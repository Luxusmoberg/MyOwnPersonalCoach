import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Subject and message are required" },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Lucas Coach <onboarding@resend.dev>",
      to: "lucas.moberg.poulsen@gmail.com",
      subject: `[Coach] ${parsed.data.subject}`,
      text: parsed.data.message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to send contact email:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
