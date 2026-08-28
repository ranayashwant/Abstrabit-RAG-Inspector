'use client';

import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert } from 'lucide-react';
import type { DeterministicDiagnosis } from '../server/types/index.ts';

interface DiagnosticBannerProps {
  diagnosis: DeterministicDiagnosis;
  status: 'COMPLETED' | 'FAILED';
}

export const DiagnosticBanner: React.FC<DiagnosticBannerProps> = ({
  diagnosis,
  status,
}) => {
  const isFailed = status === 'FAILED' || diagnosis.severity === 'HIGH';

  return (
    <div
      className={`p-5 sm:p-6 rounded-card border transition-all ${
        isFailed
          ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-slate-900 dark:text-slate-100'
          : 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-slate-900 dark:text-slate-100'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-rose-200/80 dark:border-rose-900/40">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              isFailed
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-emerald-600 text-white shadow-sm'
            }`}
          >
            {isFailed ? (
              <AlertOctagon className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Pipeline Inspection Verdict
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase ${
                  isFailed
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {status}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mt-0.5">
              {diagnosis.observation}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-abstrabit-darkSurface/80 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400">Failure Stage: </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {diagnosis.stage}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-abstrabit-darkSurface/80 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400">Severity: </span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {diagnosis.severity}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-abstrabit-darkSurface/80 border border-slate-200 dark:border-slate-800 shadow-subtle">
            <span className="text-slate-500 dark:text-slate-400">Confidence: </span>
            <span className="font-bold text-purple-600 dark:text-purple-400 uppercase">
              {diagnosis.confidence}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <span className="font-semibold text-slate-900 dark:text-slate-100">Root Cause: </span>
        {diagnosis.reason}
      </div>
    </div>
  );
};
