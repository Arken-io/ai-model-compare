/**
 * The ONLY place model IDs should be hardcoded.
 *
 * Providers change these often — when they do, update the string(s) here,
 * not inside lib/providers/*.ts.
 *
 * Verified against each provider's official API docs as of July 2026:
 *  - OpenAI:    https://developers.openai.com/api/docs/models
 *  - Anthropic: https://docs.claude.com/en/docs/about-claude/models
 *  - Google:    https://ai.google.dev/gemini-api/docs/models
 *
 * If a provider ever returns a "model not found" error, this is the
 * first (and probably only) file that needs to change.
 */
export const MODELS = {
  openai: "gpt-5.6-terra",
  anthropic: "claude-sonnet-5",
  // Google has been retiring free-tier model IDs for NEW API keys every
  // few months (gemini-2.0-flash was locked out for new users in March
  // 2026; older generations keep following the same pattern). Rather
  // than pin one string and get silently 404'd again next time, this is
  // an ordered fallback list — google.ts tries each in order and only
  // moves to the next one on a 404 "model not found" response.
  google: [
    "gemini-3.5-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
  ],
} as const;
