-- ============================================
-- SCRIPT CORECTAT — Verifică existența înainte de INSERT
-- Rulează în Supabase SQL Editor
-- ============================================

-- 1. Adaugă reguli de discount (dacă nu există)
INSERT INTO discount_rules (name, description, discount_percentage, valid_days, start_time, end_time, is_active)
VALUES 
  ('Happy Hour Luni-Joi', 'Reducere 30% în intervalul Luni-Joi, 18:00-22:00', 30, ARRAY[1,2,3,4], '18:00', '22:00', TRUE),
  ('VIP Weekend', 'Reducere 20% în weekend după ora 22:00', 20, ARRAY[5,6], '22:00', '04:00', TRUE),
  ('Early Bird', 'Reducere 15% Luni-Vineri înainte de ora 20:00', 15, ARRAY[1,2,3,4,5], '18:00', '20:00', TRUE)
ON CONFLICT DO NOTHING;

-- 2. Creează MANAGER (doar dacă nu există)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verifică dacă email-ul există deja în auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'manager@merlot.ro';
  
  IF v_user_id IS NULL THEN
    -- Creează user în auth.users
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'manager@merlot.ro',
      crypt('Manager123!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Andrei Manager", "role": "manager"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Manager creat cu ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Manager există deja cu ID: %', v_user_id;
  END IF;
  
  -- Creează profil în public.users (doar dacă nu există)
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, name, email, phone, role, avatar)
    VALUES (v_user_id, 'Andrei Manager', 'manager@merlot.ro', '+40721000001', 'manager', '👑');
    RAISE NOTICE 'Profil manager creat';
  ELSE
    RAISE NOTICE 'Profil manager există deja';
  END IF;
END $$;

-- 3. Creează BARMAN (doar dacă nu există)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'barman@merlot.ro';
  
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'barman@merlot.ro',
      crypt('Barman123!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Mihai Barman", "role": "barman"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Barman creat cu ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Barman există deja cu ID: %', v_user_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, name, email, phone, role, avatar)
    VALUES (v_user_id, 'Mihai Barman', 'barman@merlot.ro', '+40721000002', 'barman', '🍸');
    RAISE NOTICE 'Profil barman creat';
  ELSE
    RAISE NOTICE 'Profil barman există deja';
  END IF;
END $$;

-- 4. Creează CLIENT (doar dacă nu există)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'client@merlot.ro';
  
  IF v_user_id IS NULL THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role, created_at, updated_at,
      confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'client@merlot.ro',
      crypt('Client123!', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"name": "Ion Popescu", "role": "client"}'::jsonb,
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Client creat cu ID: %', v_user_id;
  ELSE
    RAISE NOTICE 'Client există deja cu ID: %', v_user_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id) THEN
    INSERT INTO public.users (id, name, email, phone, role, avatar)
    VALUES (v_user_id, 'Ion Popescu', 'client@merlot.ro', '+40721111001', 'client', '🎩');
    RAISE NOTICE 'Profil client creat';
  ELSE
    RAISE NOTICE 'Profil client există deja';
  END IF;
END $$;

-- 5. Adaugă carduri NFC (doar dacă nu există)
INSERT INTO nfc_cards (card_uuid, assigned_user_id, status)
SELECT 
  'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
  id,
  'active'
FROM public.users
WHERE email = 'client@merlot.ro'
AND NOT EXISTS (
  SELECT 1 FROM nfc_cards WHERE card_uuid = 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890'
);

INSERT INTO nfc_cards (card_uuid, status)
VALUES 
  ('B2C3D4E5-F6A7-8901-BCDE-F12345678901', 'unassigned'),
  ('C3D4E5F6-A7B8-9012-CDEF-123456789012', 'unassigned')
ON CONFLICT (card_uuid) DO NOTHING;

-- 6. Verifică rezultatul final
SELECT '📊 STATISTICI FINALE' as info;
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'NFC Cards', COUNT(*) FROM nfc_cards
UNION ALL
SELECT 'Discount Rules', COUNT(*) FROM discount_rules;

SELECT '🔐 CREDENTIALE' as info;
SELECT 
  email,
  CASE role
    WHEN 'manager' THEN 'Manager123!'
    WHEN 'barman' THEN 'Barman123!'
    WHEN 'client' THEN 'Client123!'
  END as password,
  role,
  name
FROM public.users
ORDER BY role;
