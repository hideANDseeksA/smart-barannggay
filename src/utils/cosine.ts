function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map(v => v / norm);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    return 0; // skip invalid vectors safely
  }

  const na = normalize(a);
  const nb = normalize(b);

  let dot = 0;
  for (let i = 0; i < na.length; i++) {
    dot += na[i] * nb[i];
  }

  return dot;
}
