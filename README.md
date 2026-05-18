# LyricForge

LyricForge turns a song idea into editable lyrics and generated audio.

Current MVP stack:

- React + Vite + TypeScript
- Supabase Auth + Postgres credits
- Vercel Serverless Functions
- Anthropic for lyrics
- Replicate MusicGen for audio

## First-time setup

1. Run the SQL in `supabase/schema.sql` inside the Supabase SQL Editor.
2. Create `.env.local` from `.env.example`.
3. Fill in your Supabase, Anthropic, and Replicate values.
4. Run the app:

```bash
npm install
npm run dev:vercel
```

Use `npm run dev` only when you want the frontend without Vercel API routes.

## Useful commands

```bash
npm run lint
npm run build
npx tsc --noEmit --ignoreConfig --target ES2022 --module ESNext --moduleResolution Bundler --types node --skipLibCheck api/_lib/*.ts api/lyrics/*.ts api/music/*.ts
```

## Security rules

- Browser-safe values start with `VITE_`.
- Server secrets never use `VITE_`.
- Supabase secret key, Anthropic key, and Replicate token belong only in `.env.local` and Vercel environment variables.
- `.env.local` is ignored by git.
