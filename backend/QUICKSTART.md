# 🚀 Setup Rapid - Backend Custom

## ⚡ Instalare în 5 Minute

### Pasul 1: Instalează PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Descarcă de la: https://www.postgresql.org/download/windows/

### Pasul 2: Creează baza de date

```bash
# Conectează-te la PostgreSQL
psql -U postgres

# Creează baza de date
CREATE DATABASE merlot_vip;

# Verifică
\l

# Ieși
\q
```

### Pasul 3: Configurează backend-ul

```bash
# Intră în folderul backend
cd backend

# Instalează dependențele
npm install

# Copiază .env.example în .env
cp .env.example .env

# Editează .env și schimbă parola PostgreSQL
nano .env  # sau folosește orice editor
```

Modifică în `.env`:
```env
DB_PASSWORD=your_postgres_password_here
JWT_SECRET=change-this-to-a-random-32-char-string
```

### Pasul 4: Pornește serverul

```bash
npm run dev
```

Ar trebui să vezi:
```
✅ Connected to PostgreSQL database
✅ Database schema initialized
✅ Database ready

🍷  MERLOT VIP - Custom Backend
🚀  Server running on http://localhost:3000
```

### Pasul 5: Testează

Deschide browser-ul la: http://localhost:3000/health

Ar trebui să vezi:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "version": "1.0.0"
}
```

## 🧪 Testare Completă

### 1. Testează login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@merlot.ro",
    "password": "Manager123!"
  }'
```

Ar trebui să primești:
```json
{
  "user": {
    "id": "...",
    "name": "Andrei Manager",
    "email": "manager@merlot.ro",
    "role": "manager"
  },
  "token": "eyJhbGc..."
}
```

### 2. Copiază token-ul

Salvează token-ul primit pentru următoarele teste.

### 3. Testează obținere utilizatori

```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Testează scanare card

```bash
curl -X POST http://localhost:3000/api/cards/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "card_uuid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }'
```

## 🔧 Probleme Comune

### Eroare: "database does not exist"

**Soluție:**
```bash
# Creează baza de date
psql -U postgres -c "CREATE DATABASE merlot_vip;"
```

### Eroare: "password authentication failed"

**Soluție:**
Verifică parola în `.env`:
```env
DB_PASSWORD=your_actual_postgres_password
```

### Eroare: "port 5432 already in use"

**Soluție:**
Oprește alte instanțe PostgreSQL sau schimbă portul în `.env`:
```env
DB_PORT=5433
```

### Eroare: "Cannot find module"

**Soluție:**
```bash
npm install
```

## 🔄 Conectare Frontend

Actualizează `src/lib/supabase.ts` în frontend pentru a folosi backend-ul custom:

```typescript
// src/lib/api.ts
const API_URL = 'http://localhost:3000/api';

export const api = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async getCards(token: string) {
    const response = await fetch(`${API_URL}/cards`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async scanCard(token: string, cardUuid: string) {
    const response = await fetch(`${API_URL}/cards/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ card_uuid: cardUuid })
    });
    return response.json();
  }
};
```

## 📦 Structura Proiectului

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Conexiune PostgreSQL
│   ├── middleware/
│   │   └── auth.ts              # JWT middleware
│   ├── routes/
│   │   ├── auth.ts              # Login/Register
│   │   ├── users.ts             # Users CRUD
│   │   ├── cards.ts             # NFC Cards
│   │   ├── discounts.ts         # Discount Rules
│   │   ├── visits.ts            # Visits Log
│   │   └── announcements.ts     # Announcements
│   ├── models/
│   │   └── schema.sql           # Database schema
│   └── server.ts                # Entry point
├── .env.example                 # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Următorii Pași

1. ✅ Backend-ul rulează local
2. ⏭️ Conectează frontend-ul la backend
3. ⏭️ Testează toate funcționalitățile
4. ⏭️ Deploy pe server (opțional)

## 🆘 Suport

Dacă întâmpini probleme:
1. Verifică log-urile din terminal
2. Verifică `.env` configuration
3. Asigură-te că PostgreSQL rulează
4. Verifică porturile (3000 pentru backend, 5432 pentru PostgreSQL)

---

**Gata!** Backend-ul custom este funcțional! 🎉
