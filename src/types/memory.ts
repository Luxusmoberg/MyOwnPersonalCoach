export type MemoryType =
  | "pattern"
  | "preference"
  | "goal_update"
  | "personal_detail"
  | "insight";

export interface CoachMemory {
  id: string;
  type: MemoryType;
  content: string;
  source: string;
  confidence: number;
  createdAt: string;
}
