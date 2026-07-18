"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { ProviderLogo } from "./ProviderLogo";
import type { Provider } from "@/lib/providers";

interface SelectorEntry {
  id: string;
  label: string;
  color: string;
  logoPath?: string;
  disabled: boolean;
}

export function ProviderSelector({
  providers,
  comingSoonProviders,
  selected,
  onToggle,
}: {
  providers: Provider[];
  comingSoonProviders: { id: string; label: string; color: string }[];
  selected: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const entries: SelectorEntry[] = [
    ...providers.map((p) => ({
      id: p.meta.id,
      label: p.meta.label,
      color: p.meta.color,
      logoPath: p.meta.logoPath,
      disabled: false,
    })),
    ...comingSoonProviders.map((p) => ({
      id: p.id,
      label: p.label,
      color: p.color,
      disabled: true,
    })),
  ];

  const filtered = entries.filter((e) =>
    e.label.toLowerCase().includes(query.trim().toLowerCase())
  );
  const selectableFiltered = filtered.filter((e) => !e.disabled);
  const selectedCount = providers.filter((p) => selected[p.meta.id]).length;

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(0);
      // Autofocus the search field the moment the popover mounts.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function moveHighlight(delta: number) {
    if (selectableFiltered.length === 0) return;
    setHighlight((h) => {
      const next = (h + delta + selectableFiltered.length) % selectableFiltered.length;
      const id = selectableFiltered[next].id;
      rowRefs.current[id]?.focus();
      return next;
    });
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(0); // focuses the current (first) highlighted row
      return;
    }
    if (e.key === "Enter" && selectableFiltered[highlight]) {
      e.preventDefault();
      onToggle(selectableFiltered[highlight].id);
    }
  }

  function handleRowKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(index);
      moveHighlight(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (index === 0) {
        inputRef.current?.focus();
      } else {
        setHighlight(index);
        moveHighlight(-1);
      }
    }
    // Enter and Space toggle natively since rows are real <button>s —
    // no extra handling needed for those two keys.
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="focus-ring flex items-center gap-2 rounded-lg border border-border bg-base px-3.5 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-accent/30 hover:text-ink"
      >
        <Search size={13} />
        Select Providers
        {selectedCount > 0 && (
          <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10.5px] font-semibold text-accent-soft">
            {selectedCount}
          </span>
        )}
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            role="listbox"
            aria-multiselectable="true"
            className="absolute left-0 top-[calc(100%+6px)] z-20 w-72 overflow-hidden rounded-xl2 border border-border bg-surface shadow-glow"
          >
            <div className="flex items-center gap-2 border-b border-border-soft px-3 py-2.5">
              <Search size={13} className="shrink-0 text-ink-faint" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Search providers..."
                aria-label="Search providers"
                className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 && (
                <div className="px-3.5 py-4 text-center text-[12.5px] text-ink-faint">
                  No providers match &quot;{query}&quot;.
                </div>
              )}
              {filtered.map((e) => {
                const isSelected = !!selected[e.id];
                const selectableIndex = selectableFiltered.findIndex((s) => s.id === e.id);
                return (
                  <button
                    key={e.id}
                    ref={(el) => {
                      rowRefs.current[e.id] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={e.disabled}
                    onClick={() => !e.disabled && onToggle(e.id)}
                    onKeyDown={(ev) =>
                      !e.disabled && handleRowKeyDown(ev, selectableIndex)
                    }
                    className={`focus-ring flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors ${
                      e.disabled
                        ? "cursor-not-allowed opacity-45"
                        : "hover:bg-surface-raised"
                    }`}
                  >
                    <ProviderLogo color={e.color} logoPath={e.logoPath} label={e.label} size={16} />
                    <span className="flex-1 text-ink">{e.label}</span>
                    {e.disabled && (
                      <span className="rounded-full bg-border-soft px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-ink-faint">
                        Soon
                      </span>
                    )}
                    {!e.disabled && isSelected && (
                      <Check size={14} className="text-accent-soft" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Selected-provider chips shown outside the popover, always visible. */
export function ProviderChips({
  providers,
  selected,
  onRemove,
}: {
  providers: Provider[];
  selected: Record<string, boolean>;
  onRemove: (id: string) => void;
}) {
  const active = providers.filter((p) => selected[p.meta.id]);
  if (active.length === 0) {
    return (
      <span className="text-[12.5px] text-ink-faint">
        No providers selected yet.
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map((p) => (
        <span
          key={p.meta.id}
          className="flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 py-1 pl-1 pr-2 text-[12.5px] font-medium text-ink"
        >
          <ProviderLogo color={p.meta.color} logoPath={p.meta.logoPath} label={p.meta.label} size={16} />
          {p.meta.label}
          <button
            type="button"
            onClick={() => onRemove(p.meta.id)}
            aria-label={`Remove ${p.meta.label} from selection`}
            className="focus-ring text-ink-faint transition-colors hover:text-red-400"
          >
            <X size={11} />
          </button>
        </span>
      ))}
    </div>
  );
}
