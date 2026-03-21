# Project Architecture

This file documents the complete architecture, data flow, and technology usage of the project.

## High-Level Components

1. Chrome Extension
- Injects `Match Resume` button on LinkedIn job pages.
- Uploads resume and displays latest match results.

2. Backend API (Node.js + Express)
- Handles resume upload, matching, health, and dashboard APIs.
- Orchestrates AI calls and scoring pipeline.

3. AI Provider (Groq API)
- Performs semantic similarity, skill extraction, skill gap analysis, and suggestion generation.

4. Firestore (Firebase Admin SDK)
- Stores active resume text and analysis history.

## Tech Stack by Layer

### Extension Layer

- `Manifest V3`
- `content.js`: LinkedIn page parsing + button injection + match trigger
- `background.js`: API proxying + result popup window opening
- `popup/index.html`, `popup.js`, `popup.css`: upload UI + results UI
- `chrome.storage.local`: stores latest match result for popup rendering

### Backend Layer

- Node.js + Express
- `multer` for PDF upload handling
- `pdf-parse` for PDF text extraction
- `axios` for Groq API calls
- Firebase Admin SDK for Firestore persistence

### AI Layer

- Groq OpenAI-compatible endpoint: `/openai/v1/chat/completions`
- JSON-constrained prompting for structured outputs:
  - Similarity
  - Skill extraction
  - Skill gap
  - Suggestions and project ideas

## Runtime Flow (End-to-End)

## 1) Resume Upload Flow

1. User opens extension popup and uploads PDF.
2. Popup sends `POST /api/resume/upload` (multipart form-data).
3. Backend route `resume.routes.js` receives file.
4. `pdfParser.parsePDF()` extracts and cleans text.
5. `resumeRepository.upsertActiveResume()` stores text in Firestore document:
- Collection: `resumes`
- Document: `active`
6. Backend returns success + preview.

## 2) Job Matching Flow

1. On LinkedIn job page, `content.js` extracts:
- `jobTitle`
- `companyName`
- `jobDescription`
- page URL
2. User clicks `Match Resume`.
3. `content.js` sends message to extension `background.js`.
4. `background.js` calls backend `POST /api/match`.
5. Backend `match.routes.js` executes pipeline:
- Load active resume from Firestore
- Extract skills from resume and job text (`extractSkills`)
- Compute semantic similarity (`calculateSimilarity`)
- Analyze missing vs matched skills (`analyzeSkillGap`)
- Calibrate ATS score (missing-skill-aware scoring)
- Generate suggestions/project ideas (`generateSuggestions`)
6. Backend returns `match` payload.
7. Extension stores response in `chrome.storage.local`.
8. Extension opens results popup window automatically.
9. `popup.js` reads and renders latest result.

## 3) Dashboard Analytics Flow

1. User opens `GET /dashboard` (served HTML page).
2. Frontend calls `GET /api/dashboard/analytics`.
3. Backend compiles:
- Resume stats (words, sentences, read time)
- Resume chunking previews (section-based by headings like Education/Experience/Projects with fallback)
- Latest analysis session details
4. Response renders analysis telemetry for debugging and tracking.

## Backend Module Responsibilities

### Entry and App Setup

- `backend/src/server.js`
- `backend/src/app.js`

Responsibilities:
- Load config
- Validate env
- Connect Firestore
- Register middleware and routes

### Configuration

- `backend/src/config/env.js`
- `backend/src/config/db.js`
- `backend/src/config/cors.js`

Responsibilities:
- Environment variables
- Firestore initialization
- CORS policy

### Routes

- `routes/resume.routes.js`
- `routes/match.routes.js`
- `routes/health.routes.js`
- `routes/dashboard.routes.js`

Responsibilities:
- API endpoint handling and response shaping

### Services

- `services/aiService.js`

Responsibilities:
- Groq API integration
- Structured JSON parsing
- Fallback handling where applicable

### Repositories

- `repositories/resumeRepository.js`
- `repositories/analysisRepository.js`

Responsibilities:
- Firestore CRUD for resume and analysis sessions

### Utilities

- `utils/pdfParser.js`
- `utils/textAnalytics.js`

Responsibilities:
- PDF text extraction/cleanup
- Dashboard text stats + chunking

## Data Model (Firestore)

### Active Resume

Path:
- `resumes/active`

Fields:
- `resumeText`
- `createdAt`
- `updatedAt`

### Analysis Session

Path:
- `resumes/active/analysisSessions/{autoId}`

Fields:
- `jobTitle`
- `companyName`
- `jobDescriptionPreview`
- `totalDurationMs`
- `stages` (pipeline telemetry)
- `resultSnapshot`
- `createdAt`

## API Summary

- `GET /health`
- `POST /api/resume/upload`
- `GET /api/resume`
- `POST /api/match`
- `GET /dashboard`
- `GET /api/dashboard/analytics`

## Scoring Notes

- Final ATS score is now calibrated in backend route layer.
- It combines semantic fit + skill coverage and penalizes missing critical skills.
- Full formula is documented in `SCORE.md`.
