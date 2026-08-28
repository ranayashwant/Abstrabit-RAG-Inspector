'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header.tsx';
import { QueryControlCard } from '@/components/QueryControlCard.tsx';
import { PipelineStepper } from '@/components/PipelineStepper.tsx';
import { DiagnosticBanner } from '@/components/DiagnosticBanner.tsx';
import { RetrievedChunksPanel } from '@/components/RetrievedChunksPanel.tsx';
import { PromptAnswerPanel } from '@/components/PromptAnswerPanel.tsx';
import { AIInvestigatorCard } from '@/components/AIInvestigatorCard.tsx';
import { TraceIntegrityPanel } from '@/components/TraceIntegrityPanel.tsx';
import { StageDetailDrawer } from '@/components/StageDetailDrawer.tsx';
import type { RunRecord, TraceEvent, Chunk } from '@/server/types/index.ts';
import { chunkDocument } from '@/server/rag/chunk.ts';
import { loadSeedDocument } from '@/server/rag/ingest.ts';

const DEFAULT_QUERY = "What is the company's parental leave policy?";

export default function InspectorDashboardPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [runRecord, setRunRecord] = useState<RunRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayStageIndex, setReplayStageIndex] = useState<number | undefined>(undefined);
  const [selectedStage, setSelectedStage] = useState<TraceEvent | null>(null);
  const [allHandbookChunks, setAllHandbookChunks] = useState<Chunk[]>([]);

  // Initialize seed chunks for metadata lookups
  useEffect(() => {
    const doc = loadSeedDocument();
    const chunks = chunkDocument(doc);
    setAllHandbookChunks(chunks);
  }, []);

  // Theme management
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Run pipeline inspection via API
  const handleRunInspection = async (customQuery?: string) => {
    setIsLoading(true);
    setIsReplaying(false);
    setReplayStageIndex(undefined);

    try {
      const q = customQuery || query;
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        throw new Error(`Failed to execute pipeline (HTTP ${res.status})`);
      }

      const data: RunRecord = await res.json();
      setRunRecord(data);
    } catch (err) {
      console.error('Inspection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Replay pipeline animated demonstration
  const handleReplayPipeline = async () => {
    if (!runRecord || isReplaying) return;

    setIsReplaying(true);
    const stagesCount = runRecord.events.length;

    for (let i = 0; i < stagesCount; i++) {
      setReplayStageIndex(i);
      const currentStage = runRecord.events[i]?.stage;

      // Special visual pause on the failing RETRIEVE stage
      const delay = currentStage === 'RETRIEVE' ? 900 : 400;
      await new Promise(r => setTimeout(r, delay));
    }

    setIsReplaying(false);
    setReplayStageIndex(undefined);
  };

  const handleReset = () => {
    setQuery(DEFAULT_QUERY);
    handleRunInspection(DEFAULT_QUERY);
  };

  // Auto-run default scenario on initial page mount
  useEffect(() => {
    handleRunInspection(DEFAULT_QUERY);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-abstrabit-darkBg transition-colors duration-200">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Brand Header */}
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onReset={handleReset}
          isInspecting={isLoading || isReplaying}
        />

        {/* Query & Control Bar */}
        <QueryControlCard
          query={query}
          onQueryChange={setQuery}
          onRunInspection={() => handleRunInspection(query)}
          onReplayPipeline={handleReplayPipeline}
          isLoading={isLoading}
          isReplaying={isReplaying}
          hasRun={!!runRecord}
        />

        {/* 7-Stage Pipeline Rail */}
        {runRecord && (
          <PipelineStepper
            events={runRecord.events}
            activeStageIndex={replayStageIndex}
            selectedStage={selectedStage}
            onSelectStage={setSelectedStage}
            isReplaying={isReplaying}
          />
        )}

        {/* Top Diagnostic Banner */}
        {runRecord && (
          <DiagnosticBanner
            diagnosis={runRecord.diagnosis}
            status={runRecord.status}
          />
        )}

        {/* Deep Inspection 2-Column Grid */}
        {runRecord && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (Retrieved Chunks & Invariants) */}
            <div className="lg:col-span-6 space-y-6">
              <RetrievedChunksPanel
                retrievedChunks={runRecord.retrievedChunks}
                allDocumentChunks={allHandbookChunks}
              />
              <TraceIntegrityPanel
                events={runRecord.events}
                retrievedChunks={runRecord.retrievedChunks}
                contextChunkIds={runRecord.contextChunkIds}
                allChunks={allHandbookChunks}
              />
            </div>

            {/* Right Column (Prompt, Answer & AI Investigator) */}
            <div className="lg:col-span-6 space-y-6">
              <PromptAnswerPanel
                promptTemplate={runRecord.promptTemplate}
                contextChunkIds={runRecord.contextChunkIds}
                generatedAnswer={runRecord.generatedAnswer}
                groundednessStatus={runRecord.groundednessStatus}
              />
              <AIInvestigatorCard
                investigation={runRecord.aiInvestigation}
                diagnosis={runRecord.diagnosis}
              />
            </div>
          </div>
        )}

        {/* Slide-out Stage Detail & Raw JSON Drawer */}
        <StageDetailDrawer
          event={selectedStage}
          onClose={() => setSelectedStage(null)}
        />
      </main>
    </div>
  );
}
