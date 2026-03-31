/**
 * Structured PDF generator for analysis reports (no external dependency).
 * Produces a readable, multi-page report with headings, score summary, and lists.
 */

const PAGE = {
  width: 612,
  height: 792,
  marginX: 48,
  marginTop: 56,
  marginBottom: 48,
  contentWidth: 612 - (48 * 2),
};

const FONTS = {
  regular: 'F1',
  bold: 'F2',
  italic: 'F3',
};

const FONT_WIDTH_FACTOR = {
  [FONTS.regular]: 0.52,
  [FONTS.bold]: 0.56,
  [FONTS.italic]: 0.52,
};

const escapePdfText = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');

const normalizeInline = (text = '') => String(text).replace(/\s+/g, ' ').trim();

const toList = (value) => (Array.isArray(value) ? value : []);

const valueOrDash = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const wrapText = (text, maxChars) => {
  const normalized = normalizeInline(text);
  if (!normalized) return ['-'];
  if (maxChars < 10) return [normalized];

  const words = normalized.split(' ');
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
};

const maxCharsFor = (width, font, size) => {
  const factor = FONT_WIDTH_FACTOR[font] || 0.52;
  return Math.max(12, Math.floor(width / (size * factor)));
};

const drawLine = (x1, y1, x2, y2, width = 1) => [
  `${width} w`,
  `${x1} ${y1} m`,
  `${x2} ${y2} l`,
  'S',
];

const drawRectFill = (x, y, w, h, rgb = [0.95, 0.97, 1]) => [
  `${rgb[0]} ${rgb[1]} ${rgb[2]} rg`,
  `${x} ${y} ${w} ${h} re`,
  'f',
];

const textOp = (x, y, text, { font = FONTS.regular, size = 11 } = {}) => (
  `0 0 0 rg\nBT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(text)}) Tj ET`
);

const toPercent = (value) => {
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return `${Math.round(n)}%`;
};

const sectionHeader = (title) => ([
  { kind: 'space', h: 10 },
  { kind: 'title', text: title },
  { kind: 'rule' },
  { kind: 'space', h: 4 },
]);

const pairRow = (label, value) => ([
  { kind: 'kv', label, value: valueOrDash(value) },
]);

const bulletLines = (items) => {
  if (!items.length) return [{ kind: 'text', text: '- None', font: FONTS.italic }];
  const out = [];
  items.forEach((item, i) => {
    out.push({ kind: 'bullet', text: `${i + 1}. ${item}` });
  });
  return out;
};

const buildLayoutItems = ({ resume, analysis }) => {
  const result = analysis?.resultSnapshot || {};
  const matchedSkills = toList(result.matchedSkills);
  const missingSkills = toList(result.missingSkills);
  const projectIdeas = toList(result.projectIdeas);
  const tips = toList(result?.suggestions?.techAlignmentTips);
  const scoreBreakdown = result.scoreBreakdown || {};

  const items = [];

  items.push({ kind: 'hero' });
  items.push({ kind: 'heroTitle', text: 'Resume Match Report' });
  items.push({
    kind: 'heroSub',
    text: `${valueOrDash(analysis?.jobTitle)} at ${valueOrDash(analysis?.companyName)}`,
  });
  items.push({ kind: 'heroMeta', text: `Generated: ${new Date().toLocaleString()}` });
  items.push({ kind: 'space', h: 16 });

  items.push(...sectionHeader('Overview'));
  items.push(...pairRow('Job Title', analysis?.jobTitle));
  items.push(...pairRow('Company', analysis?.companyName));
  items.push(...pairRow('Analysis Created', analysis?.createdAt));
  items.push(...pairRow('Resume Updated', resume?.updatedAt));
  items.push(...pairRow('Pipeline Duration', `${valueOrDash(analysis?.totalDurationMs)} ms`));

  items.push(...sectionHeader('Score Summary'));
  items.push({
    kind: 'scoreRow',
    cards: [
      { label: 'Score', value: toPercent(result.atsScore) },
      { label: 'Similarity', value: valueOrDash(result.similarityScore) },
      { label: 'Matched Skills', value: String(matchedSkills.length) },
      { label: 'Missing Skills', value: String(missingSkills.length) },
    ],
  });
  items.push(...pairRow('Semantic', valueOrDash(scoreBreakdown.semanticPercent)));
  items.push(...pairRow('Coverage', valueOrDash(scoreBreakdown.coveragePercent)));
  items.push(...pairRow('Weighted Penalty', valueOrDash(scoreBreakdown.weightedPenalty)));
  items.push(...pairRow('Critical Penalty', valueOrDash(scoreBreakdown.criticalPenalty)));

  items.push(...sectionHeader(`Matched Skills (${matchedSkills.length})`));
  items.push(...bulletLines(matchedSkills.map((item) => {
    const skill = typeof item === 'string' ? item : item?.skill;
    const importance = typeof item === 'object' ? item?.importance : null;
    return importance !== null && importance !== undefined
      ? `${valueOrDash(skill)} (importance: ${importance})`
      : valueOrDash(skill);
  })));

  items.push(...sectionHeader(`Missing Skills (${missingSkills.length})`));
  items.push(...bulletLines(missingSkills.map((item) => {
    const skill = typeof item === 'string' ? item : item?.skill;
    const importance = typeof item === 'object' ? item?.importance : null;
    return importance !== null && importance !== undefined
      ? `${valueOrDash(skill)} (importance: ${importance})`
      : valueOrDash(skill);
  })));

  items.push(...sectionHeader(`Project Ideas (${projectIdeas.length})`));
  if (!projectIdeas.length) {
    items.push({ kind: 'text', text: '- None', font: FONTS.italic });
  } else {
    projectIdeas.forEach((idea, index) => {
      items.push({ kind: 'bullet', text: `${index + 1}. ${valueOrDash(idea?.title || 'Untitled')}`, font: FONTS.bold });
      items.push({ kind: 'indent', text: `Description: ${valueOrDash(idea?.description)}` });
      items.push({ kind: 'indent', text: `Difficulty: ${valueOrDash(idea?.difficulty)}` });
      items.push({ kind: 'indent', text: `Estimated Time: ${valueOrDash(idea?.estimatedTime)}` });
      items.push({
        kind: 'indent',
        text: `Skills: ${toList(idea?.skills).length ? toList(idea?.skills).join(', ') : '-'}`,
      });
      items.push({ kind: 'space', h: 4 });
    });
  }

  items.push(...sectionHeader('Tech Alignment Tips'));
  items.push(...bulletLines(tips));

  return items;
};

