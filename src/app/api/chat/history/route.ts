import { NextResponse } from "next/server";
import { getConversations } from "@/lib/blob-store";

export async function GET() {
  try {
    const conversations = await getConversations();
    const sorted = conversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    return NextResponse.json(sorted);
  } catch (error) {
    console.error("Failed to get conversations:", error);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 }
    );
  }
}
