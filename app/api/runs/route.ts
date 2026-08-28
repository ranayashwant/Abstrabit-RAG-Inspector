import { NextResponse } from 'next/server';
import { executeRAGPipeline } from '@/server/rag/pipeline.ts';
import { evaluatePipelineDiagnosis } from '@/server/diagnosis/engine.ts';
import { investigatePipelineRun } from '@/server/ai/investigator.ts';
import { globalStore } from '@/server/storage/store.ts';
import { CreateRunRequestSchema } from '@/server/ai/schemas.ts';
import type { RunRecord } from '@/server/types/index.ts';

export async function POST(request: Request) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      // Allow empty JSON body
    }

    const { query, scenario } = CreateRunRequestSchema.parse(body);

    // 1. Execute 7-stage RAG pipeline
    const pipelineResult = await executeRAGPipeline(query, 2);

    // 2. Deterministic Diagnosis (Zero LLM)
    const diagnosis = evaluatePipelineDiagnosis(
      pipelineResult.chunks,
      pipelineResult.retrievedChunks,
      pipelineResult.context.contextChunkIds,
      pipelineResult.generation.answer
    );

    // 3. AI Investigator (Receives only canonical trace + diagnosis)
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

    const isGrounded = diagnosis.category === 'GENERATION_GROUNDED';

    const runRecord: RunRecord = {
      id: pipelineResult.runId,
      query,
      scenario,
      documentId: pipelineResult.document.id,
      status: pipelineResult.hasRetrievalFailure ? 'FAILED' : 'COMPLETED',
      totalDurationMs: pipelineResult.totalDurationMs,
      generatedAnswer: pipelineResult.generation.answer,
      groundednessStatus: isGrounded ? 'GROUNDED' : 'PROBLEMATIC',
      events: pipelineResult.events,
      retrievedChunks: pipelineResult.retrievedChunks,
      contextChunkIds: pipelineResult.context.contextChunkIds,
      promptTemplate: pipelineResult.context.promptTemplate,
      diagnosis,
      aiInvestigation,
      createdAt: new Date().toISOString(),
    };

    // Save to in-process store
    globalStore.saveDocument(pipelineResult.document);
    globalStore.saveRun(runRecord);

    return NextResponse.json(runRecord, { status: 201 });
  } catch (error) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error during run execution';
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export async function GET() {
  const runs = globalStore.getAllRuns();
  return NextResponse.json({ runs });
}
