// Keep this in sync with `basePath` in next.config.mjs.
// Next.js auto-prefixes next/link and next/router with basePath, but it
// does NOT touch hardcoded strings — plain <img src="..."> tags, metadata
// icon URLs, and data-driven paths like each provider's `logoPath` all
// need this added manually.
export const BASE_PATH = "/compare";
