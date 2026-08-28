'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Wrench, ShieldCheck } from 'lucide-react';
import type { AIInvestigationReport, DeterministicDiagnosis } from '../server/types/index.ts';

interface AIInvestigatorCardProps {
  investigation?: AIInvestigationReport;
  diagnosis: DeterministicDiagnosis;
}

export const AIInvestigatorCard: React.FC<AIInvestigatorCardProps> = ({
  investigation,
  diagnosis,
}) => {
  return (
    <div className="p-5 sm:p-6 rounded-card border border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/20 dark:to-abstrabit-darkSurface shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-purple-600 text-white flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            AI Investigator Analysis
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldCheck className="h-3 w-3" />
            {investigation?.isDemoFallback ? 'Offline Mode (Grounded)' : 'Live LLM Provider'}
          </span>
        </div>
      </div>

      {/* Why this diagnosis bullets */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Why this diagnosis?
        </h4>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          {diagnosis.evidence.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="h-4 w-4 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold flex items-center justify-center mt-0.5 shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested Fix Action */}
      <div className="pt-3 border-t border-purple-200/70 dark:border-purple-900/40">
        <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-white/80 dark:bg-abstrabit-darkElevated/80 shadow-subtle space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase text-purple-700 dark:text-purple-300">
            <Wrench className="h-3.5 w-3.5" />
            Suggested Engineering Action
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
            {investigation?.recommendedAction || diagnosis.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
