# AI Fitness Coach — React Frontend

A polished React/Vite frontend for the Spring Boot AI Fitness Coach backend. Includes authentication, workout management, analytics, AI chat/coaching, Intervals.icu activity sync, Telegram account linking, and a fitness preferences screen.

## Stack

- React + Vite
- React Router
- Tailwind CSS (with custom design system CSS)
- Zustand for auth state
- Axios with Bearer token and 401 handling
- React Hook Form + Zod validation
- ApexCharts
- Framer Motion, GSAP, Lenis, React Three Fiber/Drei/Three.js
- Lucide icons + Sonner notifications

## Requirements

- Node.js 20.19+ or 22+
- npm
- The Spring Boot backend running and accessible from the browser

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173.

Set `VITE_API_BASE_URL` in `.env` to the backend origin, e.g. `http://localhost:8080`.
Environment variables prefixed with `VITE_` are public and compiled into the frontend. **Never put JWT signing secrets, Gemini keys, Intervals.icu API keys, Telegram bot tokens, database passwords, or other backend secrets in this frontend `.env`.** Those belong only in the backend environment.

## Backend routes used

| Feature | Route |
|---|---|
| Login | `POST /api/v1/auth/login` |
| Register | `POST /api/v1/auth/register` |
| Current user | `GET /api/v1/users/me` (configured but not required on every load) |
| List workouts | `GET /api/v1/workouts?page=0&size=20&sort=startedAt,desc` |
| Create workout | `POST /api/v1/workouts` |
| Delete workout | `DELETE /api/v1/workouts/{id}` |
| Analytics summary | `GET /api/v1/workouts/analytics/summary?start=...&end=...` |
| AI coach recommendation | `GET /api/v1/ai/coach?start=...&end=...` |
| AI chat | `POST /api/v1/ai/chat` |
| Intervals.icu sync | `POST /api/v1/integrations/intervals-icu/sync?oldest=...&newest=...&limit=200` |
| Telegram link code | `POST /api/v1/integrations/telegram/link-code` |

The UI expects the backend's `ApiResponse` wrapper (`success`, `message`, `data`) and understands common nested `data` shapes.

### Auth request compatibility

The login form posts `{ "identifier": "username-or-email", "password": "..." }` to `/api/v1/auth/login`, matching the existing backend's `identifier` login concept. It looks for a JWT in common fields (`accessToken`, `access_token`, `token`, or `jwt`) and stores it in browser local storage via Zustand. Registration posts `{ firstName, lastName, username, email, password }`.

If your actual auth controller uses different paths, update these optional variables in `.env`:

```dotenv
VITE_AUTH_LOGIN_PATH=/api/v1/auth/login
VITE_AUTH_REGISTER_PATH=/api/v1/auth/register
VITE_AUTH_ME_PATH=/api/v1/users/me
```

If the register request DTO uses different property names, update the payload in `src/pages/AuthPages.jsx`. If login returns its JWT under a different field, add that field to `findToken()` in `src/lib/apiClient.js`.

## Required backend CORS setting

Vite runs at `http://localhost:5173`. The Spring Boot backend must allow this origin for API requests. Configure Spring Security CORS for local development, and configure your deployed frontend domain explicitly for production. Do not use wildcard origins with credentials in production.

## Important current backend gaps

- The Fitness Profile screen currently saves preference fields to this browser only. Server-side profile/goal persistence and feeding those preferences into AI context are future backend work; the UI labels this clearly.
- Intervals.icu sync currently uses the configured personal API key/owner ID. This is not yet a multi-user OAuth integration. Do not expose the personal key to browsers or allow arbitrary users to trigger the owner connection in a public deployment until per-user authorization is implemented.
- The Telegram linking UI calls the existing authenticated `POST /api/v1/integrations/telegram/link-code` endpoint. The public bot token stays on the backend.
- AI pages deliberately do not automatically call Gemini when opened. Pressing “Generate assessment” or sending a chat message makes an API call and may consume the provider's quota.
- JWT is stored in localStorage for this MVP. For higher-security production deployments, prefer a backend-managed HttpOnly Secure SameSite cookie or another reviewed token-storage architecture, and apply CSP/XSS protections.

## Build and lint

```bash
npm run build
npm run lint
```

## Suggested deployment shape

1. Build the static frontend with `npm run build` (output in `dist/`).
2. Serve `dist/` using a static host or Nginx with SPA fallback to `index.html`.
3. Host the Spring Boot backend separately and set `VITE_API_BASE_URL` to its HTTPS origin at build time.
4. Configure TLS, CORS, production environment secrets, health checks, backups, and billing alerts before opening access to other users.

This archive contains the frontend only; it does not bundle or replace the Spring Boot backend.
# ai-fitness-coach-frontend-
