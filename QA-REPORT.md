# Alpha v2 — QA Review

This was a **static code review**, not a live-browser audit — this
environment has no network access, so the project's dependencies
(Next.js, React, Tailwind, etc.) can't be installed and the app can't
actually be run, built, or opened in a real browser here. Everything below
was found by reading the source, computing contrast ratios by hand, and
checking against known browser-engine behavior. Treat this as a strong
first pass, not a substitute for testing the real running app before
launch.

## Fixed this pass

| Area | Issue | Fix |
|---|---|---|
| Accessibility | `ink-faint` text ≈3:1 contrast on the background (needs 4.5:1 for body text); used in ~20 places (metadata, error detail, empty states) | Lightened `#5C5C66` → `#7A7A84` in the design tokens |
| Accessibility | API key inputs and the Prompt field had no programmatic label | Added `aria-label` on key inputs, `htmlFor`/`id` on the Prompt label + textarea |
| Accessibility | Framer Motion animations don't respect OS-level "reduce motion" (the CSS media query only catches CSS transitions) | Wrapped the app in `<MotionConfig reducedMotion="user">` |
| Performance | `background-attachment: fixed` on `<body>` is a known scroll-jank source on mobile Safari, and was redundant with the ambient background layer | Removed it |
| Browser compat | `mask-image` unsupported unprefixed in Safari < 15.4 | Added `-webkit-mask-image` |
| UX | "Get a free API key" implied any provider; it only links to Google's free tier | Reworded to "Get a free Gemini key" |
| Correctness | localStorage save effects could fire before the initial load completed, wiping saved keys/selection on every reload | Gated writes behind a `hydrated` flag |
| Correctness | A missing closing brace left the API-keys section non-compiling | Fixed |

## Reviewed, no action needed

- **Icon-only buttons** (Eye, Copy, Regenerate, remove-recent, Clear
  Results) already carry `aria-label` and/or `title`.
- **Toggle state** (provider chips) isn't color-only — active state also
  shows a checkmark icon and uses `aria-pressed`.
- **Landmarks** — `<header>`, `<main>`, `<footer>` are all present; single
  `<h1>` on the page.
- **Responsive grid** — key inputs and result cards collapse to one column
  below `sm`; hero type scales down on mobile.
- **`prefers-reduced-motion` (CSS)** — already handled globally for
  non-Framer animations.

## Known limitations — worth a look before/soon after launch, not blocking

- **Touch target size** — provider chips and some icon buttons sit close to
  (not clearly above) the 44×44px touch-target guideline. Fine for a
  desktop-first alpha tool; worth revisiting if mobile usage turns out to
  matter.
- **Fixed px font sizes** — most type uses arbitrary `text-[13px]`-style
  values rather than Tailwind's `rem`-based scale, so it responds to
  browser *zoom* but not to a user's OS/browser default-font-size setting.
  A full pass to `rem` would be a larger, lower-urgency refactor.
- **`backdrop-blur`** on the main card requires `backdrop-filter` support
  (Firefox ≥103, all modern Safari/Chrome). Degrades gracefully — the card
  just loses the blur, background stays fully readable.
- **No automated test coverage.** Everything here was manual/static; there
  are no unit or e2e tests in the repo yet.

## Not verifiable without a live environment

I couldn't check actual paint performance, real screen-reader output, real
cross-browser rendering, or Lighthouse-style scores here — there's no
network to install dependencies or launch a browser in this sandbox.
**Before publishing, run the app locally and at minimum**:
1. Click through the whole flow in Chrome, Firefox, and Safari (incl. one
   iOS Safari pass — that's usually where surprises show up).
2. Tab through the whole UI with a keyboard only, no mouse.
3. Run Lighthouse (or WebPageTest) once for a real performance baseline.
4. Test with a screen reader (VoiceOver on Mac is the fastest to reach)
   on the key input flow and the results area.
