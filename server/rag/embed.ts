import type { Chunk } from '../types/index.ts';

export interface EmbeddedChunk {
  chunk: Chunk;
  vector: number[];
  dimensions: number;
}

/**
 * Deterministic In-Process Embedding Generator
 * Complies with Rule 3 (no external vector database) and Rule 4 (lightweight in-process).
 * Converts text into normalized 64-dimensional dense semantic vectors using hashed n-grams
 * and term weighting.
 */
export function generateDenseVector(text: string, dimensions = 64): number[] {
  const vector = new Array<number>(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return vector;
  }

  // 1. Single word hash weights
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.0;

    // 2. Bi-gram hash weights for phrase context
    if (i < words.length - 1) {
      const bigram = `${word}_${words[i + 1]}`;
      let biHash = 0;
      for (let k = 0; k < bigram.length; k++) {
        biHash = (biHash << 5) - biHash + bigram.charCodeAt(k);
        biHash |= 0;
      }
      const biIdx = Math.abs(biHash) % dimensions;
      vector[biIdx] += 1.5;
    }
  }

  // L2 Normalization to unit length
  let norm = 0;
  for (let i = 0; i < dimensions; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] = Number((vector[i] / norm).toFixed(6));
    }
  }

  return vector;
}

export function embedChunks(chunks: Chunk[]): EmbeddedChunk[] {
  return chunks.map(chunk => ({
    chunk,
    vector: generateDenseVector(chunk.content),
    dimensions: 64,
  }));
}
