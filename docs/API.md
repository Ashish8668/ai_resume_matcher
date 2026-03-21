# API Documentation

## Backend Base URL

`http://localhost:5000`

## Authentication

No UUID header or user identity is required.

## Endpoints

### `GET /health`

Returns backend and AI-engine health.

### `POST /api/resume/upload`

Uploads the active resume.

Body:
- `resume`: PDF file, max 5 MB

Success response:

```json
{
  "success": true,
  "resumeId": "active",
  "resumeText": "John Doe Software Engineer ...",
  "message": "Resume uploaded successfully"
}
```

### `GET /api/resume`

Returns the current active resume.

### `POST /api/match`

Matches the active resume against a job description.

Request body:

```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "jobDescription": "We are looking for ..."
}
```

### `GET /dashboard`

Serves the dashboard UI.

### `GET /api/dashboard/analytics`

Returns dashboard data for the active resume and the latest analysis session.

## Common Errors

```json
{
  "success": false,
  "error": "Resume not found. Please upload a resume first.",
  "code": "RESUME_NOT_FOUND"
}
```

Other common codes:
- `MISSING_FILE`
- `MISSING_FIELDS`
- `DATABASE_ERROR`
- `MATCH_ERROR`
- `DASHBOARD_ERROR`
