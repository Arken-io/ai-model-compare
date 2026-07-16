import { ArkenMark } from "./ArkenMark";

export function Header() {
  return (
    <header className="flex items-center justify-between py-6">
      <div className="flex items-center gap-2.5">
        <ArkenMark size={18} className="text-accent" />
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Arken
        </span>
        <span className="text-border-soft text-ink-faint">/</span>
        <span className="text-[13px] text-ink-muted">Model Compare</span>
      </div>
      <a
        href="https://aistudio.google.com/app/apikey"
        target="_blank"
        rel="noreferrer"
        className="focus-ring hidden sm:inline-flex items-center rounded-full border border-border px-3.5 py-1.5 text-[13px] text-ink-muted transition-colors hover:border-accent/40 hover:text-ink"
      >
        Get a free API key ↗
      </a>
    </header>
  );
}
