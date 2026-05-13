import {
  getProfile,
  getGoals,
  getCheckins,
  getMemories,
  getAppState,
} from "@/lib/blob-store";
import { getTopMemories } from "@/lib/coach/memory-scorer";

export async function buildChatContext() {
  const [profile, goals, checkins, memories, appState] = await Promise.all([
    getProfile(),
    getGoals(),
    getCheckins(),
    getMemories(),
    getAppState(),
  ]);

  const recentCheckins = checkins
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  const recentMemories = getTopMemories(memories, 10);

  return {
    profile,
    goals,
    recentCheckins,
    memories: recentMemories,
    streak: appState.currentStreak,
  };
}
