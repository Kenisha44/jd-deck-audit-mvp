# JD Deck Audit MVP

A new Johken Design MVP for auditing presentations. This project is intentionally separated from the existing JD Clarity Analyzer so it can become a dedicated GitHub repo and grow into the JD Deck Audit Engine.

## Brand Colors

- Deep Teal: `#038A8E`
- Aqua: `#00B6B2`
- Soft Orange: `#FF9559`
- Vivid Orange: `#FE5B1A`

## What this MVP does now

- Square, professional JD-branded landing page
- Light / dark mode toggle
- PPTX / PDF upload UI
- Mock audit engine connected to backend
- Executive audit results page
- Scoring cards for clarity, storytelling, executive readiness, and visual simplicity
- Strengths, weaknesses, and priority fixes
- $97 audit CTA section

## What comes next

- Real PPTX parsing
- Real PDF parsing
- AI-assisted recommendations
- PDF report export
- Email capture / lead storage
- Stripe payment link
- JD Clarity Analyzer tab

## Project Structure

```text
jd-deck-audit-mvp/
├─ frontend/       # Svelte + Vite app
├─ backend/        # Express API
└─ README.md
```

## Run Locally

Open two terminals.

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5050
```

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## GitHub Setup

From the root folder:

```bash
git init
git add .
git commit -m "Initial JD Deck Audit MVP"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/jd-deck-audit-mvp.git
git push -u origin main
```

## Deploy Later

Recommended:

- Frontend: Vercel
- Backend: Render

When deployed, update `frontend/src/lib/config.js` with your backend Render URL.
