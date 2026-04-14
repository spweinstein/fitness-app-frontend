# Health is Wealth — Frontend

React + Vite frontend for **Health is Wealth**, a full-stack fitness and workout planning application.

This repo contains the client application: authentication flows, public exploration screens, workout/template/plan management, calendar-based training workflows, and profile views. It talks to the Django REST API in the companion backend repo.

## Live Demo

- App: https://fitness-app-frontend.netlify.app
- Backend repo: https://github.com/spweinstein/fitness-app-backend

## What the app does

Health is Wealth is built around a few core workflows:

- Sign up, sign in, sign out, and session restoration
- Browse public exercises, workout templates, and workout plans
- Create and manage personal workout templates and workout plans
- Schedule workouts from templates
- Generate calendar workouts from plans
- View and update training data through a calendar-centered interface
- Manage profile and weight-log data

## Tech Stack

- React 19
- Vite
- React Router
- Axios
- Tailwind CSS
- shadcn UI components (Radix UI primitives)
- Vitest + Testing Library

## Authentication model

The frontend uses bearer-token auth against the Django API.

Current flow:

- `POST /users/register/` and `POST /users/login/` return `access`, `refresh`, and `user`
- the frontend stores `access_token` and `refresh_token` in `localStorage`
- authenticated requests attach the access token automatically through the shared Axios client
- on app boot, the frontend calls `GET /users/me/`
- if `/users/me/` returns `401`, the frontend attempts `POST /users/token/refresh/`
- if refresh succeeds, it stores the new access token and retries `/users/me/`
- if refresh fails, both stored tokens are cleared and the user is treated as signed out

## Main routes

Public / auth routes:

- `/`
- `/sign-up`
- `/sign-in`

Authenticated app routes:

- `/profile`
- `/exercises`
- `/exercises/:exerciseId`
- `/explore/:tab`
- `/training`
- `/workouts`

The app also redirects legacy `?tab=` explore URLs to the current path-based routing format.

## Project structure

A simplified view of the repo:

```text
src/
  app/
  features/
    auth/
    exercises/
    profile/
    training/
  services/
  shared/
  test/
```

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set the backend origin:

```env
VITE_BACK_END_SERVER_URL=http://localhost:8000
```

### 3. Start the dev server

```bash
npm run dev
```

## Available scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
```

## Testing

This repo uses **Vitest** and **Testing Library**.

Current tests cover:

- `UserContext` (session boot and unauthorized-event handling)
- sign-in and sign-up form behavior
- `authService` functions (sign-in, sign-up, sign-out, token verify and refresh)
- Axios client configuration (request interceptor header injection, response interceptor 401 handling)
- all API service modules: exercises, workout templates, workout plans, workouts, profile, and weight logs

Run tests with:

```bash
npm run test
```

## Notes for reviewers

- This repo contains the full client for the current version of the app
- The backend lives in a separate repository
- Public catalog screens support search and paginated browsing
- The authenticated training area is centered around templates, plans, and calendar-based workout generation

## Related repositories

- Backend API: `spweinstein/fitness-app-backend`
- Docs / coordination repo: `spweinstein/fitness-app`
