# 📧 Configurare Custom SMTP în Supabase

## 🎯 De ce Custom SMTP?

Supabase vine cu un SMTP implicit, dar pentru producție ai nevoie de:
- ✅ **Deliverability mai bun** (email-urile nu ajung în spam)
- ✅ **Branding personalizat** (logo, culori Merlot)
- ✅ **Tracking și analytics** (cine a deschis email-ul)
- ✅ **Rată de livrare mai mare** (99%+ vs 70-80%)
- ✅ **Domeniu propriu** (noreply@merlot.ro)

---

## 🚀 Provideri SMTP Recomandați

### 1. **Resend** ⭐⭐⭐⭐⭐ (RECOMANDAT)

**Cel mai simplu și modern**

| Aspect | Detalii |
|--------|---------|
| **Free Tier** | 3,000 emailuri/lună, 100/zi |
| **Setup** | 5 minute |
| **Deliverability** | Excelentă |
| **API** | Modern, REST |
| **Docs** | https://resend.com/docs |

**De ce Resend?**
- Setup ultra-simplu
- Prețuri excelente
- API modern
- Dashboard intuitiv
- Suport pentru domenii custom

---

### 2. **SendGrid** ⭐⭐⭐⭐

**Cel mai popular, enterprise-grade**

| Aspect | Detalii |
|--------|---------|
| **Free Tier** | 100 emailuri/zi (pentru totdeauna) |
| **Setup** | 10-15 minute |
| **Deliverability** | Excelentă |
| **Features** | Tracking, templates, analytics |
| **Docs** | https://docs.sendgrid.com |

**De ce SendGrid?**
- Industry standard
- Features avansate
- Scalabilitate infinită
- Integrări multiple

---

### 3. **Mailgun** ⭐⭐⭐⭐

**Excelent pentru developeri**

| Aspect | Detalii |
|--------|---------|
| **Free Tier** | 5,000 emailuri/lună (3 luni) |
| **Setup** | 10 minute |
| **Deliverability** | Foarte bună |
| **API** | RESTful, ușor de folosit |
| **Docs** | https://documentation.mailgun.com |

---

### 4. **AWS SES** ⭐⭐⭐⭐

**Cel mai ieftin la scară mare**

| Aspect | Detalii |
|--------|---------|
| **Free Tier** | 62,000 emailuri/lună (din EC2) |
| **Setup** | 20-30 minute |
| **Preț** | $0.10 per 1,000 emailuri |
| **Deliverability** | Excelentă |
| **Docs** | https://docs.aws.amazon.com/ses |

**De ce AWS SES?**
- Extrem de ieftin
- Scalabilitate infinită
- Integrare AWS nativă

---

## 📋 Ghid Pas cu Pas: Resend (Recomandat)

### Pasul 1: Creează cont Resend

1. Mergi la **https://resend.com**
2. Click **"Get Started"**
3. Înregistrează-te cu email sau GitHub
4. Verifică email-ul

### Pasul 2: Adaugă Domeniul

1. În dashboard, click **"Domains"** → **"Add Domain"**
2. Introdu domeniul: `merlot.ro`
3. Resend îți va da **DNS records** de adăugat:

```
Type: MX
Name: @
Value: feedback-smtp.eu-central-1.amazonses.com
Priority: 10

Type: TXT
Name: @
Value: v=spf1 include:resend.esp ~all

Type: CNAME
Name: resend._domainkey
Value: resend._domainkey.eu-central-1.amazonses.com
```

4. Adaugă aceste records în DNS-ul domeniului tău (Cloudflare, GoDaddy, etc.)
5. Așteaptă 5-30 minute pentru propagare
6. Click **"Verify Domain"**

### Pasul 3: Creează API Key

1. Mergi la **"API Keys"**
2. Click **"Create API Key"**
3. Nume: `Merlot VIP Production`
4. Permissions: **Full Access**
5. Click **"Create Key"**
6. **COPIAZĂ KEY-UL** (îl vezi o singură dată!)

### Pasul 4: Obține SMTP Credentials

1. Mergi la **"Domains"** → `merlot.ro`
2. Click tab-ul **"SMTP"**
3. Vei vedea:
   - **Host**: `smtp.resend.com`
   - **Port**: `465` (SSL) sau `587` (TLS)
   - **Username**: `resend`
   - **Password**: [API Key-ul creat la pasul 3]

