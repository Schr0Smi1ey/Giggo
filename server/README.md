# Giggo Backend

Phase 1 provides the authentication API used by the Giggo frontend.

1. Copy `.env.example` to `.env` and replace the JWT placeholder values.
2. Run `npm install`.
3. Run `npm run dev`.

With `MONGODB_URI` empty in development, the server uses an ephemeral local
MongoDB instance. Use a real MongoDB URI when persistent local data is needed.

## Phase 1 endpoints

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Phase 2 endpoints

- `GET /api/profiles/me`
- `PATCH /api/profiles/me`
- `POST /api/profiles/me/onboarding`
- `GET /api/profiles/talent`
- `GET /api/profiles/:userId`

## CV analysis

Giggo uses a deterministic local mock analyser by default. It does not send CV text to a third party.
To opt into a real provider later, set `AI_PROVIDER=openai` plus `AI_API_KEY` in your local `.env`.

- `POST /api/profiles/me/cv`
- `DELETE /api/profiles/me/cv`
- `POST /api/ai/cv/analyze`
- `GET /api/ai/cv/latest`
- `GET /api/ai/cv/analyses`
- `POST /api/ai/cv/analyses/:id/apply-skills`