const measureItemHeight = (item) => {
  switch (item.kind) {
    case 'hero':
      return 80;
    case 'heroTitle':
      return 24;
    case 'heroSub':
      return 18;
    case 'heroMeta':
      return 16;
    case 'title':
      return 18;
    case 'rule':
      return 8;
    case 'space':
      return item.h || 8;
    case 'scoreRow':
      return 64;
    case 'kv':
      return 16;
    case 'text':
      return 16;
    case 'bullet':
      return 18;
    case 'indent':
      return 16;
    default:
      return 14;
  }
};

const paginateItems = (items) => {
  const pages = [];
  const availableHeight = PAGE.height - PAGE.marginTop - PAGE.marginBottom - 32;
  let currentPage = [];
  let used = 0;

  items.forEach((item) => {
    const h = measureItemHeight(item);
    if (used + h > availableHeight && currentPage.length) {
      pages.push(currentPage);
      currentPage = [];
      used = 0;
    }
    currentPage.push(item);
    used += h;
  });

  if (currentPage.length) pages.push(currentPage);
  return pages.length ? pages : [[{ kind: 'text', text: 'No data available.' }]];
};

const renderPage = (items, pageNo, totalPages) => {
  const ops = [];
  let y = PAGE.height - PAGE.marginTop;
  const x = PAGE.marginX;
  const contentWidth = PAGE.contentWidth;

  ops.push('q');
  ops.push(...drawLine(x, PAGE.height - 38, x + contentWidth, PAGE.height - 38, 1));
  ops.push(textOp(x, PAGE.height - 30, 'AI Resume Matcher', { font: FONTS.bold, size: 10 }));
  ops.push(textOp(x + contentWidth - 80, PAGE.height - 30, `Page ${pageNo}/${totalPages}`, { size: 10 }));

  items.forEach((item) => {
    if (item.kind === 'space') {
      y -= item.h || 8;
      return;
    }

    if (item.kind === 'hero') {
      const h = 72;
      y -= h;
      ops.push(...drawRectFill(x, y, contentWidth, h, [0.92, 0.95, 1]));
      return;
    }

    if (item.kind === 'heroTitle') {
      ops.push(textOp(x + 14, y + 48, item.text, { font: FONTS.bold, size: 20 }));
      return;
    }

    if (item.kind === 'heroSub') {
      const lines = wrapText(item.text, maxCharsFor(contentWidth - 28, FONTS.regular, 11));
      lines.forEach((line, idx) => {
        ops.push(textOp(x + 14, y + 30 - (idx * 13), line, { size: 11 }));
      });
      return;
    }

    if (item.kind === 'heroMeta') {
      ops.push(textOp(x + 14, y + 12, item.text, { font: FONTS.italic, size: 10 }));
      return;
    }

    if (item.kind === 'title') {
      y -= 16;
      ops.push(textOp(x, y, item.text, { font: FONTS.bold, size: 13 }));
      return;
    }

    if (item.kind === 'rule') {
      y -= 4;
      ops.push(...drawLine(x, y, x + contentWidth, y, 0.7));
      y -= 4;
      return;
    }

    if (item.kind === 'scoreRow') {
      const cardGap = 10;
      const cardW = (contentWidth - (cardGap * 3)) / 4;
      const cardH = 48;
      y -= cardH;
      item.cards.forEach((card, i) => {
        const cx = x + (i * (cardW + cardGap));
        ops.push(...drawRectFill(cx, y, cardW, cardH, [0.96, 0.97, 0.99]));
        ops.push(textOp(cx + 8, y + 30, card.value, { font: FONTS.bold, size: 13 }));
        ops.push(textOp(cx + 8, y + 14, card.label, { size: 9 }));
      });
      y -= 8;
      return;
    }

    if (item.kind === 'kv') {
      y -= 14;
      const label = `${item.label}:`;
      const value = valueOrDash(item.value);
      const leftWidth = 140;
      const valueChars = maxCharsFor(contentWidth - leftWidth, FONTS.regular, 10);
      const valueLines = wrapText(value, valueChars);

      ops.push(textOp(x, y, label, { font: FONTS.bold, size: 10 }));
      valueLines.forEach((line, idx) => {
        ops.push(textOp(x + leftWidth, y - (idx * 12), line, { size: 10 }));
      });
      y -= (valueLines.length - 1) * 12;
      return;
    }

    if (item.kind === 'text') {
      const lines = wrapText(item.text, maxCharsFor(contentWidth, item.font || FONTS.regular, 10));
      lines.forEach((line) => {
        y -= 14;
        ops.push(textOp(x, y, line, { font: item.font || FONTS.regular, size: 10 }));
      });
      return;
    }

    if (item.kind === 'bullet') {
      const lines = wrapText(item.text, maxCharsFor(contentWidth - 12, item.font || FONTS.regular, 10));
      lines.forEach((line, idx) => {
        y -= 14;
        ops.push(textOp(x + (idx === 0 ? 0 : 12), y, idx === 0 ? `- ${line}` : line, {
          font: item.font || FONTS.regular,
          size: 10,
        }));
      });
      return;
    }

    if (item.kind === 'indent') {
      const lines = wrapText(item.text, maxCharsFor(contentWidth - 18, FONTS.regular, 10));
      lines.forEach((line) => {
        y -= 13;
        ops.push(textOp(x + 18, y, line, { size: 10 }));
      });
      return;
    }
  });

  ops.push(...drawLine(x, PAGE.marginBottom - 8, x + contentWidth, PAGE.marginBottom - 8, 0.7));
  ops.push(textOp(x, PAGE.marginBottom - 22, 'Generated by AI Resume Matcher', { font: FONTS.italic, size: 9 }));
  ops.push('Q');

  return ops.join('\n');
};

