/**
 * AI Service Client
 * Uses Groq directly (OpenAI-compatible API) for all AI features.
 */
const axios = require('axios');
const { GROQ_API_KEY, GROQ_MODEL } = require('../config/env');

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

const groqClient = axios.create({
  baseURL: GROQ_BASE_URL,
  timeout: 45000,
  headers: {
    Authorization: `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

const TECHNICAL_SKILLS = new Set([
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'php',
  'swift', 'kotlin', 'go', 'rust', 'scala', 'r', 'react', 'vue', 'angular',
  'html', 'css', 'node.js', 'express', 'django', 'flask', 'fastapi', 'spring',
  'mongodb', 'postgresql', 'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker',
  'kubernetes', 'terraform', 'jenkins', 'git', 'graphql', 'rest api', 'sql',
  'machine learning', 'tensorflow', 'pytorch', 'pandas', 'numpy',
]);

const ensureConfigured = () => {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is missing. Add it to backend/.env and restart backend.');
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const normalizeToAtsScore = (similarity) => {
  if (similarity <= 0.5) return Number((similarity * 120).toFixed(1));
  if (similarity <= 0.7) return Number((60 + (similarity - 0.5) * 75).toFixed(1));
  if (similarity <= 0.85) return Number((75 + (similarity - 0.7) * 86.67).toFixed(1));
  return Number((88 + (similarity - 0.85) * 80).toFixed(1));
};

const stripCodeFence = (text) => {
  if (!text) return '{}';
  return text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
};

const safeJsonParse = (raw) => {
  const cleaned = stripCodeFence(raw).trim();
  try {
    return JSON.parse(cleaned);
  } catch (_) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error('Invalid JSON returned from Groq');
  }
};

const callGroqJson = async (systemPrompt, userPrompt, maxTokens = 900) => {
  ensureConfigured();

  const response = await groqClient.post('/chat/completions', {
    model: GROQ_MODEL,
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const content = response.data?.choices?.[0]?.message?.content || '{}';
  return safeJsonParse(content);
};

const fallbackExtractSkills = (text) => {
  const lower = String(text || '').toLowerCase();
  const all = [];
  const technical = [];
  const soft = [];
  const softSkills = ['communication', 'leadership', 'teamwork', 'problem solving', 'agile'];

  for (const skill of TECHNICAL_SKILLS) {
    const token = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(lower)) {
      all.push(skill);
      technical.push(skill);
    }
  }

  for (const skill of softSkills) {
    const token = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${token}\\b`, 'i');
    if (regex.test(lower)) {
      all.push(skill);
      soft.push(skill);
    }
  }

  const unique = [...new Set(all)];
  return {
    skills: unique.sort(),
    categories: {
      technical: [...new Set(technical)].sort(),
      soft: [...new Set(soft)].sort(),
    },
  };
};

const checkAIHealth = async () => {
  ensureConfigured();
  const response = await groqClient.get('/models');
  return {
    status: 'OK',
    provider: 'groq',
    model: GROQ_MODEL,
    availableModels: Array.isArray(response.data?.data) ? response.data.data.length : 0,
  };
};

const calculateSimilarity = async (resumeText, jobDescription) => {
  try {
    const data = await callGroqJson(
      'You score resume-job fit. Return strict JSON only.',
      [
        'Compare resume and job description and return JSON:',
        '{ "similarityScore": number_between_0_and_1 }',
        'Use semantic fit across skills, experience, and responsibilities.',
        `Resume:\n${resumeText}`,
        `Job Description:\n${jobDescription}`,
      ].join('\n\n'),
      300
    );

    const similarityScore = clamp(Number(data.similarityScore) || 0, 0, 1);
    return {
      similarityScore: Number(similarityScore.toFixed(3)),
      atsScore: clamp(normalizeToAtsScore(similarityScore), 0, 100),
    };
  } catch (error) {
    throw new Error(`Similarity calculation failed: ${error.message}`);
  }
};

const extractSkills = async (text) => {
  try {
    const data = await callGroqJson(
      'You extract hiring-relevant skills from text. Return strict JSON only.',
      [
        'Extract skills from this text and return JSON:',
        '{',
        '  "skills": ["..."],',
        '  "categories": { "technical": ["..."], "soft": ["..."] }',
        '}',
        'Rules: normalize to short canonical names, remove duplicates, max 40 skills.',
        `Text:\n${text}`,
      ].join('\n'),
      700
    );

    const skills = Array.isArray(data.skills) ? data.skills : [];
    const categories = data.categories || {};
    const technical = Array.isArray(categories.technical) ? categories.technical : [];
    const soft = Array.isArray(categories.soft) ? categories.soft : [];

    return {
      skills: [...new Set(skills.map((s) => String(s).trim()).filter(Boolean))],
      categories: {
        technical: [...new Set(technical.map((s) => String(s).trim()).filter(Boolean))],
        soft: [...new Set(soft.map((s) => String(s).trim()).filter(Boolean))],
      },
    };
  } catch (_) {
    return fallbackExtractSkills(text);
  }
};

