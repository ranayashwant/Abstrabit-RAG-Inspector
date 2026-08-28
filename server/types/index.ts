/**
 * Core Domain Types for Abstrabit RAG Inspector
 * 
 * Rules:
 * - 7 RAG execution stages: INGEST, CHUNK, EMBED, RETRIEVE, RERANK, CONTEXT, GENERATE
 * - DIAGNOSE is a separate post-pipeline diagnostic evaluation
 * - Deterministic backend state is authoritative; AI output never overrides trace state
 */

export interface Document {
  id: string;
  name: string;
  content: string;
  sourceType: 'policy' | 'handbook' | 'synthetic';
  createdAt: string;
}

export interface ChunkMetadata {
  section: string;
  isAuthoritative?: boolean;
  keywords: string[];
}

export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
  tokenCount: number;
  metadata: ChunkMetadata;
  groundTruthRelevant: boolean;
}

export interface RetrievedChunk {
  chunkId: string;
  rank: number;
  score: number;
  retrievalMethod: 'dense_cosine';
  retrievedAt: string;
}

export interface RerankedChunk {
  chunkId: string;
  originalRank: number;
  rerankRank: number;
  score: number;
}

/**
 * Exactly 7 RAG Execution Stages
 */
export type RAGPipelineStage =
  | 'INGEST'
  | 'CHUNK'
  | 'EMBED'
  | 'RETRIEVE'
  | 'RERANK'
  | 'CONTEXT'
  | 'GENERATE';

export type StageStatus = 'SUCCESS' | 'WARNING' | 'FAILED';

export interface TraceEvent {
  id: string;
  runId: string;
  stage: RAGPipelineStage;
  status: StageStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  inputSummary: string;
  outputSummary: string;
  metrics: Record<string, number | string | boolean>;
  evidenceIds: string[];
  metadata: Record<string, unknown>;
}

export type DiagnosisCategory =
  | 'MISSING_RELEVANT_CHUNK'
  | 'LOW_RELEVANCE_RANK'
  | 'CONTEXT_OMISSION'
  | 'EMPTY_CONTEXT'
  | 'GENERATION_GROUNDED'
  | 'GENERATION_UNSUPPORTED';

export interface DeterministicDiagnosis {
  stage: 'RETRIEVE' | 'CONTEXT' | 'GENERATE';
  category: DiagnosisCategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  observation: string;
  reason: string;
  evidence: string[];
  recommendation: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface AIInvestigationReport {
  summary: string;
  rootCause: string;
  evidence: Array<{
    eventId: string;
    explanation: string;
  }>;
  recommendedAction: string;
  confidence: 'high' | 'medium' | 'low';
  modelUsed: string;
  isDemoFallback: boolean;
}

export interface RunRecord {
  id: string;
  query: string;
  scenario: string;
  documentId: string;
  status: 'COMPLETED' | 'FAILED';
  totalDurationMs: number;
  generatedAnswer: string;
  groundednessStatus: 'GROUNDED' | 'PROBLEMATIC' | 'UNSUPPORTED';
  events: TraceEvent[]; // Exactly 7 stage events
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[];
  contextChunkIds: string[];
  promptTemplate: string;
  diagnosis: DeterministicDiagnosis; // Separate diagnostic evaluation
  aiInvestigation?: AIInvestigationReport;
  createdAt: string;
}
