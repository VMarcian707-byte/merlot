-- ============================================
-- MERLOT VIP — Bază de Date PostgreSQL
-- Rulează acest SQL în Supabase SQL Editor
-- https://supabase.com/dashboard → Your Project → SQL Editor
-- ============================================

-- 1. TABEL: users (clienți, barmani, manageri)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'barman', 'manager')),
  avatar VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL: nfc_cards (carduri NFC fizice)
CREATE TABLE IF NOT EXISTS nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uuid VARCHAR(36) UNIQUE NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'unassigned' CHECK (status IN ('active', 'blocked', 'unassigned')),
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL: discount_rules (reguli de reducere)
CREATE TABLE IF NOT EXISTS discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_days INTEGER[] NOT NULL, -- [0=Dum, 1=Lun, ..., 6=Sâm]
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL: visits_log (jurnal vizite/scanări)
CREATE TABLE IF NOT EXISTS visits_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES nfc_cards(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  barman_id UUID REFERENCES users(id) ON DELETE SET NULL,
  discount_applied INTEGER DEFAULT 0,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL: announcements (notificări/evenimente)
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  target VARCHAR(20) DEFAULT 'all' CHECK (target IN ('all', 'vip', 'regular')),
  created_by_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXURI pentru performanță
-- ============================================
-- Drop and recreate indexes to avoid conflicts
DROP INDEX IF EXISTS idx_nfc_cards_uuid;
DROP INDEX IF EXISTS idx_nfc_cards_assigned;
DROP INDEX IF EXISTS idx_nfc_cards_status;
DROP INDEX IF EXISTS idx_visits_client;
DROP INDEX IF EXISTS idx_visits_barman;
DROP INDEX IF EXISTS idx_visits_date;
DROP INDEX IF EXISTS idx_announcements_target;
DROP INDEX IF EXISTS idx_announcements_date;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_email;

CREATE INDEX idx_nfc_cards_uuid ON nfc_cards(card_uuid);
CREATE INDEX idx_nfc_cards_assigned ON nfc_cards(assigned_user_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_visits_client ON visits_log(client_id);
CREATE INDEX idx_visits_barman ON visits_log(barman_id);
CREATE INDEX idx_visits_date ON visits_log(scanned_at DESC);
CREATE INDEX idx_announcements_target ON announcements(target);
CREATE INDEX idx_announcements_date ON announcements(created_at DESC);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE nfc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Users: toți autentificați pot citi, doar managerii pot modifica
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
CREATE POLICY "Users are viewable by authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can update users" ON users;
CREATE POLICY "Managers can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );

-- NFC Cards: toți autentificați pot citi, managerii pot modifica
DROP POLICY IF EXISTS "Cards are viewable by authenticated users" ON nfc_cards;
CREATE POLICY "Cards are viewable by authenticated users"
  ON nfc_cards FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage cards" ON nfc_cards;
CREATE POLICY "Managers can manage cards"
  ON nfc_cards FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );

-- Discount Rules: toți pot citi, doar managerii pot modifica
DROP POLICY IF EXISTS "Discount rules are viewable by authenticated users" ON discount_rules;
CREATE POLICY "Discount rules are viewable by authenticated users"
  ON discount_rules FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage discount rules" ON discount_rules;
CREATE POLICY "Managers can manage discount rules"
  ON discount_rules FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );

-- Visits Log: toți autentificați pot citi, barmanii/managerii pot crea
DROP POLICY IF EXISTS "Visits are viewable by authenticated users" ON visits_log;
CREATE POLICY "Visits are viewable by authenticated users"
  ON visits_log FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Barmen and managers can create visits" ON visits_log;
CREATE POLICY "Barmen and managers can create visits"
  ON visits_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('barman', 'manager')
    )
  );

-- Announcements: toți pot citi, doar managerii pot crea
DROP POLICY IF EXISTS "Announcements are viewable by authenticated users" ON announcements;
CREATE POLICY "Announcements are viewable by authenticated users"
  ON announcements FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage announcements" ON announcements;
CREATE POLICY "Managers can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );

-- ============================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
  v_phone TEXT;
  v_avatar TEXT;
