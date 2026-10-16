-- ============================================
-- BADGES SYSTEM - Script de Instalare
-- Rulează acest script dacă ai deja schema.sql rulată
-- ============================================

-- 1. Creează tabela badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  icon_color VARCHAR(20) DEFAULT '#D4AF37',
  requirement_type VARCHAR(50) NOT NULL CHECK (requirement_type IN ('visits', 'spending', 'streak', 'special', 'manual')),
  requirement_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Creează tabela user_badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 3. Creează indexuri
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_code ON badges(code);

-- 4. Activează RLS
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- 5. Creează policies
DROP POLICY IF EXISTS "Badges are viewable by authenticated users" ON badges;
CREATE POLICY "Badges are viewable by authenticated users"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Managers can manage badges" ON badges;
CREATE POLICY "Managers can manage badges"
  ON badges FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'manager')
  );

DROP POLICY IF EXISTS "User badges are viewable by authenticated users" ON user_badges;
CREATE POLICY "User badges are viewable by authenticated users"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "System can insert user badges" ON user_badges;
CREATE POLICY "System can insert user badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 6. Inserează badge-urile inițiale
INSERT INTO badges (code, name, description, emoji, icon_color, requirement_type, requirement_value, is_active)
VALUES 
  ('first_visit', 'Prima Vizită', 'Ai vizitat Merlot pentru prima dată!', '🎉', '#10B981', 'visits', 1, TRUE),
  ('regular', 'Client Fidel', 'Ai vizitat Merlot de 5 ori!', '⭐', '#F59E0B', 'visits', 5, TRUE),
  ('vip_10', 'VIP Bronze', 'Ai vizitat Merlot de 10 ori!', '🥉', '#CD7F32', 'visits', 10, TRUE),
  ('vip_25', 'VIP Silver', 'Ai vizitat Merlot de 25 ori!', '🥈', '#C0C0C0', 'visits', 25, TRUE),
  ('vip_50', 'VIP Gold', 'Ai vizitat Merlot de 50 ori!', '🥇', '#FFD700', 'visits', 50, TRUE),
  ('vip_100', 'VIP Platinum', 'Ai vizitat Merlot de 100 ori!', '💎', '#E5E4E2', 'visits', 100, TRUE),
  ('early_bird', 'Early Bird', 'Ai venit înainte de ora 19:00', '🌅', '#FB923C', 'special', 0, TRUE),
  ('weekend_warrior', 'Weekend Warrior', 'Ai vizitat Merlot în weekend de 5 ori', '🎊', '#A855F7', 'visits', 5, TRUE),
  ('streak_3', 'Streak Master', '3 vizite consecutive în aceeași săptămână', '🔥', '#EF4444', 'streak', 3, TRUE),
  ('streak_7', 'Unstoppable', '7 vizite consecutive în aceeași săptămână', '💪', '#DC2626', 'streak', 7, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 7. Creează funcția pentru acordare automată badge-uri
CREATE OR REPLACE FUNCTION public.award_badges_for_visit(p_client_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_visits INTEGER;
  v_weekend_visits INTEGER;
  v_badge RECORD;
  v_new_badges JSONB[] := ARRAY[]::JSONB[];
  v_badge_earned JSONB;
BEGIN
  -- Numără vizitele totale
  SELECT COUNT(*) INTO v_total_visits 
  FROM visits_log 
  WHERE client_id = p_client_id;
  
  -- Numără vizitele în weekend
  SELECT COUNT(*) INTO v_weekend_visits
  FROM visits_log
  WHERE client_id = p_client_id
  AND EXTRACT(DOW FROM scanned_at) IN (0, 5, 6);
  
  -- Verifică fiecare badge
  FOR v_badge IN 
    SELECT * FROM badges 
    WHERE is_active = TRUE
    AND requirement_type IN ('visits', 'special')
  LOOP
    -- Verifică dacă utilizatorul are deja badge-ul
    IF NOT EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_id = p_client_id AND badge_id = v_badge.id
    ) THEN
      -- Verifică dacă utilizatorul îndeplinește cerința
      IF v_badge.requirement_type = 'visits' AND v_total_visits >= v_badge.requirement_value THEN
        -- Acordă badge-ul
        INSERT INTO user_badges (user_id, badge_id)
        VALUES (p_client_id, v_badge.id)
        ON CONFLICT (user_id, badge_id) DO NOTHING;
        
        -- Adaugă la lista de badge-uri noi
        v_badge_earned := jsonb_build_object(
          'id', v_badge.id,
          'code', v_badge.code,
          'name', v_badge.name,
          'emoji', v_badge.emoji,
          'description', v_badge.description
        );
        v_new_badges := array_append(v_new_badges, v_badge_earned);
      END IF;
    END IF;
  END LOOP;
  
  -- Returnează badge-urile câștigate
  RETURN jsonb_build_object(
    'total_visits', v_total_visits,
    'new_badges', COALESCE(array_to_json(v_new_badges), '[]'::json)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Creează funcția pentru obținerea badge-urilor unui utilizator
CREATE OR REPLACE FUNCTION public.get_user_badges(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_badges JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'code', b.code,
      'name', b.name,
      'description', b.description,
      'emoji', b.emoji,
      'icon_color', b.icon_color,
      'earned_at', ub.earned_at
    )
  ) INTO v_badges
  FROM user_badges ub
  JOIN badges b ON ub.badge_id = b.id
  WHERE ub.user_id = p_user_id
  ORDER BY ub.earned_at DESC;
  
  RETURN COALESCE(v_badges, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Modifică funcția scan_nfc_card pentru a acorda badge-uri automat
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
  -- Get card
  SELECT * INTO v_card FROM nfc_cards WHERE card_uuid = p_card_uuid;
  
  IF v_card IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card NFC necunoscut');
  END IF;
  
  IF v_card.status = 'blocked' THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card BLOCAT! Contactați managerul.');
  END IF;
  
  IF v_card.assigned_user_id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'message', 'Card neasociat unui client.');
  END IF;
  
  -- Get client
  SELECT * INTO v_client FROM users WHERE id = v_card.assigned_user_id;
  
  -- Calculate best discount
  FOR v_rule IN 
    SELECT * FROM discount_rules 
    WHERE is_active = TRUE 
    AND v_day = ANY(valid_days)
  LOOP
    IF (v_now >= v_rule.start_time AND v_now <= v_rule.end_time)
       OR (v_rule.end_time < v_rule.start_time AND (v_now >= v_rule.start_time OR v_now <= v_rule.end_time))
    THEN
      IF v_rule.discount_percentage > v_discount THEN
        v_discount := v_rule.discount_percentage;
        v_rule_name := v_rule.name;
      END IF;
    END IF;
  END LOOP;
  
  -- Log visit
  INSERT INTO visits_log (card_id, client_id, barman_id, discount_applied)
  VALUES (v_card.id, v_client.id, p_barman_id, v_discount);
  
  -- Count total visits
  SELECT COUNT(*) INTO v_total_visits FROM visits_log WHERE client_id = v_client.id;
  
  -- Award badges automatically
  PERFORM award_badges_for_visit(v_client.id);
  
  -- Return result
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

-- 10. Verifică instalarea
SELECT '✅ Badge system installed successfully!' as status;
SELECT COUNT(*) as total_badges FROM badges;
SELECT COUNT(*) as total_user_badges FROM user_badges;
