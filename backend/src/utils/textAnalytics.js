/**
 * Text analytics utilities for dashboard insights
 */

const DEFAULT_CHUNK_WORDS = 180;
const DEFAULT_CHUNK_OVERLAP = 30;
const MIN_SECTION_WORDS = 8;
const MAX_HEADING_WORDS = 8;
const MAX_HEADING_CHARS = 72;

const normalizeText = (text = '') => text.replace(/\s+/g, ' ').trim();
const normalizeSectionText = (text = '') =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

const countWords = (text = '') => {
  const normalized = normalizeText(text);
  if (!normalized) return 0;
  return normalized.split(' ').length;
};

const SECTION_DEFINITIONS = [
  { label: 'Education', aliases: ['education', 'academic background', 'academics', 'academic details', 'qualifications'] },
  { label: 'Experience', aliases: ['experience', 'work experience', 'employment history', 'professional experience'] },
  { label: 'Projects', aliases: ['projects', 'project experience', 'personal projects'] },
  { label: 'Technical Skills', aliases: ['technical skills', 'skills', 'core skills', 'key skills'] },
  { label: 'Achievements & Certifications', aliases: ['achievements and certifications'] },
  { label: 'Achievements', aliases: ['achievements', 'awards', 'accomplishments', 'honors'] },
  { label: 'Certifications', aliases: ['certifications', 'certification', 'certificates', 'certificate', 'licenses', 'license'] },
];
const KNOWN_SECTION_LABELS = new Set(SECTION_DEFINITIONS.map((section) => section.label));

const findKnownSectionLabel = (text = '') => {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  for (const section of SECTION_DEFINITIONS) {
    for (const alias of section.aliases) {
      const aliasPattern = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`^${aliasPattern}(?:\\b|\\s*[:\\-])`, 'i');
      if (regex.test(lower)) {
        return section.label;
      }
    }
  }

  return null;
};

const toDisplayLabel = (text = '') => {
  const clean = text
    .replace(/[:\-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return 'General';

  return clean
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''))
    .join(' ');
};

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

