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

    if (process.env.SENDGRID_API_KEY) {
      const sgMail = (await import("@sendgrid/mail")).default;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      // Send to support
      await sgMail.send({
        to: "support@tday.co",
        from: "support@tday.co",
        replyTo: email,
        subject: `Message from ${email} re: ${subject}`,
        text: message,
      });

      // Send confirmation to user
      await sgMail.send({
        to: email,
        from: "noreply@tday.co",
        subject: "We've received your message",
        html: `<p>Hi there,</p>
        <p>Thanks for reaching out to t'day! We've received your message regarding <strong>${subject}</strong> and will get back to you within 24 hours.</p>
        <p>Best,<br/>The t'day Team</p>`,
      });
    } else {
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
