# Nahla Frontend

Admin portal for the **Nahla** platform: dashboards, users, subscriptions,
NDVI cartography, field alerts moderation, reports and AI assistants.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- React Query (Tanstack)
- Zustand
- Leaflet + Leaflet.heat (maps)
- Recharts + Chart.js (charts)
- Custom lightweight FR/EN internationalization

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A running Nahla backend (default `http://localhost:4000`)

## Installation

```bash
npm install
cp .env.local.example .env.local
# fill in the values inside .env.local
npm run dev
```

The application runs on:

```
http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the app in development mode |
| `npm run build` | Build the production bundle |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Environment variables

Copy `.env.local.example` into `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Nahla backend API | `http://localhost:4000` |

> Never commit the real `.env.local` file. Only `.env.local.example` is versioned.
> AI secrets (OpenRouter, Gemini, etc.) belong to the backend only.

## Main routes

| Route | Description |
|---|---|
| `/login` | Login page |
| `/dashboard` | Global KPIs, charts, heatmap and 30-day trends |
| `/users` | Users management (CRUD, subscriptions, exports) |
| `/users/[id]` | 360° profile of a specific user |
| `/maps` | NDVI zones and beekeepers cartography |
| `/alerts` | Field alerts moderation |
| `/reports` | Reported content moderation |
| `/ai` | AI assistants and report generation |

## Roles and access

The frontend enforces role-based navigation on top of the backend RBAC:

| Role | Access |
|---|---|
| Super Admin | All modules |
| Support | Users and field alerts |
| Analyste | Dashboard, maps and reports |
| Apiculteur | Limited access (mobile use case) |

If a user tries to access a forbidden route, the app redirects them
back to `/dashboard`.

## Languages

The interface is fully bilingual (French / English).
The FR / EN switcher is available in the top-right of every page.
The selected language is stored in `localStorage`.

## AI chat behavior

- Two AI contexts: general beekeeping assistant and Nahla platform assistant.
- Chat history is kept **only in React state** while the page stays open.
- Refreshing the page clears the conversation.
- AI responses come from the backend, which uses OpenRouter server-side.

## Documentation

Detailed documentation is available in the [`docs/`](./docs) folder:

- [Setup guide](./docs/setup.md)
- [User guide](./docs/user-guide.md)
- [Screenshots](./docs/screenshots)