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
import { X } from "lucide-react";

const steps = [
  { label: "Goals", description: "What you want" },
  { label: "Preferences", description: "How you work" },
  { label: "First Check-in", description: "Meet your coach" },
];

export default function OnboardingPreferencesPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("balanced");
  const [motivationalStyle, setMotivationalStyle] = useState("supportive");
  const [verbosity, setVerbosity] = useState("brief");
  const [accountability, setAccountability] = useState("gentle_nudge");
  const [motivatorInput, setMotivatorInput] = useState("");
  const [whatMotivates, setWhatMotivates] = useState<string[]>([]);
  const [burnoutInput, setBurnoutInput] = useState("");
  const [burnoutSignals, setBurnoutSignals] = useState<string[]>([]);
  const [ultimateGoals, setUltimateGoals] = useState("");
  const [saving, setSaving] = useState(false);

  const addMotivator = () => {
    if (!motivatorInput.trim()) return;
    setWhatMotivates([...whatMotivates, motivatorInput.trim()]);
    setMotivatorInput("");
  };

  const addBurnoutSignal = () => {
    if (!burnoutInput.trim()) return;
    setBurnoutSignals([...burnoutSignals, burnoutInput.trim()]);
    setBurnoutInput("");
  };

  const handleSubmit = async () => {
    setSaving(true);
    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || "Lucas",
        communicationStyle,
        motivationalStyle,
        verbosity,
        accountabilityPreference: accountability,
        whatMotivates,
        burnoutSignals,
        bestCheckinTime: "evening",
        goals: ultimateGoals,
      }),
    });
    setSaving(false);
    router.push("/onboarding/first-checkin");
  };

  return (
    <div>
      <StepIndicator currentStep={1} steps={steps} />

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-1">How should your coach talk to you?</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This helps your coach adapt to your style. You can always change this later.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your name</label>
              <Input
                placeholder="What should your coach call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Communication style</label>
                <Select
                  value={communicationStyle}
                  onValueChange={(v) => setCommunicationStyle(v || "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct — tell me straight</SelectItem>
                    <SelectItem value="gentle">Gentle — be supportive</SelectItem>
                    <SelectItem value="balanced">Balanced — mix of both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Motivational style</label>
                <Select
                  value={motivationalStyle}
                  onValueChange={(v) => setMotivationalStyle(v || "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="challenging">Challenging — push me</SelectItem>
                    <SelectItem value="supportive">Supportive — encourage me</SelectItem>
                    <SelectItem value="analytical">Analytical — show me data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Response length</label>
                <Select value={verbosity} onValueChange={(v) => setVerbosity(v || "")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="brief">Brief — get to the point</SelectItem>
                    <SelectItem value="detailed">Detailed — go deep</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Accountability</label>
                <Select
                  value={accountability}
                  onValueChange={(v) => setAccountability(v || "")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gentle_nudge">Gentle nudges</SelectItem>
                    <SelectItem value="direct_confrontation">
                      Direct — call me out
                    </SelectItem>
                    <SelectItem value="data_driven">
                      Data-driven — show evidence
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">What motivates you?</label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., competition, learning, recognition, autonomy"
                  value={motivatorInput}
                  onChange={(e) => setMotivatorInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMotivator()}
                />
                <Button variant="outline" onClick={addMotivator}>
                  Add
                </Button>
              </div>
              {whatMotivates.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {whatMotivates.map((m) => (
                    <Badge key={m} variant="secondary" className="gap-1">
                      {m}
                      <button
                        onClick={() =>
                          setWhatMotivates(whatMotivates.filter((x) => x !== m))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                How do you know you're burning out?
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., skipping check-ins, short responses, negative self-talk"
                  value={burnoutInput}
                  onChange={(e) => setBurnoutInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBurnoutSignal()}
                />
                <Button variant="outline" onClick={addBurnoutSignal}>
                  Add
                </Button>
              </div>
              {burnoutSignals.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {burnoutSignals.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button
                        onClick={() =>
                          setBurnoutSignals(burnoutSignals.filter((x) => x !== s))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                In your own words, what are you working toward?
              </label>
              <Textarea
                placeholder="Describe your bigger picture. What does success look like to you? What kind of life and work do you want in 2-3 years?"
                value={ultimateGoals}
                onChange={(e) => setUltimateGoals(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
