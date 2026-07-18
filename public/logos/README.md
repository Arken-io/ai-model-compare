# Real provider logos go here (optional)

This folder is empty on purpose. Claude will not fetch, hand-redraw, or
approximate any company's logo — see the note on `ProviderMeta.logoPath`
in `lib/providers/types.ts` and the "Why there are no company logos"
section in ARCHITECTURE.md for why.

If you want a provider's real logo to appear instead of its colored
initial badge:

1. Download the actual SVG yourself, directly from that provider's own
   brand/press page (not a third-party icon pack, not a screenshot trace).
2. Save it here as `<provider-id>.svg` (e.g. `openai.svg`, matching the
   `id` in that provider's `meta` in `lib/providers/<id>.ts`).
3. Add `logoPath: "/logos/<provider-id>.svg"` to that provider's `meta`
   object.

`ProviderLogo` (components/ProviderLogo.tsx) checks for `logoPath` first
and falls back to the colored badge automatically — no other code needs
to change.

Before doing this for any provider, check that provider's current brand
guidelines for third-party/identification use. At minimum, OpenAI's
guidelines (as of this writing) explicitly prohibit pairing their
logomark with a product or model name — which is exactly how this app's
result cards are laid out (logo next to "GPT-5.6 Terra"). That may rule
out compliant use of their real logo in this specific layout even with
the genuine file. The other providers' policies have not been checked
here; check per-provider before adding a file.
