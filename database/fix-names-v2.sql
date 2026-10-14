-- ============================================
-- CORECTARE NUME UTILIZATORI
-- Rulează în Supabase SQL Editor
-- ============================================

-- Verifică care utilizatori au email în câmpul name
SELECT 
  id,
  email,
  name,
  CASE 
    WHEN name LIKE '%@%' THEN '❌ ARE EMAIL'
    ELSE '✅ CORECT'
  END as status
FROM public.users
ORDER BY created_at DESC;

-- Corectează utilizatorii care au email în câmpul name
-- Extrage numele din metadata sau din email
UPDATE public.users
SET name = COALESCE(
  -- Încearcă să ia din metadata
  NULLIF(auth_users.raw_user_meta_data->>'name', ''),
  -- Fallback: extrage din email (partea dinainte de @)
  CASE 
    WHEN public.users.name LIKE '%@%' 
    THEN INITCAP(REPLACE(SPLIT_PART(public.users.email, '@', 1), '.', ' '))
    ELSE public.users.name
  END
)
FROM auth.users auth_users
WHERE public.users.id = auth_users.id
AND public.users.name LIKE '%@%';

-- Verifică rezultatul
SELECT 
  email,
  name,
  role,
  phone,
  avatar
FROM public.users
ORDER BY created_at DESC;