### Pasul 5: Configurează în Supabase

1. Mergi la **Supabase Dashboard** → **Project Settings** → **SMTP**
2. Activează **"Enable custom SMTP"**
3. Completează:

```
Sender Email: noreply@merlot.ro
Sender Name: Merlot VIP
Host: smtp.resend.com
Port: 465
Username: resend
Password: re_your_api_key_here
```

4. Click **"Save"**
5. Testează cu **"Send test email"**

---

## 📋 Ghid Pas cu Pas: SendGrid

### Pasul 1: Creează cont SendGrid

1. Mergi la **https://sendgrid.com**
2. Click **"Start for Free"**
3. Completează formularul
4. Verifică email-ul

### Pasul 2: Verifică Domeniul (Sender Authentication)

1. Mergi la **"Settings"** → **"Sender Authentication"** → **"Authenticate Domain"**
2. Introdu domeniul: `merlot.ro`
3. Alege **"Advanced Settings"**:
   - DKIM: ✅
   - Custom Link Branding: ❌ (nu e necesar)
4. Click **"Next"**
5. Adaugă DNS records în domeniul tău:

```
Type: CNAME
Name: em1234.merlot.ro
Value: u1234567.wl.sendgrid.net

Type: CNAME
Name: s1._domainkey.merlot.ro
Value: s1.domainkey.u1234567.wl.sendgrid.net

Type: CNAME
Name: s2._domainkey.merlot.ro
Value: s2.domainkey.u1234567.wl.sendgrid.net
```

6. Click **"Verify"** (poate dura până la 48h)

### Pasul 3: Creează API Key

1. Mergi la **"Settings"** → **"API Keys"**
2. Click **"Create API Key"**
3. Nume: `Merlot VIP SMTP`
4. Permissions: **Full Access**
5. Click **"Create & View"**
6. **COPIAZĂ KEY-UL**

### Pasul 4: Obține SMTP Credentials

1. Mergi la **"Settings"** → **"SMTP Settings"**
2. Vei vedea:
   - **Server**: `smtp.sendgrid.net`
   - **Username**: `apikey`
   - **Password**: [API Key-ul creat]
   - **Ports**: `25`, `2525`, `587` (TLS), `465` (SSL)

### Pasul 5: Configurează în Supabase

```
Sender Email: noreply@merlot.ro
Sender Name: Merlot VIP
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SG.your_api_key_here
```

---

## 📋 Ghid Pas cu Pas: Mailgun

### Pasul 1: Creează cont Mailgun

1. Mergi la **https://mailgun.com**
2. Click **"Sign Up Free"**
3. Completează formularul

### Pasul 2: Adaugă Domeniul

1. Mergi la **"Sending"** → **"Domains"**
2. Click **"Add New Domain"**
3. Introdu: `merlot.ro`
4. Alege regiunea: **EU** (pentru deliverability mai bună în Europa)
5. Click **"Add Domain"**

### Pasul 3: Verifică DNS Records

Mailgun îți va da records de adăugat:

```
Type: TXT
Name: @
Value: v=spf1 include:mailgun.org ~all

Type: MX
Name: @
Value: mxa.eu.mailgun.org
Priority: 10

Type: MX
Name: @
Value: mxb.eu.mailgun.org
Priority: 10

Type: TXT
Name: mailo._domainkey
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...
```

### Pasul 4: Obține SMTP Credentials

1. Mergi la **"Sending"** → **"Domains"** → `merlot.ro`
2. Click tab-ul **"SMTP Credentials"**
3. Click **"Create New SMTP Credentials"**
4. Username: `postmaster@merlot.ro` (sau altceva)
5. Password: [alege o parolă puternică]
6. **COPIAZĂ credențialele**

### Pasul 5: Configurează în Supabase

```
Sender Email: noreply@merlot.ro
Sender Name: Merlot VIP
Host: smtp.eu.mailgun.org
Port: 587
Username: postmaster@merlot.ro
Password: your_password_here
```

---

## 🔧 Configurare DNS (Cloudflare)

Dacă folosești Cloudflare pentru DNS:

### Pasul 1: Adaugă Records

