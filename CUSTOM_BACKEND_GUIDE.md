# 🛠️ Backend Custom - 100% Din Cod (Fără Supabase)

## 🎯 Ce Înseamnă "Pur Din Cod"?

O soluție **100% self-hosted** unde:
- ✅ Controlezi TOT codul
- ✅ Fără vendor lock-in
- ✅ Fără servicii externe (Supabase, Firebase, etc.)
- ✅ Database local (PostgreSQL/SQLite)
- ✅ Auth implementat de tine
- ✅ Deploy pe propriul server

---

## 🏗️ Arhitectură Completă

### **Opțiunea 1: Node.js + Express + PostgreSQL** (Recomandat)

```
┌─────────────────────────────────────────┐
│         Frontend (React/Vite)           │
│    http://localhost:5173                │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────────┐
│      Backend (Node.js + Express)        │
│    http://localhost:3000                │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  Authentication (JWT + bcrypt)   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  API Routes (REST)               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  Business Logic                  │  │
│  └──────────────────────────────────┘  │
└──────────────┬──────────────────────────┘
               │ SQL Queries
               ▼
┌─────────────────────────────────────────┐
│      PostgreSQL Database                │
│    localhost:5432                       │
│                                         │
│  • users                                │
│  • nfc_cards                            │
│  • discount_rules                       │
│  • visits_log                           │
│  • announcements                        │
└─────────────────────────────────────────┘
```

### **Opțiunea 2: Node.js + SQLite** (Mai Simplu)

```
┌─────────────────────────────────────────┐
│         Frontend (React/Vite)           │
└──────────────┬──────────────────────────┘
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────────┐
│      Backend (Node.js + Express)        │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  SQLite Database (file-based)    │  │
│  │  database.sqlite                 │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🚀 Implementare Completă

### **Pasul 1: Setup Backend**

```bash
# Creează folder backend
mkdir backend
cd backend

# Inițializează Node.js
npm init -y

# Instalează dependențe
npm install express cors bcryptjs jsonwebtoken dotenv pg better-sqlite3
npm install --save-dev nodemon @types/node @types/express typescript ts-node
```

### **Pasul 2: Structura Proiectului**

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Conexiune DB
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
│   ├── utils/
│   │   └── helpers.ts           # Helper functions
│   └── server.ts                # Entry point
├── .env                         # Environment variables
├── package.json
└── tsconfig.json
```

---

## 📝 Cod Complet

### **1. server.ts** (Entry Point)

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import cardRoutes from './routes/cards';
import discountRoutes from './routes/discounts';
import visitRoutes from './routes/visits';
import announcementRoutes from './routes/announcements';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/announcements', announcementRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

---

### **2. database.ts** (PostgreSQL)

```typescript
// src/config/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'merlot_vip',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

export const initDatabase = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL');
    
    // Run schema
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    await client.query(schema);
    
    console.log('✅ Database schema initialized');
    client.release();
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export default pool;
```

---

### **3. database.ts** (SQLite - Alternativă Simplă)

```typescript
// src/config/database-sqlite.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

export const initDatabase = () => {
  try {
    // Run schema
    const schemaPath = path.join(__dirname, '../models/schema-sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
    
    console.log('✅ SQLite database initialized');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    process.exit(1);
  }
};

export const query = (text: string, params?: any[]) => {
  if (text.includes('SELECT')) {
    return db.prepare(text).all(...(params || []));
  } else {
    return db.prepare(text).run(...(params || []));
  }
};

export default db;
```

---

### **4. schema.sql** (PostgreSQL)

```sql
-- src/models/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('client', 'barman', 'manager')),
  avatar VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- NFC Cards table
CREATE TABLE IF NOT EXISTS nfc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_uuid VARCHAR(36) UNIQUE NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'unassigned' CHECK (status IN ('active', 'blocked', 'unassigned')),
  issued_at TIMESTAMP DEFAULT NOW()
);

-- Discount Rules table
CREATE TABLE IF NOT EXISTS discount_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage BETWEEN 0 AND 100),
  valid_days INTEGER[] NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Visits Log table
CREATE TABLE IF NOT EXISTS visits_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES nfc_cards(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  barman_id UUID REFERENCES users(id) ON DELETE SET NULL,
  discount_applied INTEGER DEFAULT 0,
  scanned_at TIMESTAMP DEFAULT NOW()
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  event_date TIMESTAMP,
  target VARCHAR(20) DEFAULT 'all' CHECK (target IN ('all', 'vip', 'regular')),
  created_by_manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_uuid ON nfc_cards(card_uuid);
CREATE INDEX IF NOT EXISTS idx_nfc_cards_assigned ON nfc_cards(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_visits_client ON visits_log(client_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits_log(scanned_at DESC);
```

---

### **5. auth.ts** (Authentication)

```typescript
// src/routes/auth.ts
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'client' } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password_hash, phone, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, email, phone, role, avatar, created_at`,
      [name, email, passwordHash, phone, role]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Reset Password Request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, reset link sent' });
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await sendEmail(user.email, 'Reset Password', resetLink);

    res.json({ 
      message: 'If email exists, reset link sent',
      resetToken // Remove in production, only for testing
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Reset failed' });
  }
});

// Reset Password (with token)
router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'reset') {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, decoded.userId]
    );

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password confirm error:', error);
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

