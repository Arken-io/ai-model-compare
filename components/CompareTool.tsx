"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { providers } from "@/lib/providers";

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

export function CompareTool() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [prompt, setPrompt] = useState("");
  const [results, setResults] = useState<Record<string, ResultState>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);

  useEffect(() => {
    setRecentPrompts(loadRecentPrompts());
  }, []);

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

  const hasAnyKey = providers.some((p) => keys[p.meta.id]?.trim());
  const anyLoading = Object.values(loading).some(Boolean);

  async function handleCompare() {
    setError("");
    if (!prompt.trim()) return setError("Write a prompt first.");
    if (!hasAnyKey) return setError("Add at least one API key.");

    const activeProviders = providers.filter((p) => keys[p.meta.id]?.trim());
    const nextLoading: Record<string, boolean> = {};
    activeProviders.forEach((p) => (nextLoading[p.meta.id] = true));
    setLoading(nextLoading);
    setResults({});
    pushRecentPrompt(prompt.trim());

    await Promise.all(
      activeProviders.map(async (p) => {
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

  return (
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
          Bring your own keys · Nothing stored
        </div>
        <h1 className="max-w-2xl text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Compare GPT, Claude and Gemini,{" "}
          <span className="text-ink-muted">side by side.</span>
        </h1>
        <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-muted">
          One prompt, three models. Each key talks directly to its own
          provider from your browser — none of it touches our servers.
        </p>
      </motion.div>

      {/* Keys + Prompt card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl2 border border-border bg-surface/80 p-6 shadow-glow backdrop-blur sm:p-7"
      >
        <label className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-ink-muted">
          <KeyRound size={13} /> API keys
        </label>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {providers.map((p) => (
            <div key={p.meta.id}>
              <input
                type="password"
                value={keys[p.meta.id] || ""}
                onChange={(e) =>
                  setKeys((k) => ({ ...k, [p.meta.id]: e.target.value }))
                }
                placeholder={p.meta.keyPlaceholder}
                className="focus-ring w-full rounded-lg border border-border bg-base px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-faint"
              />
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

        <label className="mb-2 mt-6 block text-[13px] font-medium text-ink-muted">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask anything..."
          rows={4}
          className="focus-ring w-full resize-y rounded-lg border border-border bg-base px-3.5 py-3 text-[14px] leading-relaxed text-ink placeholder:text-ink-faint"
        />

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
                  className="focus-ring shrink-0 text-ink-faint hover:text-red-400"
                  aria-label="Remove from recent prompts"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

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

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCompare}
          disabled={anyLoading}
          className="focus-ring group mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-accent-dim disabled:opacity-60"
        >
          {anyLoading ? (
            <>
              <Loader2 size={15} className="animate-spin" /> Comparing
            </>
          ) : (
            <>
              Compare
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Results — always 3 columns */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {providers.map((p, i) => {
          const hasKey = !!keys[p.meta.id]?.trim();
          const result = results[p.meta.id];
          return (
            <motion.div
              key={p.meta.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="overflow-hidden rounded-xl2 border border-border bg-surface/60"
            >
              <div className="flex items-center justify-between gap-2 border-b border-border-soft px-4 py-3">
                <span className="text-[13px] font-semibold text-ink">
                  {p.meta.label}
                </span>
                {result?.text && (
                  <div className="flex items-center gap-2.5 text-[11px] text-ink-faint">
                    {result.durationMs !== null && (
                      <span className="flex items-center gap-1" title="Response time">
                        <Clock size={11} />
                        {(result.durationMs / 1000).toFixed(1)}s
                      </span>
                    )}
                    <span title="Word count">
                      {wordCount(result.text)} words
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(p.meta.id, result.text!)}
                      className="focus-ring flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:text-accent-soft"
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
                  </div>
                )}
              </div>
              <div className="min-h-[110px] px-4 py-4 text-[13.5px] leading-relaxed">
                {!hasKey && (
                  <span className="flex items-start gap-2 text-ink-faint">
                    <Key size={13} className="mt-0.5 shrink-0" />
                    Add your {p.meta.label} key above to see it here.
                  </span>
                )}
                {hasKey && loading[p.meta.id] && (
                  <span className="flex items-center gap-2 text-ink-faint">
                    <Loader2 size={13} className="animate-spin" />
                    Thinking...
                  </span>
                )}
                {hasKey && !loading[p.meta.id] && result?.error && (
                  <span className="text-red-400">{result.error}</span>
                )}
                {hasKey && !loading[p.meta.id] && result?.text && (
                  <p className="whitespace-pre-wrap text-ink-muted">
                    {result.text}
                  </p>
                )}
                {hasKey && !loading[p.meta.id] && !result && (
                  <span className="text-ink-faint">
                    Ready — press Compare.
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
