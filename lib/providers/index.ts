import * as openai from "./openai";
import * as anthropic from "./anthropic";
import * as google from "./google";
import * as xai from "./xai";
import * as deepseek from "./deepseek";
import * as mistral from "./mistral";
import * as llama from "./llama";
import * as cohere from "./cohere";
import { ProviderMeta } from "./types";

export interface Provider {
  meta: ProviderMeta;
  call: (prompt: string, apiKey: string) => Promise<string>;
}

// Ordered left-to-right as they should appear in the UI.
// The UI (CompareTool.tsx) renders entirely off this array — it never
// hardcodes a provider name, placeholder, or link, and never assumes a
// count (not "3 columns", not "the 3rd provider" — N providers). To add
// a provider:
//   1. Create providers/xyz.ts exporting `meta` (id, label, keyPlaceholder,
//      getKeyUrl, model, logoPath) and `call(prompt, apiKey)`.
//   2. Drop a logo at public/logos/xyz.svg.
//   3. Add one line below.
// That's the whole change — nothing else needs to be touched.
//
// Note: `meta` and `call` live together in the SAME file per provider on
// purpose, rather than splitting UI-facing metadata into a separate
// config file. A split would mean two places to keep in sync per
// provider (a config entry + a call-function file, matched by id string),
// which risks silent typo mismatches for zero real benefit — the "one
// new file + one line" goal is already met this way.
export const providers: Provider[] = [
  openai,
  anthropic,
  google,
  xai,
  deepseek,
  mistral,
  llama,
  cohere,
];

/**
 * Providers with a logo + slot in the Provider Selector, but no working
 * `call()` yet — rendered as disabled "Soon" chips so the selector proves
 * out its own scalability without shipping unverified API integrations.
 *
 * Empty for now: xAI, DeepSeek, Mistral, Meta Llama, and Cohere (the five
 * originally staged here) all got real `call()` implementations above,
 * verified against each provider's live docs — see the source links in
 * lib/config/models.ts. Stage the NEXT batch of providers here the same
 * way before their API shapes have been checked.
 */
export const comingSoonProviders: { id: string; label: string; logoPath: string }[] = [];
