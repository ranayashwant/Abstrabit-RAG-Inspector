'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Clock, AlertTriangle, CheckCircle2, XCircle, Code } from 'lucide-react';
import type { TraceEvent } from '../server/types/index.ts';

interface StageDetailDrawerProps {
  event: TraceEvent | null;
  onClose: () => void;
}

export const StageDetailDrawer: React.FC<StageDetailDrawerProps> = ({
  event,
  onClose,
}) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(event, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isWarning = event.status === 'WARNING';
  const isFailed = event.status === 'FAILED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-abstrabit-darkSurface shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-abstrabit-darkElevated/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                STAGE: {event.stage}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                  isWarning
                    ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300'
                    : isFailed
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {isWarning ? (
                  <>
                    <AlertTriangle className="h-3 w-3" /> WARNING
                  </>
                ) : isFailed ? (
                  <>
                    <XCircle className="h-3 w-3" /> FAILED
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3 w-3" /> SUCCESS
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied JSON' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-abstrabit-darkElevated/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Duration</span>
              <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-purple-600" />
                {event.durationMs}ms
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-abstrabit-darkElevated/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Event ID</span>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                {event.id}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-abstrabit-darkElevated/60 border border-slate-200/80 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Evidence References</span>
              <div className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {event.evidenceIds.length > 0 ? event.evidenceIds.join(', ') : 'None'}
              </div>
            </div>
          </div>

          {/* Input Summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Input Summary
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-abstrabit-darkElevated/60 border border-slate-200/80 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200">
              {event.inputSummary}
            </div>
          </div>

          {/* Output Summary */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Output Summary
            </h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-abstrabit-darkElevated/60 border border-slate-200/80 dark:border-slate-800 font-sans text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {event.outputSummary}
            </div>
          </div>

          {/* Stage Metrics */}
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Stage Metrics
            </h4>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 dark:bg-abstrabit-darkBg font-mono text-xs overflow-x-auto">
              {JSON.stringify(event.metrics, null, 2)}
            </pre>
          </div>

          {/* Raw JSON Toggle */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 transition-colors"
            >
              <Code className="h-3.5 w-3.5" />
              {showRawJson ? 'Hide Raw JSON Trace Event' : 'View Raw JSON Trace Event'}
            </button>

            {showRawJson && (
              <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-100 text-xs font-mono overflow-x-auto max-h-44">
                {JSON.stringify(event, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
