# Real provider logos

These files were sourced by the project owner directly and are now wired
up via `logoPath` in each provider's `meta` object
(`lib/providers/<id>.ts`), so `ProviderLogo` (components/ProviderLogo.tsx)
renders the real image instead of the colored-initial fallback.

Current mapping:

| Provider   | File          |
| ---------- | ------------- |
| Anthropic  | anthropic.jpg |
| OpenAI     | openai.jpg    |
| Google     | google.jpg    |
| xAI        | xai.jpg       |
| DeepSeek   | deepseek.jpg  |
| Mistral    | mistral.jpg   |
| Meta Llama | llama.jpg     |
| Cohere     | cohere.jpg    |

Before shipping this publicly, double-check each provider's current
brand/trademark guidelines for third-party use — in particular, OpenAI's
guidelines (as of this writing) prohibit pairing their logomark with a
product or model name, which is exactly how this app's result cards are
laid out (logo next to "GPT-5.6 Terra"). That may rule out compliant use
of the real OpenAI logo in this specific layout even with a genuine file.
The other providers' policies have not been checked here — verify
per-provider before relying on this in production.

To swap out a file: replace `<provider-id>.jpg` with your own image (same
filename), or update the matching `logoPath` in that provider's `meta`
object if you rename it. To go back to the colored-initial fallback for
any provider, just remove its `logoPath` line.
