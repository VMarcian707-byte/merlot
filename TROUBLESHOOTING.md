# 🔍 Ghid Testare Conexiune Bază de Date

## 🎯 3 Metode de Testare

### Metoda 1: Pagină Web de Test (Recomandat)

1. Deschide aplicația în browser
2. Click pe link-ul **"Test Conexiune DB"** din footer-ul paginii de login
3. Sau accesează direct: `http://localhost:5173/test-db`
4. Click pe butonul **"Rulează Teste Complete"**
5. Vei vedea rezultatele pentru:
   - ✅ Configurație environment
   - ✅ Conexiune Supabase
   - ✅ Tabele bază de date
   - ✅ Date în tabele
   - ✅ Funcții SQL
   - ✅ Sistem autentificare

---

### Metoda 2: Script în Consola Browser-ului

1. Deschide aplicația în browser
2. Apasă **F12** pentru Developer Tools
3. Mergi la tab-ul **Console**
4. Rulează acest script:

```javascript
// Copiază și lipește în consolă:
async function quickTest() {
  const { supabase } = await import('/src/lib/supabase.ts');
  
  console.log('🍷 Test conexiune Merlot VIP...\n');
  
  // Test conexiune
  const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.error('❌ EROARE:', error.message);
    console.error('\n💡 Verifică:');
    console.error('   1. Fișierul .env este configurat corect');
    console.error('   2. Ai restartat npm run dev după ce ai creat .env');
    console.error('   3. Proiectul Supabase există și este activ');
  } else {
    console.log('✅ Conexiune OK!\n');
    
    // Numără date
    const { count: users } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: cards } = await supabase.from('nfc_cards').select('*', { count: 'exact', head: true });
    const { count: rules } = await supabase.from('discount_rules').select('*', { count: 'exact', head: true });
    
    console.log('📊 Statistici:');
    console.log(`   Users: ${users || 0}`);
    console.log(`   Cards: ${cards || 0}`);
    console.log(`   Rules: ${rules || 0}`);
    
    if (users === 0) {
      console.log('\n💡 Baza de date este goală. Creează primul utilizator!');
    }
  }
}

quickTest();
```

---

### Metoda 3: Test Direct în Supabase

1. Mergi la **https://supabase.com** și loghează-te
2. Selectează proiectul **merlot-vip**
3. Mergi la **Table Editor** (meniul stâng)
4. Verifică că vezi tabelele:
   - `users`
   - `nfc_cards`
   - `discount_rules`
   - `visits_log`
   - `announcements`
5. Click pe fiecare tabel și verifică că are date

---

## 🐛 Probleme Comune și Soluții

### ❌ "Variabile de mediu lipsă"

**Simptome:**
- Pagina de test arată "NOT SET" pentru URL și Key
- Aplicația nu se conectează la Supabase

**Soluție:**
```bash
# 1. Verifică că fișierul .env există
ls -la .env

# 2. Dacă nu există, creează-l
cp .env.example .env

# 3. Editează .env și adaugă credențialele
nano .env  # sau folosește orice editor

# 4. Conținutul .env trebuie să fie:
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 5. RESTART server (IMPORTANT!)
# Oprește cu Ctrl+C și repornește:
npm run dev
```

---

### ❌ "Conexiune eșuată"

**Simptome:**
- Testul arată eroare la conexiune
- Mesaj de eroare: "Failed to fetch" sau "Network error"

**Soluții:**
1. **Verifică URL-ul Supabase:**
   - Mergi la Supabase Dashboard
   - Settings → API
   - Copiază "Project URL"
   - Verifică că e identic cu cel din `.env`

2. **Verifică cheia anon:**
   - În același loc (Settings → API)
   - Copiază "anon public" key
   - Verifică că e completă (începe cu `eyJ...`)

3. **Verifică internet:**
   - Deschide URL-ul Supabase în browser
   - Trebuie să vezi dashboard-ul

4. **Verifică firewall/antivirus:**
   - Unele antivirusuri blochează conexiunile
   - Încearcă să dezactivezi temporar

---

### ❌ "Tabele lipsă"

**Simptome:**
- Testul arată că unele tabele nu există
- Mesaj: "relation does not exist"

