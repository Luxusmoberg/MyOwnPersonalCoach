import { NextResponse } from "next/server";
import {
  getConversation,
  setConversation,
  getAppState,
  setAppState,
} from "@/lib/blob-store";
import { chatSchema } from "@/lib/validators";
import { buildSystemPrompt } from "@/lib/coach/system-prompt";
import { buildChatContext } from "@/lib/coach/context-builder";
import { extractInsights } from "@/lib/coach/insight-extractor";
import { streamMessage } from "@/lib/llm-client";
import type { Conversation, ConversationMessage } from "@/types/conversation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { message, conversationId } = parsed.data;
    const ctx = await buildChatContext();
    const systemPrompt = buildSystemPrompt(ctx);

    // Load or create conversation
    let conversation: Conversation;
    if (conversationId) {
      const existing = await getConversation(conversationId);
      if (!existing) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      conversation = existing;
    } else {
      const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      conversation = {
        id,
        title: message.slice(0, 80),
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // Add user message
    const userMsg: ConversationMessage = {
      id: `msg_${Date.now()}_user`,
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(userMsg);

    // Build messages array (last 30 to stay within context)
    const recentMessages = conversation.messages.slice(-30);
    const messages = recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream response via unified LLM client
    const stream = await streamMessage({
      system: systemPrompt,
      messages,
      maxTokens: 2048,
    });

    // Capture the full response while streaming
    let fullResponse = "";
    const decoder = new TextDecoder();

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        controller.enqueue(chunk);

        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (
                data.type === "content_block_delta" &&
                data.delta?.type === "text_delta"
              ) {
                fullResponse += data.delta.text;
              }
            } catch {
              // Not JSON or different event type — skip
            }
          }
        }
      },
      async flush() {
        const assistantMsg: ConversationMessage = {
          id: `msg_${Date.now()}_assistant`,
          role: "assistant",
          content: fullResponse,
          timestamp: new Date().toISOString(),
        };
        conversation.messages.push(assistantMsg);
        conversation.updatedAt = new Date().toISOString();

        if (conversation.messages.length === 2) {
          conversation.title =
            message.slice(0, 60) + (message.length > 60 ? "..." : "");
        }

        await setConversation(conversation.id, conversation);

        const appState = await getAppState();
        await setAppState({
          ...appState,
          lastActiveDate: new Date().toISOString(),
          totalConversations: appState.totalConversations + 1,
        });

        extractInsights(
          `Chat:\nUser: ${message}\nCoach: ${fullResponse.slice(0, 2000)}`,
          conversation.id
        ).catch(console.error);
      },
    });

    const readable = stream.pipeThrough(transformStream);

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": conversation.id,
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
