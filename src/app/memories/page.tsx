"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Trash2, RefreshCw, Loader2 } from "lucide-react";
import type { CoachMemory, MemoryType } from "@/types/memory";

const typeColors: Record<MemoryType, string> = {
  pattern:
    "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  preference:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  goal_update:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  personal_detail:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  insight:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
};

export default function MemoriesPage() {
  const [memories, setMemories] = useState<CoachMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [regenerating, setRegenerating] = useState(false);

  const fetchMemories = () => {
    setLoading(true);
    fetch("/api/memories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMemories(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const deleteMemory = async (id: string) => {
    await fetch(`/api/memories/${id}`, { method: "DELETE" });
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const regenerateProfile = async () => {
    setRegenerating(true);
    await fetch("/api/insights/generate", { method: "POST" });
    setRegenerating(false);
    fetchMemories();
  };

  const filteredMemories = memories.filter((m) => {
    if (filter === "all") return true;
    return m.type === filter;
  });

  const typeCounts = memories.reduce(
    (acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Coach Memories
          </h1>
          <p className="text-muted-foreground mt-1">
            What your coach has learned about you over time
          </p>
        </div>
        <Button
          variant="outline"
          onClick={regenerateProfile}
          disabled={regenerating}
        >
          {regenerating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Re-evaluate Profile
        </Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">
            All ({memories.length})
          </TabsTrigger>
          <TabsTrigger value="pattern">
            Patterns ({typeCounts.pattern || 0})
          </TabsTrigger>
          <TabsTrigger value="preference">
            Preferences ({typeCounts.preference || 0})
          </TabsTrigger>
          <TabsTrigger value="insight">
            Insights ({typeCounts.insight || 0})
          </TabsTrigger>
          <TabsTrigger value="personal_detail">
            Details ({typeCounts.personal_detail || 0})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filteredMemories.length === 0 ? (
        <div className="text-center py-16">
          <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <h3 className="text-lg font-medium mb-2">
            {memories.length === 0
              ? "No memories yet"
              : "No memories match this filter"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {memories.length === 0
              ? "Your coach learns about you as you do check-ins and have conversations. Memories will start appearing here after a few interactions."
              : "Try a different filter to see more."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemories.map((memory) => (
            <Card key={memory.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={typeColors[memory.type] || ""}>
                        {memory.type.replace("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        confidence: {Math.round(memory.confidence * 100)}%
                      </Badge>
                    </div>
                    <p className="text-sm">{memory.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(memory.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMemory(memory.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