**Soluție:**
```sql
-- 1. Mergi la Supabase → SQL Editor
-- 2. Click "New query"
-- 3. Copiază TOT conținutul din database/schema.sql
-- 4. Lipește în editor
-- 5. Click "Run" (sau Ctrl+Enter)
-- 6. Verifică că apare "Success. No rows returned"
```

---

### ❌ "Funcția scan_nfc_card nu există"

**Simptome:**
- Testul arată că funcția SQL lipsește
- Scanarea cardurilor nu funcționează

**Soluție:**
```sql
-- Rulează din nou database/schema.sql
-- Funcțiile sunt create la sfârșitul fișierului
-- Verifică în SQL Editor → Functions că vezi:
--   - scan_nfc_card
--   - get_dashboard_stats
--   - handle_new_user
```

---

### ❌ "Baza de date goală"

**Simptome:**
- Testul arată 0 users, 0 cards, etc.
- Nu te poți loga

**Soluție:**

**Opțiunea A: Creează prin interfață**
1. Deschide aplicația
2. Click "Înregistrare"
3. Completează formularul
4. Clientul este creat automat

**Opțiunea B: Creează prin SQL (pentru Manager/Barman)**
```sql
-- Mergi la Supabase → SQL Editor și rulează:

-- MANAGER
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'manager@merlot.ro',
  crypt('Manager123!', gen_salt('bf')),
  NOW(),
  '{"name": "Andrei Manager", "role": "manager"}'::jsonb,
  NOW(),
  NOW()
);

-- BARMAN
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, 
  raw_user_meta_data, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'barman@merlot.ro',
  crypt('Barman123!', gen_salt('bf')),
  NOW(),
  '{"name": "Mihai Barman", "role": "barman"}'::jsonb,
  NOW(),
  NOW()
);
```

---

## 🔧 Debug Avansat

### Verifică logs în Supabase

1. Mergi la Supabase Dashboard
2. **Logs** (meniul stâng)
3. Filtrează după:
   - **API** — pentru erori de conexiune
   - **Auth** — pentru probleme de login
   - **Database** — pentru erori SQL

### Verifică Network tab în browser

1. Apasă **F12** → **Network**
2. Reîncarcă pagina
3. Caută request-uri către `supabase.co`
4. Verifică:
   - Status code (trebuie să fie 200)
   - Response (trebuie să conțină date JSON)
   - Headers (trebuie să aibă `apikey`)

### Testează direct din Supabase SQL Editor

```sql
-- Test 1: Verifică users
SELECT * FROM users LIMIT 5;

-- Test 2: Verifică cards
SELECT * FROM nfc_cards LIMIT 5;

-- Test 3: Testează funcția
SELECT scan_nfc_card(
  'TEST-UUID',
  '00000000-0000-0000-0000-000000000000'
);

-- Test 4: Verifică statistici
SELECT get_dashboard_stats();
```

---

## ✅ Checklist Final

După ce ai rulat testele, verifică:

- [ ] Fișierul `.env` există și este complet
- [ ] Serverul a fost restartat după crearea `.env`
- [ ] Schema SQL a fost rulată în Supabase
- [ ] Toate cele 5 tabele există
- [ ] Funcțiile SQL sunt create
- [ ] Poți crea un utilizator prin interfață
- [ ] Poți să te loghezi cu utilizatorul creat
- [ ] Testul din `/test-db` arată toate verzi

---

## 📞 Suport

Dacă niciuna dintre soluții nu funcționează:

1. **Verifică consola browser-ului** (F12 → Console) pentru erori
2. **Verifică logs în Supabase** (Logs → API/Database)
3. **Verifică Network tab** pentru request-uri eșuate
4. **Asigură-te că proiectul Supabase este activ** (nu este pauzat)

**Proiect Supabase gratuit se pauzează după 7 zile de inactivitate!**
- Mergi la Supabase Dashboard
- Dacă vezi "Restore project", click pe el
- Așteaptă ~2 minute să se reactiveze

---

## 🎉 Succes!

Dacă toate testele sunt verzi, baza de date este configurată corect și poți începe să folosești aplicația! 🍷✨
