# Arken Compare — Alpha v2 Launch Kit

## What I actually could / couldn't do here

Worth being upfront about, since this batch asked for things outside a
code sandbox's reach:

- **QA review** — done, as a static code review (see `QA-REPORT.md`). I
  can't run the app in a real browser here (no network to install
  dependencies), so treat it as a strong first pass, not a replacement for
  clicking through the live app yourself before you publish.
- **Docs** — done: `README.md`, `CHANGELOG.md`, `FEATURES.md`.
- **Landing assets** — done, but with a caveat: I can't screenshot the
  *actual running app* (same network limitation), so `social-preview.png`,
  `github-banner.png`, and `product-visual.png` are hand-built mockups
  using Arken's real colors, type, and logo marks — not live screenshots.
  Swap in real screenshots once you've run the app locally, or ship these
  as-is for the initial launch.
- **Launch video** — done, partially: `arken-launch-teaser.mp4` is a
  19-second **silent kinetic-typography teaser** (title cards, not real UI
  footage), built from the script below. It's a reasonable opener/closer
  for a real launch video, but a proper "premium launch video" needs
  actual screen-captured footage of the app running, plus music/voiceover
  — none of which I can produce here. Treat it as a starting point or a
  stinger, not the final cut.
- **Publish / announce on X / share with communities** — **I can't do
  this.** I have no way to post to X or anywhere else on your behalf. I
  drafted the announcement copy below — you'll need to actually post it.

## Video script (as given) → shot list

| # | Line | What's on screen (teaser) | What real footage should show |
|---|---|---|---|
| 1 | One prompt. | Title card | Typing a prompt into the input |
| 2 | Any model. Your choice. | Title card | Toggling provider chips on/off |
| 3 | — | Provider logos row | Zoom on the three official-style logos |
| 4 | Compare. | Title card | Compare Mode, all three cards filling in |
| 5 | Measure. | Title card | Response time / word count ticking in |
| 6 | — | Test Mode vs Compare Mode mockup | Live switch: deselect down to 1 provider |
| 7 | — | Response Time · Word Count · Regenerate · Recent Prompts | Quick cuts of each feature |
| 8 | Build better. | Title card | Copy button, clean finished comparison |
| 9 | Arken Compare Alpha v2. | Outro card | Logo lockup, CTA |

**Suggested length for the real cut:** 25–35s. Suggested music: sparse,
low-key electronic/minimal — nothing that fights the "professional,
minimal" brief (avoid anything epic/cinematic-trailer-ish).

## Draft X announcement (thread)

**1/**
Arken Compare Alpha v2 is live.

One prompt. Any model. Your choice.

Compare GPT, Claude, and Gemini side by side — bring your own API keys,
nothing touches our servers.

**2/**
What's new in v2:
→ Provider Selection — turn any model on/off
→ Test Mode — benchmark one model alone
→ Compare Mode — all three, side by side
→ Response time, word count, regenerate, recent prompts

**3/**
No login. No backend. No database.
Your keys talk directly to OpenAI / Anthropic / Google from your own
browser, and stay saved locally so you don't re-type them next time.

**4/**
Built for people who actually need to pick a model, not just read about
one. Try it → [link]

Feedback welcome — this is an alpha, and we're shipping based on what
people actually hit.

*(Fill in the [link] and your handle/repo before posting — I left those as
placeholders since I don't have them.)*

## Suggested GitHub repo description / topics

**Description:** Compare GPT, Claude, and Gemini side by side — bring your
own API keys, nothing stored server-side.

**Topics:** `nextjs` `typescript` `openai` `anthropic` `gemini` `llm`
`ai-tools` `tailwindcss`
