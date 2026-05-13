"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Loader2, Download } from "lucide-react";
import type { UserProfile } from "@/types/user";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
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

  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) {
          setProfile(data);
          setName(data.name);
          setCommunicationStyle(data.communicationStyle);
          setMotivationalStyle(data.motivationalStyle);
          setVerbosity(data.verbosity);
          setAccountability(data.accountabilityPreference);
          setWhatMotivates(data.whatMotivates || []);
          setBurnoutSignals(data.burnoutSignals || []);
          setUltimateGoals(data.goals || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        communicationStyle,
        motivationalStyle,
        verbosity,
        accountabilityPreference: accountability,
        whatMotivates,
        burnoutSignals,
        bestCheckinTime: profile?.bestCheckinTime || "evening",
        goals: ultimateGoals,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExport = async () => {
    const [goals, checkins, memories, state] = await Promise.all([
      fetch("/api/goals").then((r) => r.json()),
      fetch("/api/checkins").then((r) => r.json()),
      fetch("/api/memories").then((r) => r.json()),
      fetch("/api/app-state").then((r) => r.json()),
    ]);

    const data = {
      profile,
      goals,
      checkins,
      memories,
      appState: state,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucas-coach-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your profile, preferences, and data
        </p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Communication</label>
              <Select
                value={communicationStyle}
                onValueChange={(v) => setCommunicationStyle(v || "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct</SelectItem>
                  <SelectItem value="gentle">Gentle</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivation style</label>
              <Select
                value={motivationalStyle}
                onValueChange={(v) => setMotivationalStyle(v || "")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="challenging">Challenging</SelectItem>
                  <SelectItem value="supportive">Supportive</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verbosity</label>
              <Select value={verbosity} onValueChange={(v) => setVerbosity(v || "")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brief">Brief</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
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
                  <SelectItem value="gentle_nudge">Gentle nudge</SelectItem>
                  <SelectItem value="direct_confrontation">
                    Direct confrontation
                  </SelectItem>
                  <SelectItem value="data_driven">Data-driven</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              What motivates you
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a motivator..."
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
            <label className="text-sm font-medium">Burnout signals</label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a signal..."
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
                        setBurnoutSignals(
                          burnoutSignals.filter((x) => x !== s)
                        )
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
              What are you working toward?
            </label>
            <Textarea
              value={ultimateGoals}
              onChange={(e) => setUltimateGoals(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Export your data</p>
              <p className="text-xs text-muted-foreground">
                Download all your goals, check-ins, and coach memories as JSON
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3">
        {saved && (
          <p className="text-sm text-green-600 dark:text-green-400 self-center">
            Profile saved!
          </p>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
