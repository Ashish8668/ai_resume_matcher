/**
 * Lightweight PDF generator for analysis reports (no external dependency).
 * Produces text-based multi-page PDF content.
 */

const escapePdfText = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');

const toLine = (text, width = 100) => {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return ['-'];
  const words = normalized.split(' ');
  const lines = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines;
};

const buildReportLines = ({ resume, analysis }) => {
  const result = analysis?.resultSnapshot || {};
  const matchedSkills = Array.isArray(result.matchedSkills) ? result.matchedSkills : [];
  const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
  const projectIdeas = Array.isArray(result.projectIdeas) ? result.projectIdeas : [];

  const lines = [];
  const add = (line = '') => lines.push(line);

  add('AI RESUME MATCHER - ANALYSIS REPORT');
  add('');
  add(`Generated At: ${new Date().toISOString()}`);
  add(`Resume Updated At: ${resume?.updatedAt || '-'}`);
  add(`Analysis Created At: ${analysis?.createdAt || '-'}`);
  add(`Job Title: ${analysis?.jobTitle || '-'}`);
  add(`Company: ${analysis?.companyName || '-'}`);
  add('');
  add('SCORING');
  add(`ATS Score: ${result.atsScore ?? '-'}`);
  add(`Similarity Score: ${result.similarityScore ?? '-'}`);
  if (result.scoreBreakdown) {
    add(`Semantic Percent: ${result.scoreBreakdown.semanticPercent ?? '-'}`);
    add(`Coverage Percent: ${result.scoreBreakdown.coveragePercent ?? '-'}`);
    add(`Weighted Penalty: ${result.scoreBreakdown.weightedPenalty ?? '-'}`);
    add(`Critical Penalty: ${result.scoreBreakdown.criticalPenalty ?? '-'}`);
  }
  add('');
  add(`MATCHED SKILLS (${matchedSkills.length})`);
  if (!matchedSkills.length) {
    add('- None');
  } else {
    matchedSkills.forEach((item, idx) => {
      const skill = typeof item === 'string' ? item : item.skill;
      const importance = typeof item === 'object' ? item.importance : null;
      add(`${idx + 1}. ${skill}${importance !== null && importance !== undefined ? ` (importance: ${importance})` : ''}`);
    });
  }

  add('');
  add(`MISSING SKILLS (${missingSkills.length})`);
  if (!missingSkills.length) {
    add('- None');
  } else {
    missingSkills.forEach((item, idx) => {
      const skill = typeof item === 'string' ? item : item.skill;
      const importance = typeof item === 'object' ? item.importance : null;
      add(`${idx + 1}. ${skill}${importance !== null && importance !== undefined ? ` (importance: ${importance})` : ''}`);
    });
  }

  add('');
  add(`PROJECT IDEAS (${projectIdeas.length})`);
  if (!projectIdeas.length) {
    add('- None');
  } else {
    projectIdeas.forEach((idea, idx) => {
      add(`${idx + 1}. ${idea.title || 'Untitled'}`);
      toLine(`Description: ${idea.description || '-'}`, 90).forEach((line) => add(`   ${line}`));
      add(`   Difficulty: ${idea.difficulty || '-'}`);
      add(`   Estimated Time: ${idea.estimatedTime || '-'}`);
      const skills = Array.isArray(idea.skills) ? idea.skills.join(', ') : '-';
      toLine(`Skills: ${skills}`, 90).forEach((line) => add(`   ${line}`));
      add('');
    });
  }

  add('TECH ALIGNMENT TIPS');
  const tips = Array.isArray(result?.suggestions?.techAlignmentTips) ? result.suggestions.techAlignmentTips : [];
  if (!tips.length) {
    add('- None');
  } else {
    tips.forEach((tip, idx) => {
      toLine(`${idx + 1}. ${tip}`, 95).forEach((line) => add(line));
    });
  }

  return lines.flatMap((line) => toLine(line, 110));
};

const paginateLines = (lines, maxLines = 46) => {
  const pages = [];
  for (let i = 0; i < lines.length; i += maxLines) {
    pages.push(lines.slice(i, i + maxLines));
  }
  return pages.length ? pages : [['No data']];
};

const buildContentStream = (lines) => {
  const startY = 790;
  const lineHeight = 16;
  const ops = ['BT', '/F1 11 Tf', `50 ${startY} Td`];

  lines.forEach((line, idx) => {
    if (idx > 0) {
      ops.push(`0 -${lineHeight} Td`);
    }
    ops.push(`(${escapePdfText(line)}) Tj`);
  });

  ops.push('ET');
  return ops.join('\n');
};

const createPdfBuffer = (reportInput) => {
  const reportLines = buildReportLines(reportInput);
  const pages = paginateLines(reportLines);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const catalogObj = addObject('<< /Type /Catalog /Pages 2 0 R >>');
  const pagesObjIndex = addObject('<< /Type /Pages /Kids [] /Count 0 >>');

  const pageRefs = [];
  pages.forEach((lines) => {
    const stream = buildContentStream(lines);
    const contentObjNum = addObject(
      `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`
    );
    const pageObjNum = addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${3 + (pages.length * 2)} 0 R >> >> /Contents ${contentObjNum} 0 R >>`
    );
    pageRefs.push(`${pageObjNum} 0 R`);
  });

  const fontObjNum = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

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
