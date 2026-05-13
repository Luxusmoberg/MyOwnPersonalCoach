import { NextResponse } from "next/server";
import { getUserId } from "@/lib/auth";
import { getUserById } from "@/lib/blob-store";

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ authenticated: false });
  }

  const user = await getUserById(userId);
  return NextResponse.json({
    authenticated: true,
    user: user ? { id: user.id, username: user.username, email: user.email } : null,
  });
}
