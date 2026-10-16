-- ============================================
-- CORECTARE NUME UTILIZATORI
-- Rulează în Supabase SQL Editor
-- ============================================

-- Corectează utilizatorii cu "Utilizator Nou"
-- Folosește datele din auth.users (raw_user_meta_data)
UPDATE public.users
SET name = COALESCE(
  au.raw_user_meta_data->>'name',
  SPLIT_PART(public.users.email, '@', 1) -- Fallback: prima parte a email-ului
)
FROM auth.users au
WHERE public.users.id = au.id
AND public.users.name = 'Utilizator Nou';

-- Verifică rezultatul
SELECT 
  u.email,
  u.name,
  u.role,
  u.phone,
  u.avatar,
  au.raw_user_meta_data->>'name' as auth_metadata_name
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- Rezumat
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN name = 'Utilizator Nou' THEN 1 END) as users_cu_nume_gresit,
  COUNT(CASE WHEN name != 'Utilizator Nou' THEN 1 END) as users_cu_nume_corect
FROM public.users;
