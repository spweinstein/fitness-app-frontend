# Fitness app — frontend (canonical)

This is the **canonical** frontend for the fitness application: a Vite + React client that talks to the Django API (JWT in `localStorage`, Axios base URL from env).

It was established by **porting a legacy snapshot into a fresh repository**; behavior and structure may still reflect that migration.

## Local setup

From this repo (see `package.json`):

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run lint`, `npm run test`, `npm run preview`.

## Environment

Copy `.env.example` to `.env` and set values for your machine. The app reads `VITE_*` variables at build/dev time via Vite.

## Legacy

**`fitness-app-frontend-legacy`** remains a **read-only** reference during migration; do not treat it as the source of truth for new work.