const createPdfBuffer = (reportInput) => {
  const items = buildLayoutItems(reportInput);
  const pages = paginateItems(items);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogObj = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesObjIndex = addObject('<< /Type /Pages /Kids [] /Count 0 >>');

  const pageRefs = [];
  const contentRefs = [];

  pages.forEach((pageItems, index) => {
    const stream = renderPage(pageItems, index + 1, pages.length);
    const contentObjNum = addObject(
      `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
    );
    contentRefs.push(contentObjNum);
  });

  const fontRegular = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const fontItalic = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>');

  contentRefs.forEach((contentObjNum) => {
    const pageObjNum = addObject(
      `<< /Type /Page /Parent ${pagesObjIndex} 0 R /MediaBox [0 0 ${PAGE.width} ${PAGE.height}] /Resources << /Font << /${FONTS.regular} ${fontRegular} 0 R /${FONTS.bold} ${fontBold} 0 R /${FONTS.italic} ${fontItalic} 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );
    pageRefs.push(`${pageObjNum} 0 R`);
  });

  objects[pagesObjIndex - 1] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`;
  objects[catalogObj - 1] = `<< /Type /Catalog /Pages ${pagesObjIndex} 0 R >>`;

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(pdf, 'utf8');
};

module.exports = {
  createPdfBuffer,
};
