export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt: string | null;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category:
    | "career"
    | "learning"
    | "health"
    | "finance"
    | "creative"
    | "other";
  priority: "high" | "medium" | "low";
  status: "not_started" | "in_progress" | "completed" | "paused";
  targetDate: string | null;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}
