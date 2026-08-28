'use client';

import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Clock, ChevronRight } from 'lucide-react';
import type { TraceEvent, RAGPipelineStage } from '../server/types/index.ts';

interface PipelineStepperProps {
  events: TraceEvent[];
  activeStageIndex?: number;
  selectedStage: TraceEvent | null;
  onSelectStage: (event: TraceEvent) => void;
  isReplaying?: boolean;
}

const STAGE_LABELS: Record<RAGPipelineStage, { title: string; subtitle: string }> = {
  INGEST: { title: 'INGEST', subtitle: 'Doc Loader' },
  CHUNK: { title: 'CHUNK', subtitle: '8 Sections' },
  EMBED: { title: 'EMBED', subtitle: '64-Dim Dense' },
  RETRIEVE: { title: 'RETRIEVE', subtitle: 'Top-K Cosine' },
  RERANK: { title: 'RERANK', subtitle: 'Proximity' },
  CONTEXT: { title: 'CONTEXT', subtitle: 'Prompt Assem.' },
  GENERATE: { title: 'GENERATE', subtitle: 'LLM Synthesis' },
};

export const PipelineStepper: React.FC<PipelineStepperProps> = ({
  events,
  activeStageIndex,
  selectedStage,
  onSelectStage,
  isReplaying,
}) => {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="p-5 sm:p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-card transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            7-Stage RAG Execution Pipeline
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            (Click any stage to inspect raw metadata)
          </span>
        </div>
        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
          Total: {events.reduce((acc, e) => acc + e.durationMs, 0)}ms
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {events.map((event, index) => {
          const isSelected = selectedStage?.id === event.id;
          const isCurrentActiveInReplay = isReplaying && activeStageIndex === index;
          const isPastInReplay = isReplaying && activeStageIndex !== undefined && index <= activeStageIndex;
          const isFutureInReplay = isReplaying && activeStageIndex !== undefined && index > activeStageIndex;

          const stageInfo = STAGE_LABELS[event.stage] || {
            title: event.stage,
            subtitle: '',
          };

          const isWarning = event.status === 'WARNING';
          const isFailed = event.status === 'FAILED';

          return (
            <button
              key={event.id}
              onClick={() => onSelectStage(event)}
              className={`relative flex flex-col p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 shadow-sm'
                  : isCurrentActiveInReplay
                  ? 'ring-2 ring-purple-400 border-purple-400 bg-purple-100 dark:bg-purple-900/40 animate-pulse'
                  : isWarning
                  ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/20 hover:border-amber-400'
                  : isFailed
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-abstrabit-darkElevated/60 hover:border-slate-300 dark:hover:border-slate-700'
              } ${isFutureInReplay ? 'opacity-40' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-bold font-mono tracking-wider text-slate-900 dark:text-slate-100">
                  {stageInfo.title}
                </span>

                {isWarning ? (
                  <span className="inline-flex items-center text-amber-600 dark:text-amber-400" title="Warning: Stage triggered failure condition">
                    <AlertTriangle className="h-3.5 w-3.5" />
                  </span>
                ) : isFailed ? (
                  <span className="inline-flex items-center text-rose-600 dark:text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
                {stageInfo.subtitle}
              </span>

              <div className="mt-auto flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {event.durationMs}ms
                </span>
                <span className="text-[9px] uppercase font-semibold">
                  {event.status === 'WARNING' ? 'WARN' : 'OK'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
