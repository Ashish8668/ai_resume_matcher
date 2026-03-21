# Postman Testing Guide

Use `base_url = http://localhost:5000`.

## Requests

### Health

- Method: `GET`
- URL: `{{base_url}}/health`

### Upload Resume

- Method: `POST`
- URL: `{{base_url}}/api/resume/upload`
- Body: `form-data`
- Key: `resume` as file

### Get Resume

- Method: `GET`
- URL: `{{base_url}}/api/resume`

### Match Resume

- Method: `POST`
- URL: `{{base_url}}/api/match`
- Header: `Content-Type: application/json`
- Body:

```json
{
  "jobTitle": "Senior Software Engineer",
  "companyName": "Tech Corp",
  "jobDescription": "We are looking for a Senior Software Engineer with experience in React, Node.js, and Firestore."
}
```

### Dashboard Analytics

- Method: `GET`
- URL: `{{base_url}}/api/dashboard/analytics`

## Basic Flow

1. Call `/health`
2. Upload a PDF to `/api/resume/upload`
3. Confirm with `/api/resume`
4. Call `/api/match`
5. Open `/dashboard` or call `/api/dashboard/analytics`
