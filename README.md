# 🍷 Merlot VIP — Sistem Fidelitate NFC

Sistem complet de fidelitate cu carduri NFC pentru industria HORECA/Nightlife, construit cu React, Supabase și design luxury.

---

## 🎯 Ce este Merlot VIP?

Merlot VIP este o aplicație PWA (Progressive Web App) care permite:
- **Clienților**: Să primească carduri NFC fizice, să vadă reduceri active și istoricul vizitelor
- **Barmanilor**: Să scaneze carduri NFC și să aplice automat reduceri
- **Managerilor**: Să gestioneze carduri, reguli de discount și să trimită notificări

---

## 🏗️ Arhitectură Tehnică

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** (design luxury custom)
- **Zustand** (state management)
- **Lucide React** (iconițe)
- **PWA** (Service Worker + Manifest)

### Backend & Database
- **Supabase** (PostgreSQL + Auth + Realtime)
- **Row Level Security** (RLS) activat
- **Funcții SQL** pentru logica de business
- **Triggers** pentru auto-creare profil utilizator

---

## 🚀 Setup Complet (Pas cu Pas)

### 1. Creează Proiect Supabase

1. Mergi la [https://supabase.com](https://supabase.com)
2. Creează un cont gratuit (sau loghează-te)
3. Click **"New Project"**
4. Completează:
   - **Name**: `merlot-vip`
   - **Database Password**: (salvează-l undeva!)
   - **Region**: Alege cel mai apropiat (ex: Frankfurt)
5. Click **"Create new project"** (durează ~2 minute)

### 2. Rulează Schema SQL

1. În dashboard-ul Supabase, mergi la **SQL Editor** (iconița din meniul stâng)
2. Click **"New query"**
3. Copiază **tot conținutul** din `database/schema.sql`
4. Lipește în editor și click **"Run"** (sau Ctrl+Enter)
5. Verifică că nu sunt erori

### 3. Configurează Variabilele de Mediu

1. În dashboard-ul Supabase, mergi la **Project Settings** → **API**
2. Copiază:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon/public key** (key-ul lung care începe cu `eyJ...`)

3. În folderul proiectului, creează fișierul `.env`:
```bash
cp .env.example .env
```

4. Editează `.env` și completează:
```env
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Instalează Dependențele

```bash
npm install
```

### 5. Rulează Aplicația

```bash
npm run dev
```

Aplicația va fi disponibilă la `http://localhost:5173`

---

## 👥 Creare Utilizatori

### Opțiunea 1: Prin Interfață (Recomandat)

1. Deschide aplicația
2. Click pe tab-ul **"Înregistrare"**
3. Completează formularul pentru un client
4. Pentru a crea barmani/manageri, trebuie să folosești SQL direct (vezi mai jos)

### Opțiunea 2: Prin SQL (pentru Admini)

Mergi la **SQL Editor** în Supabase și rulează:

```sql
-- Creează un manager
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'manager@merlot.ro',
  crypt('ParolaTa123!', gen_salt('bf')),
  NOW(),
  '{"name": "Andrei Manager", "role": "manager"}'
);

-- Creează un barman
INSERT INTO auth.users (
  id, email, encrypted_password, email_confirmed_at, raw_user_meta_data
) VALUES (
  gen_random_uuid(),
  'barman@merlot.ro',
  crypt('ParolaTa123!', gen_salt('bf')),
  NOW(),
  '{"name": "Mihai Barman", "role": "barman"}'
);
```

**Notă**: Parolele sunt hash-uite automat de Supabase Auth.

---

## 🎴 Gestionare Carduri NFC

### Adăugare Card Nou

1. Loghează-te ca **Manager**
2. Mergi la tab-ul **"Carduri"**
3. Click **"+ Card Nou"**
4. Se va genera automat un UUID unic
5. Asociază cardul unui client din dropdown

### Programare Card Fizic NFC

Pentru a scrie UUID-ul pe un card NFC fizic:

**Metoda 1: Android (Chrome)**
1. Deschide aplicația pe telefon
2. Folosește un app precum "NFC Tools" sau "NXP TagWriter"
3. Scrie un record NDEF de tip URL:
   ```
   https://vip.merlot.ro/c/A1B2C3D4-E5F6-7890-ABCD-EF1234567890
   ```
   (înlocuiește cu UUID-ul real din baza de date)

**Metoda 2: Web NFC API (doar Android/Chrome)**
Aplicația include deja suport pentru Web NFC. Barmanii pot scrie direct din browser.

### Tipuri Carduri Recomandate

- **NTAG215**: 504 bytes, ieftin, perfect pentru URL
- **NTAG216**: 888 bytes, mai mult spațiu
- **MIFARE DESFire**: Criptare AES, securitate maximă

---

## 🔐 Securitate

### Row Level Security (RLS)

Toate tabelele au RLS activat:
- **Users**: Toți autentificați pot citi, doar managerii pot modifica
- **NFC Cards**: Toți pot citi, doar managerii pot crea/modifica
- **Discount Rules**: Toți pot citi, doar managerii pot modifica
- **Visits Log**: Toți pot citi, barmanii/managerii pot crea
- **Announcements**: Toți pot citi, doar managerii pot crea

### Funcții SQL Securizate

Funcția `scan_nfc_card()` este marcată ca `SECURITY DEFINER`, ceea ce înseamnă că rulează cu privilegii de owner, permițând barmanilor să înregistreze vizite fără a avea acces direct la tabele.

### Prevenire Fraudă

1. **UUID unic** per card (32 caractere, generat criptografic)
2. **Validare server-side** la fiecare scanare
3. **Rate limiting** (implementează în Supabase dacă e necesar)
4. **Timestamp server-side** (nu client-side)
5. **NFC chip UID** hardware-level (imposibil de clonat)

---

## 📊 Structura Bazei de Date

### Tabele

1. **users** — Clienți, barmani, manageri
2. **nfc_cards** — Carduri NFC fizice cu UUID
3. **discount_rules** — Reguli de reducere (zile, ore, procente)
4. **visits_log** — Jurnal complet al scanărilor
5. **announcements** — Notificări și evenimente

### Funcții SQL

- `scan_nfc_card(card_uuid, barman_id)` — Scanează card și calculează discount
- `get_dashboard_stats()` — Returnează statistici pentru dashboard
- `handle_new_user()` — Trigger pentru auto-creare profil

---

## 🎨 Design System

Aplicația folosește un design luxury custom:

### Culori
- **Merlot Deep**: `#0a0608` (fundal)
- **Merlot Wine**: `#722F37` (accent principal)
- **Merlot Gold**: `#D4AF37` (accent secundar)
- **Merlot Champagne**: `#F7E7CE` (highlight)

### Tipografie
- **Playfair Display** (titluri)
- **Cormorant Garamond** (accente)
- **Inter** (text body)

### Efecte
- Glassmorphism
- Gradient borders
- Shimmer animations
- Glow effects
- Noise texture overlay

---

## 📱 PWA (Progressive Web App)

### Instalare pe Telefon

1. Deschide aplicația în Chrome/Safari
2. Click pe butonul de share (iOS) sau meniu (Android)
3. Selectează **"Add to Home Screen"**
4. Aplicația se va instala ca o app nativă

### Service Worker

Fișierul `public/sw.js` gestionează:
- Cache pentru offline
- Push notifications
- Background sync

---

## 🔔 Notificări Push

### Configurare Firebase Cloud Messaging (Opțional)

1. Creează proiect Firebase la [https://console.firebase.google.com](https://console.firebase.google.com)
2. Mergi la **Project Settings** → **Cloud Messaging**
3. Copiază **Server Key**
4. Adaugă în Supabase: **Project Settings** → **Push Notifications**

### Trimitere Notificări

Managerii pot trimite notificări din panoul Admin. Acestea vor fi trimise ca push notifications către toți utilizatorii care au permis notificările.

---

## 🧪 Testare

### Testare Scanare NFC

1. Loghează-te ca **Barman**
2. Mergi la tab-ul **"Scanare"**
3. Pentru test rapid, click pe butoanele cu clienți demo
4. Sau introdu manual un UUID din baza de date

### Testare Discount

Regulile de discount se aplică automat în funcție de:
- Ziua săptămânii
- Ora curentă
- Reguli active în baza de date

Exemplu: Dacă e Luni între 18:00-22:00, se aplică automat "Happy Hour Luni-Joi" (30% reducere).

---

## 🚢 Deployment

### Vercel (Recomandat)

1. Push codul pe GitHub
2. Mergi la [https://vercel.com](https://vercel.com)
3. Import repository
4. Adaugă environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **"Deploy"**

### Netlify

1. Push codul pe GitHub
2. Mergi la [https://netlify.com](https://netlify.com)
3. Drag & drop folderul `dist` (după `npm run build`)
4. Adaugă environment variables în **Site settings** → **Environment**

### Supabase Production

Pentru production:
1. Activează **Custom Domain** în Supabase
2. Configurează **Email Templates** custom
3. Activează **Backups** automate
4. Monitorizează **Usage** în dashboard

---

## 📝 To-Do / Îmbunătățiri

### Funcționalități Viitoare

- [ ] Realtime subscriptions pentru vizite live
- [ ] Export rapoarte PDF/Excel
- [ ] Integrare cu sisteme POS
- [ ] Program loialitate cu puncte
- [ ] QR code ca fallback pentru NFC
- [ ] Multi-language support
- [ ] Dark/Light theme toggle
- [ ] Analytics avansate cu grafice

### Securitate

- [ ] 2FA pentru manageri
- [ ] Audit log pentru acțiuni critice
- [ ] IP whitelisting pentru barmani
- [ ] Rate limiting pe API

---

## 🤝 Suport

Pentru întrebări sau probleme:
- Verifică console-ul browser-ului pentru erori
- Verifică logs în Supabase Dashboard → **Logs**
- Asigură-te că RLS policies sunt corecte
- Verifică că `.env` este configurat corect

---

## 📄 Licență

Acest proiect este proprietate privată. Toate drepturile rezervate.

---

## 🎉 Gata!

Acum ai un sistem complet de fidelitate NFC funcțional. Spor la treabă! 🍷✨
