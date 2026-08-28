import { describe, it } from 'node:test';
import assert from 'node:assert';
import { loadSeedDocument } from '../server/rag/ingest.ts';
import { chunkDocument } from '../server/rag/chunk.ts';
import { embedChunks } from '../server/rag/embed.ts';
import { retrieveChunks } from '../server/rag/retrieve.ts';
import { executeRAGPipeline } from '../server/rag/pipeline.ts';

describe('Milestone 2: 7-Stage RAG Pipeline & Trace Events', () => {
  it('should load seed document with 8 handbook sections', () => {
    const doc = loadSeedDocument();
    assert.strictEqual(doc.id, 'doc_acme_handbook_2026');
    assert.ok(doc.content.includes('Acme Corporation Global Employee Handbook'));
  });

  it('should chunk document into 8 distinct chunks with authoritative flag on chunk_004', () => {
    const doc = loadSeedDocument();
    const chunks = chunkDocument(doc);
    assert.strictEqual(chunks.length, 8);

    const authoritativeChunk = chunks.find(c => c.metadata.isAuthoritative);
    assert.ok(authoritativeChunk, 'Must have an authoritative chunk');
    assert.strictEqual(authoritativeChunk?.id, 'chunk_004');
    assert.ok(authoritativeChunk?.content.includes('26 weeks of fully paid leave'));
  });

  it('should naturally rank distractor chunk_003 above authoritative chunk_004 for parental leave query', () => {
    const doc = loadSeedDocument();
    const chunks = chunkDocument(doc);
    const embedded = embedChunks(chunks);
    const query = "What is the company's parental leave policy?";

    const result = retrieveChunks(query, embedded, 2);
    assert.strictEqual(result.retrievedChunks.length, 2);

    const retrievedIds = result.retrievedChunks.map(r => r.chunkId);
    assert.ok(retrievedIds.includes('chunk_003'), 'Distractor chunk_003 should be retrieved in top-2');
    assert.ok(!retrievedIds.includes('chunk_004'), 'Authoritative chunk_004 should be omitted from top-2');
  });

  it('should execute 7 pipeline stages and record exactly 7 structured trace events', async () => {
    const result = await executeRAGPipeline("What is the company's parental leave policy?", 2);

    assert.strictEqual(result.events.length, 7, 'Pipeline must emit exactly 7 RAG stage events');

    const stages = result.events.map(e => e.stage);
    assert.deepStrictEqual(stages, [
      'INGEST',
      'CHUNK',
      'EMBED',
      'RETRIEVE',
      'RERANK',
      'CONTEXT',
      'GENERATE',
    ]);

    // Retrieve and Context should have WARNING status due to missed authoritative chunk
    const retrieveEvent = result.events.find(e => e.stage === 'RETRIEVE');
    assert.strictEqual(retrieveEvent?.status, 'WARNING');
    assert.strictEqual(retrieveEvent?.metrics.authoritativeRetrieved, false);

    const contextEvent = result.events.find(e => e.stage === 'CONTEXT');
    assert.strictEqual(contextEvent?.status, 'WARNING');

    // Generated answer reflects missing leave duration
    assert.ok(result.generation.answer.includes('does not contain the specific policy duration'));
  });
});
