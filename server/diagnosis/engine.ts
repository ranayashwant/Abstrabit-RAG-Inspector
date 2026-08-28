import type { Chunk, RetrievedChunk, DeterministicDiagnosis } from '../types/index.ts';
import {
  missingAuthoritativeChunkRule,
  emptyContextRule,
  contextOmissionRule,
  generationGroundedRule,
  type DiagnosisRuleContext,
} from './rules.ts';

/**
 * Pure Deterministic Diagnosis Engine
 * Strict Rule 5 & Rule 7: Zero LLM dependency.
 * Evaluates canonical pipeline state against ground-truth facts.
 */
export function evaluatePipelineDiagnosis(
  allChunks: Chunk[],
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[],
  contextChunkIds: string[],
  generatedAnswer: string
): DeterministicDiagnosis {
  const ctx: DiagnosisRuleContext = {
    allChunks,
    retrievedChunks,
    contextChunkIds,
    generatedAnswer,
  };

  // Evaluate rules in priority order
  const rules = [
    emptyContextRule,
    missingAuthoritativeChunkRule,
    contextOmissionRule,
    generationGroundedRule,
  ];

  for (const rule of rules) {
    const diagnosis = rule(ctx);
    if (diagnosis) {
      return diagnosis;
    }
  }

  // Fallback default diagnosis if no specific rule matched
  return {
    stage: 'GENERATE',
    category: 'GENERATION_UNSUPPORTED',
    severity: 'MEDIUM',
    observation: 'Pipeline completed with indeterminate evidence coverage.',
    reason: 'The generated answer could not be completely matched to authoritative facts.',
    evidence: [`Retrieved ${retrievedChunks.length} chunks`, `Context contains ${contextChunkIds.length} chunks`],
    recommendation: 'Verify ground-truth annotations and evaluate similarity scoring margins.',
    confidence: 'medium',
  };
}
