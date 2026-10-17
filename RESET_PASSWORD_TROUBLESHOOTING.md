# 🔑 Resetare Parolă — De ce nu primesc email? (Ghid de Remediere)

Aplicația trimite emailul de resetare **prin Supabase Auth** (`resetPasswordForEmail`).
Dacă nu primești emailul, cauza este întotdeauna una dintre cele 5 de mai jos.

---

## ✅ Verificare rapidă (30 secunde)

1. Apasă „Am uitat parola" → introduce emailul → trimite.
2. Uită-te la ecranul de confirmare:
   - **„Email VIP Trimis!"** (verde) → cererea a fost ACCEPTATĂ de serverul Supabase. Dacă nu apare în inbox → verifică **Spam / Promotions**.
   - **„Cerere Înregistrată (Mod Demo)"** (galben) + casetă roșie „Motiv: ..." → Supabase a RESPINS trimiterea. Motivul exact e afișat pe ecran. Follow pașii de mai jos.

---

## Cauza #1 (CEA MAI FRECVENTĂ): Limita de rate Supabase ⏱️

SMTP-ul **gratuit, implicit** al Supabase are o limită de **~2 emailuri/oră** (și 400/zi).
Eroare afișată: `For security purposes, you can only request this after ...` / `rate limit`.

**Remedieri:**
- Așteaptă 60 de minute și încearcă din nou (doar pentru test).
- Pentru producție: configurează **SMTP custom** (Resend / SendGrid / Mailgun) — vezi `SMTP_SETUP_GUIDE.md`. Cu SMTP propriu limita dispare complet.

## Cauza #2: `redirectTo` nu e în Allowed Redirect URLs 🌐

Eroare: `Redirect to a non allowed site` / `not allowed`.

**Remediere:** Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL** = adresa exactă a aplicației (ex. `https://merlot.ro`)
- **Redirect URLs** → Adaugă `https://merlot.ro/reset-password` (sau `http://localhost:3000/reset-password` pentru dev).
- ⚠️ Trebuie să se potrivească EXACT (protocol + domeniu + port).

## Cauza #3: Emailul nu există în proiectul Supabase 👤

Dacă folosești conturile **demo** (client@merlot.ro etc.) fără proiect Supabase configurat,
aplicația rulează în modul mock — nu se trimite niciun email real, dar linkul generat
funcționează local (buttonul „⚡ Deschide Link & Resetează Acum").

**Remediere:** setează `VITE_SUPABASE_URL` și `VITE_SUPABASE_ANON_KEY` în `.env`
(copiază `.env.example` → `.env`) și creează utilizatorul real prin Supabase Auth.

## Cauza #4: SMTP custom configurat greșit 📮

Eroare conține: `smtp`, `relay`, `authentication failed`.

**Remediere:** Supabase Dashboard → Authentication → SMTP Settings. Verifică:
- Host / Port (587 cu STARTTLS) / User / Password / Sender email.
- Domeniul sender-ului trebuie să fie verificat la providerul SMTP (SPF/DKIM).

## Cauza #5: Emailul ajunge, dar în SPAM 🗑️

Cu SMTP-ul implicit Supabase, emailurile ajung des în Spam/Promotions.

**Remediere:** marchează ca „Not spam" + configurează SMTP custom cu domeniu propriu
(vezi `SMTP_SETUP_GUIDE.md`).

---

## Ce s-a îmbunătățit în aplicație (cod)

| Înainte | Acum |
|---|---|
| Eroarea Supabase era **ignorată** (`try/catch` care prindea doar excepții — Supabase-js returnează erorile ca `{ error }`, nu le aruncă!) | Erorile sunt detectate corect din `res.error` |
| UI spunea mereu „Email VIP Transmis!" chiar dacă NU se trimisese nimic | UI afișează onest: „Email VIP Trimis!" vs „Cerere Înregistrată (Mod Demo)" |
| Fără diagnostic | Casetă roșie cu **motivul exact** + hint de remediere + link direct către Dashboard |
| — | Sfaturi Spam/Promotions când emailul a fost acceptat de server |

## Test manual (checksum)

```bash
npm run typecheck && npm run build
```

Pentru test end-to-end cu un proiect Supabase real:
1. `cp .env.example .env` + completează cheia → `npm run dev`
2. Crează un utilizator în Supabase (Auth → Users → Add user)
3. Flow „Am uitat parola" cu acel email → trebuie să vezi „Email VIP Trimis!"
4. Verifică inbox + Spam; deschide linkul din email → pagina `/reset-password` procesează tokenul Supabase (`?token=` / hash `#access_token`) și salvează parola nouă.
