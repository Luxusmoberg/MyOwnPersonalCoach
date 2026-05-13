"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar } from "lucide-react";
import type { Checkin } from "@/types/checkin";

export default function PastCheckinPage() {
  const params = useParams();
  const router = useRouter();
  const checkinId = params.id as string;
  const [checkin, setCheckin] = useState<Checkin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/checkins/${checkinId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.id) setCheckin(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [checkinId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!checkin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-lg font-medium mb-2">Check-in not found</h2>
        <Button variant="link" onClick={() => router.push("/checkin")}>
          Back to check-ins
        </Button>
      </div>
    );
  }

  const date = new Date(checkin.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          {date}
        </h1>
      </div>

      {/* Metrics */}
      {(checkin.energyLevel || checkin.focusLevel || checkin.moodRating) && (
        <div className="grid grid-cols-3 gap-4">
          {checkin.energyLevel && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{checkin.energyLevel}/10</p>
                <p className="text-xs text-muted-foreground">Energy</p>
              </CardContent>
            </Card>
          )}
          {checkin.focusLevel && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{checkin.focusLevel}/10</p>
                <p className="text-xs text-muted-foreground">Focus</p>
              </CardContent>
            </Card>
          )}
          {checkin.moodRating && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{checkin.moodRating}/10</p>
                <p className="text-xs text-muted-foreground">Mood</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Journal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              What you accomplished
            </h4>
            <p className="text-sm">{checkin.accomplishment}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              What was hard
            </h4>
            <p className="text-sm">{checkin.challenge}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">
              Plan for tomorrow
            </h4>
            <p className="text-sm">{checkin.tomorrowPlan}</p>
          </div>
        </CardContent>
      </Card>

      {/* Coach response */}
      {checkin.aiResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Coach's Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
              {checkin.aiResponse}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
