"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { Goal, Milestone } from "@/types/goal";

export default function GoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");
  const [newMilestone, setNewMilestone] = useState("");

  useEffect(() => {
    fetchGoal();
  }, [goalId]);

  const fetchGoal = async () => {
    const res = await fetch(`/api/goals/${goalId}`);
    const data = await res.json();
    if (data.id) {
      setGoal(data);
      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setPriority(data.priority);
      setStatus(data.status);
    }
    setLoading(false);
  };

  const saveGoal = async () => {
    if (!goal) return;
    setSaving(true);
    await fetch(`/api/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category,
        priority,
        status,
        milestones: goal.milestones,
      }),
    });
    await fetchGoal();
    setEditing(false);
    setSaving(false);
  };

  const addMilestone = async () => {
    if (!newMilestone.trim() || !goal) return;
    const milestone: Milestone = {
      id: `ms_${Date.now()}`,
      title: newMilestone.trim(),
      completed: false,
      completedAt: null,
    };
    const updated = { ...goal, milestones: [...goal.milestones, milestone] };
    await fetch(`/api/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setGoal(updated);
    setNewMilestone("");
  };

  const toggleMilestone = async (milestoneId: string) => {
    if (!goal) return;
    const updated = {
      ...goal,
      milestones: goal.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date().toISOString() : null,
            }
          : m
      ),
    };
    await fetch(`/api/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setGoal(updated);
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!goal) return;
    const updated = {
      ...goal,
      milestones: goal.milestones.filter((m) => m.id !== milestoneId),
    };
    await fetch(`/api/goals/${goalId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setGoal(updated);
  };

  const deleteGoal = async () => {
    await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
    router.push("/goals");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h2 className="text-lg font-medium mb-2">Goal not found</h2>
        <Button variant="link" onClick={() => router.push("/goals")}>
          Back to goals
        </Button>
      </div>
    );
  }

  const completed = goal.milestones.filter((m) => m.completed).length;
  const total = goal.milestones.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryColors: Record<string, string> = {
    career: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
    learning:
      "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
    health:
      "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
    finance:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
    creative: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-400",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/goals")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight truncate flex-1">
          {editing ? "Edit Goal" : goal.title}
        </h1>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={saveGoal} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={deleteGoal}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v || "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="career">Career</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priority} onValueChange={(v) => setPriority(v || "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={status} onValueChange={(v) => setStatus(v || "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={categoryColors[goal.category] || ""}>
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
                {goal.priority} priority
              </Badge>
              <Badge variant="outline">{goal.status.replace("_", " ")}</Badge>
            </div>
            <p className="text-muted-foreground">{goal.description}</p>
            {total > 0 && (
              <div className="flex items-center gap-3">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground">
                  {progress}%
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            Milestones ({completed}/{total})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No milestones yet. Add some to break your goal into actionable steps.
            </p>
          ) : (
            <div className="space-y-2">
              {goal.milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Checkbox
                    checked={m.completed}
                    onCheckedChange={() => toggleMilestone(m.id)}
                  />
                  <span
                    className={`flex-1 text-sm ${
                      m.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {m.title}
                  </span>
                  <button
                    onClick={() => deleteMilestone(m.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Add a milestone..."
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addMilestone()}
            />
            <Button
              variant="outline"
              onClick={addMilestone}
              disabled={!newMilestone.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
