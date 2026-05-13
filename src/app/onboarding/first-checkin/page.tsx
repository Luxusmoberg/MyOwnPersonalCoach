"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Brain } from "lucide-react";

const steps = [
  { label: "Goals", description: "What you want" },
  { label: "Preferences", description: "How you work" },
  { label: "First Check-in", description: "Meet your coach" },
];

export default function FirstCheckinPage() {
  const router = useRouter();
  const [accomplishment, setAccomplishment] = useState("");
  const [challenge, setChallenge] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [done, setDone] = useState(false);

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
          energyLevel: null,
          focusLevel: null,
          moodRating: null,
        }),
      });
      const data = await res.json();
      setResponse(data.aiResponse);
      setDone(true);

      // Mark onboarding complete
      await fetch("/api/app-state", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingComplete: true }),
      });
    } catch {
      // Handle error
    }
    setLoading(false);
  };

  if (done && response) {
    return (
      <div>
        <StepIndicator currentStep={2} steps={steps} />
        <div className="space-y-6">
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <Brain className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              Your coach is ready
            </h2>
            <p className="text-muted-foreground">
              Here's what your coach had to say:
            </p>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <div className="flex gap-3 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-medium">
                LC
              </div>
              <div>
                <p className="text-xs font-medium">Your Coach</p>
                <p className="text-xs text-muted-foreground">Just now</p>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {response}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = accomplishment.trim() && challenge.trim() && tomorrowPlan.trim();

  return (
    <div>
      <StepIndicator currentStep={2} steps={steps} />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Let your coach get to know you
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Answer these three questions honestly. Your coach will read your
            answers and respond personally.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                What did you accomplish today?
              </label>
              <Textarea
                placeholder="Even if it was small. What progress did you make?"
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
                placeholder="What got in your way? What felt difficult or frustrating?"
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
                placeholder="Pick one concrete action. Small is better than ambitious."
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                rows={2}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={() => router.back()} disabled={loading}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Your coach is thinking...
              </>
            ) : (
              "Meet Your Coach"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
