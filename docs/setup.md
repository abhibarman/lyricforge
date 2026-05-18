# LyricForge Setup Guide

## 1. Supabase

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open `supabase/schema.sql` from this repo.
4. Paste the whole file and run it.
5. Go to **Authentication > URL Configuration**.
6. Add these redirect URLs:
   - `http://localhost:5173/auth/callback`
   - your future Vercel URL, for example `https://lyricforge.vercel.app/auth/callback`

## 2. Local env

Create a local `.env.local` file from `.env.example` and fill in your real values.

Use your Supabase project URL for both `VITE_SUPABASE_URL` and `SUPABASE_URL`.

Use the Supabase publishable key for `VITE_SUPABASE_PUBLISHABLE_KEY`.

Use the Supabase secret key for `SUPABASE_SECRET_KEY`.

## 3. Run locally

```bash
npm install
npm run dev
```

For local API routes, use Vercel's dev server:

```bash
npx vercel dev
```

## 4. Vercel environment variables

In Vercel project settings, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `REPLICATE_API_TOKEN`
- `REPLICATE_MUSICGEN_VERSION`
- `PUBLIC_APP_URL`

After Vercel gives you a production URL, set `PUBLIC_APP_URL` to that URL and add the same URL plus `/auth/callback` in Supabase redirect URLs.
