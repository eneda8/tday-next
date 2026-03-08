import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "t'day <no-reply@tday.co>";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/* ─────────────────────────────────────────────
   Shared email layout — ruled notebook paper background
   with clean white content card on top, matching tday.co
   Holes on left side, continuous ruled lines, red margin
   ───────────────────────────────────────────── */

/* Single notebook hole — solid circle matching the site */
function hole() {
  return `<div class="hole" style="width:18px;height:18px;border-radius:50%;background-color:#E0D5C5;margin:0 auto;"></div>`;
}

function layout(content: string) {
  /* CSS background-image for ruled lines — works in Apple Mail, iOS Gmail,
     Outlook Mac. Gmail web strips it but still looks clean without lines. */
  const ruledBg = "background-image:linear-gradient(to bottom, rgba(190,175,155,0.4) 0%, transparent 1px);background-size:100% 24px;background-position:0 0;";

  return `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>t'day</title>
  <style>
    :root { color-scheme: light; }
    @media (prefers-color-scheme: dark) {
      .email-bg { background-color: #FFF8F0 !important; }
      .content-card { background-color: #FFFFFF !important; }
      .hole { background-color: #E0D5C5 !important; }
      .text-heading { color: #3E3529 !important; }
      .text-body { color: #333333 !important; }
      .text-muted { color: #8B7E6F !important; }
      .btn-forest { background-color: #2D5F3F !important; }
      .btn-text { color: #FFFFFF !important; }
      .margin-line { border-right-color: rgba(210,100,100,0.5) !important; }
      u + .body .email-bg { background-color: #FFF8F0 !important; }
    }
  </style>
</head>
<body class="body" style="margin:0;padding:0;background-color:#FFF8F0;font-family:'Open Sans','Segoe UI',Tahoma,Geneva,Verdana,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Full ruled-paper background with continuous lines -->
  <table class="email-bg" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#FFF8F0;${ruledBg}">
    <tr>

      <!-- Left column: holes + red margin line -->
      <td class="margin-line" width="36" style="vertical-align:top;border-right:2px solid rgba(210,100,100,0.5);">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <!-- Spacer before first hole -->
          <tr><td style="height:80px;font-size:1px;">&nbsp;</td></tr>
          <!-- Hole 1 -->
          <tr><td align="center" style="padding:0 4px;">${hole()}</td></tr>
          <!-- Gap between holes -->
          <tr><td style="height:180px;font-size:1px;">&nbsp;</td></tr>
          <!-- Hole 2 -->
          <tr><td align="center" style="padding:0 4px;">${hole()}</td></tr>
          <!-- Gap between holes -->
          <tr><td style="height:180px;font-size:1px;">&nbsp;</td></tr>
          <!-- Hole 3 -->
          <tr><td align="center" style="padding:0 4px;">${hole()}</td></tr>
        </table>
      </td>

      <!-- Main content area -->
      <td style="vertical-align:top;padding:40px 24px 32px;">

        <!-- Content card — clean white, sits on the paper -->
        <table align="center" class="content-card" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;background-color:#FFFFFF;border-radius:12px;border:1px solid rgba(212,196,176,0.4);box-shadow:0 2px 12px rgba(62,53,41,0.1);overflow:hidden;">

          <!-- Logo header -->
          <tr><td style="padding:28px 32px 20px;text-align:center;">
            <a href="${APP_URL}" style="text-decoration:none;">
              <span style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:700;font-style:italic;color:#FFC107;">t'day</span>
            </a>
          </td></tr>

          <!-- Gold accent line -->
          <tr><td style="padding:0 32px;">
            <div style="height:2px;background:linear-gradient(to right,transparent,#FFC107,transparent);"></div>
          </td></tr>

          <!-- Body content -->
          <tr><td style="padding:24px 32px 28px;">
            ${content}
          </td></tr>

        </table>

        <!-- Footer on the ruled paper below the card -->
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:480px;margin:0 auto;">
          <tr><td style="padding:20px 0 0;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;">
              <a class="text-muted" href="${APP_URL}/about" style="color:#8B7E6F;text-decoration:none;">About</a>
              <span style="color:#B0A494;">&nbsp;&middot;&nbsp;</span>
              <a class="text-muted" href="${APP_URL}/privacy" style="color:#8B7E6F;text-decoration:none;">Privacy</a>
              <span style="color:#B0A494;">&nbsp;&middot;&nbsp;</span>
              <a class="text-muted" href="${APP_URL}/terms" style="color:#8B7E6F;text-decoration:none;">Terms</a>
            </p>
            <p class="text-muted" style="margin:0;font-size:11px;color:#B0A494;">
              &copy; ${new Date().getFullYear()} t'day &mdash; the world's first collective online journal
            </p>
          </td></tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(label: string, href: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr><td align="center">
      <a class="btn-forest" href="${href}" style="display:inline-block;padding:14px 36px;background-color:#2D5F3F;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
        <span class="btn-text" style="color:#FFFFFF;">${label}</span>
      </a>
    </td></tr>
  </table>`;
}

