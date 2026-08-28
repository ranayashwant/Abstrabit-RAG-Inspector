import { loadSeedDocument } from './ingest.ts';
import { chunkDocument } from './chunk.ts';
import { embedChunks } from './embed.ts';
import { retrieveChunks } from './retrieve.ts';
import { rerankChunks } from './rerank.ts';
import { constructContext, type ConstructedContext } from './context.ts';
import { generateAnswer, type GenerationOutput } from './generate.ts';
import { TraceCollector } from '../tracing/tracer.ts';
import type { Chunk, RetrievedChunk, RerankedChunk, TraceEvent, Document } from '../types/index.ts';

export interface PipelineExecutionResult {
  runId: string;
  query: string;
  document: Document;
  chunks: Chunk[];
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[];
  rerankedChunks: RerankedChunk[];
  context: ConstructedContext;
  generation: GenerationOutput;
  events: TraceEvent[]; // Exactly 7 RAG stage events
  totalDurationMs: number;
  hasRetrievalFailure: boolean;
}

/**
 * 7-Stage In-Process RAG Pipeline Orchestrator
 * Executes INGEST -> CHUNK -> EMBED -> RETRIEVE -> RERANK -> CONTEXT -> GENERATE
 * and records canonical trace events for all 7 execution stages.
 */
export async function executeRAGPipeline(
  query = "What is the company's parental leave policy?",
  topK = 2
): Promise<PipelineExecutionResult> {
  const runId = `run-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const tracer = new TraceCollector(runId);
  const pipelineStartTime = Date.now();

  // STAGE 1: INGEST
  const ingestStart = Date.now();
  const document = loadSeedDocument();
  const ingestDuration = Math.max(8, Date.now() - ingestStart);
  tracer.recordStage(
    'INGEST',
    'SUCCESS',
    ingestDuration,
    `Loaded document: ${document.name}`,
    `Document size: ${document.content.length} characters across 8 handbook sections.`,
    { characterCount: document.content.length, sectionCount: 8 },
    [document.id]
  );

  // STAGE 2: CHUNK
  const chunkStart = Date.now();
  const chunks = chunkDocument(document);
  const chunksMap = new Map(chunks.map(c => [c.id, c]));
  const chunkDuration = Math.max(5, Date.now() - chunkStart);
  tracer.recordStage(
    'CHUNK',
    'SUCCESS',
    chunkDuration,
    `Input document: ${document.id}`,
    `Created ${chunks.length} section chunks with ground-truth metadata.`,
    { chunkCount: chunks.length, totalEstimatedTokens: chunks.reduce((acc, c) => acc + c.tokenCount, 0) },
    chunks.map(c => c.id)
  );

  // STAGE 3: EMBED
  const embedStart = Date.now();
  const embeddedChunks = embedChunks(chunks);
  const embedDuration = Math.max(12, Date.now() - embedStart);
  tracer.recordStage(
    'EMBED',
    'SUCCESS',
    embedDuration,
    `Generated embeddings for ${chunks.length} chunks + query`,
    `Vector dimensions: 64. Normalized L2 dense representation.`,
    { dimensions: 64, embeddedChunkCount: embeddedChunks.length },
    chunks.map(c => c.id)
  );

  // STAGE 4: RETRIEVE
  const retrieveStart = Date.now();
  const retrievalResult = retrieveChunks(query, embeddedChunks, topK);
  const retrieveDuration = Math.max(15, Date.now() - retrieveStart);

  const authoritativeChunk = chunks.find(c => c.metadata.isAuthoritative);
  const retrievedAuthoritative = retrievalResult.retrievedChunks.some(
    r => r.chunkId === authoritativeChunk?.id
  );

  const retrievalStatus = retrievedAuthoritative ? 'SUCCESS' : 'WARNING';
  const hasRetrievalFailure = !retrievedAuthoritative;

  tracer.recordStage(
    'RETRIEVE',
    retrievalStatus,
    retrieveDuration,
    `Query: "${query}" | Top-K: ${topK}`,
    hasRetrievalFailure
      ? `Retrieved ${retrievalResult.retrievedChunks.length} chunks. Authoritative chunk (${authoritativeChunk?.id || 'unknown'}) was ranked #${retrievalResult.allScoredChunks.find(s => s.chunkId === authoritativeChunk?.id)?.rank || '>2'} and excluded.`
      : `Retrieved ${retrievalResult.retrievedChunks.length} chunks including authoritative policy.`,
    {
      topK,
      topScore: retrievalResult.retrievedChunks[0]?.score || 0,
      authoritativeRetrieved: retrievedAuthoritative,
      authoritativeRank: retrievalResult.allScoredChunks.find(s => s.chunkId === authoritativeChunk?.id)?.rank || -1,
    },
    retrievalResult.retrievedChunks.map(r => r.chunkId)
  );

  // STAGE 5: RERANK
  const rerankStart = Date.now();
  const rerankedChunks = rerankChunks(query, retrievalResult.retrievedChunks, chunksMap);
  const rerankDuration = Math.max(6, Date.now() - rerankStart);
  tracer.recordStage(
    'RERANK',
    'SUCCESS',
    rerankDuration,
    `Evaluated ${rerankedChunks.length} candidate chunks`,
    `Refined score ordering across top candidates.`,
    { rerankedCount: rerankedChunks.length },
    rerankedChunks.map(r => r.chunkId)
  );

  // STAGE 6: CONTEXT
  const contextStart = Date.now();
  const context = constructContext(query, rerankedChunks, chunksMap);
  const contextDuration = Math.max(4, Date.now() - contextStart);
  const contextStatus = hasRetrievalFailure ? 'WARNING' : 'SUCCESS';

  tracer.recordStage(
    'CONTEXT',
    contextStatus,
    contextDuration,
    `Assembled context from ${context.contextChunkIds.length} chunks`,
    hasRetrievalFailure
      ? `Context assembled (${context.totalTokens} tokens). Warning: Missing authoritative leave duration chunk.`
      : `Context assembled with complete policy coverage (${context.totalTokens} tokens).`,
    {
      contextChunkCount: context.contextChunkIds.length,
      contextTokens: context.totalTokens,
      missingAuthoritative: hasRetrievalFailure,
    },
    context.contextChunkIds
  );

  // STAGE 7: GENERATE
  const generateStart = Date.now();
  const generation = await generateAnswer(query, context);
  const generateDuration = Math.max(generation.latencyMs, Date.now() - generateStart);

  tracer.recordStage(
    'GENERATE',
    'SUCCESS',
    generateDuration,
    `Prompt template: ${context.promptTemplate.length} chars`,
    `Generated answer (${generation.tokenUsage.completionTokens} tokens) using model ${generation.model}.`,
    {
      model: generation.model,
      promptTokens: generation.tokenUsage.promptTokens,
      completionTokens: generation.tokenUsage.completionTokens,
      isDemoFallback: generation.isDemoFallback,
    },
    context.contextChunkIds
  );

  const totalDurationMs = Date.now() - pipelineStartTime;

  const retrievedWithChunks = retrievalResult.retrievedChunks.map(r => ({
    ...r,
    chunk: chunksMap.get(r.chunkId) || chunks[0],
  }));

  return {
    runId,
    query,
    document,
    chunks,
    retrievedChunks: retrievedWithChunks,
    rerankedChunks,
    context,
    generation,
    events: tracer.getEvents(),
    totalDurationMs,
    hasRetrievalFailure,
  };
}
