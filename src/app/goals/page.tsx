"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, ArrowRight } from "lucide-react";
import type { Goal } from "@/types/goal";

const categoryColors: Record<string, string> = {
  career: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  learning: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  health: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  finance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  creative: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setGoals(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return g.status === "in_progress";
    if (filter === "completed") return g.status === "completed";
    if (filter === "paused") return g.status === "paused";
    return true;
  });

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="text-muted-foreground mt-1">
            What you're working toward
          </p>
        </div>
        <Button onClick={() => router.push("/goals/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">No goals yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first goal and let your coach help you achieve it.
          </p>
          <Button onClick={() => router.push("/goals/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const completed = goal.milestones.filter((m) => m.completed).length;
            const total = goal.milestones.length;
            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Card
                key={goal.id}
                className="cursor-pointer hover:bg-accent/30 transition-colors"
                onClick={() => router.push(`/goals/${goal.id}`)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{goal.title}</h3>
                        <Badge
                          variant="outline"
                          className={categoryColors[goal.category] || ""}
                        >
                          {goal.category}
                        </Badge>
                        <Badge
                          variant={
                            goal.priority === "high"
                              ? "destructive"
                              : goal.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {goal.description}
                      </p>
                      {total > 0 ? (
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="h-2 flex-1 max-w-[200px]" />
                          <span className="text-xs text-muted-foreground">
                            {completed}/{total} milestones
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          No milestones yet
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
