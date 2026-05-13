"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

const steps = [
  { label: "Goals", description: "What you want" },
  { label: "Preferences", description: "How you work" },
  { label: "First Check-in", description: "Meet your coach" },
];

interface DraftGoal {
  title: string;
  description: string;
  category: string;
  priority: string;
}

export default function OnboardingGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<DraftGoal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("career");
  const [priority, setPriority] = useState("medium");
  const [saving, setSaving] = useState(false);

  const addGoal = () => {
    if (!title.trim() || !description.trim()) return;
    setGoals([
      ...goals,
      {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
      },
    ]);
    setTitle("");
    setDescription("");
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  const handleContinue = async () => {
    setSaving(true);
    for (const goal of goals) {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...goal,
          status: "not_started",
          targetDate: null,
          milestones: [],
        }),
      });
    }
    setSaving(false);
    router.push("/onboarding/preferences");
  };

  return (
    <div>
      <StepIndicator currentStep={0} steps={steps} />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-1">What do you want to achieve?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Add the goals you want your coach to help you with. Be specific — the
            more detail, the better your coach can help.
          </p>

          {/* Goal list */}
          {goals.length > 0 && (
            <div className="space-y-3 mb-6">
              {goals.map((goal, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between rounded-lg border p-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{goal.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        {goal.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <button
                    onClick={() => removeGoal(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-4 mt-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add goal form */}
          <div className="rounded-lg border p-4 space-y-4">
            <Input
              placeholder="Goal title (e.g. 'Launch my freelance business')"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addGoal()}
            />
            <Textarea
              placeholder="What does success look like? Why is this important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <div className="flex gap-3">
              <Select value={category} onValueChange={(v) => setCategory(v || "")}>
                <SelectTrigger className="w-40">
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
              <Select value={priority} onValueChange={(v) => setPriority(v || "")}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High priority</SelectItem>
                  <SelectItem value="medium">Medium priority</SelectItem>
                  <SelectItem value="low">Low priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={addGoal}
                disabled={!title.trim() || !description.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => router.push("/onboarding/preferences")}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={saving}
          >
            {saving ? "Saving..." : goals.length === 0 ? "Skip — I'll add later" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
