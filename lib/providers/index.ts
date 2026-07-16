import * as openai from "./openai";
import * as anthropic from "./anthropic";
import * as google from "./google";
import { ProviderMeta } from "./types";

export interface Provider {
  meta: ProviderMeta;
  call: (prompt: string, apiKey: string) => Promise<string>;
}

// Ordered left-to-right as they should appear in the UI.
// The UI (CompareTool.tsx) renders entirely off this array — it never
// hardcodes a provider name, placeholder, or link. To add a provider:
//   1. Create providers/xyz.ts exporting `meta` (id, label, keyPlaceholder,
//      getKeyUrl, model) and `call(prompt, apiKey)`.
//   2. Add one line below.
// That's the whole change — nothing else needs to be touched.
//
// Note: `meta` and `call` live together in the SAME file per provider on
// purpose, rather than splitting UI-facing metadata into a separate
// config file. A split would mean two places to keep in sync per
// provider (a config entry + a call-function file, matched by id string),
// which risks silent typo mismatches for zero real benefit — the "one
// new file + one line" goal is already met this way.
export const providers: Provider[] = [openai, anthropic, google];
