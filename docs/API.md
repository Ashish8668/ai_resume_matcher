# API Documentation

## Base URLs

- **Backend API (Public)**: `https://your-backend.render.com`
- **AI Engine (Private)**: `http://localhost:8000` (local) / Internal only (production)

## Authentication

All requests (except `/health`) require a UUID header:

```
X-User-UUID: <uuid-v4>
```

## Endpoints

### Backend API

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "backend-api"
}
```

---

#### 2. Upload Resume

```http
POST /api/resume/upload
```

**Headers:**
```
X-User-UUID: <uuid-v4>
Content-Type: multipart/form-data
```

**Body:**
- `resume`: PDF file (max 5MB)

**Response (Success):**
```json
{
  "success": true,
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "resumeText": "John Doe\nSoftware Engineer\n...",
  "message": "Resume uploaded successfully"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid UUID format"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (invalid UUID, no file, invalid format)
- `500`: Server error

---

#### 3. Get Resume

```http
GET /api/resume
```

**Headers:**
```
X-User-UUID: <uuid-v4>
```

**Response (Success):**
```json
{
  "success": true,
  "resume": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "resumeText": "John Doe\nSoftware Engineer\n...",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (Not Found):**
```json
{
  "success": false,
  "error": "Resume not found"
}
```

**Status Codes:**
- `200`: Success
- `400`: Invalid UUID
- `404`: Resume not found
- `500`: Server error

---

#### 4. Match Resume with Job

```http
POST /api/match
```

**Headers:**
```
X-User-UUID: <uuid-v4>
Content-Type: application/json
```

**Body:**
```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "jobDescription": "We are looking for a Senior Software Engineer..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "match": {
    "atsScore": 85.5,
    "similarityScore": 0.855,
    "missingSkills": [
      {
        "skill": "React",
        "importance": 0.9,
        "category": "technical"
      },
      {
        "skill": "TypeScript",
        "importance": 0.7,
        "category": "technical"
      }
    ],
    "matchedSkills": [
      {
        "skill": "JavaScript",
        "relevance": 0.95,
        "category": "technical"
      },
      {
        "skill": "Node.js",
        "relevance": 0.88,
        "category": "technical"
      }
    ],
    "suggestions": {
      "keywordSuggestions": [
        "Add 'React' to your skills section",
        "Mention 'TypeScript' in your experience section"
      ],
      "bulletSuggestions": [
        "Highlight experience with component-based architecture",
        "Emphasize modern JavaScript features and ES6+"
      ],
      "techAlignmentTips": [
        "Your experience with JavaScript aligns well with React",
        "Consider highlighting REST API experience"
      ]
    },
    "projectIdeas": [
      {
        "title": "Build a React Todo App with TypeScript",
        "description": "Create a full-stack todo application using React, TypeScript, and Node.js. This project demonstrates component-based architecture, state management, and modern JavaScript practices.",
        "skills": ["React", "TypeScript", "State Management", "REST APIs"],
        "difficulty": "beginner",
        "estimatedTime": "2-3 weeks"
      },
      {
        "title": "E-commerce Dashboard with React",
        "description": "Build an admin dashboard for an e-commerce platform using React, TypeScript, and modern UI libraries. Focus on data visualization and CRUD operations.",
        "skills": ["React", "TypeScript", "Data Visualization", "REST APIs"],
        "difficulty": "intermediate",
        "estimatedTime": "3-4 weeks"
      }
    ]
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Resume not found. Please upload a resume first."
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad request (invalid UUID, missing fields)
- `404`: Resume not found
- `500`: Server error

---

### AI Engine API (Internal Only)

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "models": {
    "sentenceTransformer": "loaded",
    "spacy": "loaded"
  }
}
```

---

#### 2. Calculate Similarity

```http
POST /api/similarity
```

**Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer\n...",
  "jobDescription": "We are looking for a Senior Software Engineer..."
}
```

**Response:**
```json
{
  "similarityScore": 0.855,
  "atsScore": 85.5
}
```

---

