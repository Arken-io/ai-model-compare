# Arken — AI Model Compare

Compare GPT, Claude, Gemini, Grok, DeepSeek, Mistral, Llama, and Cohere
responses side by side. Bring your own API keys — saved only in your
browser's local storage, never sent anywhere but straight to each
provider's own API.

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
- xAI: https://console.x.ai/team/default/api-keys
- DeepSeek: https://platform.deepseek.com/api_keys
- Mistral: https://console.mistral.ai/api-keys/
- Meta Llama (preview, waitlisted, US-only): https://llama.developer.meta.com/
- Cohere (has a free trial tier): https://dashboard.cohere.com/api-keys

Current models used (as of July 2026):
- OpenAI — `gpt-5.6-terra`
- Anthropic — `claude-sonnet-5`
- Google — `gemini-3.5-flash` (falls back to older Gemini ids on a 404)
- xAI — `grok-4.3`
- DeepSeek — `deepseek-v4-flash`
- Mistral — `mistral-large-latest` (Mistral-managed alias, not re-pinned)
- Meta Llama — `Llama-4-Maverick-17B-128E-Instruct-FP8`
- Cohere — `command-a-plus-05-2026`

## Providers, Test Mode & Compare Mode

Toggle providers on/off with the chips above the API key fields — only
selected providers show a key field and take part in the run. The layout
adapts automatically, with no manual mode switch:

- **1 provider selected → Test Mode.** A single roomier card with response
  time, word count, character count, copy, and regenerate — a lightweight
  benchmarking view.
- **2+ providers selected → Compare Mode.** The side-by-side grid, using
  an `auto-fit` layout so it holds up whether that's 2 providers or 8.

API keys and your provider selection are remembered locally (browser
`localStorage`) so you don't have to re-enter them next visit. Recent
prompts are stored the same way. None of it is ever sent to a server —
only straight to each provider's own API.

## Architecture

Each provider is a self-contained module under `lib/providers/`:

```
lib/providers/
  types.ts       shared types + fetch/error helpers
  openai.ts      OpenAI Chat Completions
  anthropic.ts   Anthropic Messages API
  google.ts      Google Gemini generateContent (with model fallback list)
  xai.ts         xAI Chat Completions (OpenAI-compatible)
  deepseek.ts    DeepSeek Chat Completions (OpenAI-compatible)
  mistral.ts     Mistral Chat Completions (OpenAI-compatible)
  llama.ts       Meta Llama API, via its OpenAI-compatible /compat endpoint
  cohere.ts      Cohere v2 Chat API (its own content-block response shape)
  index.ts       registry — the only place that lists all providers
```

To add a new provider later: create `lib/providers/newone.ts` exporting the
same shape (`meta` + `call`), including a `logoPath` pointing at an SVG in
`public/logos/`, then add one line to `index.ts`. The UI — provider chips,
key fields, logos, result cards, Test/Compare Mode — all read from that
registry automatically. No other changes needed, and there's no hardcoded
limit on how many providers can be selected at once (the results grid uses
`auto-fit`, not a fixed 1/2/3-column map).

`comingSoonProviders` (same file) is the staging area for a provider whose
logo/label are ready but whose API shape hasn't been verified against
live docs yet — it renders as a disabled "Soon" chip in the Selector. It's
empty right now; the five providers originally staged there (xAI,
DeepSeek, Mistral, Meta Llama, Cohere) all got real integrations, each
verified against that provider's current docs (see the source links in
`lib/config/models.ts`).

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

- All provider calls happen client-side, directly from the user's
  browser to each provider's API. This works in a real deployed
  environment. It will NOT work inside a Claude.ai Artifact preview
  sandbox, which blocks arbitrary outbound requests — unrelated to this code.
- Anthropic's API blocks direct browser requests by default; `anthropic.ts`
  sends the `anthropic-dangerous-direct-browser-access` header to opt in,
  which is appropriate here since it's the user's own key.
- Meta's official Llama API is preview/waitlisted and US-only right now —
  a Llama key may simply not be approved yet for some accounts/regions.
  That's a Meta-side limitation, not a bug in `llama.ts`.
- API keys, provider selection, and recent prompts persist in the
  browser's `localStorage` only — clearing site data resets all of it.
- No backend, no database, no login. Scope intentionally minimal.