function greeting(name: string) {
  return `<p class="text-heading" style="margin:0 0 16px;font-size:16px;color:#3E3529;">Hi <strong>${name}</strong>,</p>`;
}

function text(content: string) {
  return `<p class="text-body" style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#333333;">${content}</p>`;
}

function muted(content: string) {
  return `<p class="text-muted" style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#8B7E6F;">${content}</p>`;
}

function linkFallback(url: string) {
  return muted(`Or copy this link:<br/><a href="${url}" style="color:#2D5F3F;word-break:break-all;">${url}</a>`);
}

/* ─────────────────────────────────────────────
   Email templates
   ───────────────────────────────────────────── */

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const link = `${APP_URL}/verify?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your t'day account",
    html: layout(`
      ${greeting(username)}
      ${text("Welcome to t'day! We're glad you're here. Please verify your email address to activate your account and start rating your days.")}
      ${button("Verify My Email", link)}
      ${linkFallback(link)}
      ${muted("This link expires in 1 hour. If you didn't create this account, you can safely ignore this email.")}
    `),
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const link = `${APP_URL}/reset/${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your t'day password",
    html: layout(`
      ${greeting(username)}
      ${text("We received a request to reset your password. Click the button below to choose a new one.")}
      ${button("Reset Password", link)}
      ${linkFallback(link)}
      ${muted("This link expires in 1 hour. If you didn't request this, your password will remain unchanged.")}
    `),
  });
}

export async function sendPasswordChangedEmail(
  email: string,
  username: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your t'day password was changed",
    html: layout(`
      ${greeting(username)}
      ${text("This is a confirmation that the password for your t'day account has just been changed.")}
      ${text("If you did not make this change, please contact us immediately.")}
      ${button("Go to t'day", APP_URL)}
    `),
  });
}

export async function sendContactConfirmation(
  email: string,
  subject: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "We've received your message",
    html: layout(`
      ${greeting("there")}
      ${text(`Thanks for reaching out! We've received your message regarding <strong>${subject}</strong> and will get back to you within 24 hours.`)}
      ${text("In the meantime, feel free to keep rating your days.")}
      ${button("Back to t'day", APP_URL)}
    `),
  });
}

export async function sendContactToSupport(
  fromEmail: string,
  subject: string,
  message: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: "enedaxhambazi@gmail.com",
    replyTo: fromEmail,
    subject: `[t'day Contact] ${subject}`,
    html: layout(`
      <p style="margin:0 0 8px;font-size:13px;color:#8B7E6F;">From: ${fromEmail}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#8B7E6F;">Subject: ${subject}</p>
      <hr style="border:none;border-top:1px solid #E8DED0;margin:16px 0;">
      ${text(message.replace(/\n/g, "<br/>"))}
    `),
  });
}

export async function sendAccountDeletedEmail(
  email: string,
  username: string
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Your t'day account has been deleted",
    html: layout(`
      ${greeting(username)}
      ${text("Your t'day account has been deleted — we're sorry to see you go. All your ratings, journals, and data have been removed.")}
      ${text("If you ever want to come back and start rating your days again, we'll be here. \u2728")}
      ${button("Visit t'day", APP_URL)}
      ${muted("If you didn't request this, please contact us immediately.")}
    `),
  });
}
