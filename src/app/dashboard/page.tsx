"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCoach } from "@/providers/coach-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardCheck,
  MessageSquare,
  Target,
  Plus,
  Flame,
  TrendingUp,
  Brain,
} from "lucide-react";
import type { Goal } from "@/types/goal";
import type { CoachMemory } from "@/types/memory";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, appState, isLoading } = useCoach();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [memories, setMemories] = useState<CoachMemory[]>([]);

  useEffect(() => {
    if (!isLoading) {
      fetch("/api/goals")
        .then((r) => r.json())
        .then(setGoals)
        .catch(() => {});
      fetch("/api/memories")
        .then((r) => r.json())
        .then((data) => setMemories(data.slice(0, 5)))
        .catch(() => {});
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const activeGoals = goals.filter((g) => g.status === "in_progress");
  const name = profile?.name || "Lucas";
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

  return (
    <div className="max-w-5xl space-y-8">
      {/* Welcome */}
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Good {greeting}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
        {appState.currentStreak > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-muted-foreground">
              {appState.currentStreak} day streak —{" "}
              {appState.currentStreak >= 7
                ? "You're on fire! Keep it going."
                : appState.currentStreak >= 3
                ? "Building momentum. Don't stop now."
                : "Keep showing up."}
            </span>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={() => router.push("/checkin")}
        >
          <ClipboardCheck className="h-6 w-6" />
          <span className="text-sm font-medium">Daily Check-in</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={() => router.push("/chat")}
        >
          <MessageSquare className="h-6 w-6" />
          <span className="text-sm font-medium">Talk to Coach</span>
        </Button>
        <Button
          variant="outline"
          className="h-auto py-6 flex flex-col items-center gap-2"
          onClick={() => router.push("/goals/new")}
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Add Goal</span>
        </Button>
      </div>

      {/* Goals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Goals
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/goals")}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent>
          {activeGoals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No active goals yet</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => router.push("/goals/new")}
                className="mt-1"
              >
                Create your first goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const completed = goal.milestones.filter(
                  (m) => m.completed
                ).length;
                const total = goal.milestones.length;
                const progress =
                  total > 0 ? Math.round((completed / total) * 100) : 0;

                return (
                  <div
                    key={goal.id}
                    className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => router.push(`/goals/${goal.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{goal.title}</h4>
                        <Badge
                          variant={
                            goal.priority === "high"
                              ? "destructive"
                              : goal.priority === "medium"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {goal.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {total > 0
                          ? `${completed}/${total} milestones`
                          : "No milestones yet — add some to track progress"}
                      </p>
                    </div>
                    {total > 0 && (
                      <div className="w-32">
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-muted-foreground text-right mt-1">
                          {progress}%
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Coach Insights */}
      {memories.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5" />
              What Your Coach Has Learned
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/memories")}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
                >
                  <div>
                    <Badge variant="outline" className="text-xs mb-1">
                      {memory.type.replace("_", " ")}
                    </Badge>
                    <p className="text-sm">{memory.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{appState.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{appState.totalCheckins}</p>
                <p className="text-xs text-muted-foreground">Total check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-xs text-muted-foreground">Active goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
