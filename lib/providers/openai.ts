import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "openai",
  label: "GPT",
  model: MODELS.openai.id,
  modelDisplayName: MODELS.openai.displayName,
  keyPlaceholder: "sk-...",
  getKeyUrl: "https://platform.openai.com/api-keys",
  color: "#34D399",
};

export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";

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
