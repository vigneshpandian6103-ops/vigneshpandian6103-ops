import { DocumentChunk, Citation } from '../types';

export interface RetrievalResult {
  chunk: DocumentChunk;
  score: number;
  matchedKeywords: string[];
}

export function retrieveRelevantChunks(
  query: string,
  chunks: DocumentChunk[],
  subjectFilter?: string,
  topK: number = 4
): RetrievalResult[] {
  if (!chunks || chunks.length === 0) return [];

  const rawTokens = query.toLowerCase().match(/[a-z0-9_]{3,}/g) || [];
  // filter stop words
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'what', 'how', 'why',
    'can', 'explain', 'tell', 'about', 'does', 'which', 'when', 'where', 'are', 'was'
  ]);
  const tokens = rawTokens.filter(t => !stopWords.has(t));

  const results: RetrievalResult[] = [];

  for (const chunk of chunks) {
    if (subjectFilter && subjectFilter !== 'All' && chunk.subject !== subjectFilter) {
      continue;
    }

    const chunkContentLower = chunk.content.toLowerCase();
    const docTitleLower = chunk.documentTitle.toLowerCase();
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const token of tokens) {
      // Direct token match in content
      const occurrences = (chunkContentLower.match(new RegExp(`\\b${token}`, 'g')) || []).length;
      if (occurrences > 0) {
        score += Math.min(occurrences * 2.5, 10);
        matchedKeywords.push(token);
      }

      // Higher weight for matches in document title
      if (docTitleLower.includes(token)) {
        score += 4.0;
      }

      // Check chunk keywords
      if (chunk.keywords.some(k => k.toLowerCase().includes(token))) {
        score += 3.0;
      }
    }

    // Exact phrase match bonus
    if (query.trim().length > 8 && chunkContentLower.includes(query.trim().toLowerCase())) {
      score += 15.0;
    }

    if (score > 0) {
      results.push({
        chunk,
        score,
        matchedKeywords: Array.from(new Set(matchedKeywords))
      });
    }
  }

  // Sort descending by score
  results.sort((a, b) => b.score - a.score);

  // If no match found by keyword, fallback to return the top chunks from the requested subject or first documents
  if (results.length === 0 && chunks.length > 0) {
    const candidatePool = subjectFilter && subjectFilter !== 'All'
      ? chunks.filter(c => c.subject === subjectFilter)
      : chunks;
    return (candidatePool.length > 0 ? candidatePool : chunks).slice(0, topK).map(c => ({
      chunk: c,
      score: 1.0,
      matchedKeywords: ['contextual overview']
    }));
  }

  return results.slice(0, topK);
}

export function buildCitations(retrievals: RetrievalResult[]): Citation[] {
  return retrievals.map(r => {
    // Generate an illustrative excerpt (~150-250 chars)
    const content = r.chunk.content;
    const firstPeriod = content.indexOf('. ');
    const excerpt = firstPeriod > 40 && firstPeriod < 240
      ? content.slice(0, firstPeriod + 1)
      : content.slice(0, 200) + '...';

    return {
      documentTitle: r.chunk.documentTitle,
      chunkIndex: r.chunk.chunkIndex,
      excerpt: excerpt.trim(),
      relevanceScore: Math.round(Math.min(r.score * 10, 99))
    };
  });
}
