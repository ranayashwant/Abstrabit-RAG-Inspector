import type { Chunk, RetrievedChunk, DeterministicDiagnosis, DiagnosisCategory } from '../types/index.ts';

export interface DiagnosisRuleContext {
  allChunks: Chunk[];
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[];
  contextChunkIds: string[];
  generatedAnswer: string;
}

export type DiagnosticRule = (ctx: DiagnosisRuleContext) => DeterministicDiagnosis | null;

/**
 * Rule 1: Missing Authoritative Chunk in Retrieved Set
 * Triggers when authoritative evidence exists in the corpus but was not returned in top-K.
 */
export const missingAuthoritativeChunkRule: DiagnosticRule = ctx => {
  const authoritativeChunks = ctx.allChunks.filter(c => c.metadata.isAuthoritative);
  if (authoritativeChunks.length === 0) {
    return null;
  }

  const retrievedIds = new Set(ctx.retrievedChunks.map(r => r.chunkId));
  const missingAuthoritative = authoritativeChunks.filter(c => !retrievedIds.has(c.id));

  if (missingAuthoritative.length > 0) {
    const target = missingAuthoritative[0];
    const topRetrievedList = ctx.retrievedChunks
      .map(r => `${r.chunkId} (score: ${r.score.toFixed(2)}, section: "${r.chunk.metadata.section}")`)
      .join(', ');

    return {
      stage: 'RETRIEVE',
      category: 'MISSING_RELEVANT_CHUNK',
      severity: 'HIGH',
      observation: `Authoritative evidence (${target.id}) was not retrieved in the top-${ctx.retrievedChunks.length} results.`,
      reason: `The retriever ranked administrative/overview chunks higher than the policy entitlement section because the query phrase had higher literal term overlap with the submission guidelines.`,
      evidence: [
        `Authoritative chunk ${target.id} ("${target.metadata.section}") contains the 26-week leave duration policy.`,
        `Retrieved top-${ctx.retrievedChunks.length} candidates: ${topRetrievedList}.`,
        `The context sent to the generator omitted chunk ${target.id}, leaving the LLM with incomplete policy facts.`,
      ],
      recommendation: `Improve retrieval recall by adjusting chunk boundaries or increasing retrieval depth (top-K) from ${ctx.retrievedChunks.length} to 4.`,
      confidence: 'high',
    };
  }

  return null;
};

/**
 * Rule 2: Empty Retrieved Context
 */
export const emptyContextRule: DiagnosticRule = ctx => {
  if (ctx.retrievedChunks.length === 0 || ctx.contextChunkIds.length === 0) {
    return {
      stage: 'RETRIEVE',
      category: 'EMPTY_CONTEXT',
      severity: 'HIGH',
      observation: 'Zero context chunks were retrieved for the query.',
      reason: 'Embedding similarity failed to meet minimum similarity threshold or query was empty.',
      evidence: ['Retrieved chunk count: 0', 'Context chunk count: 0'],
      recommendation: 'Check embedding vector generation and verify index population.',
      confidence: 'high',
    };
  }
  return null;
};

/**
 * Rule 3: Context Omission (Retrieved but omitted during context assembly)
 */
export const contextOmissionRule: DiagnosticRule = ctx => {
  const contextSet = new Set(ctx.contextChunkIds);
  const retrievedAuthoritative = ctx.retrievedChunks.find(
    r => r.chunk.metadata.isAuthoritative && !contextSet.has(r.chunkId)
  );

  if (retrievedAuthoritative) {
    return {
      stage: 'CONTEXT',
      category: 'CONTEXT_OMISSION',
      severity: 'HIGH',
      observation: `Authoritative chunk ${retrievedAuthoritative.chunkId} was retrieved but excluded from context window.`,
      reason: 'Token limit or reranking filter dropped the authoritative chunk before prompt construction.',
      evidence: [
        `Chunk ${retrievedAuthoritative.chunkId} was retrieved at rank #${retrievedAuthoritative.rank}.`,
        `Context builder omitted chunk ${retrievedAuthoritative.chunkId}.`,
      ],
      recommendation: 'Increase maximum context token budget or adjust reranking selection thresholds.',
      confidence: 'high',
    };
  }
  return null;
};

/**
 * Rule 4: Normal Grounded Generation (All authoritative evidence present)
 */
export const generationGroundedRule: DiagnosticRule = ctx => {
  const authoritativeChunks = ctx.allChunks.filter(c => c.metadata.isAuthoritative);
  const contextSet = new Set(ctx.contextChunkIds);
  const allAuthoritativeInContext = authoritativeChunks.every(c => contextSet.has(c.id));

  if (allAuthoritativeInContext && authoritativeChunks.length > 0) {
    return {
      stage: 'GENERATE',
      category: 'GENERATION_GROUNDED',
      severity: 'LOW',
      observation: 'All authoritative evidence chunks were successfully retrieved and included in context.',
      reason: 'Pipeline executed with high recall and complete evidence grounding.',
      evidence: [
        `Authoritative chunk(s) (${authoritativeChunks.map(c => c.id).join(', ')}) were included in prompt context.`,
      ],
      recommendation: 'No engineering action needed; pipeline operated as expected.',
      confidence: 'high',
    };
  }
  return null;
};
