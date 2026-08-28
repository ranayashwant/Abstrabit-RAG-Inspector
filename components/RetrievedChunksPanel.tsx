'use client';

import React from 'react';
import { Layers, AlertCircle, CheckCircle2, BookmarkCheck, XCircle } from 'lucide-react';
import type { Chunk, RetrievedChunk } from '../server/types/index.ts';

interface RetrievedChunksPanelProps {
  retrievedChunks: (RetrievedChunk & { chunk: Chunk })[];
  allDocumentChunks?: Chunk[];
}

export const RetrievedChunksPanel: React.FC<RetrievedChunksPanelProps> = ({
  retrievedChunks,
  allDocumentChunks = [],
}) => {
  const authoritativeChunk = allDocumentChunks.find(c => c.metadata.isAuthoritative);
  const isAuthoritativeRetrieved = retrievedChunks.some(
    r => r.chunkId === authoritativeChunk?.id
  );

  return (
    <div className="p-5 sm:p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Retrieved Chunks Inspection
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {retrievedChunks.length} chunks retrieved (Top-K = 2)
        </span>
      </div>

      {/* Expected Authoritative Chunk Callout */}
      {authoritativeChunk && (
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isAuthoritativeRetrieved
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-100'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <BookmarkCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold font-mono uppercase">
                Expected Authoritative Chunk: {authoritativeChunk.id}
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                isAuthoritativeRetrieved
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
              }`}
            >
              {isAuthoritativeRetrieved ? (
                <>
                  <CheckCircle2 className="h-3 w-3" /> Retrieved: YES
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" /> Retrieved: NO
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            <span className="font-semibold">{authoritativeChunk.metadata.section}: </span>
            {authoritativeChunk.content.replace(/^## \d+\.[^\n]*\n/, '')}
          </p>
        </div>
      )}

      {/* Retrieved Chunks List */}
      <div className="space-y-3">
        {retrievedChunks.map(item => {
          const isAuthoritative = item.chunk.metadata.isAuthoritative;

          return (
            <div
              key={item.chunkId}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-mono font-bold flex items-center justify-center">
                    #{item.rank}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                    {item.chunkId}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({item.chunk.metadata.section})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isAuthoritative
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isAuthoritative ? 'Authoritative' : 'Low Relevance'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">
                    Score: {item.score.toFixed(3)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono bg-white/70 dark:bg-abstrabit-darkSurface/70 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60 leading-relaxed whitespace-pre-wrap">
                {item.chunk.content}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
