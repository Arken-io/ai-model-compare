import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "deepseek",
  label: "DeepSeek",
  model: MODELS.deepseek.id,
  modelDisplayName: MODELS.deepseek.displayName,
  keyPlaceholder: "sk-...",
  getKeyUrl: "https://platform.deepseek.com/api_keys",
  color: "#38BDF8",
};

/**
 * DeepSeek's API mirrors the OpenAI Chat Completions spec closely enough
 * that the official OpenAI SDKs work against it unmodified — same request
 * body, same choices[0].message.content response shape. See the model-id
 * note in lib/config/models.ts: the legacy deepseek-chat/deepseek-reasoner
 * aliases are being retired, so this points at the versioned V4 ids.
 */
export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.deepseek.com/chat/completions";

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
