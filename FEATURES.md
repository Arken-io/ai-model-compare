# Arken Compare — Alpha v2 Feature List

**One prompt. Any model. Your choice.**

## Core
- Side-by-side comparison across eight providers — OpenAI, Anthropic,
  Google, xAI, DeepSeek, Mistral, Meta Llama, and Cohere — bring your own
  API keys, nothing goes through a server but each provider's own API.
- **Provider Selection** — turn any provider on/off with a tap; the UI
  adapts automatically.
- **Test Mode** — select just one provider and get a focused single-model
  benchmarking view (response time, word count, character count).
- **Compare Mode** — select two or more providers for the classic
  side-by-side grid (auto-fit layout, so it scales past three).

## Productivity
- **Recent prompts** — your last 8 prompts, one tap to reuse.
- **⌘/Ctrl + Enter** to run a comparison without leaving the keyboard.
- **Regenerate** any single provider's response without re-running the
  others.
- **Clear Results** to reset a run without losing your prompt or keys.
- **Copy** any response in one click.
- Local persistence — keys, provider selection, and recent prompts survive
  a page reload (saved in your browser only).

## Interface
- Official-style provider logos, sourced straight from each provider's own
  metadata — adding a new provider needs zero UI changes.
- Collapsible long responses with a smooth expand/collapse animation.
- Subtle animated ambient background (soft grid + slow glow drift).
- Loading skeleton shimmer while a response streams in.
- Dark, minimal visual language — inspired by Linear, Vercel, Raycast,
  Anthropic, and Perplexity.
- Fully responsive, keyboard-accessible, and respects your OS's
  reduce-motion setting.

## Under the hood
- Next.js 14 (App Router) + TypeScript + Tailwind CSS + Framer Motion.
- No backend, no database, no login — your API keys never leave your
  browser except to talk directly to their own provider.
- A provider is a single self-contained module (`lib/providers/*.ts`); the
  whole UI — key fields, logos, result cards, Test/Compare Mode — reads
  from one registry automatically.
