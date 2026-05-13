"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStreamingChat } from "@/hooks/use-streaming-chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Loader2,
  Brain,
  Plus,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import type { Conversation } from "@/types/conversation";
import type { ConversationMessage } from "@/types/conversation";

export default function ChatPage() {
  const router = useRouter();
  const {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    setMessages,
  } = useStreamingChat({
    onConversationId: (id) => router.replace(`/chat/${id}`),
  });

  const [input, setInput] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/chat/history")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setConversations(data);
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed);
  };

  const handleNewChat = () => {
    setMessages([]);
    router.replace("/chat");
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
      {/* Conversation sidebar */}
      <div
        className={`${
          showSidebar ? "w-72" : "w-0"
        } border-r bg-card transition-all duration-200 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold">Conversations</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            title="New chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loadingHistory ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className="w-full text-left rounded-lg p-3 text-sm hover:bg-accent transition-colors"
              >
                <p className="font-medium truncate">
                  {conv.title || "Untitled"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="border-b px-6 py-4 flex items-center gap-3">
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
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={handleNewChat}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                <Brain className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Talk to Your Coach
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask questions, talk through problems, or just reflect. Your coach
                remembers your goals, past check-ins, and what it's learned about
                you.
              </p>
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
                      {msg.content || (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
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
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
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