export default router;
```

---

### **6. auth middleware.ts**

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

### **7. cards.ts** (NFC Cards Routes)

```typescript
// src/routes/cards.ts
import express from 'express';
import { query } from '../config/database';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all cards (manager only)
router.get('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.name as client_name, u.email as client_email
      FROM nfc_cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      ORDER BY c.issued_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

// Get card by UUID
router.get('/uuid/:uuid', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, u.name as client_name, u.email as client_email, u.phone as client_phone
      FROM nfc_cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.card_uuid = $1
    `, [req.params.uuid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch card' });
  }
});

// Create new card
router.post('/', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { card_uuid } = req.body;

    const result = await query(
      'INSERT INTO nfc_cards (card_uuid) VALUES ($1) RETURNING *',
      [card_uuid]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Assign card to user
router.post('/:id/assign', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const { user_id } = req.body;

    const result = await query(`
      UPDATE nfc_cards 
      SET assigned_user_id = $1, status = 'active'
      WHERE id = $2
      RETURNING *
    `, [user_id, req.params.id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign card' });
  }
});

// Block card
router.post('/:id/block', authenticate, authorize('manager'), async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      UPDATE nfc_cards 
      SET status = 'blocked'
      WHERE id = $1
      RETURNING *
    `, [req.params.id]);

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to block card' });
  }
});

// Scan card (barman)
router.post('/scan', authenticate, authorize('barman', 'manager'), async (req: AuthRequest, res) => {
  try {
    const { card_uuid, barman_id } = req.body;

    // Get card
    const cardResult = await query(`
      SELECT c.*, u.name as client_name, u.phone as client_phone, u.avatar as client_avatar
      FROM nfc_cards c
      LEFT JOIN users u ON c.assigned_user_id = u.id
      WHERE c.card_uuid = $1
    `, [card_uuid]);

    if (cardResult.rows.length === 0) {
      return res.json({
        valid: false,
        message: 'Card not found'
      });
    }

    const card = cardResult.rows[0];

    if (card.status === 'blocked') {
      return res.json({
        valid: false,
        message: 'Card is blocked'
      });
    }

    if (!card.assigned_user_id) {
      return res.json({
        valid: false,
        message: 'Card not assigned'
      });
    }

    // Calculate discount
    const now = new Date();
    const dayOfWeek = now.getDay();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const discountResult = await query(`
      SELECT * FROM discount_rules
      WHERE is_active = TRUE
      AND $1 = ANY(valid_days)
    `, [dayOfWeek]);

    let bestDiscount = 0;
    let ruleName = 'No active discount';

    for (const rule of discountResult.rows) {
      const inRange = (
        currentTime >= rule.start_time &&
        currentTime <= rule.end_time
      ) || (
        rule.end_time < rule.start_time &&
        (currentTime >= rule.start_time || currentTime <= rule.end_time)
      );

      if (inRange && rule.discount_percentage > bestDiscount) {
        bestDiscount = rule.discount_percentage;
        ruleName = rule.name;
      }
    }

    // Log visit
    await query(`
      INSERT INTO visits_log (card_id, client_id, barman_id, discount_applied)
      VALUES ($1, $2, $3, $4)
    `, [card.id, card.assigned_user_id, barman_id, bestDiscount]);

    // Get total visits
    const visitsResult = await query(`
      SELECT COUNT(*) as total FROM visits_log WHERE client_id = $1
    `, [card.assigned_user_id]);

    res.json({
      valid: true,
      discount: bestDiscount > 0 ? `${bestDiscount}%` : '0%',
      discount_percentage: bestDiscount,
      client_name: card.client_name,
      client_phone: card.client_phone,
      client_avatar: card.client_avatar || '🎫',
      card_uuid: card.card_uuid,
      total_visits: parseInt(visitsResult.rows[0].total),
      rule_name: ruleName,
      message: bestDiscount > 0 
        ? `✅ ${bestDiscount}% discount applied! (${ruleName})`
        : '✅ Visit recorded (no active discount)'
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ error: 'Scan failed' });
  }
});

export default router;
```

---

### **8. .env**

```env
# Server
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=merlot_vip
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email (optional)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=your_resend_api_key
SMTP_FROM=noreply@merlot.ro
```

---

### **9. package.json**

```json
{
  "name": "merlot-vip-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "@types/cors": "^2.8.17",
    "@types/pg": "^8.10.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "typescript": "^5.3.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.2"
  }
}
```

---

## 🚀 Deploy

### **Opțiunea 1: VPS (DigitalOcean, Hetzner, etc.)**

```bash
# Pe server
git clone your-repo
cd backend
npm install
npm run build

# Folosește PM2 pentru process management
npm install -g pm2
pm2 start dist/server.js --name merlot-backend
pm2 save
pm2 startup
```

### **Opțiunea 2: Docker**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=merlot_vip
      - DB_USER=postgres
      - DB_PASSWORD=secret
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=merlot_vip
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=secret
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 💰 Costuri

### **Self-Hosted (VPS)**

| Component | Cost/lună |
|-----------|-----------|
| VPS (2GB RAM) | $5-10 |
| PostgreSQL (included) | $0 |
| Domain | $1 |
| **Total** | **$6-11/lună** |

### **vs Supabase**

| Plan | Cost/lună |
|------|-----------|
| Supabase Free | $0 (limitat) |
| Supabase Pro | $25 |
| **Custom Backend** | **$6-11** ✅ |

---

## ✅ Avantaje

- ✅ **Control 100%** asupra codului
- ✅ **Fără vendor lock-in**
- ✅ **Costuri mai mici** la scară
- ✅ **Performance optimizat** pentru Merlot
- ✅ **Customizabil** 100%
- ✅ **Self-hosted** = privacy totală

---

## 🎯 Concluzie

**Alege backend custom dacă:**
- Ai developer în echipă
- Vrei control total
- Vrei costuri minime la scară
- Nu vrei vendor lock-in

**Rămâi cu Supabase dacă:**
- Vrei rapiditate
- Nu ai developer backend
- Vrei features out-of-the-box

---

**Vrei să implementez complet backend-ul custom?** Pot crea toate fișierele și să-l fac funcțional! 🚀
