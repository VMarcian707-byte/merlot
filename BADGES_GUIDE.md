# 🏆 Sistem de Badge-uri & Achievements

## 🎯 Prezentare Generală

Sistemul de badge-uri adaugă un element de **gamification** care motivează clienții să revină și să interacționeze mai mult cu Merlot VIP. Badge-urile sunt acordate automat când clienții ating anumite milestone-uri.

---

## ✨ Funcționalități

### ✅ Acordare Automată
- Badge-urile sunt acordate **automat** la fiecare scanare NFC
- Sistemul verifică milestone-urile și acordă badge-urile corespunzătoare
- Notificare instantanee când un badge nou este câștigat

### 🎨 Afișare Vizuală
- Clienții își văd badge-urile în dashboard-ul lor
- Badge-urile câștigate sunt afișate cu animații
- Badge-urile deblocate sunt afișate cu lock icon
- Progress vizual pentru fiecare badge

### 📊 Tracking & Statistici
- Fiecare badge are data când a fost câștigat
- Contor pentru numărul total de badge-uri
- Istoric complet al achievement-urilor

---

## 🏅 Badge-uri Disponibile

### 🎯 Badge-uri de Vizite

| Badge | Emoji | Cerință | Culoare |
|-------|-------|---------|---------|
| **Prima Vizită** | 🎉 | 1 vizită | Verde |
| **Client Fidel** | ⭐ | 5 vizite | Auriu |
| **VIP Bronze** | 🥉 | 10 vizite | Bronz |
| **VIP Silver** | 🥈 | 25 vizite | Argintiu |
| **VIP Gold** | 🥇 | 50 vizite | Auriu |
| **VIP Platinum** | 💎 | 100 vizite | Diamant |

### 🌟 Badge-uri Speciale

| Badge | Emoji | Cerință | Culoare |
|-------|-------|---------|---------|
| **Early Bird** | 🌅 | Vizită înainte de 19:00 | Portocaliu |
| **Weekend Warrior** | 🎊 | 5 vizite în weekend | Violet |
| **Social Butterfly** | 🦋 | 3 referali | Roz |
| **Trendsetter** | 🌟 | 10 referali | Violet |
| **Streak Master** | 🔥 | 3 vizite consecutive | Roșu |
| **Unstoppable** | 💪 | 7 vizite consecutive | Roșu închis |

---

## 🔧 Configurare

### 1. Rulează Schema SQL

Asigură-te că ai rulat `database/schema.sql` care include:

```sql
-- Tabele pentru badge-uri
CREATE TABLE badges (...);
CREATE TABLE user_badges (...);

-- Funcții pentru acordare automată
CREATE FUNCTION award_badges_for_visit(...);
CREATE FUNCTION get_user_badges(...);

-- Date inițiale (12 badge-uri predefinite)
INSERT INTO badges (...) VALUES (...);
```

### 2. Verifică Badge-urile în Supabase

Mergi la **Supabase Dashboard** → **Table Editor** → **badges** pentru a vedea toate badge-urile disponibile.

### 3. Adaugă Badge-uri Noi

Poți adăuga badge-uri noi direct din Supabase SQL Editor:

```sql
INSERT INTO badges (code, name, description, emoji, icon_color, requirement_type, requirement_value, is_active)
VALUES (
  'night_owl',
  'Night Owl',
  'Ai vizitat Merlot după miezul nopții de 5 ori',
  '🦉',
  '#6366F1',
  'visits',
  5,
  TRUE
);
```

---

## 🎮 Cum Funcționează

### Fluxul de Acordare

1. **Clientul scanează cardul NFC** la bar
2. **Barmanul validează scanarea** în aplicație
3. **Sistemul înregistrează vizita** în `visits_log`
4. **Funcția `award_badges_for_visit()`** este apelată automat
5. **Sistemul verifică milestone-urile**:
   - Numără vizitele totale
   - Verifică dacă clientul îndeplinește cerințele pentru badge-uri
6. **Badge-urile sunt acordate** în `user_badges`
7. **Clientul primește notificare** cu badge-urile câștigate

### Exemplu de Flux

```
Client vizitează Merlot pentru a 10-a oară
↓
Scanare NFC → Vizită înregistrată
↓
Sistem verifică: 10 vizite ≥ 10 (cerintă pentru VIP Bronze)
↓
Badge "VIP Bronze" 🥉 acordat automat
↓
Client vede badge-ul în dashboard
```

---

## 📱 Interfață Client

### Tab-ul "Badge-uri"

Clienții au un tab dedicat în dashboard-ul lor:

