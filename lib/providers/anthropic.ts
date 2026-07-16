import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "anthropic",
  label: "Claude",
  model: MODELS.anthropic,
  keyPlaceholder: "sk-ant-...",
  getKeyUrl: "https://console.anthropic.com/settings/keys",
};

export async function call(prompt: string, apiKey: string): Promise<string> {
  const url = "https://api.anthropic.com/v1/messages";

  const res = await safeFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      // ⚠️ READ BEFORE TOUCHING THIS HEADER ⚠️
      // Anthropic's API rejects requests sent directly from a browser by
      // default (no CORS headers), specifically to stop developers from
      // shipping their OWN secret key inside client-side JS where anyone
      // could steal it from the network tab.
      // This header is how you explicitly opt back into browser calls.
      // It is safe ONLY because of this app's BYOK model: the key
      // typed in belongs to the end user, not to us, so there is no
      // secret of ours to leak. If this app ever switches to using a
      // key WE own instead of BYOK, this header must be removed and the
      // call moved to a server route — otherwise our key gets exposed
      // to every visitor's browser.
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: meta.model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await readErrorDetail(res)}`);
  }

  const data = await res.json();
  return (
    data?.content?.map((b: { text?: string }) => b.text).join("") ||
    "(empty response)"
  );
}
