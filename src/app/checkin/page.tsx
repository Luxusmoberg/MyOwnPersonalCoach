"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame, Calendar } from "lucide-react";
import type { Checkin } from "@/types/checkin";

export default function CheckinPage() {
  const router = useRouter();
  const [accomplishment, setAccomplishment] = useState("");
  const [challenge, setChallenge] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [focusLevel, setFocusLevel] = useState<number | null>(null);
  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Checkin | null>(null);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/app-state")
      .then((r) => r.json())
      .then((d) => setStreak(d.currentStreak))
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accomplishment,
          challenge,
          tomorrowPlan,
          energyLevel,
          focusLevel,
          moodRating,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      // Handle error
    }
    setLoading(false);
  };

  const canSubmit =
    accomplishment.trim() && challenge.trim() && tomorrowPlan.trim();

  // Show result
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-950/20 px-4 py-1.5 text-sm text-green-700 dark:text-green-400 mb-4">
            <Flame className="h-4 w-4" />
            Check-in complete — {streak + 1} day streak
          </div>
          <h1 className="text-2xl font-semibold mb-2">
            Nice work, Lucas
          </h1>
          <p className="text-muted-foreground">
            Your coach had this to say:
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {result.aiResponse}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={() => router.push("/chat")}>
            Talk to Coach More
          </Button>
        </div>
      </div>
    );
  }

  // Check-in form
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{today}</p>
          {streak > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="h-3 w-3 text-orange-500" />
              {streak} day streak
            </Badge>
          )}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Daily Check-in
        </h1>
        <p className="text-muted-foreground mt-1">
          Reflect on your day. Your coach will read this and respond.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              What did you accomplish today?
            </label>
            <Textarea
              placeholder="What progress did you make? Even small wins count."
              value={accomplishment}
              onChange={(e) => setAccomplishment(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              What was hard?
            </label>
            <Textarea
              placeholder="What got in your way? What felt difficult?"
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              What's one thing you'll do tomorrow?
            </label>
            <Textarea
              placeholder="Pick one concrete, small action."
              value={tomorrowPlan}
              onChange={(e) => setTomorrowPlan(e.target.value)}
              rows={2}
              disabled={loading}
            />
          </div>

          {/* Optional metrics */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-4">
              Optional — rate how you're feeling (1-10)
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Energy", value: energyLevel, set: setEnergyLevel, color: "bg-yellow-500" },
                { label: "Focus", value: focusLevel, set: setFocusLevel, color: "bg-blue-500" },
                { label: "Mood", value: moodRating, set: setMoodRating, color: "bg-green-500" },
              ].map(({ label, value, set, color }) => (
                <div key={label} className="space-y-2">
                  <p className="text-xs text-center text-muted-foreground">
                    {label}
                  </p>
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => set(n === value ? null : n)}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          value && n <= value ? color : "bg-muted hover:bg-muted-foreground/30"
                        }`}
                        title={`${n}/10`}
                      />
                    ))}
                  </div>
                  {value && (
                    <p className="text-xs text-center font-medium">
                      {value}/10
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!canSubmit || loading} size="lg">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Your coach is thinking...
            </>
          ) : (
            "Submit Check-in"
          )}
        </Button>
      </div>
    </div>
  );
}
