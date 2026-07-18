import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "mistral",
  label: "Mistral",
  model: MODELS.mistral.id,
  modelDisplayName: MODELS.mistral.displayName,
  keyPlaceholder: "Mistral API key",
  getKeyUrl: "https://console.mistral.ai/api-keys/",
  logoPath: "/logos/mistral.svg",
};

/**
 * Mistral's Chat Completion API follows the same request/response shape
 * as OpenAI's (their own docs recommend pointing OpenAI-compatible
 * clients at it directly) — same pattern as openai.ts and xai.ts.
 * "mistral-large-latest" is a stable alias Mistral repoints to their
 * current flagship, so this doesn't need to be re-pinned on every model
 * bump the way the versioned ids (DeepSeek, Cohere) do.
 */
export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.mistral.ai/v1/chat/completions";

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: meta.model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await readErrorDetail(res)}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "(empty response)";
}
