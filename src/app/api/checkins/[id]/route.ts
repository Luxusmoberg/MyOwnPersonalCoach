import { NextResponse } from "next/server";
import { getCheckin } from "@/lib/blob-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const checkin = await getCheckin(id);
    if (!checkin) {
      return NextResponse.json(
        { error: "Check-in not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(checkin);
  } catch (error) {
    console.error("Failed to get check-in:", error);
    return NextResponse.json(
      { error: "Failed to load check-in" },
      { status: 500 }
    );
  }
}