BEGIN
  -- Extrage datele din metadata
  v_name := NEW.raw_user_meta_data->>'name';
  v_role := NEW.raw_user_meta_data->>'role';
  v_phone := NEW.raw_user_meta_data->>'phone';
  v_avatar := NEW.raw_user_meta_data->>'avatar';
  
  -- Dacă nu există name în metadata, folosește email-ul temporar
  -- (dar aplicația va face UPDATE imediat după signup)
  IF v_name IS NULL OR v_name = '' THEN
    v_name := 'Utilizator Nou';
  END IF;
  
  -- Role default
  IF v_role IS NULL OR v_role = '' THEN
    v_role := 'client';
  END IF;
  
  -- Avatar default
  IF v_avatar IS NULL OR v_avatar = '' THEN
    v_avatar := '🎫';
  END IF;
  
  INSERT INTO public.users (id, email, name, role, phone, avatar)
  VALUES (
    NEW.id,
    NEW.email,
    v_name,
    v_role,
    v_phone,
    v_avatar
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCȚIE: Scanare card NFC (atomică)
-- ============================================
CREATE OR REPLACE FUNCTION public.scan_nfc_card(
  p_card_uuid VARCHAR(36),
  p_barman_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_card RECORD;
  v_client RECORD;
  v_discount INTEGER := 0;
  v_rule_name TEXT := 'Fără reducere';
  v_now TIME := CURRENT_TIME;
  v_day INTEGER := EXTRACT(DOW FROM NOW());
  v_rule RECORD;
  v_total_visits INTEGER;
BEGIN
  -- 1. Găsește cardul
  SELECT * INTO v_card FROM nfc_cards WHERE card_uuid = p_card_uuid;
  
  IF v_card IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Card NFC necunoscut'
    );
  END IF;
  
  IF v_card.status = 'blocked' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Card BLOCAT! Contactați managerul.'
    );
  END IF;
  
  IF v_card.assigned_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Card neasociat unui client.'
    );
  END IF;
  
  -- 2. Găsește clientul
  SELECT * INTO v_client FROM users WHERE id = v_card.assigned_user_id;
  
  -- 3. Calculează cel mai bun discount activ
  FOR v_rule IN 
    SELECT * FROM discount_rules 
    WHERE is_active = TRUE 
    AND v_day = ANY(valid_days)
  LOOP
    -- Verifică interval orar (inclusiv overnight)
    IF (v_now >= v_rule.start_time AND v_now <= v_rule.end_time)
       OR (v_rule.end_time < v_rule.start_time AND (v_now >= v_rule.start_time OR v_now <= v_rule.end_time))
    THEN
      IF v_rule.discount_percentage > v_discount THEN
        v_discount := v_rule.discount_percentage;
        v_rule_name := v_rule.name;
      END IF;
    END IF;
  END LOOP;
  
  -- 4. Înregistrează vizita
  INSERT INTO visits_log (card_id, client_id, barman_id, discount_applied)
  VALUES (v_card.id, v_client.id, p_barman_id, v_discount);
  
  -- 5. Numără vizitele totale
  SELECT COUNT(*) INTO v_total_visits FROM visits_log WHERE client_id = v_client.id;
  
  -- 6. Returnează rezultat
  RETURN jsonb_build_object(
    'valid', true,
    'discount_percentage', v_discount,
    'discount', CASE WHEN v_discount > 0 THEN v_discount || '%' ELSE '0%' END,
    'client_name', v_client.name,
    'client_phone', v_client.phone,
    'client_avatar', v_client.avatar,
    'card_uuid', v_card.card_uuid,
    'total_visits', v_total_visits,
    'rule_name', v_rule_name,
    'message', CASE 
      WHEN v_discount > 0 THEN '✅ Reducere ' || v_discount || '% aplicată! (' || v_rule_name || ')'
      ELSE '✅ Vizită înregistrată (fără reducere activă)'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCȚIE: Statistici dashboard
-- ============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_clients', (SELECT COUNT(*) FROM users WHERE role = 'client'),
    'active_cards', (SELECT COUNT(*) FROM nfc_cards WHERE status = 'active'),
    'unassigned_cards', (SELECT COUNT(*) FROM nfc_cards WHERE status = 'unassigned'),
    'blocked_cards', (SELECT COUNT(*) FROM nfc_cards WHERE status = 'blocked'),
    'total_visits', (SELECT COUNT(*) FROM visits_log),
    'today_visits', (
      SELECT COUNT(*) FROM visits_log 
      WHERE scanned_at >= CURRENT_DATE 
      AND scanned_at < CURRENT_DATE + INTERVAL '1 day'
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATE INIȚIALE (opțional — reguli discount)
-- ============================================
INSERT INTO discount_rules (name, description, discount_percentage, valid_days, start_time, end_time, is_active)
VALUES 
  ('Happy Hour Luni-Joi', 'Reducere 30% în intervalul Luni-Joi, 18:00-22:00', 30, ARRAY[1,2,3,4], '18:00', '22:00', TRUE),
  ('VIP Weekend', 'Reducere 20% în weekend după ora 22:00', 20, ARRAY[5,6], '22:00', '04:00', TRUE),
  ('Early Bird', 'Reducere 15% Luni-Vineri înainte de ora 20:00', 15, ARRAY[1,2,3,4,5], '18:00', '20:00', TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- REALTIME: Abonare la modificări (opțional)
-- ============================================
-- Pentru notificări push realtime, activează în Supabase:
-- Database → Replication → Select tables → Enable Realtime
