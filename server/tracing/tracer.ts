import type { RAGPipelineStage, StageStatus, TraceEvent } from '../types/index.ts';

/**
 * Trace Collector for RAG Pipeline Execution
 * Records immutable, structured TraceEvent records for all 7 pipeline stages.
 */
export class TraceCollector {
  private events: TraceEvent[] = [];
  private runId: string;

  constructor(runId: string) {
    this.runId = runId;
  }

  recordStage(
    stage: RAGPipelineStage,
    status: StageStatus,
    durationMs: number,
    inputSummary: string,
    outputSummary: string,
    metrics: Record<string, number | string | boolean>,
    evidenceIds: string[] = [],
    metadata: Record<string, unknown> = {}
  ): TraceEvent {
    const now = new Date();
    const startTime = new Date(now.getTime() - durationMs);

    const event: TraceEvent = {
      id: `evt-${stage.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      runId: this.runId,
      stage,
      status,
      startedAt: startTime.toISOString(),
      completedAt: now.toISOString(),
      durationMs: Math.max(1, Math.round(durationMs)),
      inputSummary,
      outputSummary,
      metrics,
      evidenceIds,
      metadata,
    };

    this.events.push(event);
    return event;
  }

  getEvents(): TraceEvent[] {
    return [...this.events];
  }
}
