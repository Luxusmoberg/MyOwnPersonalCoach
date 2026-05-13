@AGENTS.md

# Lucas Coach — Personal AI Coach

## Stack
- Next.js 16 App Router + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui (new-york style)
- Anthropic SDK for AI (`@anthropic-ai/sdk`)
- Netlify Blobs for persistence (file-based fallback for local dev)
- jose for JWT session cookies
- zod for validation, resend for email

## Architecture
- `src/app/` — Pages (App Router)
- `src/app/api/` — API routes (Route Handlers)
- `src/lib/` — Core logic: blob-store, auth, coach system, Anthropic client, validators
- `src/components/` — UI components (shadcn/ui + app-specific)
- `src/types/` — TypeScript interfaces

## Coach System (the secret sauce)
- `src/lib/coach/system-prompt.ts` — Dynamic prompt assembly (base + profile + memories + context)
- `src/lib/coach/context-builder.ts` — Fetches all context for AI calls
- `src/lib/coach/insight-extractor.ts` — Post-interaction memory extraction
- `src/lib/coach/memory-scorer.ts` — Relevance scoring for memory retrieval

## Key conventions
- Single-user app — simple password auth, no multi-tenant complexity
- Server Components by default, `"use client"` where needed for interactivity
- Data stored in `data/` directory locally, Netlify Blobs in production
- All AI calls go through the coach system prompt assembler, never raw
