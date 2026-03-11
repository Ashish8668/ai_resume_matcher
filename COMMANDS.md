# Commands Reference

## Backend (Node.js)

### Install Dependencies
```bash
cd backend
npm install
```

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Watch Tests
```bash
npm run test:watch
```

---

## AI Engine (Python)

### Create Virtual Environment
```bash
cd ai-engine
python -m venv venv
```

### Activate Virtual Environment

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Download spaCy Model
```bash
python -m spacy download en_core_web_sm
```

### Run AI Engine
```bash
python -m app.main
```

Or using uvicorn directly:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Tests
```bash
pytest tests/
```

---

## Chrome Extension

### Load Extension
1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension` folder

### Reload Extension
- Click the reload icon on the extension card
- Or use keyboard shortcut: `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)

### View Background Console
1. Go to `chrome://extensions/`
2. Find "AI Resume Matcher"
3. Click "service worker" link (or "background page" in older Chrome)

### View Extension Storage
1. Open DevTools (F12)
2. Go to "Application" tab
3. Expand "Storage" → "Local Storage"
4. Select `chrome-extension://<extension-id>`
5. View `userUUID` key

---

## MongoDB Atlas

### Get Connection String
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database password

### Whitelist IP
1. Go to "Network Access" in Atlas
2. Click "Add IP Address"
3. For development: Add `0.0.0.0/0` (all IPs)
4. For production: Add specific IPs

---

## Testing with Postman

### Setup Environment
1. Create new environment in Postman
2. Add variables:
   - `base_url`: `http://localhost:5000`
   - `uuid`: Generate UUID v4 (or use `{{$randomUUID}}`)

### Test Flow
1. **Health Check**: `GET {{base_url}}/health`
2. **Upload Resume**: `POST {{base_url}}/api/resume/upload` (with UUID header)
3. **Get Resume**: `GET {{base_url}}/api/resume` (with UUID header)
4. **Match Resume**: `POST {{base_url}}/api/match` (with UUID header and job data)

---

## Troubleshooting Commands

### Check if ports are in use

**Windows:**
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :8000
```

**Mac/Linux:**
```bash
lsof -i :5000
lsof -i :8000
```

### Kill process on port (Mac/Linux)
```bash
lsof -ti:5000 | xargs kill
lsof -ti:8000 | xargs kill
```

### Check Node.js version
```bash
node --version
```

### Check Python version
```bash
python --version
```

### Check MongoDB connection
```bash
# Test connection string
mongosh "mongodb+srv://..."
```

### Clear Chrome Extension Storage
1. Open extension popup
2. Open DevTools (F12)
3. Go to Console
4. Run: `chrome.storage.local.clear()`

---

## Development Workflow

### Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - AI Engine:**
```bash
cd ai-engine
source venv/bin/activate  # or venv\Scripts\activate on Windows
python -m app.main
```

**Terminal 3 - Watch for changes (optional):**
```bash
# Use nodemon for backend (already configured)
# Use uvicorn --reload for AI engine
```

### Verify Services Running

**Backend:**
```bash
curl http://localhost:5000/health
```

**AI Engine:**
```bash
curl http://localhost:8000/health
```

---

## Production Deployment

### Backend (Render/Railway)
```bash
# Set environment variables in dashboard
# Deploy from Git repository
# Or use CLI:
render deploy
```

### AI Engine (Render)
```bash
# Set environment variables
# Install system dependencies:
pip install -r requirements.txt
python -m spacy download en_core_web_sm
# Deploy
```

### Update Extension for Production
1. Update `API_BASE_URL` in `extension/popup/popup.js`
2. Update `API_BASE_URL` in `extension/background.js`
3. Update `host_permissions` in `extension/manifest.json`
4. Reload extension

---

## Useful Scripts

### Generate UUID (for testing)
```bash
# Node.js
node -e "console.log(require('uuid').v4())"

# Python
python -c "import uuid; print(uuid.uuid4())"

# Online
# Use: https://www.uuidgenerator.net/
```

### Test PDF Parsing
```bash
cd backend
node -e "const {parsePDF} = require('./src/utils/pdfParser'); const fs = require('fs'); parsePDF(fs.readFileSync('test.pdf')).then(console.log)"
```

### Check MongoDB Collections
```bash
mongosh "mongodb+srv://..."
use resume_matcher
db.resumes.find().pretty()
```

---

## Quick Reference

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| AI Engine | 8000 | http://localhost:8000 |
| MongoDB | 27017 | mongodb+srv://... |

| Command | Description |
|---------|-------------|
| `npm run dev` | Start backend in dev mode |
| `python -m app.main` | Start AI engine |
| `pytest tests/` | Run Python tests |
| `npm test` | Run Node.js tests |
