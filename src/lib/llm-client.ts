import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

type Provider = "anthropic" | "deepseek";

interface MessageParams {
  system: string;
  messages: { role: "user" | "assistant"; content: string }[];
  maxTokens?: number;
  stream?: boolean;
}

// Tier → model mapping per provider
const MODELS: Record<Provider, { fast: string; smart: string; cheap: string }> = {
  anthropic: {
    fast: "claude-sonnet-4-20250514",
    smart: "claude-opus-4-20250514",
    cheap: "claude-haiku-4-5-20251001",
  },
  deepseek: {
    fast: "deepseek-chat",
    smart: "deepseek-chat",
    cheap: "deepseek-chat",
  },
};

function getProvider(): Provider {
  const configured = process.env.LLM_PROVIDER as Provider | undefined;
  return configured === "deepseek" ? "deepseek" : "anthropic";
}

function getAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

function getDeepSeekClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com/v1",
  });
}

function formatForOpenAI(params: MessageParams): {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
} {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: params.system },
  ];

  for (const msg of params.messages) {
    messages.push({ role: msg.role, content: msg.content });
  }

  return { messages };
}

export async function createMessage(
  params: MessageParams,
  tier: "fast" | "smart" | "cheap" = "fast"
): Promise<string> {
  const provider = getProvider();
  const model = MODELS[provider][tier];

  if (provider === "anthropic") {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model,
      max_tokens: params.maxTokens || 1024,
      system: params.system,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    return response.content
      .filter((block) => block.type === "text")
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
  }

  // DeepSeek via OpenAI SDK
  const client = getDeepSeekClient();
  const formatted = formatForOpenAI(params);
  const response = await client.chat.completions.create({
    model,
    max_tokens: params.maxTokens || 1024,
    messages: formatted.messages,
  });

  return response.choices[0]?.message?.content || "";
}

export async function streamMessage(
  params: MessageParams,
  tier: "fast" | "smart" | "cheap" = "fast"
): Promise<ReadableStream<Uint8Array>> {
  const provider = getProvider();
  const model = MODELS[provider][tier];

  if (provider === "anthropic") {
    const client = getAnthropicClient();
    const stream = await client.messages.create({
      model,
      max_tokens: params.maxTokens || 2048,
      system: params.system,
      messages: params.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    });

    return stream.toReadableStream();
  }

  // DeepSeek via OpenAI SDK — convert to SSE format matching Anthropic's SSE events
  const client = getDeepSeekClient();
  const formatted = formatForOpenAI(params);
  const stream = await client.chat.completions.create({
    model,
    max_tokens: params.maxTokens || 2048,
    messages: formatted.messages,
    stream: true,
  });

  // Convert OpenAI SSE format to Anthropic-compatible SSE format
  // so the chat route's TransformStream parsers work unchanged
  const encoder = new TextEncoder();
  let messageStartSent = false;

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (!delta) continue;

        if (!messageStartSent) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "message_start",
                message: { id: `msg_${Date.now()}`, role: "assistant", content: [] },
              })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "content_block_start",
                index: 0,
                content_block: { type: "text", text: "" },
              })}\n\n`
            )
          );
          messageStartSent = true;
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "content_block_delta",
              index: 0,
              delta: { type: "text_delta", text: delta },
            })}\n\n`
          )
        );
      }

      if (messageStartSent) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "content_block_stop", index: 0 })}\n\n`
          )
        );
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "message_stop" })}\n\n`
          )
        );
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
}
