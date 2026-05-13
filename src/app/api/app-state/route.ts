import { NextResponse } from "next/server";
import { getAppState, setAppState } from "@/lib/blob-store";

export async function GET() {
  try {
    const state = await getAppState();
    return NextResponse.json(state);
  } catch {
    return NextResponse.json(
      { error: "Failed to load app state" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existing = await getAppState();
    const updated = { ...existing, ...body };
    await setAppState(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update app state" },
      { status: 500 }
    );
  }
}