const analyzeSkillGap = async (resumeSkills, jobSkills) => {
  try {
    const data = await callGroqJson(
      'You analyze skill gaps for hiring. Return strict JSON only.',
      [
        'Given resume skills and job skills, return JSON:',
        '{',
        '  "missingSkills": [{"skill":"...", "importance":0.0, "category":"technical|soft"}],',
        '  "matchedSkills": [{"skill":"...", "importance":0.0, "category":"technical|soft"}],',
        '  "gapScore": number_between_0_and_1',
        '}',
        'Keep importance in [0,1]. Use concise skill names.',
        `Resume Skills: ${JSON.stringify(resumeSkills || [])}`,
        `Job Skills: ${JSON.stringify(jobSkills || [])}`,
      ].join('\n'),
      800
    );

    const normalizeSkillInfo = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr
        .map((item) => {
          const skill = String(item?.skill || '').trim();
          if (!skill) return null;
          return {
            skill,
            importance: clamp(Number(item?.importance) || 0.5, 0, 1),
            category: item?.category === 'soft' ? 'soft' : 'technical',
          };
        })
        .filter(Boolean);
    };

    const missingSkills = normalizeSkillInfo(data.missingSkills);
    const matchedSkills = normalizeSkillInfo(data.matchedSkills);
    const gapScore = clamp(Number(data.gapScore) || 0, 0, 1);

    return {
      missingSkills,
      matchedSkills,
      gapScore: Number(gapScore.toFixed(2)),
    };
  } catch (error) {
    const resumeSet = new Set((resumeSkills || []).map((s) => String(s).toLowerCase()));
    const jobSet = new Set((jobSkills || []).map((s) => String(s).toLowerCase()));
    const matched = [...jobSet].filter((s) => resumeSet.has(s));
    const missing = [...jobSet].filter((s) => !resumeSet.has(s));
    const toInfo = (skill) => ({
      skill,
      importance: TECHNICAL_SKILLS.has(skill) ? 0.8 : 0.6,
      category: TECHNICAL_SKILLS.has(skill) ? 'technical' : 'soft',
    });

    return {
      missingSkills: missing.map(toInfo),
      matchedSkills: matched.map(toInfo),
      gapScore: Number((missing.length / Math.max(jobSet.size, 1)).toFixed(2)),
    };
  }
};

const generateSuggestions = async (resumeText, jobDescription, missingSkills) => {
  try {
    const data = await callGroqJson(
      'You are an expert resume coach. Return strict JSON only.',
      [
        'Generate actionable resume suggestions and project ideas.',
        'Return JSON with this shape exactly:',
        '{',
        '  "keywordSuggestions": ["..."],',
        '  "bulletSuggestions": ["..."],',
        '  "techAlignmentTips": ["..."],',
        '  "projectIdeas": [',
        '    {',
        '      "title": "...",',
        '      "description": "...",',
        '      "skills": ["..."],',
        '      "difficulty": "beginner|intermediate|advanced",',
        '      "estimatedTime": "..."',
        '    }',
        '  ]',
        '}',
        'Limits: keywordSuggestions <= 10, bulletSuggestions <= 8, techAlignmentTips <= 5, projectIdeas <= 5.',
        `Missing Skills: ${JSON.stringify(missingSkills || [])}`,
        `Resume:\n${resumeText}`,
        `Job Description:\n${jobDescription}`,
      ].join('\n'),
      1200
    );

    const normalizeList = (val) =>
      Array.isArray(val) ? val.map((x) => String(x).trim()).filter(Boolean) : [];
    const projectIdeas = Array.isArray(data.projectIdeas)
      ? data.projectIdeas
          .map((p) => ({
            title: String(p?.title || '').trim(),
            description: String(p?.description || '').trim(),
            skills: normalizeList(p?.skills),
            difficulty: ['beginner', 'intermediate', 'advanced'].includes(String(p?.difficulty || '').toLowerCase())
              ? String(p.difficulty).toLowerCase()
              : 'intermediate',
            estimatedTime: String(p?.estimatedTime || '2-4 weeks').trim(),
          }))
          .filter((p) => p.title && p.description)
      : [];

    return {
      keywordSuggestions: normalizeList(data.keywordSuggestions).slice(0, 10),
      bulletSuggestions: normalizeList(data.bulletSuggestions).slice(0, 8),
      techAlignmentTips: normalizeList(data.techAlignmentTips).slice(0, 5),
      projectIdeas: projectIdeas.slice(0, 5),
    };
  } catch (error) {
    throw new Error(`Suggestion generation failed: ${error.message}`);
  }
};

module.exports = {
  checkAIHealth,
  calculateSimilarity,
  extractSkills,
  analyzeSkillGap,
  generateSuggestions,
};