1. Mergi la **Cloudflare Dashboard** → domeniul tău → **DNS**
2. Click **"Add Record"**
3. Adaugă toate records-urile primite de la providerul SMTP

### Pasul 2: Proxy Status

**IMPORTANT**: Pentru MX și TXT records, **dezactivează proxy-ul**:

```
Proxy status: DNS only (gray cloud) ❌ NOT proxied (orange cloud)
```

### Pasul 3: Așteaptă Propagarea

- DNS propagation: 5 minute - 48 ore
- Verifică cu: https://dnschecker.org

---

## 🧪 Testare Configurare

### Test 1: Send Test Email din Supabase

1. Mergi la **Supabase Dashboard** → **Project Settings** → **SMTP**
2. Click **"Send test email"**
3. Introdu email-ul tău
4. Verifică inbox-ul (și spam folder)

### Test 2: Resetare Parolă

1. Deschide aplicația: `http://localhost:5173`
2. Click **"Am uitat parola"**
3. Introdu email-ul tău
4. Verifică inbox-ul
5. Email-ul ar trebui să vină de la `noreply@merlot.ro`

### Test 3: Verifică Deliverability

Folosește aceste tool-uri:
- **Mail-Tester**: https://www.mail-tester.com (scor 0-10)
- **MXToolbox**: https://mxtoolbox.com
- **DKIM Validator**: https://dkimvalidator.com

**Scor ideal**: 9-10/10

---

## 🎨 Personalizare Email Templates

După ce configurezi SMTP, personalizează template-urile:

