# 🚀 Ghid Rapid de Instalare — Merlot VIP

## ⚡ Setup în 5 Pași

### 1️⃣ Creează Cont Supabase (2 minute)

1. Mergi la **https://supabase.com**
2. Click **"Start your project"** → Sign up cu GitHub/Email
3. Click **"New Project"**
4. Completează:
   - Name: `merlot-vip`
   - Database Password: `AlegeOParolaPuternica123!`
   - Region: `West EU (Ireland)` sau cel mai apropiat
5. Click **"Create new project"** (așteaptă ~2 minute)

---

### 2️⃣ Rulează Schema SQL (1 minut)

1. În Supabase Dashboard, click pe **"SQL Editor"** (meniul stâng)
2. Click **"New query"**
3. Deschide fișierul `database/schema.sql` din proiect
4. **Copiază TOT conținutul** și lipește în Supabase SQL Editor
5. Click **"Run"** (butonul verde din dreapta-jos)
6. Verifică că apare **"Success. No rows returned"** (fără erori roșii)

✅ **Gata!** Tabelele sunt create.

---

### 3️⃣ Copiază Cheile API (30 secunde)

1. În Supabase, mergi la **Settings** (iconița ⚙️) → **API**
2. Copiază aceste 2 valori:

```
Project URL: https://xxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4️⃣ Configurează `.env` (30 secunde)

1. În folderul proiectului, deschide terminalul
2. Rulează:
```bash
cp .env.example .env
```

3. Deschide fișierul `.env` creat și înlocuiește cu valorile tale:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT**: Folosește `anon public` key, NU `service_role` key!

---

### 5️⃣ Pornește Aplicația (1 minut)

```bash
# Instalează dependențele (prima dată)
npm install

# Pornește serverul de development
npm run dev
```

Deschide browser-ul la: **http://localhost:5173**

🎉 **Felicitări!** Aplicația rulează!

---

## 👥 Creează Primii Utilizatori

### Client (prin interfață)

1. Deschide **http://localhost:5173**
2. Click pe tab-ul **"Înregistrare"**
3. Completează:
   - Nume: `Ion Popescu`
   - Telefon: `+40721111001`
   - Email: `ion.popescu@email.com`
   - Parolă: `Client123!`
4. Click **"Creează Cont VIP"**

✅ Clientul este creat și logat automat!

### Manager & Barman (prin SQL)

1. În Supabase, mergi la **SQL Editor**
2. Rulează acest query:

```sql
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

✅ Manager și Barman creați!

**Credențiale:**
- Manager: `manager@merlot.ro` / `Manager123!`
- Barman: `barman@merlot.ro` / `Barman123!`

---

## 🎴 Adaugă Primul Card NFC

1. Loghează-te ca **Manager** (`manager@merlot.ro`)
2. Mergi la tab-ul **"Carduri"**
3. Click **"+ Card Nou"**
4. Se generează automat un UUID (ex: `A1B2C3D4-E5F6-7890-ABCD-EF1234567890`)
5. Din dropdown, selectează clientul (`Ion Popescu`)
6. Click pe butonul de asociere

✅ Cardul este acum asociat clientului!

---

## 📱 Testează Scanarea

1. Loghează-te ca **Barman** (`barman@merlot.ro`)
2. Mergi la tab-ul **"Scanare"**
3. În câmpul "Introducere Manuală UUID", lipește UUID-ul cardului
4. Click **"Verifică"**

✅ Vei vedea:
- Nume client: Ion Popescu
- Reducere aplicată: 30% (dacă e în intervalul Happy Hour)
- Total vizite: 1

---

## 🎯 Testează Reducerile

Regulile de discount se aplică automat în funcție de **zi** și **oră**:

| Regulă | Zile | Ore | Reducere |
|--------|------|-----|----------|
| Happy Hour Luni-Joi | Lun-Joi | 18:00-22:00 | 30% |
| VIP Weekend | Vin-Sâm | 22:00-04:00 | 20% |
| Early Bird | Lun-Vin | 18:00-20:00 | 15% |

**Test:**
- Dacă e Luni la 19:00 → se aplică 30% (Happy Hour)
- Dacă e Vineri la 23:00 → se aplică 20% (VIP Weekend)
- Dacă e Marți la 16:00 → 0% (nicio regulă activă)

---

## 🔧 Probleme Comune

### "Cannot connect to Supabase"

✅ **Soluție**: Verifică că `.env` este configurat corect și ai restartat `npm run dev`

### "Permission denied" la query SQL

✅ **Soluție**: Asigură-te că ești logat ca owner al proiectului Supabase

### "Table does not exist"

✅ **Soluție**: Rulează din nou `database/schema.sql` în SQL Editor

### Utilizatorul nu se poate loga

✅ **Soluție**: Verifică în Supabase → **Authentication** → **Users** că email-ul există și e confirmat

---

## 🚢 Deployment (Opțional)

### Deploy pe Vercel

1. Push codul pe GitHub
2. Mergi la **https://vercel.com**
3. Import repository
4. Adaugă environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

✅ Aplicația este live!

---

## 📞 Suport

Dacă întâmpini probleme:

1. Verifică **console-ul browser-ului** (F12 → Console)
2. Verifică **logs** în Supabase Dashboard
3. Asigură-te că toate tabelele sunt create
4. Verifică că `.env` este corect

---

## 🎉 Gata!

Acum ai un sistem complet funcțional de fidelitate NFC. 

**Următorii pași:**
- Printează carduri NFC fizice
- Programează-le cu UUID-urile din baza de date
- Distribuie-le clienților
- Configurează reguli de discount personalizate
- Trimite notificări despre evenimente

Spor la treabă! 🍷✨
