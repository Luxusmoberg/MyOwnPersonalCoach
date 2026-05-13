import { NextResponse } from "next/server";
import { getProfile, setProfile } from "@/lib/blob-store";
import { profileSchema } from "@/lib/validators";
import { DEFAULT_PROFILE } from "@/types/user";
import type { UserProfile } from "@/types/user";

export async function GET() {
  try {
    const profile = await getProfile();
    if (!profile) {
      return NextResponse.json(DEFAULT_PROFILE);
    }
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to get profile:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getProfile();
    const profile: UserProfile = {
      ...parsed.data,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setProfile(profile);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    );
  }
}
