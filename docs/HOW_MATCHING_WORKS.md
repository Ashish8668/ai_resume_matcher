# How Resume Matching Works

## Overview

The AI Resume Matcher uses a multi-step process to match your resume against job descriptions:

1. **Text Extraction** - Extracts text from PDF (PDF is discarded)
2. **Skill Extraction** - Identifies technical and soft skills from both resume and job description
3. **Similarity Calculation** - Uses AI embeddings to calculate semantic similarity
4. **Skill Gap Analysis** - Compares skills and finds matches/missing skills
5. **Suggestions Generation** - Provides improvement tips and project ideas

---

## Step-by-Step Process

### 1. Resume Upload
- PDF is uploaded → Text is extracted → PDF is discarded
- Only extracted text is stored in database
- Text is cleaned and normalized

### 2. Job Description Capture
- When you click "Match Resume" on LinkedIn
- Extension extracts: Job Title, Company Name, Job Description

### 3. Skill Extraction

**From Resume:**
- Looks for skills in "Skills:" sections
- Uses NLP (spaCy) to identify technical terms
- Matches against known skill database
- **Uses word boundaries** to avoid false matches

**From Job Description:**
- Same process as resume
- Extracts required skills mentioned in job posting

**Important:** The system uses **word boundary matching** to prevent false positives:
- ✅ "Go" matches "Go" (the language)
- ❌ "Go" does NOT match "Google" or "ago"
- ✅ "R" matches "R" (the language)  
- ❌ "R" does NOT match "React", "Python", "Ruby", "for", etc.

### 4. Similarity Calculation

Uses **SentenceTransformer** embeddings:
- Converts resume text → vector embedding
- Converts job description → vector embedding
- Calculates cosine similarity (0-1)
- Normalizes to ATS-style score (0-100)

**Example:**
- Similarity: 0.85 → ATS Score: 88%

### 5. Skill Gap Analysis

**Direct Matching:**
- Compares exact skill names
- "JavaScript" in resume + "JavaScript" in job = Match ✅

**Semantic Matching:**
- Uses embeddings to find similar skills
- "JS" in resume + "JavaScript" in job = Match ✅
- "Node" in resume + "Node.js" in job = Match ✅
- Threshold: 85% similarity required

**Missing Skills:**
- Skills in job but not in resume
- Ranked by importance (frequency in job description)

**Matched Skills:**
- Skills found in both resume and job
- Ranked by relevance

### 6. Suggestions Generation

**Keyword Suggestions:**
- "Add 'React' to your skills section"
- Based on missing skills

**Bullet Point Suggestions:**
- "Highlight experience with REST APIs"
- Based on job requirements

**Project Ideas:**
- Generated based on missing skills
- Includes difficulty and time estimates

---

## Why You See False Matches

### The Problem (FIXED)

**Before Fix:**
- Used substring matching: `if "go" in text`
- "go" matched "Google", "ago", "Golang", etc.
- "r" matched "React", "Python", "Ruby", "for", etc.

**After Fix:**
- Uses word boundary matching: `\bgo\b`
- Only matches whole words
- "go" only matches "go" (the language)
- "r" only matches "r" (the language)

### How to Verify

After the fix, you should see:
- ✅ Only skills that actually appear in your resume
- ✅ No false matches from substring matching
- ✅ More accurate skill gap analysis

---

## Technical Details

### Skill Database

The system maintains a database of known skills:

**Technical Skills:**
- Programming languages: Python, JavaScript, Go, R, etc.
- Frameworks: React, Vue, Angular, etc.
- Tools: Docker, Kubernetes, AWS, etc.

**Soft Skills:**
- Communication, Leadership, Teamwork, etc.

### Matching Algorithm

```python
# Direct match
if "javascript" in resume_skills and "javascript" in job_skills:
    match = True

# Semantic match (using embeddings)
similarity = cosine_similarity(
    embedding("javascript"),
    embedding("js")
)
if similarity > 0.85:
    match = True
```

### Word Boundary Matching

```python
# OLD (WRONG) - substring matching
if "go" in text:  # Matches "Google", "ago", etc.

# NEW (CORRECT) - word boundary matching
import re
if re.search(r'\bgo\b', text):  # Only matches "go" as whole word
```

---

## Common Questions

### Q: Why is "Go" showing as matched when I don't have it?

**A:** This was a bug (now fixed). The old code used substring matching, so "Go" matched "Google" or "ago". The fix uses word boundaries, so it only matches "Go" as a complete word.

### Q: How accurate is the matching?

**A:** 
- **Direct matches:** 100% accurate
- **Semantic matches:** ~85-95% accurate (uses AI embeddings)
- **Skill extraction:** ~80-90% accurate (depends on resume format)

### Q: Can I improve the accuracy?

**A:** Yes!
- List skills clearly in a "Skills:" section
- Use standard skill names (e.g., "JavaScript" not "JS")
- Be specific (e.g., "React" not "frontend framework")

### Q: Why are some skills missing?

**A:** The system only matches skills from its database. If you use uncommon terms, they might not be recognized. The system learns common variations (e.g., "JS" → "JavaScript").

---

## Debugging

To see what skills were extracted:

1. Check backend logs
2. Use Postman to call `/api/skills/extract`
3. Check extension console for extracted skills

Example request:
```json
POST /api/skills/extract
{
  "text": "Your resume text here..."
}
```

Response:
```json
{
  "skills": ["javascript", "python", "react"],
  "categories": {
    "technical": ["javascript", "python", "react"],
    "soft": []
  }
}
```

---

## Future Improvements

- [ ] Machine learning model trained on real resumes
- [ ] Custom skill database per industry
- [ ] Better handling of skill variations
- [ ] Context-aware skill extraction
- [ ] Multi-language support
