# Architecture — Arken AI Model Compare

This file exists so that in 6 months, when Arken has 6 tools and 20K lines
of code, nobody has to reverse-engineer *why* things are built this way.
Each section is a decision, not just a description.

## Why BYOK (Bring Your Own Key)

The user pastes their own API key for each provider; we never hold or pay
for any key ourselves.

- Zero cost to us no matter how many people use the tool.
- Zero abuse risk (nobody can drain a key we own).
- The tradeoff: fewer people will try it, since not everyone has a key
  ready. Acceptable for a learning project — not acceptable if this ever
  becomes a growth-focused product, at which point a metered free tier
  with our own rate-limited key would need a real backend.

## Why no backend

Every provider call happens client-side, straight from the browser to
that provider's API. There is no server of ours in the request path.

- Nothing to host, scale, secure, or pay for.
- The cost: some providers (Anthropic) block this by default and require
  an explicit opt-in header (see below). If we ever add a provider that
  refuses browser calls entirely with no opt-in, that single provider
  would need a thin server route — the rest of the app stays as is.

## Why `lib/providers/` — one module per provider

Each provider (`openai.ts`, `anthropic.ts`, `google.ts`) exports the same
two things: `meta` (display name, key placeholder, docs link, model id)
and `call(prompt, apiKey)`. `index.ts` is the single registry the UI reads
from — `CompareTool.tsx` never hardcodes a provider's name or loops over
anything else.

**Adding a new provider (e.g. xAI) is exactly two steps:**
1. Create `lib/providers/xai.ts` exporting `meta` + `call` in the same shape.
2. Add one line to `lib/providers/index.ts`.

Nothing in the UI needs to change.

### Why `meta` and `call` live in the same file (not split into a separate config)

It was tempting to pull all the `meta` objects into one
`config/providers.ts` array, separate from the provider logic. Rejected
because it would require keeping two files in sync per provider (a config
entry and a call-function file, matched by an `id` string) — a silent
typo risk for no actual reduction in the "add one file" goal, which the
current structure already achieves.

## Why `lib/config/models.ts` exists

Model IDs (`gpt-5.6-terra`, `claude-sonnet-5`, `gemini-3.5-flash`) change
on a provider's own schedule, not ours. This file is the *only* place
those strings are hardcoded. If a provider deprecates a model and
requests start failing, this is the first — and usually only — file that
needs to change. Verified against each provider's official docs as of
July 2026; re-verify here first before assuming a bug elsewhere.

Each entry is `{ id, displayName }` rather than a bare string — `id` is
the raw API model string, `displayName` is what the UI shows next to
each provider's name. Kept together per entry (not split across files)
so updating a model never means touching two places.

Google specifically has been locking free-tier model IDs out for *new*
API keys every few months (this happened to `gemini-2.0-flash` in March
2026, and is expected to keep happening as newer generations ship). So
`MODELS.google` is an **ordered list**, not a single entry — `google.ts`
tries each candidate and only advances to the next one on a 404 ("model
not found for this account"), never on other errors like a bad key or a
rate limit, since those aren't fixed by switching models.

**Known tech debt (tracked for v1.2, not fixed now):** `call()` only
returns the response text, not which candidate actually served it. If
candidate 0 404s and candidate 1 answers, the UI still shows
`google[0].displayName` — the label can silently drift from the model
that actually generated the text. Fixing this means changing `call()`'s
return type across all three providers (currently `Promise<string>`),
which is a bigger change than the fallback-list feature warrants on its
own. Worth fixing before this label is ever relied on for something that
matters (e.g. a future "which model answered" feature).

## Why Anthropic needs `anthropic-dangerous-direct-browser-access`

Anthropic's API blocks direct browser requests by default (no CORS
headers) specifically to stop developers from shipping their own secret
key inside client-side JS, where anyone could steal it from the network
tab. This header opts back into browser calls.

**It is safe here only because of BYOK**: the key typed in belongs to the
end user, not to us — there's no secret of ours to leak. If this app ever
switches to a key *we* own instead of BYOK, this header must be removed
and the Anthropic call moved to a server route, or our key gets exposed
to every visitor.

## Why placeholders instead of errors for missing keys

If a provider's key field is empty, its result column shows "Add your
[X] key above" instead of an error. An empty key is an expected, normal
state (most users will only have one or two of the three keys) — it is
not a failure, so it shouldn't look like one.

## Scope boundaries (deliberately out, for now)

- No AI Judge / scoring between responses — real feature, real added
  complexity, deferred until v1 has been used by a real person.
- No login, no database. "Recent prompts" (below) is the one exception
  to "no persistence," and it's deliberately lightweight.
- No Arken branding beyond header + footer — the tool is the product,
  the brand is a footnote.

## v1.1: what was added and why each one earns its place

- **Response time + word count per column** — free to compute (timing
  already happens around each `call()`; word count is a one-line split),
  and turns "3 responses next to each other" into an actual comparison.
- **Copy button per response** — the most obvious missing action: people
  compare in order to *use* an answer, not just read it.
- **Friendly error messages** — maps common HTTP statuses (401/403, 429,
  404, 5xx) to plain-language titles, without touching provider files
  (see `friendlyError()` in `CompareTool.tsx`). Falls back to the raw
  message for anything uncommon, so nothing is ever silently hidden.
- **Recent prompts (localStorage, last 8)** — intentionally *not* the
  Vault/History split from the Prompt Forge spec. This is a flat array
  of strings with no titles, tags, or export — a shortcut for "run that
  again," not a saved-prompts feature. If Prompt Forge ever gets built,
  this should not turn into a second, competing history — one of them
  should absorb the other rather than both existing side by side.
- **Regenerate per provider** — reuses the same `runProviders()` a full
  Compare uses, just scoped to one provider; adding a new provider to
  `lib/providers/index.ts` gets Regenerate for free, no extra wiring.

## Deployment gotcha (learned the hard way)

The first Vercel deploy failed not because of the code, but because the
Next.js project files were nested one level too deep in the GitHub repo
(`arken-compare/` inside the repo root instead of the project files
being at the root). Next.js/Vercel expects `package.json`, `app/`, etc.
at the repository root. If a future deploy fails in a way that looks
unrelated to any code change, check the repo structure before debugging
the app itself.
