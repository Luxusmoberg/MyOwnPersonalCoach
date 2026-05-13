"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Send, Loader2, Brain, Plus, ChevronRight, ArrowLeft } from "lucide-react";
import type { Conversation } from "@/types/conversation";
import type { ConversationMessage } from "@/types/conversation";

export default function ChatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const {
    messages,
    isStreaming,
    sendMessage,
    setMessages,
  } = useStreamingChat({ conversationId });

  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [convRes, historyRes] = await Promise.all([
          fetch(`/api/chat/${conversationId}`),
          fetch("/api/chat/history"),
        ]);
        const convData = await convRes.json();
        const historyData = await historyRes.json();

        if (convData.messages) {
          setMessages(convData.messages);
        }
        if (Array.isArray(historyData)) {
          setConversations(historyData);
        }
      } catch {
        // Handle error
      }
      setLoading(false);
    }
    load();
  }, [conversationId, setMessages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed);
  };

  const loadConversation = async (id: string) => {
    const res = await fetch(`/api/chat/${id}`);
    const data = await res.json();
    if (data.messages) {
      setMessages(data.messages);
      router.replace(`/chat/${id}`);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-8">
      <div
        className={`${
          showSidebar ? "w-72" : "w-0"
        } border-r bg-card transition-all duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Conversations</h3>
          <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => loadConversation(conv.id)}
              className={`w-full text-left rounded-lg p-3 text-sm hover:bg-accent transition-colors ${
                conv.id === conversationId ? "bg-accent" : ""
              }`}
            >
              <p className="font-medium truncate">{conv.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(conv.updatedAt).toLocaleDateString()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="border-b px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/chat")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <ChevronRight
              className={`h-4 w-4 transition-transform ${
                showSidebar ? "rotate-180" : ""
              }`}
            />
          </Button>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Coach</h2>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <Skeleton className="h-16 w-3/4" />
              <Skeleton className="h-24 w-2/3 ml-auto" />
              <Skeleton className="h-20 w-1/2" />
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        LC
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-xl px-4 py-3 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <p
                      className={`text-xs mt-1 ${
                        msg.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {msg.role === "user" && (
                    <Avatar className="h-8 w-8 mt-0.5">
                      <AvatarFallback className="text-xs">LU</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto flex gap-3">
            <Textarea
              placeholder="Talk to your coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              className="min-h-[44px] max-h-[200px] resize-none"
              disabled={isStreaming}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="h-11 w-11 shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
