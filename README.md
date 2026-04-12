# HW App Frontend

React/Vite client for the fitness app. It connects to the Django API with JWT-based authentication and powers the public landing pages, sign-in/sign-up flow, profile screen, exercise library, workout templates and plans, and the calendar-based workout view.

## Setup

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run lint` - run ESLint

## Environment

Set `VITE_BACK_END_SERVER_URL` to the backend API base URL before running the app.

## Source structure

```
src/
├── app/                        # App shell: router entry, providers, global layout
│   ├── UserContext.jsx         # Auth context + UserProvider
│   ├── NavBar.jsx              # Top navigation bar
│   └── NavBar.css
│
├── features/
│   ├── auth/                   # Sign-in, sign-up, and landing page
│   │   ├── SignInForm.jsx
│   │   ├── SignUpForm.jsx
│   │   ├── Landing.jsx
│   │   └── Landing.css / SignUpForm.css
│   │
│   ├── exercises/              # Exercise library and detail view
│   │   ├── ExerciseLibrary.jsx
│   │   ├── ExerciseDetail.jsx
│   │   └── *.css
│   │
│   ├── profile/                # User profile (height, weight log)
│   │   ├── Profile.jsx
│   │   └── Profile.css
│   │
│   └── training/               # All training-domain UI
│       ├── TrainingPage.jsx    # /training and /workouts route (calendar + pickers)
│       ├── calendar/           # FullCalendar integration + bulk delete
│       ├── explore/            # /explore/:tab page, pagination, list utils
│       ├── workout/            # Workout CRUD (RHF + zod form, read, delete, popover)
│       ├── workout-template/   # Template CRUD (picker, manage list, scheduler)
│       ├── workout-plan/       # Plan CRUD (picker, generate dialog, read)
│       ├── exercise-field-group/ # New RHF-based exercise row field group (used by workout & template forms)
│       └── forms/              # Legacy form system (kept for backward compat)
│           ├── WorkoutForm.jsx       # Legacy unified workout/template form
│           ├── PlanForm.jsx          # Legacy plan form
│           ├── exercise-form-fields/ # Legacy exercise row components + InputField/SelectField/TextAreaField
│           └── template-form-fields/ # Legacy template link row components
│
├── shared/
│   ├── layout/
│   │   └── AppLayout.jsx       # Page shell wrapper (Outlet)
│   ├── feedback/
│   │   └── LoadingSpinner.jsx  # Spinner with variants (fullscreen, centered, inline)
│   └── ui/
│       ├── CardList.jsx        # Generic card list with actions, scope switcher, empty state
│       └── CardList.css
│
├── services/                   # API service modules (authService, workoutService, …)
├── utils/                      # Shared helpers (formHelpers, apiErrorMessage, …)
├── App.jsx                     # Route tree
├── main.jsx                    # React root + BrowserRouter + UserProvider
└── index.css / App.css
```

### Path alias

All imports use the `@/` alias which resolves to the repo root (`fitness-frontend/`). Imports into `src/` use `@/src/…`. Shadcn/ui components are at `@/components/ui/…`.

### Legacy forms

`src/features/training/forms/` contains the older inline-style form system (pre-RHF). It is still used by some flows and kept to avoid churn. The newer pattern uses React Hook Form + Zod and lives in `workout/`, `workout-template/`, and `workout-plan/` (e.g. `WorkoutForm.jsx`, `WorkoutTemplateForm.jsx`, `WorkoutPlanForm.jsx`).

## Notes

- Access tokens are stored in `localStorage` and attached by the Axios client in `src/services/apiConfig.js`.
- See the workspace root [README](/home/swein/projects/fitness-app/README.md) for the full repo layout and backend setup notes.

