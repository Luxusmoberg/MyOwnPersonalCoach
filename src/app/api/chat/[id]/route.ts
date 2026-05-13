import { NextResponse } from "next/server";
import { getConversation } from "@/lib/blob-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await getConversation(id);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Failed to get conversation:", error);
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 }
    );
  }
}
