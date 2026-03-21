# AI Resume Matcher

This repository contains a Chrome extension and an Express backend API with Groq-powered AI processing.

## Prerequisites

- Node.js 18+
- npm
- Firebase service account credentials
- Groq API key
- Google Chrome (for extension)

## Setup

```bash
cd backend
npm install
```

Create `backend/.env` with:

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_ORIGINS=http://localhost:3000
```

## Run

Development:

```bash
cd backend
npm run dev
```

Production:

```bash
cd backend
npm start
```

## Chrome Extension Setup

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click `Load unpacked`
4. Select the `extension` folder

## Important Backend Endpoints

- `GET /health`
- `POST /api/resume/upload`
- `GET /api/resume`
- `POST /api/match`
- `GET /dashboard`
- `GET /api/dashboard/analytics`

## Quick Check Commands

Health:

```bash
curl http://localhost:5000/health
```

Match:

```bash
curl -X POST http://localhost:5000/api/match \
  -H "Content-Type: application/json" \
  -d "{\"jobTitle\":\"Backend Developer\",\"companyName\":\"TestCo\",\"jobDescription\":\"Looking for Node.js, Express, REST API, Docker, AWS experience.\"}"
```
