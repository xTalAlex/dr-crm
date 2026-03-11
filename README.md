# Dr. CRM

Landing page with a simple CRM.

## Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Framework | Astro 6 (SSR)                    |
| UI        | Tailwind CSS 4 · Alpine.js       |
| Database  | PostgreSQL (Supabase) · Prisma 7 |
| Auth      | better-auth                      |
| Deploy    | Netlify                          |

## Prerequisites

- Node &ge; 22.12
- A Supabase project (or any PostgreSQL instance)

## Setup

```bash
npm install
cp .env.example .env   # fill in environment variables
npm run dev
```

### Environment Variables

| Variable             | Description                          |
| -------------------- | ------------------------------------ |
| `BETTER_AUTH_URL`    | Site base URL                        |
| `BETTER_AUTH_SECRET` | Secret for better-auth               |
| `DATABASE_URL`       | PostgreSQL connection string (pooled)|
| `DIRECT_URL`         | PostgreSQL direct connection string  |

## Database

```bash
# Apply migrations
npx prisma migrate deploy

# Or direct sync (dev — drops and recreates tables)
npx prisma db push --force-reset
```

## Scripts

| Command           | Description                                        |
| ----------------- | -------------------------------------------------- |
| `npm run dev`     | Dev server with hot reload                         |
| `npm run build`   | Production build (generates Prisma client + Astro) |
| `npm run preview` | Preview the build                                  |