#### 3. Extract Skills

```http
POST /api/skills/extract
```

**Body:**
```json
{
  "text": "John Doe\nSoftware Engineer\nSkills: JavaScript, Python, React..."
}
```

**Response:**
```json
{
  "skills": [
    "JavaScript",
    "Python",
    "React",
    "Node.js"
  ],
  "categories": {
    "technical": [
      "JavaScript",
      "Python",
      "React",
      "Node.js"
    ],
    "soft": [
      "Communication",
      "Teamwork"
    ]
  }
}
```

---

#### 4. Analyze Skill Gap

```http
POST /api/skills/gap
```

**Body:**
```json
{
  "resumeSkills": ["JavaScript", "Node.js", "Python"],
  "jobSkills": ["JavaScript", "React", "TypeScript", "Node.js"]
}
```

**Response:**
```json
{
  "missingSkills": [
    {
      "skill": "React",
      "importance": 0.9,
      "category": "technical"
    },
    {
      "skill": "TypeScript",
      "importance": 0.7,
      "category": "technical"
    }
  ],
  "matchedSkills": [
    {
      "skill": "JavaScript",
      "relevance": 0.95,
      "category": "technical"
    },
    {
      "skill": "Node.js",
      "relevance": 0.88,
      "category": "technical"
    }
  ],
  "gapScore": 0.33
}
```

---

#### 5. Generate Suggestions

```http
POST /api/suggestions
```

**Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer\n...",
  "jobDescription": "We are looking for a Senior Software Engineer...",
  "missingSkills": ["React", "TypeScript"]
}
```

**Response:**
```json
{
  "keywordSuggestions": [
    "Add 'React' to your skills section",
    "Mention 'TypeScript' in your experience section"
  ],
  "bulletSuggestions": [
    "Highlight experience with component-based architecture",
    "Emphasize modern JavaScript features and ES6+"
  ],
  "techAlignmentTips": [
    "Your experience with JavaScript aligns well with React",
    "Consider highlighting REST API experience"
  ],
  "projectIdeas": [
    {
      "title": "Build a React Todo App with TypeScript",
      "description": "Create a full-stack todo application...",
      "skills": ["React", "TypeScript", "State Management"],
      "difficulty": "beginner",
      "estimatedTime": "2-3 weeks"
    }
  ]
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `INVALID_UUID`: UUID format is invalid
- `MISSING_UUID`: UUID header is missing
- `RESUME_NOT_FOUND`: No resume found for UUID
- `INVALID_FILE`: File format not supported or file too large
- `MISSING_FIELDS`: Required fields missing in request body
- `AI_ENGINE_ERROR`: Error from AI engine service
- `DATABASE_ERROR`: Database operation failed
- `INTERNAL_ERROR`: Unexpected server error

---

## Rate Limiting

- **Resume Upload**: 5 requests/hour per UUID
- **Match Requests**: 20 requests/hour per UUID
- **Get Resume**: 100 requests/hour per UUID

Rate limit headers:
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 19
X-RateLimit-Reset: 1642248000
```

---

## Testing with Postman

### Setup

1. Create a new collection: "AI Resume Matcher"
2. Add environment variables:
   - `base_url`: `http://localhost:5000`
   - `uuid`: Generate a UUID v4 (use Postman's `{{$randomUUID}}`)

### Collection Variables

```json
{
  "base_url": "http://localhost:5000",
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Request Headers (Collection Level)

```
X-User-UUID: {{uuid}}
```

### Test Requests

1. **Health Check**
   - Method: GET
   - URL: `{{base_url}}/health`
   - No headers needed

2. **Upload Resume**
   - Method: POST
   - URL: `{{base_url}}/api/resume/upload`
   - Body: form-data
   - Key: `resume` (type: File)
   - Value: Select a PDF file

3. **Get Resume**
   - Method: GET
   - URL: `{{base_url}}/api/resume`

4. **Match Resume**
   - Method: POST
   - URL: `{{base_url}}/api/match`
   - Body: raw JSON
   - Content: Job description JSON
