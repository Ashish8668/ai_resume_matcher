# Useful Commands

## Backend

```bash
cd backend
npm install
npm run dev
npm test -- --runInBand
```

## AI Engine

```bash
cd ai-engine
venv\Scripts\activate
python -m app.main
```

## Smoke Checks

```bash
curl http://localhost:5000/health
curl http://localhost:5000/api/resume
curl http://localhost:5000/api/dashboard/analytics
```

## Dashboard

Open:

```text
http://localhost:5000/dashboard
```
