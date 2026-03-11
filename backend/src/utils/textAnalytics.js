/**
 * Text analytics utilities for dashboard insights
 */

const DEFAULT_CHUNK_WORDS = 180;
const DEFAULT_CHUNK_OVERLAP = 30;

const normalizeText = (text = '') => text.replace(/\s+/g, ' ').trim();

const splitIntoChunks = (text, chunkWords = DEFAULT_CHUNK_WORDS, overlapWords = DEFAULT_CHUNK_OVERLAP) => {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const words = normalized.split(' ');
  const chunks = [];
  const step = Math.max(1, chunkWords - overlapWords);

  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(words.length, start + chunkWords);
    const chunkWordsSlice = words.slice(start, end);

    if (!chunkWordsSlice.length) break;

    chunks.push({
      index: chunks.length + 1,
      startWord: start + 1,
      endWord: end,
      wordCount: chunkWordsSlice.length,
      charCount: chunkWordsSlice.join(' ').length,
      preview: `${chunkWordsSlice.slice(0, 28).join(' ')}${chunkWordsSlice.length > 28 ? '...' : ''}`,
      text: chunkWordsSlice.join(' '),
    });

    if (end === words.length) break;
  }

  return chunks;
};

const getTextStats = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return {
      chars: 0,
      words: 0,
      lines: 0,
      sentences: 0,
      avgWordsPerSentence: 0,
      estimatedReadTimeMinutes: 0,
    };
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim()).length;
  const words = normalized.split(' ');
  const sentences = normalized
    .split(/[.!?]+/g)
    .map((item) => item.trim())
    .filter(Boolean);

  const avgWordsPerSentence = sentences.length
    ? Number((words.length / sentences.length).toFixed(1))
    : words.length;

  return {
    chars: normalized.length,
    words: words.length,
    lines,
    sentences: sentences.length,
    avgWordsPerSentence,
    estimatedReadTimeMinutes: Number((words.length / 200).toFixed(2)),
  };
};

const summarizeText = (text, maxWords = 40) => {
  const normalized = normalizeText(text);
  if (!normalized) return '';
  const words = normalized.split(' ');
  return words.length > maxWords ? `${words.slice(0, maxWords).join(' ')}...` : normalized;
};

module.exports = {
  splitIntoChunks,
  getTextStats,
  summarizeText,
};
