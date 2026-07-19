import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "xai",
  label: "xAI",
  model: MODELS.xai.id,
  modelDisplayName: MODELS.xai.displayName,
  keyPlaceholder: "xai-...",
  getKeyUrl: "https://console.x.ai/team/default/api-keys",
  color: "#A78BFA",
};

/**
 * xAI's Chat Completions endpoint is intentionally OpenAI-compatible (same
 * request/response shape as openai.ts) — this is documented behavior, not
 * a coincidence, so this file mirrors openai.ts almost line for line.
 */
export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.x.ai/v1/chat/completions";

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
