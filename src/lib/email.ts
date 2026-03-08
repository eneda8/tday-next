import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "no-reply@tday.co";
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/* ─────────────────────────────────────────────
   Shared email layout — warm paper notebook feel
   ───────────────────────────────────────────── */
function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F5F0E6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5F0E6;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#FFF8F0;border-radius:16px;overflow:hidden;border:1px solid #D4C4B0;">

        <!-- Header with logo -->
        <tr><td style="padding:32px 40px 16px;text-align:center;border-bottom:2px solid rgba(210,100,100,0.3);">
          <a href="${APP_URL}" style="text-decoration:none;">
            <span style="font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:700;color:#FFC107;letter-spacing:-0.5px;">t'day</span>
          </a>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 40px;">
          ${content}
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #E8DED0;text-align:center;">
          <p style="margin:0 0 8px;font-size:12px;color:#8B7E6F;">
            <a href="${APP_URL}/about" style="color:#8B7E6F;text-decoration:none;">About</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/privacy" style="color:#8B7E6F;text-decoration:none;">Privacy</a>
            &nbsp;&middot;&nbsp;
            <a href="${APP_URL}/terms" style="color:#8B7E6F;text-decoration:none;">Terms</a>
          </p>
          <p style="margin:0;font-size:11px;color:#B0A494;">
            &copy; ${new Date().getFullYear()} t'day &mdash; the world's first collective online journal
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function button(text: string, href: string) {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td align="center">
      <a href="${href}" style="display:inline-block;padding:14px 32px;background-color:#2D5F3F;color:#FFF8F0;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
        ${text}
      </a>
    </td></tr>
  </table>`;
}

function greeting(name: string) {
  return `<p style="margin:0 0 16px;font-size:16px;color:#3E3529;">Hi <strong>${name}</strong>,</p>`;
}

function text(content: string) {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#5C5048;">${content}</p>`;
}

function muted(content: string) {
  return `<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#8B7E6F;">${content}</p>`;
}

function linkFallback(url: string) {
  return muted(`Or copy this link into your browser:<br/><a href="${url}" style="color:#2D5F3F;word-break:break-all;">${url}</a>`);
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
