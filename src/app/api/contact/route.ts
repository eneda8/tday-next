import { NextRequest, NextResponse } from "next/server";
import {
  sendContactConfirmation,
  sendContactToSupport,
} from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    await Promise.all([
      sendContactToSupport(email, subject, message),
      sendContactConfirmation(email, subject),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}
