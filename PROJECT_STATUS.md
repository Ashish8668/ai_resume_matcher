# Project Status

## Current State

- Backend uses Express + Firestore
- AI engine uses FastAPI + local NLP/embedding models
- Chrome extension uploads one active resume and requests matching
- Dashboard shows resume analytics and the latest analysis run

## Storage Model

- One active resume document in Firestore
- Latest and historical analysis sessions stored under that resume

## Verified

- Backend test suite passes
- Dashboard route is available at `/dashboard`
- Resume and dashboard APIs work without any UUID header

## Remaining Work

- Broader route/integration test coverage
- Production deployment docs
- UX polish across the extension popup and dashboard
