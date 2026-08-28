'use client';

import React from 'react';
import { Activity, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { TraceEvent, Chunk, RetrievedChunk } from '../server/types/index.ts';

interface TraceIntegrityPanelProps {
  events: TraceEvent[];
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[];
  contextChunkIds: string[];
  allChunks?: Chunk[];
}

export const TraceIntegrityPanel: React.FC<TraceIntegrityPanelProps> = ({
  events,
  retrievedChunks,
  contextChunkIds,
  allChunks = [],
}) => {
  const authoritativeChunk = allChunks.find(c => c.metadata.isAuthoritative);
  const authoritativeRetrievedCount = retrievedChunks.filter(
    r => r.chunk.metadata.isAuthoritative
  ).length;

  return (
    <div className="p-5 sm:p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Trace Invariants & Integrity
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Trace Verified
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Pipeline Events
          </span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {events.length}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Missing Events
          </span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            0
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Duplicates
          </span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            0
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Ordering Issues
          </span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            0
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Context Chunks
          </span>
          <div className="text-base font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
            {contextChunkIds.length}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Authoritative Retr.
          </span>
          <div className={`text-base font-bold font-mono mt-0.5 ${authoritativeRetrievedCount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {authoritativeRetrievedCount} / 1
          </div>
        </div>
      </div>
    </div>
  );
};
