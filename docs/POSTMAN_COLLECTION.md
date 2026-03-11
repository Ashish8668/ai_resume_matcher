# Postman Collection for Testing

## Setup

1. Import this collection into Postman
2. Create an environment variable:
   - `base_url`: `http://localhost:5000`
   - `uuid`: Generate a UUID v4 (or use `{{$randomUUID}}`)

## Collection Variables

```json
{
  "base_url": "http://localhost:5000",
  "uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Requests

### 1. Health Check

**Method:** `GET`  
**URL:** `{{base_url}}/health`  
**Headers:** None  
**Expected Response:**
```json
{
  "status": "OK",
  "timestamp": "...",
  "service": "backend-api"
}
```

---

### 2. Upload Resume

**Method:** `POST`  
**URL:** `{{base_url}}/api/resume/upload`  
**Headers:**
```
X-User-UUID: {{uuid}}
```
**Body:** `form-data`
- Key: `resume` (type: File)
- Value: Select a PDF file

**Expected Response:**
```json
{
  "success": true,
  "uuid": "...",
  "resumeText": "...",
  "message": "Resume uploaded successfully"
}
```

---

### 3. Get Resume

**Method:** `GET`  
**URL:** `{{base_url}}/api/resume`  
**Headers:**
```
X-User-UUID: {{uuid}}
```

**Expected Response:**
```json
{
  "success": true,
  "resume": {
    "uuid": "...",
    "resumeText": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

### 4. Match Resume

**Method:** `POST`  
**URL:** `{{base_url}}/api/match`  
**Headers:**
```
X-User-UUID: {{uuid}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "jobDescription": "We are looking for a Senior Software Engineer with experience in React, Node.js, and MongoDB. The ideal candidate should have 5+ years of experience building scalable web applications."
}
```

**Expected Response:**
```json
{
  "success": true,
  "match": {
    "atsScore": 85.5,
    "similarityScore": 0.855,
    "missingSkills": [...],
    "matchedSkills": [...],
    "suggestions": {...},
    "projectIdeas": [...]
  }
}
```

---

## Testing AI Engine Directly

### AI Engine Health Check

**Method:** `GET`  
**URL:** `http://localhost:8000/health`

### Calculate Similarity

**Method:** `POST`  
**URL:** `http://localhost:8000/api/similarity`  
**Body:**
```json
{
  "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, Python, React...",
  "jobDescription": "We are looking for a Senior Software Engineer..."
}
```

### Extract Skills

**Method:** `POST`  
**URL:** `http://localhost:8000/api/skills/extract`  
**Body:**
```json
{
  "text": "John Doe\nSoftware Engineer\nSkills: JavaScript, Python, React, Node.js..."
}
```

---

## Test Scenarios

### Scenario 1: Complete Flow

1. Health check → Should return OK
2. Upload resume → Should succeed
3. Get resume → Should return uploaded resume
4. Match resume → Should return match results

### Scenario 2: Error Cases

1. Upload without UUID → Should return 400
2. Upload invalid UUID → Should return 400
3. Get resume without uploading → Should return 404
4. Match without resume → Should return 404

### Scenario 3: Edge Cases

1. Upload very large PDF (>5MB) → Should return error
2. Upload non-PDF file → Should return error
3. Match with empty job description → Should return error
