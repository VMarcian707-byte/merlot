# 📧 Configurare Email și SMS pentru Merlot VIP

## 🎯 Funcționalități Implementate

✅ **Resetare Parolă** - Utilizatorii pot reseta parola prin email
✅ **Email de Confirmare** - La înregistrare (opțional)
✅ **SMS de Confirmare** - Prin Twilio (opțional)

---

## 📧 Configurare Email în Supabase

### Pasul 1: Activează Email Provider

1. Mergi la **Supabase Dashboard** → **Authentication** → **Providers**
2. Click pe **Email**
3. Activează **"Enable Email provider"**
4. Configurează:
   - **Confirm email**: ✅ (recomandat pentru securitate)
   - **Confirm phone**: ❌ (dezactivează dacă nu folosești SMS)

### Pasul 2: Personalizează Template-urile de Email

1. Mergi la **Authentication** → **Email Templates**
2. Editează template-urile:

#### **Magic Link** (Resetare Parolă)

```html
<h2>Resetare Parolă - Merlot VIP</h2>
<p>Bună {{ .Name }},</p>
<p>Ai solicitat resetarea parolei pentru contul tău Merlot VIP.</p>
<p>Click pe butonul de mai jos pentru a reseta parola:</p>
<p>
  <a href="{{ .RedirectTo }}/reset-password#{{ .Token }}">
    <strong>Resetează Parola</strong>
  </a>
</p>
<p>Sau copiază acest link în browser:</p>
<p>{{ .RedirectTo }}/reset-password#{{ .Token }}</p>
<p>Acest link este valabil 24 de ore.</p>
<p>Dacă nu ai solicitat resetarea parolei, ignoră acest email.</p>
<br>
<p>Cu stimă,<br>Echipa Merlot VIP</p>
```

**Subject:** `Resetare Parolă - Merlot VIP`

#### **Confirm Signup** (Confirmare Înregistrare)

```html
<h2>Bine ai venit la Merlot VIP!</h2>
<p>Bună {{ .Name }},</p>
<p>Mulțumim că te-ai alăturat comunității Merlot VIP!</p>
<p>Click pe butonul de mai jos pentru a-ți confirma contul:</p>
<p>
  <a href="{{ .SiteURL }}/confirm#{{ .Token }}">
    <strong>Confirmă Contul</strong>
  </a>
</p>
<p>După confirmare, te poți loga cu:</p>
<p><strong>Email:</strong> {{ .Email }}</p>
<br>
<p><strong>Beneficiile tale VIP:</strong></p>
<ul>
  <li>✨ Reduceri exclusive la fiecare vizită</li>
  <li>🎫 Card VIP personalizat</li>
  <li>🎉 Invitații la evenimente speciale</li>
  <li>🍸 Oferte personalizate</li>
</ul>
<br>
<p>Cu stimă,<br>Echipa Merlot VIP</p>
```

**Subject:** `Bine ai venit la Merlot VIP! 🍷`

#### **Welcome Email** (Opțional - după confirmare)

```html
<h2>Contul tău Merlot VIP este activ!</h2>
<p>Bună {{ .Name }},</p>
<p>Contul tău a fost confirmat cu succes!</p>
<p>Acum poți:</p>
<ul>
  <li>📱 Descarcă aplicația pe telefon</li>
  <li>🎫 Activează cardul tău VIP</li>
  <li>🎁 Profită de reducerea de bun venit: <strong>20% OFF</strong></li>
</ul>
<p>
  <a href="{{ .SiteURL }}">
    <strong>Loghează-te acum</strong>
  </a>
</p>
<br>
<p>Te așteptăm la Merlot! 🍷✨</p>
```

**Subject:** `Contul tău Merlot VIP este activ! 🎉`

### Pasul 3: Configurează SMTP Custom (Opțional)

Pentru a folosi propriul server de email (recomandat pentru producție):

1. Mergi la **Project Settings** → **SMTP**
2. Activează **"Enable custom SMTP"**
3. Configurează:
   - **Sender email**: `noreply@merlot.ro`
   - **Sender name**: `Merlot VIP`
   - **Host**: `smtp.your-provider.com`
   - **Port**: `587` (TLS) sau `465` (SSL)
   - **Username**: your-smtp-username
   - **Password**: your-smtp-password

**Provideri recomandați:**
- **SendGrid** - Gratuit până la 100 emailuri/zi
- **Mailgun** - Gratuit până la 5000 emailuri/lună
- **AWS SES** - Foarte ieftin (~$0.10 per 1000 emailuri)
- **Postmark** - Excelent pentru tranzacționale

---

## 📱 Configurare SMS prin Twilio (Opțional)

### Pasul 1: Creează cont Twilio

