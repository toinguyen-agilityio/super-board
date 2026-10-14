// Intl.Segmenter is missing in older browsers (Firefox < 125); fall back to code points.
const segmenter =
  typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;

const graphemes = (text: string): string[] =>
  segmenter ? Array.from(segmenter.segment(text), (s) => s.segment) : Array.from(text);

// Count user-perceived characters (grapheme clusters), not UTF-16 units.
export function countGraphemes(text: string): number {
  return graphemes(text).length;
}

// Keep the first `max` graphemes; never splits a cluster.
export function truncateGraphemes(text: string, max: number): string {
  const all = graphemes(text);
  return all.length <= max ? text : all.slice(0, max).join("");
}
