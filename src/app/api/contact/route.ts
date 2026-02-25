import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    // If SendGrid is configured, send the email
    if (process.env.SENDGRID_API_KEY && process.env.CONTACT_EMAIL) {
      const sgMail = (await import("@sendgrid/mail")).default;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      await sgMail.send({
        to: process.env.CONTACT_EMAIL,
        from: process.env.SENDGRID_FROM_EMAIL || process.env.CONTACT_EMAIL,
        replyTo: email,
        subject: `[t'day Contact] ${subject}`,
        text: `From: ${email}\nSubject: ${subject}\n\n${message}`,
      });
    } else {
      // Log to server console when SendGrid is not configured
      console.log("=== Contact Form Submission ===");
      console.log("From:", email);
      console.log("Subject:", subject);
      console.log("Message:", message);
      console.log("===============================");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