### Template: Resetare Parolă

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0608;
      color: #ffffff;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #1a0d12;
      border-radius: 16px;
      padding: 40px;
      border: 1px solid rgba(212, 175, 55, 0.2);
    }
    .logo {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo h1 {
      font-family: 'Playfair Display', serif;
      color: #ffffff;
      font-size: 32px;
      margin: 0;
    }
    .logo p {
      color: #D4AF37;
      font-size: 12px;
      letter-spacing: 3px;
      text-transform: uppercase;
      margin: 10px 0 0 0;
    }
    .content {
      color: #ffffff;
      line-height: 1.6;
    }
    .content h2 {
      color: #D4AF37;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #722F37 0%, #8B3A42 100%);
      color: #ffffff;
      padding: 14px 32px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 600;
      margin: 20px 0;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Merlot</h1>
      <p>VIP Experience</p>
    </div>
    
    <div class="content">
      <h2>Resetare Parolă</h2>
      <p>Bună {{ .Name }},</p>
      <p>Ai solicitat resetarea parolei pentru contul tău Merlot VIP.</p>
      <p>Click pe butonul de mai jos pentru a reseta parola:</p>
      
      <p style="text-align: center;">
        <a href="{{ .RedirectTo }}/reset-password#{{ .Token }}" class="button">
          Resetează Parola
        </a>
      </p>
      
      <p>Sau copiază acest link în browser:</p>
      <p style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all;">
        {{ .RedirectTo }}/reset-password#{{ .Token }}
      </p>
      
      <p style="color: rgba(255,255,255,0.5); font-size: 13px;">
        Acest link este valabil 24 de ore. Dacă nu ai solicitat resetarea parolei, ignoră acest email.
      </p>
    </div>
    
    <div class="footer">
      <p>Cu stimă,<br><strong>Echipa Merlot VIP</strong></p>
      <p style="margin-top: 20px;">
        📍 Strada Exemplu nr. 123, București<br>
        📞 +40 721 000 000<br>
        📧 contact@merlot.ro
      </p>
    </div>
  </div>
</body>
</html>
```

### Template: Confirmare Cont

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Același CSS ca mai sus */
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <h1>Merlot</h1>
      <p>VIP Experience</p>
    </div>
    
    <div class="content">
      <h2>Bine ai venit la Merlot VIP!</h2>
      <p>Bună {{ .Name }},</p>
      <p>Mulțumim că te-ai alăturat comunității Merlot VIP!</p>
      <p>Click pe butonul de mai jos pentru a-ți confirma contul:</p>
      
      <p style="text-align: center;">
        <a href="{{ .SiteURL }}/confirm#{{ .Token }}" class="button">
          Confirmă Contul
        </a>
      </p>
      
      <h3 style="color: #D4AF37; margin-top: 30px;">Beneficiile tale VIP:</h3>
      <ul style="color: rgba(255,255,255,0.8);">
        <li>✨ Reduceri exclusive la fiecare vizită</li>
        <li>🎫 Card VIP personalizat cu tehnologie NFC</li>
        <li>🎉 Invitații la evenimente speciale</li>
        <li>🍸 Oferte personalizate</li>
        <li>🎁 Cadou de bun venit: <strong>20% OFF</strong></li>
      </ul>
      
      <p style="margin-top: 30px;">
        După confirmare, te poți loga cu:<br>
        <strong>Email:</strong> {{ .Email }}
      </p>
    </div>
    
    <div class="footer">
      <p>Te așteptăm la Merlot! 🍷✨</p>
    </div>
  </div>
</body>
</html>
```

---

## 🔒 Securitate și Best Practices

### 1. Verifică SPF, DKIM, DMARC

```bash
# Verifică SPF
dig TXT merlot.ro

# Verifică DKIM
dig TXT resend._domainkey.merlot.ro

# Verifică DMARC
dig TXT _dmarc.merlot.ro
```

### 2. Adaugă DMARC Record

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@merlot.ro
```

### 3. Monitorizează Deliverability

- Verifică spam score săptămânal
- Monitorizează bounce rate
- Track open rate și click rate

---

## 📊 Monitoring și Analytics

### Resend Dashboard

1. Mergi la **https://resend.com** → **Emails**
2. Vezi:
   - ✅ Sent (trimise)
   - ✅ Delivered (livrate)
   - ✅ Opened (deschise)
   - ✅ Clicked (click-uri)
   - ❌ Bounced (respinse)
   - ❌ Failed (eșuate)

### SendGrid Dashboard

1. Mergi la **https://app.sendgrid.com** → **Email Activity**
2. Filtrează după:
   - Status
   - Date
   - Recipient

---

## 💰 Comparație Prețuri

| Provider | Free Tier | Preț după | Cost per 1K emailuri |
|----------|-----------|-----------|---------------------|
| **Resend** | 3,000/lună | $20/lună (50K) | $0.40 |
| **SendGrid** | 100/zi | $19.95/lună (50K) | $0.40 |
| **Mailgun** | 5,000/lună (3 luni) | $35/lună (50K) | $0.70 |
| **AWS SES** | 62,000/lună (din EC2) | $0.10/1K | $0.10 |

**Recomandare pentru Merlot:**
- **Start**: Resend (gratuit, simplu)
- **Scale**: AWS SES (cel mai ieftin la volum mare)

---

## ✅ Checklist Configurare

- [ ] Cont creat la providerul SMTP
- [ ] Domeniu adăugat și verificat
- [ ] DNS records adăugate (MX, SPF, DKIM)
- [ ] API Key creat și copiat
- [ ] SMTP credentials obținute
- [ ] Configurare în Supabase completă
- [ ] Test email trimis cu succes
- [ ] Email template personalizat
- [ ] DMARC record adăugat
- [ ] Deliverability testat (scor 9-10/10)

---

## 🚀 Next Steps

După configurarea SMTP:

1. **Testează resetarea parolei** în aplicație
2. **Personalizează template-urile** cu logo și culori Merlot
3. **Activează confirmarea email-ului** pentru securitate
4. **Monitorizează deliverability** săptămânal
5. **Configurează tracking** pentru analytics

---

## 🆘 Troubleshooting

### Email-urile ajung în spam?

✅ **Soluții:**
- Verifică SPF, DKIM, DMARC
- Încălzește domeniul (trimite gradual)
- Verifică spam score cu mail-tester.com
- Asigură-te că domeniul este verificat

### Nu primesc test email?

✅ **Soluții:**
- Verifică spam folder
- Verifică credențialele SMTP
- Verifică portul (465 SSL, 587 TLS)
- Testează cu alt email provider

### Eroare "Authentication failed"?

✅ **Soluții:**
- Verifică username și password
- Asigură-te că API Key este corect
- Verifică că domeniul este verificat
- Regenerază API Key dacă e necesar

---

**Gata!** Acum ai un sistem complet de email cu deliverability excelent! 🎉

Pentru întrebări sau probleme, verifică documentația providerului tău SMTP.
