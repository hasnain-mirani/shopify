/** Paths and labels to hide from category nav (e.g. PriceOye-style strip without phones / trimmers). */
const EXCLUDED_PATHS = new Set([
  "/collections/mobiles",
  "/collections/trimmers-shavers",
]);

export function isExcludedNavCategory(label: string, href: string): boolean {
  const path = href.split("?")[0].toLowerCase().replace(/\/$/, "");
  if (EXCLUDED_PATHS.has(path)) return true;
  const l = label.toLowerCase().trim();
  if (/\btrimm(er|ers)?\b/i.test(label) || /\bshaver/i.test(l)) return true;
  if (/^mobiles?$/i.test(l)) return true;
  return false;
}
