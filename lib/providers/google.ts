import { ProviderMeta, readErrorDetail, safeFetch } from "./types";
import { MODELS } from "../config/models";

export const meta: ProviderMeta = {
  id: "google",
  label: "Gemini",
  // Shown in the UI as the primary model; the fallback chain is internal.
  model: MODELS.google[0].id,
  // NOTE: this reflects the *primary* candidate. Because call() falls back
  // silently to the next candidate on a 404 (see below), the model that
  // actually answered can differ from this label. Tracked as known tech
  // debt for v1.2 (see MODELS.google comment in lib/config/models.ts) —
  // fixing it means changing call()'s return type across all three
  // providers, out of scope for a fallback-list feature on its own.
  modelDisplayName: MODELS.google[0].displayName,
  keyPlaceholder: "AIza...",
  getKeyUrl: "https://aistudio.google.com/app/apikey",
  color: "#60A5FA",
  logoPath: "/logos/google.jpg",
};

async function tryModel(
  modelId: string,
  prompt: string,
  apiKey: string
): Promise<
  { ok: true; text: string } | { ok: false; status: number; detail: string }
> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const res = await safeFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  if (!res.ok) {
    return { ok: false, status: res.status, detail: await readErrorDetail(res) };
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text)
      .join("") || "(empty response)";
  return { ok: true, text };
}

export async function call(prompt: string, apiKey: string): Promise<string> {
  const candidates = MODELS.google;
  let lastError = "";

  for (let i = 0; i < candidates.length; i++) {
    const modelId = candidates[i].id;
    const result = await tryModel(modelId, prompt, apiKey);

    if (result.ok) return result.text;

    // Only a 404 means "this specific model id doesn't exist / isn't
    // available to this account" — worth trying the next candidate.
    // Any other status (401 bad key, 429 quota, 500...) is not fixed by
    // switching models, so stop and surface it immediately.
    if (result.status !== 404) {
      throw new Error(`HTTP ${result.status}: ${result.detail}`);
    }

    lastError = `HTTP 404 on ${modelId}: ${result.detail}`;
  }

  throw new Error(
    `All Gemini model candidates returned 404. Last: ${lastError}. Update lib/config/models.ts.`
  );
}
