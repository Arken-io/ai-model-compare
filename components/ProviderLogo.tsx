/**
 * Renders whichever logo a provider's metadata points to
 * (lib/providers/*.ts -> meta.logoPath, files live in public/logos/).
 * Adding a new provider is just: drop an SVG in public/logos/ and set
 * logoPath in its meta -- this component never needs to change.
 *
 * Plain <img>, not next/image: next/image runs local SVGs through its
 * optimizer by default and 400s unless dangerouslyAllowSVG is set — not
 * worth the config for icons this small.
 */
export function ProviderLogo({
  logoPath,
  label,
  size = 20,
  className = "",
}: {
  logoPath: string;
  label: string;
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logoPath}
      alt={`${label} logo`}
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
