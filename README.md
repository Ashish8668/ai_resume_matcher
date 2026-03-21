# AI Resume Matcher

AI-powered resume matching for LinkedIn job posts using a Chrome extension, an Express backend, and a FastAPI AI engine.

## Features

- PDF resume upload with text-only storage
- Resume/job similarity scoring
- Skill extraction and gap analysis
- Resume improvement suggestions and project ideas
- Dashboard for resume stats, chunking, stage timings, and latest analysis
- Firestore-backed backend storage

## Architecture

```text
Chrome Extension
   -> Express Backend
   -> FastAPI AI Engine
   -> Firestore
```

## Current Flow

- The app keeps one active resume in the backend.
- The extension uploads that resume and requests job matching.
- The dashboard reads the latest stored resume and latest analysis session.

## Run Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

Required backend `.env`:

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
AI_ENGINE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
```

### AI Engine

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m app.main
```

### Chrome Extension

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `extension` folder

## Useful Endpoints

- `GET /health`
- `POST /api/resume/upload`
- `GET /api/resume`
- `POST /api/match`
- `GET /dashboard`
- `GET /api/dashboard/analytics`

## Testing

```bash
cd backend
npm test -- --runInBand
```
