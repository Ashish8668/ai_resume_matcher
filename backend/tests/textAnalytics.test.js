const {
  splitIntoChunks,
  getTextStats,
  summarizeText,
} = require('../src/utils/textAnalytics');

describe('text analytics utilities', () => {
  test('computes basic text stats', () => {
    const stats = getTextStats('Hello world. This is a test.');

    expect(stats.words).toBe(6);
    expect(stats.sentences).toBe(2);
    expect(stats.lines).toBe(1);
  });

  test('splits text into chunks with metadata', () => {
    const text = Array.from({ length: 220 }, (_, index) => `word${index + 1}`).join(' ');
    const chunks = splitIntoChunks(text, 100, 20);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].wordCount).toBe(100);
    expect(chunks[0].startWord).toBe(1);
  });

  test('summarizes long text', () => {
    const summary = summarizeText('one two three four five six', 3);
    expect(summary).toBe('one two three...');
  });
});
