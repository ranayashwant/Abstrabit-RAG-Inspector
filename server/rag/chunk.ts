import type { Chunk, Document } from '../types/index.ts';

/**
 * Chunker: Splits document into 8 distinct section chunks.
 * In accordance with the prompt specification, chunking boundary separates the overview
 * from the entitlement details, creating the scenario where high keyword overlap on
 * request guidelines can outrank the policy entitlement chunk.
 */
export function chunkDocument(doc: Document): Chunk[] {
  // Split on section headers (e.g. ## 1., ## 2.)
  const rawSections = doc.content
    .split(/\n(?=## \d+\.)/)
    .map(s => s.trim())
    .filter(s => s.startsWith('## '));

  return rawSections.map((sectionContent, index) => {
    const lines = sectionContent.split('\n');
    const headerLine = lines[0] || '';
    const sectionTitle = headerLine.replace(/^## \d+\.\s*/, '').trim();

    const isParentalEntitlement = sectionTitle.toLowerCase().includes('entitlement');
    const chunkId = `chunk_00${index + 1}`;

    const tokenCount = Math.round(sectionContent.length / 4);

    const rawWords = sectionContent.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const keywords = Array.from(new Set(rawWords)).slice(0, 8);

    return {
      id: chunkId,
      documentId: doc.id,
      content: sectionContent,
      index: index + 1,
      tokenCount,
      metadata: {
        section: sectionTitle,
        isAuthoritative: isParentalEntitlement,
        keywords,
      },
      groundTruthRelevant: isParentalEntitlement,
    };
  });
}