const findKnownSectionStarts = (normalizedText) => {
  const lower = normalizedText.toLowerCase();
  const starts = [];
  const headingBoundary = '(?:^|\\n|\\.\\s+|\\|\\s+|:\\s+|\\s{2,})';

  SECTION_DEFINITIONS.forEach((section) => {
    let earliestIndex = -1;

    section.aliases.forEach((alias) => {
      const aliasPattern = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${headingBoundary}${aliasPattern}\\b\\s*[:\\-]?`, 'i');
      const match = regex.exec(lower);
      if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
        earliestIndex = match.index;
      }
    });

    if (earliestIndex >= 0) {
      starts.push({ label: section.label, startIndex: earliestIndex, source: 'known' });
    }
  });

  return starts;
};

const isLikelyHeadingLine = (line = '') => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (trimmed.length > MAX_HEADING_CHARS) return false;
  if (/^[-*•\u2022]/.test(trimmed)) return false;
  if (/^\d+[\).]/.test(trimmed)) return false;
  if (trimmed.includes('@')) return false;
  if ((trimmed.match(/\|/g) || []).length >= 2) return false;
  if (!/[a-z]/i.test(trimmed)) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (!words.length || words.length > MAX_HEADING_WORDS) return false;
  if (/[.;!?]$/.test(trimmed) && !trimmed.endsWith(':')) return false;

  const isAllCaps = trimmed === trimmed.toUpperCase();
  const capitalizedWords = words.filter((word) => /^[A-Z]/.test(word)).length;
  const isMostlyTitleCase = capitalizedWords / words.length >= 0.6;
  const hasKnownLabel = Boolean(findKnownSectionLabel(trimmed));

  return hasKnownLabel || trimmed.endsWith(':') || isAllCaps || isMostlyTitleCase;
};

const findGenericSectionStarts = (normalizedText) => {
  const lines = normalizedText.split('\n');
  const starts = [];
  let cursor = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    const startIndex = cursor;

    cursor += line.length + 1;
    if (!trimmed) continue;
    if (i === 0) continue;
    if (!isLikelyHeadingLine(trimmed)) continue;

    const label = findKnownSectionLabel(trimmed) || toDisplayLabel(trimmed);
    starts.push({ label, startIndex, source: 'generic' });
  }

  return starts;
};

const mergeAndFilterSectionStarts = (normalizedText, starts) => {
  const sorted = starts.sort((a, b) => a.startIndex - b.startIndex);
  const deduped = [];

  sorted.forEach((current) => {
    const prev = deduped[deduped.length - 1];
    if (!prev || Math.abs(current.startIndex - prev.startIndex) > 3) {
      deduped.push(current);
      return;
    }

    const prevIsKnown = KNOWN_SECTION_LABELS.has(prev.label);
    const currentIsKnown = KNOWN_SECTION_LABELS.has(current.label);
    if (!prevIsKnown && currentIsKnown) {
      deduped[deduped.length - 1] = current;
    }
  });

  const filtered = deduped.filter((current, index) => {
    const next = deduped[index + 1];
    const slice = normalizeText(
      normalizedText.slice(current.startIndex, next ? next.startIndex : normalizedText.length)
    );
    const minWords = KNOWN_SECTION_LABELS.has(current.label) ? 2 : MIN_SECTION_WORDS;
    return countWords(slice) >= minWords;
  });

  return filtered;
};

const findSectionStarts = (normalizedText) => {
  const knownStarts = findKnownSectionStarts(normalizedText);
  const genericStarts = findGenericSectionStarts(normalizedText);
  return mergeAndFilterSectionStarts(normalizedText, [...knownStarts, ...genericStarts]);
};

const findFallbackKnownSectionStarts = (normalizedText) => {
  const lower = normalizedText.toLowerCase();
  const starts = [];
  const headingBoundary = '(?:^|\\n|\\.\\s+|\\|\\s+|:\\s+|\\s{2,})';

  SECTION_DEFINITIONS.forEach((section) => {
    let earliestIndex = -1;

    section.aliases.forEach((alias) => {
      const aliasPattern = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`${headingBoundary}${aliasPattern}\\b`, 'i');
      const match = regex.exec(lower);
      if (match && (earliestIndex === -1 || match.index < earliestIndex)) {
        earliestIndex = match.index;
      }
    });

    if (earliestIndex >= 0) {
      starts.push({ label: section.label, startIndex: earliestIndex, source: 'known' });
    }
  });

  return starts.sort((a, b) => a.startIndex - b.startIndex);
};

const splitIntoSectionChunks = (text) => {
  const sectionText = normalizeSectionText(text);
  if (!sectionText) return [];

  const sectionStarts = findSectionStarts(sectionText);
  const effectiveSectionStarts = sectionStarts.length ? sectionStarts : findFallbackKnownSectionStarts(sectionText);
  if (!effectiveSectionStarts.length) return [];

  const chunks = [];

  // Capture a short preface before first detected section if meaningful.
  const firstStart = effectiveSectionStarts[0].startIndex;
  const prefixText = normalizeText(sectionText.slice(0, firstStart));
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

  for (let i = 0; i < effectiveSectionStarts.length; i += 1) {
    const current = effectiveSectionStarts[i];
    const next = effectiveSectionStarts[i + 1];
    const slice = normalizeText(
      sectionText.slice(
        current.startIndex,
        next ? next.startIndex : sectionText.length
      )
    );

    const wordCount = countWords(slice);
    if (!wordCount) continue;

    const wordsBefore = countWords(sectionText.slice(0, current.startIndex));
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
  const hasKnownSection = sectionChunks.some((chunk) => KNOWN_SECTION_LABELS.has(chunk.section));
  if (sectionChunks.length >= 2 || (sectionChunks.length >= 1 && hasKnownSection)) {
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
