import { NextResponse } from "next/server";
import { evaluateProfile } from "@/lib/coach/insight-extractor";

export async function POST() {
  try {
    await evaluateProfile();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Insight generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
