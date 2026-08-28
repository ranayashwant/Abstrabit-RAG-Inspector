import { NextResponse } from 'next/server';
import { globalStore } from '@/server/storage/store.ts';

export async function GET(
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

  return NextResponse.json(run);
}
