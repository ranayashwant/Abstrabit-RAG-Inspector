import type { RunRecord, Document } from '../types/index.ts';

/**
 * In-Process Storage for RAG Runs and Documents
 * Complies with Rule 4 (zero external database infrastructure required).
 */
class MemoryStore {
  private runs: Map<string, RunRecord> = new Map();
  private documents: Map<string, Document> = new Map();

  saveRun(run: RunRecord): void {
    this.runs.set(run.id, run);
  }

  getRun(id: string): RunRecord | undefined {
    return this.runs.get(id);
  }

  getAllRuns(): RunRecord[] {
    return Array.from(this.runs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  saveDocument(doc: Document): void {
    this.documents.set(doc.id, doc);
  }

  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  getAllDocuments(): Document[] {
    return Array.from(this.documents.values());
  }

  clear(): void {
    this.runs.clear();
    this.documents.clear();
  }
}

export const globalStore = new MemoryStore();
