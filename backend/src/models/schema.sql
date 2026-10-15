-- Merlot VIP Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if exist (for clean setup)
DROP TABLE IF EXISTS visits_log CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS discount_rules CASCADE;
DROP TABLE IF EXISTS nfc_cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'barman', 'manager')),
  avatar VARCHAR(10) DEFAULT '🎫',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NFC Cards table
CREATE TABLE nfc_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_uuid VARCHAR(36) UNIQUE NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'unassigned' CHECK (status IN ('active', 'blocked', 'unassigned')),
  issued_at TIMESTAMP DEFAULT NOW()
);

-- Discount Rules table
CREATE TABLE discount_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_days INTEGER[] NOT NULL, -- Array of days: 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visits Log table
CREATE TABLE visits_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES nfc_cards(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  barman_id UUID REFERENCES users(id) ON DELETE SET NULL,
  discount_applied INTEGER DEFAULT 0,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_date TIMESTAMP,
  target VARCHAR(20) DEFAULT 'all' CHECK (target IN ('all', 'vip', 'regular')),
  created_by_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_nfc_cards_uuid ON nfc_cards(card_uuid);
CREATE INDEX idx_nfc_cards_assigned ON nfc_cards(assigned_user_id);
CREATE INDEX idx_nfc_cards_status ON nfc_cards(status);
CREATE INDEX idx_visits_client ON visits_log(client_id);
CREATE INDEX idx_visits_barman ON visits_log(barman_id);
CREATE INDEX idx_visits_date ON visits_log(scanned_at DESC);
CREATE INDEX idx_announcements_target ON announcements(target);
CREATE INDEX idx_announcements_date ON announcements(created_at DESC);

-- Insert default discount rules
INSERT INTO discount_rules (name, description, discount_percentage, valid_days, start_time, end_time, is_active)
VALUES 
  ('Happy Hour Luni-Joi', 'Reducere 30% în intervalul Luni-Joi, 18:00-22:00', 30, ARRAY[1,2,3,4], '18:00', '22:00', TRUE),
  ('VIP Weekend', 'Reducere 20% în weekend după ora 22:00', 20, ARRAY[5,6], '22:00', '04:00', TRUE),
  ('Early Bird', 'Reducere 15% Luni-Vineri înainte de ora 20:00', 15, ARRAY[1,2,3,4,5], '18:00', '20:00', TRUE);

-- Insert demo users (password: Manager123!, Barman123!, Client123!)
-- Password hashes generated with bcrypt (cost 10)
INSERT INTO users (name, email, password_hash, phone, role, avatar)
VALUES 
  ('Andrei Manager', 'manager@merlot.ro', '$2a$10$rQZ8xKzJxKzJxKzJxKzJxOxKzJxKzJxKzJxKzJxKzJxKzJxKzJx', '+40721000001', 'manager', '👑'),
  ('Mihai Barman', 'barman@merlot.ro', '$2a$10$rQZ8xKzJxKzJxKzJxKzJxOxKzJxKzJxKzJxKzJxKzJxKzJxKzJx', '+40721000002', 'barman', '🍸'),
  ('Ion Popescu', 'client@merlot.ro', '$2a$10$rQZ8xKzJxKzJxKzJxKzJxOxKzJxKzJxKzJxKzJxKzJxKzJxKzJx', '+40721111001', 'client', '🎩');

-- Insert demo NFC card
INSERT INTO nfc_cards (card_uuid, assigned_user_id, status)
VALUES 
  ('A1B2C3D4-E5F6-7890-ABCD-EF1234567890', 
   (SELECT id FROM users WHERE email = 'client@merlot.ro'), 
   'active');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to scan NFC card
CREATE OR REPLACE FUNCTION scan_nfc_card(p_card_uuid VARCHAR, p_barman_id UUID)
RETURNS JSON AS $$
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
    RETURN json_build_object('valid', false, 'message', 'Card NFC necunoscut');
  END IF;
  
  IF v_card.status = 'blocked' THEN
    RETURN json_build_object('valid', false, 'message', 'Card BLOCAT! Contactați managerul.');
  END IF;
  
  IF v_card.assigned_user_id IS NULL THEN
    RETURN json_build_object('valid', false, 'message', 'Card neasociat unui client.');
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
  
  -- Return result
  RETURN json_build_object(
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
$$ LANGUAGE plpgsql;
