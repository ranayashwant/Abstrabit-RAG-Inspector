import type { Chunk, RerankedChunk } from '../types/index.ts';

export interface ConstructedContext {
  contextChunkIds: string[];
  contextText: string;
  promptTemplate: string;
  totalTokens: number;
}

/**
 * Context Window Constructor
 * Assembles retrieved chunks into the prompt context payload.
 */
export function constructContext(
  query: string,
  reranked: RerankedChunk[],
  chunksMap: Map<string, Chunk>
): ConstructedContext {
  const contextChunkIds = reranked.map(r => r.chunkId);
  const contextSections: string[] = [];
  let totalTokens = 0;

  for (const chunkId of contextChunkIds) {
    const chunk = chunksMap.get(chunkId);
    if (chunk) {
      contextSections.push(`[Source: ${chunk.id} - ${chunk.metadata.section}]\n${chunk.content}`);
      totalTokens += chunk.tokenCount;
    }
  }

  const contextText = contextSections.join('\n\n');

  const promptTemplate = `You are a helpful enterprise assistant. Answer the user question strictly using ONLY the provided context snippets below. If the context does not contain the complete policy details, explicitly state what is missing.

--- CONTEXT SNIPPETS ---
${contextText || '(No context provided)'}
------------------------

User Question: ${query}

Answer:`;

  return {
    contextChunkIds,
    contextText,
    promptTemplate,
    totalTokens,
  };
}
