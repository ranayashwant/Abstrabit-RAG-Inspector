import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadSeedDocument } from '../server/rag/ingest.ts';
import { chunkDocument } from '../server/rag/chunk.ts';
import { embedChunks } from '../server/rag/embed.ts';
import { retrieveChunks } from '../server/rag/retrieve.ts';
import { evaluatePipelineDiagnosis } from '../server/diagnosis/engine.ts';
import { investigatePipelineRun } from '../server/ai/investigator.ts';
import { AIInvestigationSchema } from '../server/ai/schemas.ts';

describe('Milestone 3: Deterministic Diagnosis Engine & AI Investigator', () => {
  it('should deterministically diagnose MISSING_RELEVANT_CHUNK when authoritative chunk is omitted', () => {
    const doc = loadSeedDocument();
    const chunks = chunkDocument(doc);
    const embedded = embedChunks(chunks);
    const query = "What is the company's parental leave policy?";

    const retrievalResult = retrieveChunks(query, embedded, 2);
    const chunksMap = new Map(chunks.map(c => [c.id, c]));
    const retrievedWithChunks = retrievalResult.retrievedChunks.map(r => ({
      ...r,
      chunk: chunksMap.get(r.chunkId) || chunks[0],
    }));

    const contextChunkIds = retrievedWithChunks.map(r => r.chunkId);
    const dummyAnswer = 'Parental leave requests must be submitted through HR.';

    const diagnosis = evaluatePipelineDiagnosis(
      chunks,
      retrievedWithChunks,
      contextChunkIds,
      dummyAnswer
    );

    assert.strictEqual(diagnosis.stage, 'RETRIEVE');
    assert.strictEqual(diagnosis.category, 'MISSING_RELEVANT_CHUNK');
    assert.strictEqual(diagnosis.severity, 'HIGH');
    assert.strictEqual(diagnosis.confidence, 'high');
    assert.ok(diagnosis.evidence.length >= 2);
    assert.ok(diagnosis.evidence[0].includes('chunk_004'));
    assert.ok(diagnosis.recommendation.includes('top-K'));
  });

  it('should generate a schema-valid AI investigation report without external API in demo mode', async () => {
    const doc = loadSeedDocument();
    const chunks = chunkDocument(doc);
    const embedded = embedChunks(chunks);
    const query = "What is the company's parental leave policy?";

    const retrievalResult = retrieveChunks(query, embedded, 2);
    const chunksMap = new Map(chunks.map(c => [c.id, c]));
    const retrievedWithChunks = retrievalResult.retrievedChunks.map(r => ({
      ...r,
      chunk: chunksMap.get(r.chunkId) || chunks[0],
    }));

    const contextChunkIds = retrievedWithChunks.map(r => r.chunkId);
    const diagnosis = evaluatePipelineDiagnosis(
      chunks,
      retrievedWithChunks,
      contextChunkIds,
      'Leave requests must be submitted via HR.'
    );

    const aiReport = await investigatePipelineRun({
      query,
      generatedAnswer: 'Leave requests must be submitted via HR.',
      diagnosis,
      events: [],
      retrievedChunkSummary: retrievedWithChunks.map(r => ({
        id: r.chunkId,
        rank: r.rank,
        score: r.score,
        section: r.chunk.metadata.section,
        isAuthoritative: r.chunk.metadata.isAuthoritative,
      })),
      contextChunkIds,
    });

    // Validate using Zod schema
    const validated = AIInvestigationSchema.parse(aiReport);
    assert.strictEqual(validated.confidence, 'high');
    assert.ok(validated.rootCause.length > 10);
    assert.ok(validated.evidence.length > 0);
    assert.strictEqual(aiReport.isDemoFallback, true);
  });
});
