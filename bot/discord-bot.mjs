import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_URL = "https://api.deepseek.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are Lucas's personal AI assistant, running as a Discord bot. You're helpful, smart, and a little witty. You talk like a real person — not a corporate chatbot. You're powered by DeepSeek.

Rules:
- Keep responses concise unless asked for detail
- Be direct and honest — no fluff
- If you don't know something, say so
- You can use Discord markdown: **bold**, *italic*, \`code\`, \`\`\`code blocks\`\`\`
- Don't roleplay, don't use emojis excessively`;

// Store conversation history per channel (last 20 messages)
const conversations = new Map();

client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const channelId = message.channel.id;

  try {
    await message.channel.sendTyping();
  } catch {}

  if (!conversations.has(channelId)) {
    conversations.set(channelId, []);
  }
  const history = conversations.get(channelId);

  history.push({ role: "user", content: message.content });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.slice(-20)],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content;

    if (reply) {
      // Split long messages if needed
      if (reply.length <= 2000) {
        await message.reply(reply);
      } else {
        const chunks = reply.match(/[\s\S]{1,1900}/g) || [];
        for (const chunk of chunks) {
          await message.channel.send(chunk);
        }
      }

      history.push({ role: "assistant", content: reply });
      if (history.length > 40) history.splice(0, history.length - 40);
    }
  } catch (error) {
    console.error("DeepSeek error:", error);
    await message.reply("Sorry, something went wrong. Try again in a moment.");
  }
});

// Tiny HTTP server so it runs as a free Render Web Service
import { createServer } from "http";
const PORT = process.env.PORT || 3001;
createServer((_req, res) => { res.writeHead(200); res.end("ok"); }).listen(PORT, () => {
  console.log(`🌐 Health check on port ${PORT}`);
});

client.login(DISCORD_TOKEN);
