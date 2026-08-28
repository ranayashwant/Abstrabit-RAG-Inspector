import { NextResponse } from 'next/server';
import { globalStore } from '@/server/storage/store.ts';
import { investigatePipelineRun } from '@/server/ai/investigator.ts';

export async function POST(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const run = globalStore.getRun(params.runId);

  if (!run) {
    return NextResponse.json(
      { error: `Run with ID '${params.runId}' not found.` },
      { status: 404 }
    );
  }

  const retrievedSummary = run.retrievedChunks.map(r => ({
    id: r.chunkId,
    rank: r.rank,
    score: r.score,
    section: r.chunk.metadata.section,
    isAuthoritative: r.chunk.metadata.isAuthoritative,
  }));

  const aiInvestigation = await investigatePipelineRun({
    query: run.query,
    generatedAnswer: run.generatedAnswer,
    diagnosis: run.diagnosis,
    events: run.events,
    retrievedChunkSummary: retrievedSummary,
    contextChunkIds: run.contextChunkIds,
  });

  const updatedRun = {
    ...run,
    aiInvestigation,
  };

  globalStore.saveRun(updatedRun);

  return NextResponse.json({
    runId: run.id,
    aiInvestigation,
  });
}
