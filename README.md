# VidMorphX

AI-powered automatic video editing platform. Upload raw footage, and the
pipeline detects scenes, cleans audio, reframes, color-grades, captions,
and exports it — no timeline required.

## Stack
Next.js (Pages Router) + TypeScript + Tailwind + Framer Motion · Node.js +
FFmpeg + BullMQ + Redis + PostgreSQL (Prisma) · Google Gemini for
transcription/captions and metadata generation.

## Local development
```bash
cp .env.example .env        # fill in DATABASE_URL, REDIS_URL, GEMINI_API_KEY
docker compose up --build   # starts web, worker, postgres, redis
```
Or without Docker (requires local ffmpeg, Postgres, Redis installed):
```bash
npm install
npx prisma migrate dev
npm run dev          # web on :3000
npm run worker        # in a second terminal — processes the queue
```

## Deploying to Railway
1. Create a new Railway project from this repo.
2. Add the **PostgreSQL** and **Redis** plugins — Railway sets
   `DATABASE_URL` and `REDIS_URL` automatically.
3. Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and `GEMINI_API_KEY` in the
   service's Variables tab. Add `GOOGLE_CLIENT_ID`/`SECRET` and
   `GITHUB_CLIENT_ID`/`SECRET` if you want those login options — leave
   them blank to run with email/password login only.
4. Add a Railway **Volume** mounted at `/data` so uploads/outputs persist
   across deploys (the default Dockerfile creates `/data/uploads` and
   `/data/outputs`).
5. Deploy the `web` process (uses `railway.json` / `Dockerfile`). Add a
   **second Railway service** from the same repo for the worker, with
   its start command overridden to `npx tsx worker.ts` — this is what
   actually processes the video queue; the web service alone will accept
   uploads but never finish them.
6. Run `npx prisma migrate deploy` once (Railway's deploy shell, or add
   it to the web service's start command) to create the database tables.

## Notes on the AI pipeline
- Scene detection, silence removal, cropping/reframing, color grading,
  stabilization, sharpening, film grain, frame interpolation, speed
  ramping, watermarking, and subtitle burn-in are implemented as real
  FFmpeg filter chains in `lib/ffmpeg.ts` — not mocked.
- Captions and metadata (title/description/hashtags) are generated with
  the Gemini API in `lib/gemini.ts`; if `GEMINI_API_KEY` is unset those
  steps are skipped gracefully rather than failing the job.
- "Detect faces/objects/animals/products" in the original feature list is
  intentionally not implemented as bespoke ML classifiers here — that
  needs trained models or a vision API with real inference cost. The
  pipeline instead uses ffmpeg's scene/motion/silence signals, which
  cover cuts, trims, and reframing well without that dependency. Swapping
  in MediaPipe or a vision API for true face/object tracking is a
  contained change inside `lib/ffmpeg.ts` + `lib/editor.ts`.
