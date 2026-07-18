"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Key,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  KeyRound,
  Copy,
  Check,
  Clock,
  History,
  X,
  RotateCw,
  Eye,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { providers, comingSoonProviders } from "@/lib/providers";
import { ProviderLogo } from "./ProviderLogo";
import { ProviderSelector, ProviderChips } from "./ProviderSelector";

type ResultState = {
  text: string | null;
  error: string | null;
  durationMs: number | null;
};

const RECENT_PROMPTS_KEY = "arken-compare:recent-prompts";
const RECENT_PROMPTS_LIMIT = 8;

function loadRecentPrompts(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_PROMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((p) => typeof p === "string") : [];
  } catch {
    return [];
  }
}

function saveRecentPrompts(prompts: string[]) {
  try {
    window.localStorage.setItem(RECENT_PROMPTS_KEY, JSON.stringify(prompts));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — fail silently,
    // recent prompts just won't persist this session.
  }
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

const API_KEYS_STORAGE_KEY = "arken-compare:api-keys";
const SELECTED_PROVIDERS_STORAGE_KEY = "arken-compare:selected-providers";

function loadStoredKeys(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredKeys(storedKeys: Record<string, string>) {
  try {
    window.localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(storedKeys));
  } catch {
    // localStorage unavailable — keys just won't persist this session.
  }
}

function loadSelectedProviders(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SELECTED_PROVIDERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSelectedProviders(selected: Record<string, boolean>) {
  try {
    window.localStorage.setItem(
      SELECTED_PROVIDERS_STORAGE_KEY,
      JSON.stringify(selected)
    );
  } catch {
    // localStorage unavailable — selection just won't persist this session.
  }
}

/**
 * Every provider throws `Error("HTTP {status}: {detail}")` on a bad
 * response (see readErrorDetail/safeFetch in lib/providers/types.ts) — this
 * is the one shared shape across all providers, so we can turn common
 * status codes into a friendly message without touching provider files.
 */
function friendlyError(message: string): { title: string; detail: string } {
  const match = message.match(/^HTTP (\d+):/);
  const status = match ? Number(match[1]) : null;
  switch (status) {
    case 401:
    case 403:
      return { title: "Invalid API key", detail: "Check the key you entered above." };
    case 429:
      return { title: "Rate limited", detail: "Too many requests. Wait a moment and try again." };
    case 404:
      return { title: "Model not found", detail: "This provider no longer serves the configured model." };
    case 500:
    case 502:
    case 503:
      return { title: "Provider error", detail: "The provider's servers had an issue. Try again." };
    default:
      return { title: "Request failed", detail: message };
  }
}

/** Shimmering placeholder shown while a provider's response is streaming in. */
function ResponseSkeleton() {
  const widths = ["100%", "94%", "97%", "70%"];
  return (
    <div>
      <span className="mb-3 flex items-center gap-2 text-ink-faint">
        <Loader2 size={13} className="animate-spin" />
        Thinking...
      </span>
      <div className="space-y-2">
        {widths.map((w, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-border-soft"
            style={{ width: w, animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

const COLLAPSE_CHAR_THRESHOLD = 480;
const COLLAPSED_MAX_HEIGHT = 190;

/**
 * Long responses get a capped preview height with a fade-out edge and a
 * "Show more" toggle, so a single huge answer doesn't blow out the card
 * grid. The height animates smoothly in both directions.
 */
function CollapsibleText({ text, roomy = false }: { text: string; roomy?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const needsCollapse = text.length > COLLAPSE_CHAR_THRESHOLD;
  const textClass = roomy
    ? "text-[14px] leading-relaxed"
    : "text-[13.5px] leading-relaxed";

  return (
    <div>
      <motion.div
        initial={false}
        animate={{ maxHeight: !needsCollapse || expanded ? 4000 : COLLAPSED_MAX_HEIGHT }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden"
      >
        <p className={`whitespace-pre-wrap text-ink-muted ${textClass}`}>{text}</p>
        {needsCollapse && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
        )}
      </motion.div>
      {needsCollapse && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="focus-ring mt-2 flex items-center gap-1 text-[12px] font-medium text-accent-soft transition-all hover:text-accent active:scale-95"
        >
          {expanded ? (
            <>
              Show less <ChevronUp size={13} />
            </>
          ) : (
            <>
              Show more <ChevronDown size={13} />
            </>
          )}
        </button>
      )}
    </div>
  );
}

/**
 * Renders the not-ready / loading / error / text states for one provider's
 * result. Shared by the Compare Mode grid (compact) and Test Mode (roomy)
 * so both layouts stay in sync automatically.
 */
function ProviderResultStatus({
  providerLabel,
  hasKey,
  isLoading,
  result,
  onRegenerate,
  roomy = false,
}: {
  providerLabel: string;
  hasKey: boolean;
  isLoading: boolean;
  result?: ResultState;
  onRegenerate: () => void;
  roomy?: boolean;
}) {
  if (!hasKey) {
    return (
      <span className="flex items-start gap-2 text-ink-faint">
        <Key size={13} className="mt-0.5 shrink-0" />
        Add your {providerLabel} key above to see it here.
      </span>
    );
  }
  if (isLoading) {
    return <ResponseSkeleton />;
  }
  if (result?.error) {
    const fe = friendlyError(result.error);
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5">
        <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
        <div className="flex-1">
          <div className="text-[13px] font-medium text-red-400">{fe.title}</div>
          <div className="mt-0.5 text-[12px] text-ink-faint">{fe.detail}</div>
          <button
            type="button"
            onClick={onRegenerate}
            className="focus-ring mt-2 flex items-center gap-1.5 rounded-md border border-red-500/20 px-2 py-1 text-[11.5px] font-medium text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
          >
            <RotateCw size={11} />
            Regenerate
          </button>
        </div>
      </div>
    );
  }
  if (result?.text) {
    return <CollapsibleText text={result.text} roomy={roomy} />;
  }
  return <span className="text-ink-faint">No response yet. Press the button above.</span>;
}

export function CompareTool() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [selectedProviders, setSelectedProviders] = useState<
    Record<string, boolean>
  >(() => Object.fromEntries(providers.map((p) => [p.meta.id, true])));
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setRecentPrompts(loadRecentPrompts());
    const storedKeys = loadStoredKeys();
    if (Object.keys(storedKeys).length) {
      setKeys((k) => ({ ...storedKeys, ...k }));
    }
    const storedSelected = loadSelectedProviders();
    if (Object.keys(storedSelected).length) {
      setSelectedProviders((s) => ({ ...s, ...storedSelected }));
    }
    // Only flip this AFTER the loads above are queued, so the save effects
    // below never fire on the pre-load render and clobber what we just
    // read from storage with the empty initial state.
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredKeys(keys);
  }, [keys, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveSelectedProviders(selectedProviders);
  }, [selectedProviders, hydrated]);

  function toggleProvider(id: string) {
    setSelectedProviders((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function pushRecentPrompt(p: string) {
    setRecentPrompts((prev) => {
      const next = [p, ...prev.filter((x) => x !== p)].slice(
        0,
        RECENT_PROMPTS_LIMIT
      );
      saveRecentPrompts(next);
      return next;
    });
  }

  function removeRecentPrompt(p: string) {
    setRecentPrompts((prev) => {
      const next = prev.filter((x) => x !== p);
      saveRecentPrompts(next);
      return next;
    });
  }

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
    } catch {
      // Clipboard API blocked (permissions, insecure context) — no-op.
    }
  }

  const visibleProviders = providers.filter((p) => selectedProviders[p.meta.id]);
  const isTestMode = visibleProviders.length === 1;
  // auto-fit + minmax means this scales to any provider count — 2, 3, 8 —
  // without a column class hardcoded per count. Test Mode (exactly 1) is
  // handled as its own layout below, not through this grid at all.
  const gridColsClass = "grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(260px,1fr))]";
  const hasAnyKey = visibleProviders.some((p) => keys[p.meta.id]?.trim());
  const anyLoading = Object.values(loading).some(Boolean);
  const hasResults = Object.keys(results).length > 0;

  function clearResults() {
    setResults({});
    setError("");
  }

  /**
   * Runs the given providers' call() and writes their results — used for
   * both the full "Compare" pass and a single-provider "Regenerate". Adding
   * a new provider to lib/providers/index.ts automatically gets Regenerate
   * for free; there is no per-provider function to write.
   */
  async function runProviders(targets: typeof providers) {
    setLoading((l) => {
      const next = { ...l };
      targets.forEach((p) => (next[p.meta.id] = true));
      return next;
    });

    await Promise.all(
      targets.map(async (p) => {
        const startedAt = performance.now();
        try {
          const text = await p.call(prompt, keys[p.meta.id].trim());
          const durationMs = performance.now() - startedAt;
          setResults((r) => ({
            ...r,
            [p.meta.id]: { text, error: null, durationMs },
          }));
        } catch (e) {
          setResults((r) => ({
            ...r,
            [p.meta.id]: {
              text: null,
              error: (e as Error).message,
              durationMs: null,
            },
          }));
        } finally {
          setLoading((l) => ({ ...l, [p.meta.id]: false }));
        }
      })
    );
  }

  async function handleCompare() {
    setError("");
    if (visibleProviders.length === 0)
      return setError("Select at least one provider.");
    if (!prompt.trim()) return setError("Write a prompt first.");
    if (!hasAnyKey) return setError("Add at least one API key.");

    const activeProviders = visibleProviders.filter((p) =>
      keys[p.meta.id]?.trim()
    );
    setResults({});
    pushRecentPrompt(prompt.trim());
    await runProviders(activeProviders);
  }

  async function regenerate(providerId: string) {
    const p = providers.find((pr) => pr.meta.id === providerId);
    if (!p || !prompt.trim() || !keys[p.meta.id]?.trim()) return;
    await runProviders([p]);
  }

  return (
    <MotionConfig reducedMotion="user">
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pb-10 pt-4"
      >
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1 text-[12px] font-medium text-accent-soft">
          <Sparkles size={12} />
          Bring your own keys · Saved in this browser only
        </div>
        <h1 className="max-w-2xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Compare any model,{" "}
          <span className="text-ink-muted">side by side.</span>
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
          One prompt, any provider you pick: GPT, Claude, Gemini, Grok,
          DeepSeek, Mistral, Llama, Cohere, and counting. Each key talks
          directly to its own provider from your browser. None of it
          touches our servers.
        </p>
      </motion.div>

      {/* Keys + Prompt card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-3xl rounded-xl2 border border-border bg-surface/80 p-7 shadow-card backdrop-blur transition-shadow focus-within:shadow-glow sm:p-8"
      >
        <div className="mb-2 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
            <Sparkles size={13} /> Providers
          </label>
          {visibleProviders.length > 0 && (
            <span
              className={`rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${
                isTestMode
                  ? "border-accent/30 bg-accent/10 text-accent-soft"
                  : "border-border-soft text-ink-faint"
              }`}
            >
              {isTestMode ? "Test Mode" : "Compare Mode"}
            </span>
          )}
        </div>
        <div className="mb-5 flex flex-wrap items-start gap-3">
          <ProviderSelector
            providers={providers}
            comingSoonProviders={comingSoonProviders}
            selected={selectedProviders}
            onToggle={toggleProvider}
          />
          <div className="flex-1 pt-2">
            <ProviderChips
              providers={providers}
              selected={selectedProviders}
              onRemove={toggleProvider}
            />
          </div>
        </div>

        <div className="mt-7 border-t border-border-soft pt-6">
        <label className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
          <KeyRound size={13} /> API keys
        </label>
        {visibleProviders.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-soft px-3.5 py-3 text-[12.5px] text-ink-faint">
            Select at least one provider above to enter its key.
          </p>
        ) : (
          <div className={`grid gap-2.5 ${gridColsClass}`}>
            {visibleProviders.map((p) => (
            <div key={p.meta.id}>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-muted">
                <ProviderLogo color={p.meta.color} logoPath={p.meta.logoPath} label={p.meta.label} size={16} />
                {p.meta.label}
              </div>
              <div className="relative">
                <input
                  type={visibleKeys[p.meta.id] ? "text" : "password"}
                  value={keys[p.meta.id] || ""}
                  onChange={(e) =>
                    setKeys((k) => ({ ...k, [p.meta.id]: e.target.value }))
                  }
                  placeholder={p.meta.keyPlaceholder}
                  aria-label={`${p.meta.label} API key`}
                  className="focus-ring w-full rounded-lg border border-border bg-base px-3.5 py-2.5 pr-9 text-[13.5px] text-ink placeholder:text-ink-faint"
                />
                <button
                  type="button"
                  onClick={() =>
                    setVisibleKeys((v) => ({
                      ...v,
                      [p.meta.id]: !v[p.meta.id],
                    }))
                  }
                  className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint transition-all hover:text-ink active:scale-90"
                  aria-label={
                    visibleKeys[p.meta.id] ? "Hide API key" : "Show API key"
                  }
                >
                  {visibleKeys[p.meta.id] ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              <a
                href={p.meta.getKeyUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block text-[11.5px] text-ink-faint transition-colors hover:text-accent-soft"
              >
                {p.meta.label} key ↗
              </a>
            </div>
          ))}
        </div>
        )}
        </div>

        <div className="mt-7 border-t border-border-soft pt-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="prompt-input" className="block text-[13px] font-medium text-ink-muted">
            Prompt
          </label>
          <span className="text-[11.5px] text-ink-faint">
            {prompt.length} chars
          </span>
        </div>
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleCompare();
            }
          }}
          placeholder="Ask anything..."
          rows={4}
          className="focus-ring w-full resize-y rounded-lg border border-border bg-base px-3.5 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint"
        />
        <div className="mt-1.5 flex items-center justify-end gap-1 text-[11px] text-ink-faint">
          <kbd className="rounded border border-border-soft px-1.5 py-0.5 font-sans">
            ⌘/Ctrl
          </kbd>
          <span>+</span>
          <kbd className="rounded border border-border-soft px-1.5 py-0.5 font-sans">
            Enter
          </kbd>
          <span>to compare</span>
        </div>

        {recentPrompts.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1 text-[11.5px] text-ink-faint">
              <History size={11} /> Recent:
            </span>
            {recentPrompts.map((p) => (
              <span
                key={p}
                className="group inline-flex max-w-[220px] items-center gap-1 rounded-full border border-border-soft bg-base px-2.5 py-1 text-[11.5px] text-ink-faint"
              >
                <button
                  type="button"
                  onClick={() => setPrompt(p)}
                  className="focus-ring truncate hover:text-accent-soft"
                  title={p}
                >
                  {p}
                </button>
                <button
                  type="button"
                  onClick={() => removeRecentPrompt(p)}
                  className="focus-ring shrink-0 text-ink-faint transition-all hover:text-red-400 active:scale-90"
                  aria-label="Remove from recent prompts"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex items-center gap-2 overflow-hidden text-[13px] text-red-400"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-7 flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleCompare}
            disabled={anyLoading}
            className="focus-ring group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-b from-accent-soft to-accent px-4 py-3 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] transition-colors hover:to-accent-dim disabled:opacity-60"
          >
            {anyLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {isTestMode ? "Testing" : "Comparing"}
              </>
            ) : (
              <>
                {isTestMode ? "Test" : "Compare"}
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </>
            )}
          </motion.button>
          {hasResults && (
            <motion.button
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearResults}
              disabled={anyLoading}
              className="focus-ring flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border px-3.5 py-3 text-[13px] font-medium text-ink-muted transition-colors hover:border-red-500/30 hover:text-red-400 disabled:opacity-60"
              aria-label="Clear results"
              title="Clear results"
            >
              <Trash2 size={14} />
              Clear Results
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Results — Test Mode (1 provider) vs Compare Mode (2-3 providers) */}
      <AnimatePresence mode="wait">
      {visibleProviders.length === 0 ? (
        <motion.div
          key="empty"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-10 rounded-xl2 border border-dashed border-border-soft px-6 py-10 text-center text-[13.5px] text-ink-faint"
        >
          Select at least one provider above to see results here.
        </motion.div>
      ) : isTestMode ? (
        (() => {
          const p = visibleProviders[0];
          const hasKey = !!keys[p.meta.id]?.trim();
          const result = results[p.meta.id];
          return (
            <motion.div
              key={p.meta.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-10 overflow-hidden rounded-xl2 border border-border bg-surface/60 shadow-card transition-all hover:border-accent/20 hover:shadow-glow-sm"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border-soft px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <ProviderLogo color={p.meta.color} logoPath={p.meta.logoPath} label={p.meta.label} size={26} />
                  <div>
                    <div className="text-[14px] font-semibold text-ink">
                      {p.meta.label}
                    </div>
                    <div className="text-[11.5px] text-ink-faint">
                      {p.meta.modelDisplayName}
                    </div>
                  </div>
                </div>
                {result && (result.text || result.error) && (
                  <div className="flex items-center gap-3 text-[11.5px] text-ink-faint">
                    {result.text && result.durationMs !== null && (
                      <span className="flex items-center gap-1" title="Response time">
                        <Clock size={12} />
                        {(result.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    {result.text && (
                      <span title="Word count">{wordCount(result.text)} words</span>
                    )}
                    <button
                      type="button"
                      onClick={() => regenerate(p.meta.id)}
                      disabled={loading[p.meta.id]}
                      className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-all hover:text-accent-soft active:scale-90 disabled:opacity-50"
                      aria-label={`Regenerate ${p.meta.label} response`}
                      title="Regenerate"
                    >
                      <RotateCw
                        size={12}
                        className={loading[p.meta.id] ? "animate-spin" : ""}
                      />
                    </button>
                    {result.text && (
                      <button
                        type="button"
                        onClick={() => handleCopy(p.meta.id, result.text!)}
                        className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-all hover:text-accent-soft active:scale-90"
                        aria-label={`Copy ${p.meta.label} response`}
                      >
                        {copiedId === p.meta.id ? (
                          <>
                            <Check size={12} /> Copied
                          </>
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="min-h-[160px] px-5 py-5">
                <ProviderResultStatus
                  providerLabel={p.meta.label}
                  hasKey={hasKey}
                  isLoading={!!loading[p.meta.id]}
                  result={result}
                  onRegenerate={() => regenerate(p.meta.id)}
                  roomy
                />
              </div>
            </motion.div>
          );
        })()
      ) : (
        <motion.div
          key="compare-mode"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`mt-10 grid gap-5 ${gridColsClass}`}
        >
          {visibleProviders.map((p, i) => {
            const hasKey = !!keys[p.meta.id]?.trim();
            const result = results[p.meta.id];
            return (
              <motion.div
                key={p.meta.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="overflow-hidden rounded-xl2 border border-border bg-surface/60 shadow-card transition-all hover:border-accent/20 hover:shadow-glow-sm"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border-soft px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <ProviderLogo color={p.meta.color} logoPath={p.meta.logoPath} label={p.meta.label} size={22} />
                    <div>
                      <div className="text-[13px] font-semibold leading-tight text-ink">
                        {p.meta.label}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-tight text-ink-faint">
                        {p.meta.modelDisplayName}
                      </div>
                    </div>
                  </div>
                  {result && (result.text || result.error) && (
                    <div className="flex items-center gap-2.5 text-[11px] text-ink-faint">
                      {result.text && result.durationMs !== null && (
                        <span className="flex items-center gap-1" title="Response time">
                          <Clock size={11} />
                          {(result.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      {result.text && (
                        <span title="Word count">
                          {wordCount(result.text)} words
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => regenerate(p.meta.id)}
                        disabled={loading[p.meta.id]}
                        className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-all hover:text-accent-soft active:scale-90 disabled:opacity-50"
                        aria-label={`Regenerate ${p.meta.label} response`}
                        title="Regenerate"
                      >
                        <RotateCw
                          size={11}
                          className={loading[p.meta.id] ? "animate-spin" : ""}
                        />
                      </button>
                      {result.text && (
                        <button
                          type="button"
                          onClick={() => handleCopy(p.meta.id, result.text!)}
                          className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-all hover:text-accent-soft active:scale-90"
                          aria-label={`Copy ${p.meta.label} response`}
                        >
                          {copiedId === p.meta.id ? (
                            <>
                              <Check size={11} /> Copied
                            </>
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="min-h-[130px] px-5 py-5">
                  <ProviderResultStatus
                    providerLabel={p.meta.label}
                    hasKey={hasKey}
                    isLoading={!!loading[p.meta.id]}
                    result={result}
                    onRegenerate={() => regenerate(p.meta.id)}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
    </MotionConfig>
  );
}