1. Mergi la [https://www.twilio.com](https://www.twilio.com)
2. Creează un cont gratuit
3. Verifică numărul de telefon
4. Mergi la **Console Dashboard**: [https://console.twilio.com](https://console.twilio.com)
5. Copiază:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (cu prefix +)

### Pasul 2: Adaugă Twilio în Supabase

Supabase nu are integrare nativă SMS, dar poți folosi **Edge Functions**:

1. Mergi la **Edge Functions** în Supabase Dashboard
2. Creează o nouă funcție: `send-sms`

```typescript
// supabase/functions/send-sms/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')
const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

serve(async (req) => {
  try {
    const { to, message } = await req.json()

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber!,
          To: to,
          Body: message,
        }),
      }
    )

    const data = await response.json()
    
    return new Response(
      JSON.stringify({ success: true, sid: data.sid }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

3. Adaugă environment variables în Supabase:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`

### Pasul 3: Template SMS

#### **Confirmare Înregistrare**
```
Bună {name}! 🍷 Contul tău Merlot VIP a fost creat cu succes. 
Loghează-te în aplicație și profită de reducerea de bun venit: 20% OFF! 
Detalii: https://vip.merlot.ro
```

#### **Resetare Parolă**
```
Merlot VIP: Codul tău de resetare parolă este: {code}. 
Valabil 10 minute. Nu îl share-ui cu nimeni.
```

#### **Notificare Eveniment**
```
🎉 {event_name} - {event_date} la Merlot! 
Show special, băuturi premium. Rezervă acum: https://vip.merlot.ro/events
```

### Pasul 4: Integrează în Aplicație

Adaugă în `src/lib/supabase.ts`:

```typescript
export async function sendSMS(phone: string, message: string) {
  const {  error } = await supabase.functions.invoke('send-sms', {
    body: { to: phone, message }
  });
  
  if (error) throw error;
}

// Exemplu utilizare:
await sendSMS('+40721111001', 'Bună Ion! Contul tău Merlot VIP este activ! 🍷');
```

---

## 🔐 Configurare URL-uri de Redirecționare

### Pentru Producție

1. Mergi la **Authentication** → **URL Configuration**
2. Configurează:
   - **Site URL**: `https://vip.merlot.ro`
   - **Redirect URLs**: 
     - `https://vip.merlot.ro/reset-password`
     - `https://vip.merlot.ro/confirm`
     - `https://vip.merlot.ro/**`

### Pentru Development

1. **Site URL**: `http://localhost:5173`
2. **Redirect URLs**:
   - `http://localhost:5173/reset-password`
   - `http://localhost:5173/confirm`
   - `http://localhost:5173/**`

---

## 🧪 Testare

### Testare Resetare Parolă

1. Deschide aplicația: `http://localhost:5173`
2. Click pe **"Am uitat parola"**
3. Introdu email-ul: `client@merlot.ro`
4. Click **"Trimite Link Resetare"**
5. Verifică inbox-ul (sau spam folder)
6. Click pe link-ul din email
7. Introdu noua parolă
8. Click **"Resetează Parola"**
9. Loghează-te cu noua parolă

### Testare Email de Confirmare

1. Dezactivează **"Confirm email"** în Authentication → Providers → Email
2. Înregistrează un client nou
3. Verifică inbox-ul pentru email-ul de bun venit

### Testare SMS (dacă ai configurat Twilio)

```typescript
// În consola browser-ului:
import { sendSMS } from './src/lib/supabase';
await sendSMS('+40721111001', 'Test SMS de la Merlot VIP 🍷');
```

---

## 📊 Monitorizare Email-uri

### Supabase Dashboard

1. Mergi la **Logs** → **Auth Logs**
2. Filtrează după:
   - `type: mail_sent`
   - `type: mail_failed`

### Provider SMTP

- **SendGrid**: Dashboard → Email Activity
- **Mailgun**: Logs → Sending History
- **AWS SES**: Dashboard → Sending Statistics

---

## 🎨 Personalizare Avansată

### Logo în Email

Adaugă logo-ul în template-urile de email:

```html
<img src="https://vip.merlot.ro/logo.png" alt="Merlot VIP" style="max-width: 200px; margin-bottom: 20px;" />
```

### Culori Brand

```html
<style>
  h2 { color: #722F37; }
  a { color: #D4AF37; }
  .button { 
    background: #722F37; 
    color: white; 
    padding: 12px 24px; 
    border-radius: 8px; 
    text-decoration: none;
  }
</style>
```

### Footer Personalizat

```html
<hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
<p style="font-size: 12px; color: #666;">
  Merlot VIP — Sistem de Fidelitate NFC<br>
  Strada Exemplu nr. 123, București<br>
  +40 721 000 000 | contact@merlot.ro
</p>
```

---

## 🔒 Securitate

### Rate Limiting

Supabase are deja rate limiting pentru email-uri:
- **3 email-uri per oră** per utilizator
- **10 email-uri per oră** per IP

### Validare Email

```typescript
// Înainte de a trimite email de resetare
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Email invalid');
}
```

### Token Expiration

Token-urile de resetare expiră automat după **24 de ore** (configurabil în Supabase).

---

## 📋 Checklist Lansare

- [ ] Template-urile de email sunt personalizate
- [ ] Logo-ul este inclus în email-uri
- [ ] URL-urile de redirecționare sunt configurate corect
- [ ] SMTP custom este configurat (pentru producție)
- [ ] Testele de resetare parolă funcționează
- [ ] Email-urile ajung în inbox (nu spam)
- [ ] SMS-urile sunt configurate (opțional)
- [ ] Rate limiting este activ
- [ ] Monitorizarea email-urilor este configurată

---

## 🚀 Resurse Utile

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates
- **Twilio SMS**: https://www.twilio.com/docs/sms
- **SendGrid**: https://sendgrid.com/docs
- **Email Best Practices**: https://sendgrid.com/blog/email-best-practices

---

**Gata!** Acum ai un sistem complet de resetare parolă și notificări email/SMS! 🎉
