export interface ProviderMeta {
  id: "openai" | "anthropic" | "google";
  label: string;
  model: string;
  keyPlaceholder: string;
  getKeyUrl: string;
}

export interface CallResult {
  text: string;
}

/**
 * Turns a fetch Response (already known to be !ok) into a readable error
 * message, trying to parse the provider's JSON error body first and
 * falling back to raw text.
 */
export async function readErrorDetail(res: Response): Promise<string> {
  const bodyText = await res.text().catch(() => "");
  try {
    const parsed = JSON.parse(bodyText);
    return (
      parsed?.error?.message ||
      parsed?.message ||
      bodyText ||
      "No details returned"
    );
  } catch {
    return bodyText || "No details returned";
  }
}

/**
 * Wraps a raw fetch() call so that network-level failures (the request
 * never reaching or returning from the server — DNS, offline, blocked by
 * a sandbox, etc.) are distinguished from HTTP-level errors (401, 404...).
 */
export async function safeFetch(
  url: string,
  init: RequestInit
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new Error(
      "Network request failed before reaching the provider's servers. Check your connection."
    );
  }
}
