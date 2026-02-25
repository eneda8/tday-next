import sgMail from "@sendgrid/mail";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getSgMail() {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }
  sgMail.setApiKey(key);
  return sgMail;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  const mail = getSgMail();
  await mail.send({
    to: options.to,
    from: process.env.SENDGRID_FROM_EMAIL || "no-reply@tday.co",
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const verificationLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your t'day account",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to t'day, ${username}!</h2>
      <p>Thank you for signing up. Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationLink}" style="background-color: #2D5F3F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p>${verificationLink}</p>
      <p>This link expires in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    </div>`,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset/${token}`;

  await sendEmail({
    to: email,
    subject: "Reset your t'day password",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <p>
        <a href="${resetLink}" style="background-color: #2D5F3F; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link into your browser:</p>
      <p>${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>`,
  });
}

export default sgMail;
