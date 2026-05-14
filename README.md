# Lucas Coach

A personal AI coach that knows you — your goals, your patterns, your burnout signals — and helps you stay on track. Not a generic motivational bot. A private, persistent coach that learns from every conversation and check-in.

## What it does

- **Chat** — talk to your coach anytime. It remembers past conversations and references them naturally
- **Daily check-ins** — log what you accomplished, what was hard, and your energy level. The coach responds with context-aware feedback
- **Goal tracking** — set goals with milestones, track progress, and get held accountable in your preferred style (gentle nudge, direct confrontation, or data-driven)
- **Memory system** — the coach automatically extracts patterns, preferences, and insights about you from every interaction. Over time it knows when you tend to lose momentum, what communication style works best, and what's actually important to you
- **Insight detection** — recurring patterns get surfaced: skipped Fridays, same blocker mentioned three times, energy trending down
- **Onboarding** — sets up your communication style, motivation type, accountability preference, and initial goals before the first conversation
- **Discord bot** — standalone bot you can DM anytime, powered by DeepSeek

## Coach personality

The coach adapts to you. If you told it you respond to blunt honesty, it won't sugarcoat. If you prefer data-driven arguments, it shows you the evidence. It never uses motivational quotes or preachy language. It pushes deeper on money, career, and business topics — asks what the real goal behind the goal is.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Anthropic SDK, DeepSeek, jose (JWT auth), Resend (contact form), Discord.js

## Getting started

```bash
git clone https://github.com/Luxusmoberg/Lucas-Coach1.git
cd lucas-coach
npm install
```

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

You need at least one LLM provider:

- **DeepSeek** (cheaper, default) — `LLM_PROVIDER=deepseek` + `DEEPSEEK_API_KEY`
- **Anthropic** (smarter) — `LLM_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`

Also set a random string for `SESSION_SECRET`.

Then run it:

```bash
npm run dev
```

Open `http://localhost:3000`. You'll be prompted to create an account, then taken through onboarding.

## Discord bot

```bash
npm run bot
```

Requires `DISCORD_BOT_TOKEN` and `DEEPSEEK_API_KEY` in `.env.local`. Runs a tiny HTTP server for Render's health check requirement.

## Project structure

```
src/
  app/                  Pages and API routes (App Router)
  lib/
    coach/              System prompt builder, context assembler, insight extractor, memory scorer
    llm-client.ts       Unified Anthropic + DeepSeek client with streaming
    blob-store.ts       In-memory store with disk backup (per-user scoped)
    auth.ts             JWT session auth via jose
  components/
    layout/             App shell, sidebar
    dashboard/          Weather widget
    ui/                 shadcn/ui components
bot/
  discord-bot.mjs       Standalone Discord bot
data/                   Local data persistence (gitignored)
```

## Deployment

The web app deploys to **Netlify** via `netlify.toml`. The Discord bot runs on **Render** as a Web Service (it includes a tiny HTTP server for the health check).

## License

MIT
