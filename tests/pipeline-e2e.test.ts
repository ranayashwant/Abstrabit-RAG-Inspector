import { describe, it } from 'node:test';
import assert from 'node:assert';
import { executeRAGPipeline } from '../server/rag/pipeline.ts';
import { evaluatePipelineDiagnosis } from '../server/diagnosis/engine.ts';
import { investigatePipelineRun } from '../server/ai/investigator.ts';
import { globalStore } from '../server/storage/store.ts';
import type { RunRecord } from '../server/types/index.ts';

describe('Milestone 5: End-to-End Pipeline & Inspection Flow', () => {
  it('should run complete end-to-end inspection lifecycle and store result', async () => {
    const query = "What is the company's parental leave policy?";

    // 1. Pipeline Execution
    const pipelineResult = await executeRAGPipeline(query, 2);
    assert.strictEqual(pipelineResult.events.length, 7);
    assert.strictEqual(pipelineResult.hasRetrievalFailure, true);

    // 2. Deterministic Diagnosis
    const diagnosis = evaluatePipelineDiagnosis(
      pipelineResult.chunks,
      pipelineResult.retrievedChunks,
      pipelineResult.context.contextChunkIds,
      pipelineResult.generation.answer
    );
    assert.strictEqual(diagnosis.stage, 'RETRIEVE');
    assert.strictEqual(diagnosis.category, 'MISSING_RELEVANT_CHUNK');

    // 3. AI Investigation
    const retrievedSummary = pipelineResult.retrievedChunks.map(r => ({
      id: r.chunkId,
      rank: r.rank,
      score: r.score,
      section: r.chunk.metadata.section,
      isAuthoritative: r.chunk.metadata.isAuthoritative,
    }));

    const aiInvestigation = await investigatePipelineRun({
      query,
      generatedAnswer: pipelineResult.generation.answer,
      diagnosis,
      events: pipelineResult.events,
      retrievedChunkSummary: retrievedSummary,
      contextChunkIds: pipelineResult.context.contextChunkIds,
    });

    assert.strictEqual(aiInvestigation.confidence, 'high');
    assert.ok(aiInvestigation.recommendedAction.includes('top-K') || aiInvestigation.recommendedAction.includes('chunk'));

    // 4. Persistence in Store
    const runRecord: RunRecord = {
      id: pipelineResult.runId,
      query,
      scenario: 'retrieval-failure',
      documentId: pipelineResult.document.id,
      status: 'FAILED',
      totalDurationMs: pipelineResult.totalDurationMs,
      generatedAnswer: pipelineResult.generation.answer,
      groundednessStatus: 'PROBLEMATIC',
      events: pipelineResult.events,
      retrievedChunks: pipelineResult.retrievedChunks,
      contextChunkIds: pipelineResult.context.contextChunkIds,
      promptTemplate: pipelineResult.context.promptTemplate,
      diagnosis,
      aiInvestigation,
      createdAt: new Date().toISOString(),
    };

    globalStore.saveRun(runRecord);

    const saved = globalStore.getRun(runRecord.id);
    assert.ok(saved);
    assert.strictEqual(saved?.id, runRecord.id);
    assert.strictEqual(saved?.events.length, 7);
    assert.strictEqual(saved?.diagnosis.category, 'MISSING_RELEVANT_CHUNK');
  });
});
