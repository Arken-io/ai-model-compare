/**
 * The ONLY place model IDs (and their display names) should be hardcoded.
 *
 * Providers change these often — when they do, update the entries here,
 * not inside lib/providers/*.ts. This is also the file Model Selection
 * (v1.2) will read from to populate its dropdowns/settings, so keep
 * `id` (raw API model string) and `displayName` (human-friendly label)
 * together per entry rather than splitting them across files.
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
  openai: { id: "gpt-5.6-terra", displayName: "GPT-5.6 Terra" },
  anthropic: { id: "claude-sonnet-5", displayName: "Claude Sonnet 5" },
  // Google has been retiring free-tier model IDs for NEW API keys every
  // few months (gemini-2.0-flash was locked out for new users in March
  // 2026; older generations keep following the same pattern). Rather
  // than pin one entry and get silently 404'd again next time, this is
  // an ordered fallback list — google.ts tries each in order and only
  // moves to the next one on a 404 "model not found" response.
  //
  // KNOWN TECH DEBT (tracked for v1.2, not fixed here): call() only
  // returns the response text, not which candidate actually served it.
  // So if index 0 404s and index 1 answers instead, the UI still shows
  // google[0].displayName — the label can silently drift from the model
  // that actually generated the text. Fixing this means changing call()'s
  // return type across all three providers, which is bigger than this
  // fallback-list feature warrants on its own.
  google: [
    { id: "gemini-3.5-flash", displayName: "Gemini 3.5 Flash" },
    { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash" },
    { id: "gemini-2.5-flash-lite", displayName: "Gemini 2.5 Flash Lite" },
  ],
} as const;
