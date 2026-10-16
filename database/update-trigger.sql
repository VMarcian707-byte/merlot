-- ============================================
-- ACTUALIZARE TRIGGER + CORECTARE NUME
-- Rulează în Supabase SQL Editor
-- ============================================

-- 1. Actualizează funcția trigger-ului
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
  
  -- Dacă nu există name în metadata, folosește "Utilizator Nou"
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

-- 2. Recreează trigger-ul
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Corectează utilizatorii existenți
UPDATE public.users
SET 
  name = COALESCE(
    NULLIF(au.raw_user_meta_data->>'name', ''),
    public.users.name
  ),
  phone = COALESCE(
    NULLIF(au.raw_user_meta_data->>'phone', ''),
    public.users.phone
  ),
  avatar = COALESCE(
    NULLIF(au.raw_user_meta_data->>'avatar', ''),
    public.users.avatar,
    '🎫'
  )
FROM auth.users au
WHERE public.users.id = au.id;

-- 4. Verifică rezultatul
SELECT 
  u.email,
  u.name,
  u.role,
  u.phone,
  u.avatar,
  au.raw_user_meta_data->>'name' as metadata_name
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;
