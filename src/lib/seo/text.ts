/** Strip emoji and most symbols for clean H1 / schema titles. */
export function stripEmojisForSeo(text: string): string {
  return text
    .replace(
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|\uFE0F|\u200D/gu,
      "",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function plainTextFromHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncateMetaDescription(text: string, max = 160): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim() + "…";
}
