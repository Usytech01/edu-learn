# Edu-Learn

A web-based learning management platform for teachers and students — assignments, grading, student records, and analytics.

## Stack

- **Database:** [Supabase](https://supabase.com) (Postgres, Auth, Storage, RLS)
- **Backend helpers:** `@supabase/supabase-js`

## Getting started

```bash
npm install
cp .env.example .env   # add your Supabase URL and keys
npm run db:test        # verify connection
```

## Database

```bash
npm run db:start   # local Supabase (Docker)
npm run db:reset   # apply migrations + seed
npm run db:push    # push migrations to linked remote project
```

## Project docs

See [Edu-Learn_PRD.md](./Edu-Learn_PRD.md) for product requirements and MVP roadmap.
