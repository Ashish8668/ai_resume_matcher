# Step-by-Step Setup Guide

## Prerequisites

- Node.js 18+ installed
- Python 3.9+ installed
- MongoDB Atlas account (free tier)
- Chrome browser
- Git (optional)

---

## Phase 1: Backend Setup (Node.js API Gateway)

### Step 1.1: Install Dependencies

```bash
cd backend
npm install
```

### Step 1.2: Configure Environment Variables

Create `backend/.env` file:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resume_matcher?retryWrites=true&w=majority
AI_ENGINE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000
UUID_VALIDATION_ENABLED=true
```

**To get MongoDB URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get connection string and replace `<password>` with your password

### Step 1.3: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Environment variables validated
✅ MongoDB connected: ...
🚀 Server running on port 5000
```

### Step 1.4: Test Backend (Postman)

1. **Health Check**
   - Method: `GET`
   - URL: `http://localhost:5000/health`
   - No headers needed
   - Expected: `{ "status": "OK", ... }`

2. **Upload Resume** (requires UUID)
   - Method: `POST`
   - URL: `http://localhost:5000/api/resume/upload`
   - Headers:
     - `X-User-UUID: 550e8400-e29b-41d4-a716-446655440000` (generate a UUID)
   - Body: `form-data`
   - Key: `resume` (type: File)
   - Value: Select a PDF file
   - Expected: `{ "success": true, "uuid": "...", ... }`

3. **Get Resume**
   - Method: `GET`
   - URL: `http://localhost:5000/api/resume`
   - Headers: `X-User-UUID: <same-uuid>`
   - Expected: `{ "success": true, "resume": {...} }`

---

## Phase 2: AI Engine Setup (FastAPI)

### Step 2.1: Create Python Virtual Environment

```bash
cd ai-engine
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### Step 2.2: Install Dependencies

```bash
pip install -r requirements.txt
```

**Note:** You may need to install spaCy model separately:
```bash
python -m spacy download en_core_web_sm
```

### Step 2.3: Configure Environment Variables

Create `ai-engine/.env` file:

```env
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
BACKEND_URL=http://localhost:5000
```

### Step 2.4: Start AI Engine

```bash
cd ai-engine
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2.5: Test AI Engine (Postman)

1. **Health Check**
   - Method: `GET`
   - URL: `http://localhost:8000/health`
   - Expected: `{ "status": "OK", ... }`

2. **Calculate Similarity**
   - Method: `POST`
   - URL: `http://localhost:8000/api/similarity`
   - Body (JSON):
     ```json
     {
       "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, Python...",
       "jobDescription": "We are looking for a Senior Software Engineer..."
     }
     ```
   - Expected: `{ "similarityScore": 0.85, "atsScore": 85.5 }`

---

## Phase 3: Chrome Extension Setup

### Step 3.1: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Extension should appear in your extensions list

### Step 3.2: Verify UUID Generation

1. Open Chrome DevTools (F12)
2. Go to "Application" tab → "Storage" → "Local Storage" → `chrome-extension://<id>`
3. You should see `userUUID` key with a UUID value
4. Or check Console tab in background page for UUID log

### Step 3.3: Test Resume Upload

1. Click the extension icon
2. Click "Upload Resume"
3. Select a PDF file
4. Should see success message

### Step 3.4: Test LinkedIn Job Matching

1. Go to https://www.linkedin.com/jobs
2. Open any job posting
3. You should see a "🎯 Match Resume" button
4. Click it (after uploading resume)
5. Extension popup should show match results

---

## Phase 4: Testing End-to-End Flow

### Test Flow:

1. **Upload Resume via Extension**
   - Open extension popup
   - Upload PDF resume
   - Verify success message

2. **Match on LinkedIn**
   - Go to LinkedIn job page
   - Click "Match Resume" button
   - View results in popup

3. **Test via Postman**
   - Use same UUID from extension (check chrome.storage.local)
   - Test all endpoints manually

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Failed**
- Check MongoDB URI in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Check network connectivity

**UUID Validation Fails**
- Ensure `X-User-UUID` header is present
- Verify UUID format (must be UUID v4)
- Check `UUID_VALIDATION_ENABLED` in `.env`

### AI Engine Issues

**spaCy Model Not Found**
```bash
python -m spacy download en_core_web_sm
```

**SentenceTransformer Model Download**
- First request may take time to download model
- Check internet connection
- Model is cached after first download

**Port Already in Use**
- Change PORT in `.env`
- Or kill process using port: `lsof -ti:8000 | xargs kill` (Mac/Linux)

### Extension Issues

**UUID Not Generated**
- Check background.js console for errors
- Verify `storage` permission in manifest.json
- Try reloading extension

**CORS Errors**
- Add extension ID to `ALLOWED_ORIGINS` in backend `.env`
- Format: `chrome-extension://<extension-id>`
- Restart backend server

**API Calls Fail**
- Verify backend is running on port 5000
- Check `API_BASE_URL` in extension/utils/api.js
- Check browser console for errors

---

## Next Steps

After setup is complete:

1. ✅ Phase 1: UUID Identity & Resume Upload
2. ✅ Phase 2: LinkedIn Job Capture
3. ⏳ Phase 3: AI Similarity Engine (in progress)
4. ⏳ Phase 4: Skill Extraction Engine
5. ⏳ Phase 5: Skill Gap Analysis
6. ⏳ Phase 6: Resume Improvement Engine
7. ⏳ Phase 7: Chrome Extension UI
8. ⏳ Phase 8: Deployment
9. ⏳ Phase 9: Testing & Validation

---

## Production Deployment

See `docs/DEPLOYMENT.md` for deployment instructions.