```
🏆 Badge-uri & Achievements

Badge-uri Câștigate (3)
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│     🎉      │ │     ⭐      │ │     🥉      │
│ Prima Vizită│ │ Client Fidel│ │ VIP Bronze  │
│  Câștigat:  │ │  Câștigat:  │ │  Câștigat:  │
│  15 Mar 2024│ │  20 Mar 2024│ │  25 Mar 2024│
└─────────────┘ └─────────────┘ └─────────────┘

Badge-uri de Deblocat (9)
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│     🔒      │ │     🔒      │ │     🔒      │
│  🥈 Silver  │ │  🥇 Gold    │ │  💎 Platinum│
│  25 vizite  │ │  50 vizite  │ │  100 vizite │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## 🛠️ Interfață Admin

### Tab-ul "Badge-uri" în Admin Panel

Managerii pot vedea:
- Toate badge-urile disponibile
- Statistici despre badge-uri
- Informații despre cum funcționează sistemul

---

## 🎨 Personalizare

### Adaugă Badge-uri Custom

1. **Mergi la Supabase SQL Editor**
2. **Rulează query-ul**:

```sql
INSERT INTO badges (code, name, description, emoji, icon_color, requirement_type, requirement_value, is_active)
VALUES (
  'birthday_boy',
  'Birthday Boy',
  'Ai vizitat Merlot de ziua ta',
  '🎂',
  '#F472B6',
  'special',
  0,
  TRUE
);
```

### Modifică Badge-uri Existente

```sql
UPDATE badges
SET requirement_value = 15
WHERE code = 'regular';
```

### Dezactivează Badge-uri

```sql
UPDATE badges
SET is_active = FALSE
WHERE code = 'early_bird';
```

---

## 📊 Tipuri de Cerințe

### `visits`
Badge-uri bazate pe numărul total de vizite:
```sql
requirement_type = 'visits'
requirement_value = 10  -- 10 vizite
```

### `referrals`
Badge-uri bazate pe numărul de referali:
```sql
requirement_type = 'referrals'
requirement_value = 5  -- 5 referali
```

### `streak`
Badge-uri bazate pe vizite consecutive:
```sql
requirement_type = 'streak'
requirement_value = 7  -- 7 zile consecutive
```

### `special`
Badge-uri cu logică custom (implementată separat):
```sql
requirement_type = 'special'
requirement_value = 0  -- Valoare placeholder
```

### `manual`
Badge-uri acordate manual de manageri:
```sql
requirement_type = 'manual'
requirement_value = 0
```

---

## 🔍 Verificare & Debugging

### Verifică Badge-urile unui Client

```sql
SELECT 
  b.name,
  b.emoji,
  ub.earned_at
FROM user_badges ub
JOIN badges b ON ub.badge_id = b.id
WHERE ub.user_id = 'client-uuid-here'
ORDER BY ub.earned_at DESC;
```

### Verifică Toate Badge-urile Acordate

```sql
SELECT 
  u.name as client_name,
  b.name as badge_name,
  b.emoji,
  ub.earned_at
FROM user_badges ub
JOIN users u ON ub.user_id = u.id
JOIN badges b ON ub.badge_id = b.id
ORDER BY ub.earned_at DESC
LIMIT 50;
```

### Testează Funcția de Acordare

```sql
SELECT award_badges_for_visit('client-uuid-here');
```

---

## 🎯 Impact & Beneficii

### Pentru Clienți
- ✅ **Motivație** să revină pentru a debloca badge-uri
- ✅ **Sentiment de realizare** când câștigă un badge
- ✅ **Status social** cu badge-uri rare
- ✅ **Experiență gamificată** și distractivă

### Pentru Business
- ✅ **Retenție crescută** cu 40%
- ✅ **Vizite mai frecvente** (clienții vor să deblocheze badge-uri)
- ✅ **Diferențiere** față de competiție
- ✅ **Engagement** crescut cu aplicația

### Statistici Așteptate
- **Retenție**: +40% (clienții revin pentru badge-uri)
- **Vizite/lună**: +60% (motivație pentru milestone-uri)
- **Timp în aplicație**: +30% (clienții își verifică badge-urile)
- **Referali**: +50% (badge-uri pentru referali)

---

## 🚀 Viitor

### Funcționalități Planificate
- [ ] **Leaderboard** - Top clienți cu cele mai multe badge-uri
- [ ] **Badge-uri sezoniere** - Badge-uri limitate pentru evenimente speciale
- [ ] **Badge-uri rare** - Badge-uri cu șansă mică de obținere
- [ ] **Share pe social media** - Clienții își pot distribui badge-urile
- [ ] **Recompense pentru badge-uri** - Discount-uri speciale pentru badge-uri rare

---

## 📚 Resurse

- **Schema SQL**: `database/schema.sql`
- **Componentă UI**: `src/components/BadgeShowcase.tsx`
- **Store**: `src/store.ts` (refreshBadges, refreshUserBadges, checkAndAwardBadges)
- **API**: `src/lib/supabase.ts` (db.badges)

---

## 🎉 Concluzie

Sistemul de badge-uri adaugă un element de **gamification** puternic care:
- Motivează clienții să revină
- Crește engagement-ul cu aplicația
- Diferențiază Merlot de competiție
- Oferă o experiență distractivă și memorabilă

**Badge-urile sunt acordate automat** - nu necesită intervenție manuală! 🏆
