const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

// Count user-perceived characters (grapheme clusters), not UTF-16 units.
export function countGraphemes(text: string): number {
  return Array.from(segmenter.segment(text)).length;
}

// Keep the first `max` graphemes; never splits a cluster.
export function truncateGraphemes(text: string, max: number): string {
  let n = 0;
  for (const { index } of segmenter.segment(text)) {
    if (n === max) return text.slice(0, index);
    n++;
  }
  return text;
}
