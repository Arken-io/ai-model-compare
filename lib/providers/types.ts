export interface ProviderMeta {
  /** Stable slug, e.g. "openai" — used as the React key, the localStorage
   * key, and the lib/providers/<id>.ts filename. Not a fixed union on
   * purpose: the registry is meant to grow past three providers without
   * editing this type. */
  id: string;
  label: string;
  model: string;
  /** Human-friendly model name for UI display, separate from the raw API
   * model id in `model`. Keep this updated alongside lib/config/models.ts. */
  modelDisplayName: string;
  keyPlaceholder: string;
  getKeyUrl: string;
  /** A single accent color (hex) used as the fallback badge when no real
   * logo file is set below. */
  color: string;
  /** Optional path (under /public) to a real logo file, e.g.
   * "/logos/openai.svg" — used only if YOU place a genuine file you
   * sourced directly from that provider at this path. Left unset here on
   * purpose: Claude will not fetch, redraw, or approximate any company's
   * logo (see ARCHITECTURE.md). If this is set, ProviderLogo renders the
   * image; if not, it falls back to the colored initial badge. */
  logoPath?: string;
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
