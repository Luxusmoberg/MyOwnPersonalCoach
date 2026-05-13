import { NextResponse } from "next/server";
import { getGoal, setGoal, deleteGoal } from "@/lib/blob-store";
import { goalSchema } from "@/lib/validators";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const goal = await getGoal(id);
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json(goal);
  } catch (error) {
    console.error("Failed to get goal:", error);
    return NextResponse.json({ error: "Failed to load goal" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = goalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid goal data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await getGoal(id);
    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const goal = {
      ...existing,
      ...parsed.data,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    await setGoal(id, goal);
    return NextResponse.json(goal);
  } catch (error) {
    console.error("Failed to update goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteGoal(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
