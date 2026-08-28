import type { RetrievedChunk, Chunk } from '../types/index.ts';
import { generateDenseVector, type EmbeddedChunk } from './embed.ts';

/**
 * In-Process Cosine Similarity Vector Retriever
 * Computes exact dot product over normalized dense vectors.
 * The retrieval failure naturally emerges from the chunk phrasing and top-K parameter.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Number(Math.max(0, Math.min(1, dot)).toFixed(4));
}

export interface RetrievalResult {
  retrievedChunks: RetrievedChunk[];
  topK: number;
  allScoredChunks: Array<{
    chunkId: string;
    rank: number;
    score: number;
    chunk: Chunk;
  }>;
}

export function retrieveChunks(
  query: string,
  embeddedChunks: EmbeddedChunk[],
  topK = 2
): RetrievalResult {
  const queryVector = generateDenseVector(query);

  const scored = embeddedChunks.map(({ chunk, vector }) => {
    const score = cosineSimilarity(queryVector, vector);
    return {
      chunkId: chunk.id,
      score,
      chunk,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const rankedAll = scored.map((item, index) => ({
    chunkId: item.chunkId,
    rank: index + 1,
    score: item.score,
    chunk: item.chunk,
  }));

  const topChunks: RetrievedChunk[] = rankedAll.slice(0, topK).map(item => ({
    chunkId: item.chunkId,
    rank: item.rank,
    score: item.score,
    retrievalMethod: 'dense_cosine',
    retrievedAt: new Date().toISOString(),
  }));

  return {
    retrievedChunks: topChunks,
    topK,
    allScoredChunks: rankedAll,
  };
}
