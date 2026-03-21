/**
 * Text analytics utilities for dashboard insights
 */

const DEFAULT_CHUNK_WORDS = 180;
const DEFAULT_CHUNK_OVERLAP = 30;

const normalizeText = (text = '') => text.replace(/\s+/g, ' ').trim();

const countWords = (text = '') => {
  const normalized = normalizeText(text);
  if (!normalized) return 0;
  return normalized.split(' ').length;
};

const SECTION_DEFINITIONS = [
  { label: 'Education', aliases: ['education', 'academic background', 'academics'] },
  { label: 'Experience', aliases: ['experience', 'work experience', 'employment history', 'professional experience'] },
  { label: 'Projects', aliases: ['projects', 'project experience', 'personal projects'] },
  { label: 'Achievements', aliases: ['achievements', 'awards', 'accomplishments', 'honors'] },
  { label: 'Certifications', aliases: ['certifications', 'certificates', 'licenses'] },
];

const splitIntoWordChunks = (text, chunkWords = DEFAULT_CHUNK_WORDS, overlapWords = DEFAULT_CHUNK_OVERLAP) => {
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

const findSectionStarts = (normalizedText) => {
  const lower = normalizedText.toLowerCase();
  const starts = [];

  SECTION_DEFINITIONS.forEach((section) => {
    let earliestIndex = -1;

    section.aliases.forEach((alias) => {
      const aliasPattern = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${aliasPattern}\\b\\s*[:\\-]?`, 'i');
      const match = regex.exec(lower);
      if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
        earliestIndex = match.index;
      }
    });

    if (earliestIndex >= 0) {
      starts.push({ label: section.label, startIndex: earliestIndex });
    }
  });

  return starts.sort((a, b) => a.startIndex - b.startIndex);
};

const splitIntoSectionChunks = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return [];

  const sectionStarts = findSectionStarts(normalized);
  if (!sectionStarts.length) return [];

  const chunks = [];

  // Capture a short preface before first detected section if meaningful.
  const firstStart = sectionStarts[0].startIndex;
  const prefixText = normalizeText(normalized.slice(0, firstStart));
  if (countWords(prefixText) >= 25) {
    chunks.push({
      index: 1,
      section: 'Summary',
      startWord: 1,
      endWord: countWords(prefixText),
      wordCount: countWords(prefixText),
      charCount: prefixText.length,
      preview: `${prefixText.split(' ').slice(0, 28).join(' ')}${countWords(prefixText) > 28 ? '...' : ''}`,
      text: prefixText,
      strategy: 'section',
    });
  }

  for (let i = 0; i < sectionStarts.length; i += 1) {
    const current = sectionStarts[i];
    const next = sectionStarts[i + 1];
    const slice = normalizeText(
      normalized.slice(
        current.startIndex,
        next ? next.startIndex : normalized.length
      )
    );

    const wordCount = countWords(slice);
    if (!wordCount) continue;

    const wordsBefore = countWords(normalized.slice(0, current.startIndex));
    const startWord = wordsBefore + 1;
    const endWord = startWord + wordCount - 1;

    chunks.push({
      index: chunks.length + 1,
      section: current.label,
      startWord,
      endWord,
      wordCount,
      charCount: slice.length,
      preview: `${slice.split(' ').slice(0, 28).join(' ')}${wordCount > 28 ? '...' : ''}`,
      text: slice,
      strategy: 'section',
    });
  }

  return chunks;
};

const splitIntoChunks = (text, chunkWords = DEFAULT_CHUNK_WORDS, overlapWords = DEFAULT_CHUNK_OVERLAP) => {
  const sectionChunks = splitIntoSectionChunks(text);
  if (sectionChunks.length >= 2) {
    return sectionChunks;
  }
  return splitIntoWordChunks(text, chunkWords, overlapWords).map((chunk) => ({
    ...chunk,
    section: 'General',
    strategy: 'word_window',
  }));
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
  splitIntoSectionChunks,
  getTextStats,
  summarizeText,
};
