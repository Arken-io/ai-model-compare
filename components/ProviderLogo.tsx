/**
 * Renders a provider's real logo if `logoPath` is set (a file YOU sourced
 * and dropped into public/logos/ yourself — see public/logos/README.md),
 * otherwise falls back to a colored initial badge using `color`.
 *
 * Claude does not fetch, redraw, or approximate any company's logo — see
 * ARCHITECTURE.md ("Why there are no company logos"). Each provider's
 * `logoPath` now points at a real file the project owner supplied in
 * public/logos/ (see that folder's README for the mapping and the
 * per-provider brand-guideline caveats, e.g. OpenAI). Remove a provider's
 * `logoPath` line to fall back to the colored-initial badge again.
 */
export function ProviderLogo({
  color,
  logoPath,
  label,
  size = 20,
  className = "",
}: {
  color: string;
  logoPath?: string;
  label: string;
  size?: number;
  className?: string;
}) {
  if (logoPath) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoPath}
        alt={`${label} logo`}
        width={size}
        height={size}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-black/70 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: Math.max(8, Math.round(size * 0.45)),
      }}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
