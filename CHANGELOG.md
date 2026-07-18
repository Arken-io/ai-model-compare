# Changelog

All notable changes to Arken Compare are documented here.

## [Unreleased]

### Added
- **Five new providers** — xAI, DeepSeek, Mistral, Meta Llama, and Cohere
  are now real integrations (`lib/providers/{xai,deepseek,mistral,llama,cohere}.ts`),
  not just "Soon" chips. Each was verified against that provider's current
  API docs (endpoint, auth header, request/response shape, current model
  id) before being wired in — see the source links in
  `lib/config/models.ts`. `comingSoonProviders` is now empty; it's still
  there as a staging area for whichever provider is added next.
- Hero copy, README, and FEATURES.md updated off the old fixed "GPT,
  Claude and Gemini" / "up to three models" phrasing now that the
  registry holds eight providers and the grid is uncapped.

### Changed (carried over from the prep work below)
- `ProviderMeta.id` is now a plain `string` instead of a
  `"openai" | "anthropic" | "google"` union — the registry can grow past
  three providers without editing the type itself.
- Result/key-input grids switched from a hardcoded 1/2/3-column ternary to
  a CSS `auto-fit` grid, so selecting 4+ providers lays out correctly with
  no new column-count case to write — this is what made today's five-provider
  addition a pure registry change, with zero layout code touched.

## [Alpha v2] — 2026-07-18

The first public-launch-ready build. Everything below shipped across five
internal batches on top of the Alpha v1 base (provider registry, side-by-side
compare, bring-your-own-key).

### Added
- **Provider Selection** — toggle chips to choose which providers (OpenAI,
  Anthropic, Google) take part in a run, independent of whether a key is
  filled in.
- **Test Mode** — when exactly one provider is selected, a single roomier
  card replaces the grid, with response time, word count, character count,
  copy, and regenerate. A lightweight single-model benchmarking view.
- **Compare Mode** — the side-by-side layout, now shown automatically
  whenever 2–3 providers are selected. No manual mode switch.
- **Official-style provider logos** — local SVGs in `public/logos/`,
  referenced from each provider's own metadata (`logoPath`). Adding a new
  provider later needs zero UI changes — just a logo file + a metadata
  entry.
- **Local persistence** — API keys, provider selection, and recent prompts
  are remembered in the browser's `localStorage` between visits. Never sent
  to a server.
- **Regenerate** — per-provider retry, surfaced both in each card's header
  and directly inside error states.
- **Clear Results** — resets the current run's output without touching your
  prompt or keys.
- **Collapse / expand** for long responses, with a smooth animated height
  transition and a fade-out edge.
- **Response metrics** — response time, word count, and (Test Mode)
  character count per provider.
- **Animated ambient background** — a faint drifting grid + two slow glow
  blobs, respecting `prefers-reduced-motion`.
- **Loading skeleton** shimmer while a response streams in.

### Changed
- Wider page layout (`max-w-6xl`) so result cards get real room on desktop;
  the input card stays capped at a comfortable reading width.
- Reworked card spacing, padding, and section dividers for clearer visual
  hierarchy ("Better Cards" pass).
- Softer, more restrained shadows and a tighter border radius, focus rings
  switched from a hard outline to a halo `box-shadow` (Linear/Vercel-style).
- Primary "Compare" button got a subtle gradient + inner highlight instead
  of a flat fill.
- Hero copy updated to accurately reflect that keys are now saved locally
  (previously said "nothing is stored").

### Fixed
- **Accessibility:** `ink-faint` text color only met ~3:1 contrast against
  the background (WCAG AA requires 4.5:1 for body-sized text) — lightened
  the token; it's used in ~20 places for metadata, error detail, and empty
  states.
- **Accessibility:** API key inputs and the Prompt field had no programmatic
  label (visual-only `<div>`/`<label>` not wired to the input) — added
  `aria-label` / `htmlFor`+`id`.
- **Accessibility:** Framer Motion animations ignored the OS-level
  "reduce motion" setting (the CSS `prefers-reduced-motion` block only
  covers CSS transitions, not Framer's JS-driven ones) — wrapped the app in
  `<MotionConfig reducedMotion="user">`.
- **Perf/compat:** removed `background-attachment: fixed` on `<body>`, a
  known scroll-jank source on mobile Safari; the ambient background layer
  already provides a pinned effect on its own.
- **Compat:** added `-webkit-mask-image` alongside `mask-image` for Safari
  versions before 15.4.
- **Bug:** local-storage writes for keys/provider-selection could fire
  before the initial load finished, silently wiping previously saved data
  on every page open — gated behind a `hydrated` flag.
- **Bug:** a missing closing brace in the API-keys section left the file in
  a non-compiling state after an earlier edit.
- **UX:** Header's "Get a free API key" link only ever pointed at Google's
  free tier — reworded to "Get a free Gemini key" so it doesn't imply
  OpenAI/Anthropic keys are free too.

## [Alpha v1] — 2026-07-16

- Initial release: OpenAI / Anthropic / Google side-by-side comparison,
  bring-your-own-key, no backend.
