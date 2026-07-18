/**
 * Renders a provider's real logo if `logoPath` is set (a file YOU sourced
 * and dropped into public/logos/ yourself — see public/logos/README.md),
 * otherwise falls back to a colored initial badge using `color`.
 *
 * Claude does not fetch, redraw, or approximate any company's logo — see
 * ARCHITECTURE.md ("Why there are no company logos"). This component
 * ships with every provider's `logoPath` unset, so every badge renders
 * as the colored-initial fallback until a real file is added manually.
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
        className={`shrink-0 object-contain ${className}`}
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
