# 🍷 Merlot VIP - Custom Backend

Backend 100% custom pentru sistemul de fidelitate Merlot VIP, construit de la zero fără dependențe de servicii externe (Supabase, Firebase, etc.).

## 🎯 Caracteristici

- ✅ **100% din cod** - Control total asupra codului
- ✅ **Fără vendor lock-in** - Nu depinzi de servicii externe
- ✅ **PostgreSQL** - Bază de date robustă și scalabilă
- ✅ **JWT Authentication** - Securitate enterprise-grade
- ✅ **REST API** - Endpoints clare și documentate
- ✅ **TypeScript** - Type-safe și maintainable
- ✅ **Self-hosted** - Deploy pe propriul server

## 📋 Cerințe

- Node.js 18+
- PostgreSQL 14+
- npm sau yarn

## 🚀 Instalare

### 1. Clonează și instalează dependențele

```bash
cd backend
npm install
```

### 2. Configurează variabilele de mediu

```bash
cp .env.example .env
```

Editează `.env` și completează:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=merlot_vip
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Creează baza de date

```bash
# Conectează-te la PostgreSQL
psql -U postgres

# Creează baza de date
CREATE DATABASE merlot_vip;

# Ieși
\q
```

### 4. Pornește serverul

```bash
# Development (cu hot reload)
npm run dev

# Production
npm run build
npm start
```

Serverul va rula pe `http://localhost:3000`

## 📡 API Endpoints

### Authentication

```
POST   /api/auth/register          - Înregistrare utilizator
POST   /api/auth/login             - Autentificare
POST   /api/auth/reset-password    - Cerere resetare parolă
POST   /api/auth/reset-password/confirm - Confirmare resetare parolă
GET    /api/auth/me                - Obține utilizatorul curent
```

### Users

```
GET    /api/users                  - Toți utilizatorii (manager)
GET    /api/users/clients          - Doar clienții (manager/barman)
GET    /api/users/:id              - Utilizator după ID
PUT    /api/users/:id              - Actualizare utilizator
DELETE /api/users/:id              - Ștergere utilizator (manager)
```

### NFC Cards

```
GET    /api/cards                  - Toate cardurile (manager)
GET    /api/cards/uuid/:uuid       - Card după UUID
POST   /api/cards                  - Creează card nou (manager)
POST   /api/cards/:id/assign       - Asociază card cu client (manager)
POST   /api/cards/:id/block        - Blochează card (manager)
POST   /api/cards/scan             - Scanează card (barman/manager)
```

### Discount Rules

```
GET    /api/discounts              - Toate regulile
GET    /api/discounts/active       - Reguli active
POST   /api/discounts              - Creează regulă (manager)
PUT    /api/discounts/:id          - Actualizare regulă (manager)
PATCH  /api/discounts/:id/toggle   - Toggle activ/inactiv (manager)
DELETE /api/discounts/:id          - Ștergere regulă (manager)
```

### Visits

```
GET    /api/visits                 - Toate vizitele (manager)
GET    /api/visits/client/:id      - Vizitele unui client
GET    /api/visits/today           - Vizitele de azi (barman/manager)
GET    /api/visits/stats           - Statistici vizite (manager)
```

### Announcements

```
GET    /api/announcements          - Toate anunțurile
GET    /api/announcements/for-user - Anunțuri pentru utilizator
POST   /api/announcements          - Creează anunț (manager)
PUT    /api/announcements/:id      - Actualizare anunț (manager)
DELETE /api/announcements/:id      - Ștergere anunț (manager)
```

## 🔐 Autentificare

Toate endpoint-urile protejate necesită header-ul `Authorization`:

```
Authorization: Bearer <your-jwt-token>
```

### Exemplu de autentificare

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@merlot.ro",
    "password": "Manager123!"
  }'

# Response
{
  "user": {
    "id": "uuid",
    "name": "Andrei Manager",
    "email": "manager@merlot.ro",
    "role": "manager"
  },
  "token": "jwt-token-here"
}

# Folosește token-ul
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer jwt-token-here"
```

## 🗄️ Structura Bazei de Date

### Tabele

- **users** - Utilizatori (clienți, barmani, manageri)
- **nfc_cards** - Carduri NFC fizice
- **discount_rules** - Reguli de discount
- **visits_log** - Jurnal vizite
- **announcements** - Anunțuri și evenimente

### Funcții SQL

- **scan_nfc_card(uuid, barman_id)** - Scanează card și calculează discount

## 🧪 Testare

### Utilizatori demo

```
Manager:  manager@merlot.ro  / Manager123!
Barman:   barman@merlot.ro   / Barman123!
Client:   client@merlot.ro   / Client123!
```

### Testare scanare card

```bash
curl -X POST http://localhost:3000/api/cards/scan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <barman-token>" \
  -d '{
    "card_uuid": "A1B2C3D4-E5F6-7890-ABCD-EF1234567890"
  }'
```

## 🚀 Deploy

### Docker

```bash
# Build
docker build -t merlot-backend .

# Run
docker run -p 3000:3000 --env-file .env merlot-backend
```

### VPS (DigitalOcean, Hetzner, etc.)

```bash
# Instalează PM2
npm install -g pm2

# Build
npm run build

# Start cu PM2
pm2 start dist/server.js --name merlot-backend

# Save și startup
pm2 save
pm2 startup
```

## 💰 Costuri

### Self-hosted (VPS)

| Component | Cost/lună |
|-----------|-----------|
| VPS (2GB RAM) | $5-10 |
| PostgreSQL (included) | $0 |
| Domain | $1 |
| **Total** | **$6-11** |

### vs Supabase

| Plan | Cost/lună |
|------|-----------|
| Supabase Free | $0 (limitat) |
| Supabase Pro | $25 |
| **Custom Backend** | **$6-11** ✅ |

## 📚 Documentație

- [CUSTOM_BACKEND_GUIDE.md](../CUSTOM_BACKEND_GUIDE.md) - Ghid complet
- [API Documentation](#api-endpoints) - Endpoint-uri API
- [Database Schema](./src/models/schema.sql) - Schema bazei de date

## 🤝 Contribuții

Pull requests sunt binevenite! Pentru modificări majore, deschide întâi un issue.

## 📄 Licență

MIT

## 🆘 Suport

Pentru întrebări sau probleme, deschide un issue pe GitHub.

---

**Construit cu ❤️ pentru Merlot VIP**
