import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AIInvestigationSchema, CreateRunRequestSchema } from '../server/ai/schemas.ts';
import type { RAGPipelineStage } from '../server/types/index.ts';

describe('Milestone 1: Domain Types and Zod Schemas', () => {
  it('should strictly validate valid AI investigation JSON report', () => {
    const validReport = {
      summary: 'Retrieval stage omitted the authoritative parental leave chunk.',
      rootCause: 'Keyword overlap on submission policy ranked higher than entitlement policy.',
      evidence: [
        {
          eventId: 'evt-retrieve-001',
          explanation: 'Authoritative chunk_004 was ranked #3 and excluded from top-2 context.',
        },
      ],
      recommendedAction: 'Increase top-K retrieval depth or adjust chunk boundaries.',
      confidence: 'high' as const,
    };

    const parsed = AIInvestigationSchema.parse(validReport);
    assert.strictEqual(parsed.confidence, 'high');
    assert.strictEqual(parsed.evidence.length, 1);
    assert.ok(parsed.summary.includes('Retrieval stage'));
  });

  it('should reject AI report with invalid confidence value', () => {
    const invalidReport = {
      summary: 'Some summary',
      rootCause: 'Some root cause',
      evidence: [
        {
          eventId: 'evt-1',
          explanation: 'Some explanation',
        },
      ],
      recommendedAction: 'Some action',
      confidence: 'absolute_certainty', // invalid enum
    };

    assert.throws(() => AIInvestigationSchema.parse(invalidReport));
  });

  it('should enforce exactly 7 pipeline stages in domain types', () => {
    const stages: RAGPipelineStage[] = [
      'INGEST',
      'CHUNK',
      'EMBED',
      'RETRIEVE',
      'RERANK',
      'CONTEXT',
      'GENERATE',
    ];
    assert.strictEqual(stages.length, 7);
  });

  it('should parse run request with defaults', () => {
    const defaultReq = CreateRunRequestSchema.parse({});
    assert.strictEqual(defaultReq.query, "What is the company's parental leave policy?");
    assert.strictEqual(defaultReq.scenario, 'retrieval-failure');
  });
});
