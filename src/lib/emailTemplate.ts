// ============================================
// MERLOT VIP — LUXURY EMAIL TEMPLATES
// ============================================

export interface ResetEmailOptions {
  recipientName: string;
  recipientEmail: string;
  resetUrl: string;
  token?: string;
  expireHours?: number;
}

/**
 * Generates an ultra-luxurious, production-ready HTML email for password reset.
 * Styled with Merlot Nightclub's signature Deep Wine Noir (#0d0507), Merlot Crimson (#722F37),
 * and Metallic Gold (#D4AF37) palette.
 */
export function generateMerlotResetEmailHtml({
  recipientName,
  recipientEmail,
  resetUrl,
  expireHours = 24,
}: ResetEmailOptions): string {
  const safeName = recipientName || 'Client VIP';
  const safeEmail = recipientEmail || 'client@merlot.ro';

  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resetare Parolă Merlot VIP</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #080305;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e5e5e5;
      -webkit-font-smoothing: antialiased;
    }
    table { border-collapse: collapse; }
    a { text-decoration: none; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #080305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f3f3;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080305; min-height: 100vh; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #16080c 0%, #0d0407 100%); border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.28); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(114, 47, 55, 0.25); overflow: hidden;">
          
          <!-- Top Wine Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #722F37 0%, #D4AF37 50%, #722F37 100%);"></td>
          </tr>

          <!-- Header with Monogram -->
          <tr>
            <td align="center" style="padding: 42px 30px 20px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="width: 72px; height: 72px; border-radius: 50%; background: radial-gradient(circle, #722F37 0%, #300f15 100%); border: 1.5px solid #D4AF37; box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); line-height: 70px; text-align: center;">
                      <span style="font-family: Georgia, 'Playfair Display', serif; font-size: 36px; font-weight: bold; color: #D4AF37; display: inline-block;">M</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 18px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; letter-spacing: 0.35em; color: #D4AF37; text-transform: uppercase; font-weight: 600;">Merlot Nightclub</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-family: Georgia, serif; font-size: 13px; letter-spacing: 0.15em; color: rgba(255, 255, 255, 0.5); font-style: italic;">Exclusivitate & Privilegii VIP</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="1" style="background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 40px 25px 40px; text-align: left;">
              <h1 style="margin: 0 0 14px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 24px; font-weight: 500; color: #ffffff; text-align: center; letter-spacing: -0.01em;">
                Resetare Securizată a Parolei
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #d0c4c7; text-align: center;">
                Salut, <strong style="color: #ffffff;">${safeName}</strong>. Am recepționat o cerere de resetare a parolei pentru contul asociat adresei <span style="color: #D4AF37;">${safeEmail}</span>.
              </p>

              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #b8a6aa; line-height: 1.5;">
                  Apasă pe butonul de mai jos pentru a alege o parolă nouă. Link-ul este personalizat și valabil pentru următoarele <strong style="color: #D4AF37;">${expireHours} de ore</strong>.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #b38f2a 100%); color: #0f0507; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 16px 38px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.35); border: 1px solid #ffde6a;">
                      Resetează Parola Acum &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="border-left: 2px solid #722F37; padding: 12px 16px; margin: 24px 0 15px 0; background: rgba(114, 47, 55, 0.12); border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 12px; color: #d6b8be; line-height: 1.5;">
                  <strong>Securitate Cont:</strong> Dacă nu ai solicitat tu această resetare, te rugăm să ignori acest email. Parola ta actuală rămâne neschimbată și în deplină siguranță.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 24px 0 6px 0; font-size: 11px; color: rgba(255, 255, 255, 0.4); line-height: 1.4;">
                Dacă butonul nu funcționează, copiază și lipește următorul link direct în bara adresei din browser:
              </p>
              <div style="background-color: #070204; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 14px; word-break: break-all; font-family: monospace; font-size: 11px; color: #D4AF37;">
                ${resetUrl}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 34px 40px; background-color: #090305; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 0.15em; color: rgba(212, 175, 55, 0.7); text-transform: uppercase;">
                Merlot Nightclub • VIP Experience
              </p>
              <p style="margin: 0; font-size: 10px; color: rgba(255, 255, 255, 0.3); line-height: 1.4;">
                Acest mesaj a fost transmis securizat de către sistemul intern de loialitate Merlot NFC.<br>
                Nu răspundeți la acest email automat.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Returns the exact HTML template ready to paste into Supabase:
 * Supabase Dashboard -> Authentication -> Email Templates -> Reset Password
 * Uses the Supabase variable {{ .ConfirmationURL }}
 */
export function getSupabaseResetEmailTemplate(): string {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resetare Parolă Merlot VIP</title>
</head>
<body style="margin: 0; padding: 0; background-color: #080305; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f3f3;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #080305; min-height: 100vh; padding: 40px 15px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #16080c 0%, #0d0407 100%); border-radius: 20px; border: 1px solid rgba(212, 175, 55, 0.28); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 35px rgba(114, 47, 55, 0.25); overflow: hidden;">
          
          <!-- Top Wine Accent Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #722F37 0%, #D4AF37 50%, #722F37 100%);"></td>
          </tr>

          <!-- Header with Monogram -->
          <tr>
            <td align="center" style="padding: 42px 30px 20px 30px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <div style="width: 72px; height: 72px; border-radius: 50%; background: radial-gradient(circle, #722F37 0%, #300f15 100%); border: 1.5px solid #D4AF37; box-shadow: 0 0 20px rgba(212, 175, 55, 0.4); line-height: 70px; text-align: center;">
                      <span style="font-family: Georgia, 'Playfair Display', serif; font-size: 36px; font-weight: bold; color: #D4AF37; display: inline-block;">M</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 18px;">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; letter-spacing: 0.35em; color: #D4AF37; text-transform: uppercase; font-weight: 600;">Merlot Nightclub</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 4px;">
                    <span style="font-family: Georgia, serif; font-size: 13px; letter-spacing: 0.15em; color: rgba(255, 255, 255, 0.5); font-style: italic;">Exclusivitate & Privilegii VIP</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 40px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td height="1" style="background: linear-gradient(90deg, transparent 0%, rgba(212, 175, 55, 0.3) 50%, transparent 100%);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 40px 25px 40px; text-align: left;">
              <h1 style="margin: 0 0 14px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 24px; font-weight: 500; color: #ffffff; text-align: center; letter-spacing: -0.01em;">
                Resetare Securizată a Parolei
              </h1>
              
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #d0c4c7; text-align: center;">
                Salut, membru <strong style="color: #ffffff;">Merlot VIP</strong>. Am recepționat o cerere de resetare a parolei pentru contul tău asociat adresei <span style="color: #D4AF37;">{{ .Email }}</span>.
              </p>

              <div style="background-color: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 12px; padding: 18px 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #b8a6aa; line-height: 1.5;">
                  Apasă pe butonul de mai jos pentru a alege o parolă nouă. Link-ul este personalizat și securizat.
                </p>
              </div>

              <!-- CTA Button -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 32px 0 24px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #b38f2a 100%); color: #0f0507; font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 16px 38px; border-radius: 12px; text-decoration: none; box-shadow: 0 10px 25px rgba(212, 175, 55, 0.35); border: 1px solid #ffde6a;">
                      Resetează Parola Acum &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <div style="border-left: 2px solid #722F37; padding: 12px 16px; margin: 24px 0 15px 0; background: rgba(114, 47, 55, 0.12); border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 12px; color: #d6b8be; line-height: 1.5;">
                  <strong>Securitate Cont:</strong> Dacă nu ai solicitat tu această resetare, ignoră cu încredere acest mesaj. Parola ta actuală rămâne neschimbată și protejată.
                </p>
              </div>

              <!-- Fallback Link -->
              <p style="margin: 24px 0 6px 0; font-size: 11px; color: rgba(255, 255, 255, 0.4); line-height: 1.4;">
                Dacă butonul nu răspunde la click, copiază link-ul direct în browser:
              </p>
              <div style="background-color: #070204; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px 14px; word-break: break-all; font-family: monospace; font-size: 11px; color: #D4AF37;">
                {{ .ConfirmationURL }}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 34px 40px; background-color: #090305; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 0.15em; color: rgba(212, 175, 55, 0.7); text-transform: uppercase;">
                Merlot Nightclub • VIP Experience
              </p>
              <p style="margin: 0; font-size: 10px; color: rgba(255, 255, 255, 0.3); line-height: 1.4;">
                Acest mesaj a fost transmis securizat de către sistemul intern de loialitate Merlot.<br>
                Nu răspundeți la acest email automat.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
