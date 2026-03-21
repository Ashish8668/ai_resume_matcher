# Setup Guide

## Prerequisites

- Node.js 18+
- Python 3.9+
- Chrome
- Firebase project with Firestore enabled
- Firebase service account key

## Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
AI_ENGINE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
```

Run backend:

```bash
cd backend
npm run dev
```

## AI Engine

```bash
cd ai-engine
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m app.main
```

## Extension

1. Open `chrome://extensions/`
2. Enable Developer mode
3. Load unpacked
4. Select `extension`

## Smoke Test

1. `GET http://localhost:5000/health`
2. Upload a resume from the extension popup
3. Open `http://localhost:5000/dashboard`
4. Run a match request from the extension on a LinkedIn job page
