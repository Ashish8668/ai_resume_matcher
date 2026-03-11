# AI Resume Matcher

A production-grade AI-powered resume matching Chrome extension that analyzes resumes and matches them against LinkedIn job postings using NLP and machine learning.

## 🎯 Features

- **UUID-Based Identity**: No login required - each browser installation gets a unique UUID
- **PDF Resume Upload**: Extract and store only text (PDF discarded immediately)
- **LinkedIn Integration**: One-click matching on any LinkedIn job posting
- **AI-Powered Matching**: 
  - SentenceTransformer embeddings for semantic similarity
  - NLP-based skill extraction using spaCy
  - Skill gap analysis
  - Resume improvement suggestions
  - Project ideas based on missing skills
- **ATS-Style Scoring**: Normalized 0-100 match score
- **Real-time Results**: Instant feedback in extension popup

## 🏗️ Architecture

```
Chrome Extension (Manifest V3)
   ↓ (UUID in headers)
Node.js API Gateway (PUBLIC)
   ↓ (internal HTTP)
FastAPI AI Engine (PRIVATE)
   ↓
MongoDB Atlas
```

## 📁 Project Structure

```
ai-resume-matcher/
├── backend/              # Node.js API Gateway
│   ├── src/
│   │   ├── config/      # Database, CORS, env
│   │   ├── middleware/   # UUID validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # AI service client
│   │   └── utils/        # PDF parser, text cleaner
│   └── package.json
│
├── ai-engine/           # FastAPI AI Service
│   ├── app/
│   │   ├── models/      # ML model loaders
│   │   ├── similarity.py    # Embedding similarity
│   │   ├── skills.py         # Skill extraction
│   │   ├── gap_analysis.py   # Skill gap analysis
│   │   └── suggestions.py    # Improvement suggestions
│   └── requirements.txt
│
├── extension/           # Chrome Extension
│   ├── background.js    # Service worker
│   ├── content.js       # LinkedIn content script
│   ├── popup/           # Popup UI
│   └── manifest.json
│
└── docs/                # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB Atlas account (free tier)
- Chrome browser

### Step 1: Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Edit with your MongoDB URI
npm run dev
```

### Step 2: AI Engine Setup

```bash
cd ai-engine
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m app.main
```

### Step 3: Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension` folder

### Step 4: Test

1. Open extension popup
2. Upload a PDF resume
3. Go to LinkedIn job page
4. Click "🎯 Match Resume" button
5. View results in popup

## 📖 Documentation

- [Architecture](ARCHITECTURE.md) - System design and architecture
- [API Documentation](docs/API.md) - API endpoints and contracts
- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Postman Collection](docs/POSTMAN_COLLECTION.md) - Testing guide

## 🧪 Testing

### Manual Testing (Postman)

See [Postman Collection Guide](docs/POSTMAN_COLLECTION.md) for detailed test scenarios.

### Test Endpoints

1. **Health Check**: `GET http://localhost:5000/health`
2. **Upload Resume**: `POST http://localhost:5000/api/resume/upload` (with UUID header)
3. **Get Resume**: `GET http://localhost:5000/api/resume` (with UUID header)
4. **Match Resume**: `POST http://localhost:5000/api/match` (with UUID header and job data)

## 🔒 Security

- UUID validation on every request
- CORS configured for extension origins only
- AI engine is private (not exposed publicly)
- No authentication tokens or sessions
- PDF files discarded immediately after parsing
- Only extracted text stored in database

## 🌍 Environment Variables

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
AI_ENGINE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,chrome-extension://<id>
UUID_VALIDATION_ENABLED=true
```

### AI Engine (.env)

```env
HOST=0.0.0.0
PORT=8000
SENTENCE_TRANSFORMER_MODEL=all-MiniLM-L6-v2
SPACY_MODEL=en_core_web_sm
```

## 📊 Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI Engine**: Python, FastAPI, SentenceTransformers, spaCy, scikit-learn
- **Extension**: Chrome Extension Manifest V3, Vanilla JavaScript
- **Database**: MongoDB Atlas (Free Tier)

## 🚢 Deployment

See deployment guide (coming soon) for:
- Render/Railway deployment
- Vercel frontend deployment
- MongoDB Atlas setup
- Environment configuration

## 📝 License

MIT License

## 🤝 Contributing

This is a production-grade project built to industry standards. Contributions welcome!

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Built with ❤️ for resume-worthy projects**
