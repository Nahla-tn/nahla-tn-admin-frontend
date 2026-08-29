# Setup Guide

This document explains how to install, configure and run the Nahla admin
frontend locally.

## 1. Requirements

- Node.js 18 or newer
- npm 9 or newer
- A running Nahla backend
  - Default URL: `http://localhost:4000`
  - See the backend `README.md` for the backend setup

## 2. Install dependencies

From the `nahla-frontend/` directory:

```bash
npm install
```

## 3. Configure environment variables

Create the local environment file from the provided template:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Nahla backend |

> Never commit the real `.env.local` file. AI keys (OpenRouter, Gemini, ...)
> belong to the backend only.

## 4. Run the application

```bash
npm run dev
```

The application starts on:

```
http://localhost:3000
```

## 5. First login

Use an account seeded on the backend, for example:

- Email: `admin@gmail.com`
- Password: `123456`

The account role must match the intended dashboard permissions.

## 6. Production build

To produce a production build:

```bash
npm run build
npm run start
```

## 7. Language

The interface supports French and English.
Use the `FR / EN` switch in the top-right corner.
The selection is stored in `localStorage`.

## 8. Common issues

**The dashboard shows 401 or redirects to `/login`**
The JWT is missing or expired. Log in again.

**The dashboard shows empty stats**
Check that the backend is running and that
`NEXT_PUBLIC_API_URL` points to the correct backend URL.

**AI answers always show `Source: mock`**
The backend cannot reach OpenRouter. Verify the backend
`OPENROUTER_API_KEY` and `OPENROUTER_MODEL` variables.

**Map does not load**
Make sure your browser allows the OpenStreetMap tile server
and that the backend `/users/map` and `/zones` endpoints respond.