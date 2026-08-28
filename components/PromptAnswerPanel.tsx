'use client';

import React, { useState } from 'react';
import { Bot, FileCode, AlertTriangle, CheckCircle2, Copy, Check } from 'lucide-react';

interface PromptAnswerPanelProps {
  promptTemplate: string;
  contextChunkIds: string[];
  generatedAnswer: string;
  groundednessStatus: 'GROUNDED' | 'PROBLEMATIC' | 'UNSUPPORTED';
}

export const PromptAnswerPanel: React.FC<PromptAnswerPanelProps> = ({
  promptTemplate,
  contextChunkIds,
  generatedAnswer,
  groundednessStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const isProblematic = groundednessStatus === 'PROBLEMATIC';

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-5 sm:p-6 rounded-card border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-card space-y-4">
      {/* Generated Answer Box */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Generated Answer
            </h3>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase ${
              isProblematic
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {isProblematic ? (
              <>
                <AlertTriangle className="h-3 w-3" /> Groundedness: Incomplete
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3 w-3" /> Groundedness: Grounded
              </>
            )}
          </span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-abstrabit-darkElevated/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
          {generatedAnswer}
        </div>
      </div>

      {/* Context & Prompt Template Box */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Prompt & Context Sent to Model
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              Context: [{contextChunkIds.join(', ')}]
            </span>
            <button
              onClick={handleCopyPrompt}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </button>
          </div>
        </div>

        <pre className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 dark:bg-abstrabit-darkBg text-xs font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
          {promptTemplate}
        </pre>
      </div>
    </div>
  );
};
