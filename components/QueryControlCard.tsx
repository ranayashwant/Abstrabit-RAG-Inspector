'use client';

import React from 'react';
import { Play, RotateCw, FileText, Search, ShieldCheck } from 'lucide-react';

interface QueryControlCardProps {
  query: string;
  onQueryChange: (q: string) => void;
  onRunInspection: () => void;
  onReplayPipeline: () => void;
  isLoading: boolean;
  isReplaying: boolean;
  hasRun: boolean;
}

export const QueryControlCard: React.FC<QueryControlCardProps> = ({
  query,
  onQueryChange,
  onRunInspection,
  onReplayPipeline,
  isLoading,
  isReplaying,
  hasRun,
}) => {
  return (
    <div className="p-5 sm:p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-card transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FileText className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Corpus: Acme Employee Handbook (8 Chunks)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            Deterministic Scenario
          </span>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          Top-K = 2 | In-Process Cosine
        </span>
      </div>

      <div className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Inspection Query
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            disabled={isLoading || isReplaying}
            placeholder="Enter query to inspect RAG pipeline..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-abstrabit-darkElevated text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tests chunk splitting, dense retrieval ranking, and prompt context integrity.
          </p>

          <div className="flex items-center gap-2.5">
            {hasRun && (
              <button
                type="button"
                onClick={onReplayPipeline}
                disabled={isLoading || isReplaying}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-slate-800 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
              >
                <RotateCw className={`h-4 w-4 ${isReplaying ? 'animate-spin text-purple-600' : ''}`} />
                {isReplaying ? 'Replaying Pipeline...' : 'Replay Pipeline'}
              </button>
            )}

            <button
              type="button"
              onClick={onRunInspection}
              disabled={isLoading || isReplaying}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-purpleGlow transition-all disabled:opacity-60"
            >
              <Play className={`h-4 w-4 fill-white ${isLoading ? 'animate-pulse' : ''}`} />
              {isLoading ? 'Executing Pipeline...' : 'Run Inspection'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
