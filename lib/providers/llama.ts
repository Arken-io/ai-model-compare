import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "llama",
  label: "Meta Llama",
  model: MODELS.llama.id,
  modelDisplayName: MODELS.llama.displayName,
  keyPlaceholder: "Llama API key",
  getKeyUrl: "https://llama.developer.meta.com/",
  logoPath: "/logos/llama.svg",
};

/**
 * Meta's official Llama API exposes an OpenAI-compatible endpoint at
 * /compat/v1/ specifically so existing OpenAI-client code works unchanged
 * — same request body, same choices[0].message.content response shape.
 *
 * ⚠️ Unlike the other providers here, Meta's own Llama API is currently
 * preview/waitlisted and US-only — a key from llama.developer.meta.com
 * may not be approved yet for a given account/region. Users blocked here
 * aren't necessarily doing anything wrong; this is a real product
 * limitation on Meta's side, not a bug in this app.
 */
export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.llama.com/compat/v1/chat/completions";

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
