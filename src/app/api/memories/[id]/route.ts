import { NextResponse } from "next/server";
import { deleteMemory } from "@/lib/blob-store";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteMemory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete memory:", error);
    return NextResponse.json(
      { error: "Failed to delete memory" },
      { status: 500 }
    );
  }
}
