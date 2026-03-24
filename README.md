# Dr. CRM

Landing page with a simple CRM.

## Tech Stack

| Layer     | Technology                              |
| --------- | --------------------------------------- |
| Framework | Astro 6 (SSR)                           |
| UI        | Tailwind CSS 4 · Alpine.js · astro-icon |
| Database  | PostgreSQL (Supabase) · Prisma 7        |
| Storage   | Supabase Storage                        |
| Auth      | better-auth                             |
| Email     | Brevo                                   |
| Deploy    | Netlify                                 |
| Icons     | Material Symbols Light                  |

## Prerequisites

- Node &ge; 22.12
- A Supabase project (or any PostgreSQL instance)

## Setup

```bash
npm install
cp env.example .env   # fill in environment variables
npm run dev
```

### Environment Variables

| Variable             | Description                           |
| -------------------- | ------------------------------------- |
| `BETTER_AUTH_URL`    | Site base URL                         |
| `BETTER_AUTH_SECRET` | Secret for better-auth                |
| `DATABASE_URL`       | PostgreSQL connection string (pooled) |
| `DIRECT_URL`         | PostgreSQL direct connection string   |
| `ADMIN_EMAIL`        | Email for the first admin user        |
| `SUPABASE_URL`       | Supabase project URL                  |
| `SUPABASE_SECRET`    | Supabase service-role key             |

## Database

```bash
# Apply migrations
npx prisma migrate deploy

# Or direct sync (dev — drops and recreates tables)
npx prisma db push --force-reset
```

### Seeding the First Admin

The seed script creates an admin user with a random temporary password.

1. Set `ADMIN_EMAIL` in your `.env`:
   ```
   ADMIN_EMAIL=you@example.com
   ```
2. Run the seed:
   ```bash
   npx prisma db seed
   ```
3. Open the login page and use **Reset password** to set your password.

## Scripts

| Command                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Dev server with hot reload                         |
| `npm run build`         | Production build (generates Prisma client + Astro) |
| `npm run preview`       | Preview the build                                  |
| `npm run prisma studio` | Access database from browser                       |
