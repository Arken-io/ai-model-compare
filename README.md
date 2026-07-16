# Arken — AI Model Compare

Compare GPT, Claude and Gemini responses side by side. Bring your own API
keys — nothing is stored or sent to any server but each provider's own.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Get free / API keys

- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google (has a free tier): https://aistudio.google.com/app/apikey

Current models used (as of July 2026):
- OpenAI — `gpt-5.6-terra`
- Anthropic — `claude-sonnet-5`
- Google — `gemini-2.5-flash` (free tier: 10 req/min, 250/day)

Any column with no key entered shows a friendly placeholder instead of an
error — you can use just one provider, two, or all three.

## Architecture

Each provider is a self-contained module under `lib/providers/`:

```
lib/providers/
  types.ts       shared types + fetch/error helpers
  openai.ts      OpenAI Chat Completions
  anthropic.ts   Anthropic Messages API
  google.ts      Google Gemini generateContent
  index.ts       registry — the only place that lists all providers
```

To add a new provider later: create `lib/providers/newone.ts` exporting the
same shape (`meta` + `call`), then add one line to `index.ts`. The UI reads
from that registry automatically — no other changes needed.

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new and import the repo
3. No environment variables needed — each key is entered by the user in
   the browser and sent directly to that provider, never through your server
4. Deploy

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- Lucide icons

## Notes

- All three provider calls happen client-side, directly from the user's
  browser to each provider's API. This works in a real deployed
  environment. It will NOT work inside a Claude.ai Artifact preview
  sandbox, which blocks arbitrary outbound requests — unrelated to this code.
- Anthropic's API blocks direct browser requests by default; `anthropic.ts`
  sends the `anthropic-dangerous-direct-browser-access` header to opt in,
  which is appropriate here since it's the user's own key.
- No backend, no database, no login. Scope intentionally minimal.

