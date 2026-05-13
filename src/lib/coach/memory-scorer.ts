import type { CoachMemory } from "@/types/memory";

export function getTopMemories(
  memories: CoachMemory[],
  limit: number,
  context?: string
): CoachMemory[] {
  const scored = memories.map((m) => ({
    memory: m,
    score: scoreMemory(m, context),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.memory);
}

function scoreMemory(memory: CoachMemory, context?: string): number {
  let score = 0;

  // Recency boost — newer memories score higher
  const ageInDays =
    (Date.now() - new Date(memory.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 30 - ageInDays) / 30; // 0-1 based on recency within 30 days

  // Confidence boost
  score += memory.confidence * 0.5;

  // Type priority — patterns and preferences are most actionable
  const typeWeight: Record<string, number> = {
    pattern: 1.0,
    preference: 0.9,
    goal_update: 0.8,
    insight: 0.7,
    personal_detail: 0.6,
  };
  score += (typeWeight[memory.type] || 0.5) * 0.3;

  // Contextual relevance — keyword match with current conversation
  if (context) {
    const words = context.toLowerCase().split(/\s+/);
    const memoryWords = memory.content.toLowerCase();
    const matchCount = words.filter((w) => w.length > 3 && memoryWords.includes(w)).length;
    score += (matchCount / Math.max(words.length, 1)) * 0.5;
  }

  return score;
}
