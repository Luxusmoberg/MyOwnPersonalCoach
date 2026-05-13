"use client";

import { useState, useCallback } from "react";
import type { ConversationMessage } from "@/types/conversation";

interface UseStreamingChatOptions {
  conversationId?: string;
  onConversationId?: (id: string) => void;
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState(
    options.conversationId || ""
  );

  const sendMessage = useCallback(
    async (content: string) => {
      // Add user message immediately
      const userMsg: ConversationMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversationId: conversationId || undefined,
          }),
        });

        const newConvId = response.headers.get("X-Conversation-Id");
        if (newConvId && !conversationId) {
          setConversationId(newConvId);
          options.onConversationId?.(newConvId);
        }

        // Add empty assistant message to stream into
        const assistantMsg: ConversationMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: "",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Read SSE stream
        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (
                  data.type === "content_block_delta" &&
                  data.delta?.type === "text_delta"
                ) {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === "assistant") {
                      updated[updated.length - 1] = {
                        ...last,
                        content: last.content + data.delta.text,
                      };
                    }
                    return updated;
                  });
                }
              } catch {
                // Skip non-JSON SSE events
              }
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
      } finally {
        setIsStreaming(false);
      }
    },
    [conversationId, options]
  );

  return {
    messages,
    isStreaming,
    conversationId,
    sendMessage,
    setMessages,
  };
}
