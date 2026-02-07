import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  throw new Error("Please define the SENDGRID_API_KEY environment variable");
}

sgMail.setApiKey(SENDGRID_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await sgMail.send({
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || "noreply@tday.app",
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error}`);
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const verificationLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to t'day, ${username}!</h2>
      <p>Thank you for signing up. Please verify your email address to activate your account.</p>
      <p>
        <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email
        </a>
      </p>
      <p>Or copy this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link expires in 24 hours.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Verify your t'day account",
    html,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
): Promise<void> {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset/${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${username},</p>
      <p>We received a request to reset your password. Click the button below to create a new password.</p>
      <p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
      </p>
      <p>Or copy this link in your browser:</p>
      <p>${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
      <p style="color: #666; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: "Reset your t'day password",
    html,
  });
}

export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> {
  const recipientEmail = process.env.CONTACT_EMAIL || "contact@tday.app";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    </div>
  `;

  await sendEmail({
    to: recipientEmail,
    subject: `[Contact] ${subject}`,
    html,
  });
}

export default sgMail;
