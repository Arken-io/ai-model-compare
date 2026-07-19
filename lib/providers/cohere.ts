import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "cohere",
  label: "Cohere",
  model: MODELS.cohere.id,
  modelDisplayName: MODELS.cohere.displayName,
  keyPlaceholder: "Cohere API key",
  getKeyUrl: "https://dashboard.cohere.com/api-keys",
  color: "#2DD4BF",
};

/**
 * Unlike xai.ts/deepseek.ts/mistral.ts, Cohere's v2 Chat API is NOT
 * OpenAI-shaped — response text lives at message.content[], an array of
 * typed blocks (mirrors Anthropic's content-block shape more than
 * OpenAI's choices[0].message.content string). Join every "text" block
 * rather than assuming there's exactly one, same reasoning as
 * anthropic.ts's content.map(...).join("").
 */
export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.cohere.com/v2/chat";

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: meta.model,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await readErrorDetail(res)}`);
  }

  const data = await res.json();
  const blocks: { type?: string; text?: string }[] = data?.message?.content || [];
  const text = blocks
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text)
    .join("");
  return text || "(empty response)";
}
