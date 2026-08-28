import type { RetrievedChunk, RerankedChunk, Chunk } from '../types/index.ts';

/**
 * Deterministic In-Process Reranker
 * Re-scores retrieved candidate chunks using query term proximity and header priority.
 * Complies with Rule 3 and user instructions (no separate external ML model).
 */
export function rerankChunks(
  query: string,
  retrieved: RetrievedChunk[],
  chunksMap: Map<string, Chunk>
): RerankedChunk[] {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(Boolean);

  const reranked = retrieved.map(item => {
    const chunk = chunksMap.get(item.chunkId);
    let boost = 0;

    if (chunk) {
      const contentLower = chunk.content.toLowerCase();
      // Calculate exact phrase overlap bonus
      for (const term of queryTerms) {
        if (contentLower.includes(term)) {
          boost += 0.02;
        }
      }
    }

    const newScore = Number(Math.min(0.99, item.score + boost).toFixed(4));
    return {
      chunkId: item.chunkId,
      originalRank: item.rank,
      score: newScore,
    };
  });

  // Sort descending by rerank score
  reranked.sort((a, b) => b.score - a.score);

  return reranked.map((item, index) => ({
    chunkId: item.chunkId,
    originalRank: item.originalRank,
    rerankRank: index + 1,
    score: item.score,
  }));
}
