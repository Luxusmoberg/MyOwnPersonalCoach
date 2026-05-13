import { NextResponse } from "next/server";
import { getMemories } from "@/lib/blob-store";

export async function GET() {
  try {
    const memories = await getMemories();
    const sorted = memories.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Failed to get memories:", error);
    return NextResponse.json(
      { error: "Failed to load memories" },
      { status: 500 }
    );
  }
}
