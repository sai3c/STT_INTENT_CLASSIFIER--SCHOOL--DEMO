# Behavior MVP — Whisper + Gemini

Minimal Next.js app for the behavioral data entry system. Tap a student, record a voice memo, see the AI classify it into one of 10 traits with a score.

## Stack
- **Next.js 14** (App Router) — single codebase for UI + API
- **Whisper API** (OpenAI) — speech to text
- **Gemini 1.5 Flash** — intent classification + scoring (non-RAG, single-prompt)
- **JSON file** — record storage (swap for Postgres later)

## Quick Start in GitHub Codespaces

1. Push this repo to GitHub → "Open in Codespaces"
2. Create `.env.local`:
   ```
   OPENAI_API_KEY=sk-...
   GEMINI_API_KEY=...
   ```
3. Install and run:
   ```bash
   npm install
   npm run dev
   ```
4. Codespaces will forward port 3000. Open the forwarded URL **on your phone** to test the mic.
   - Make the port **Public** in the Ports tab so your phone can reach it.
   - HTTPS is required for `getUserMedia` — Codespaces forwarded URLs are HTTPS by default ✓

## Testing Flow
1. Land on `/` → see 30-student grid (seeded demo data)
2. Tap a student → opens recorder
3. Hold to record (up to 30s) → release to upload
4. Watch status: `uploading → transcribing → classifying → done`
5. See result: trait + score + confidence + AI rationale
6. Records saved to `data/records.json`

## File Map
```
app/
  page.tsx                   # Student grid
  student/[id]/page.tsx      # Recorder + result view
  api/
    students/route.ts        # GET roster
    transcribe/route.ts      # POST audio → Whisper
    classify/route.ts        # POST transcript → Gemini → trait+score
    records/route.ts         # GET/POST records
lib/
  traits.ts                  # 10-trait taxonomy
  storage.ts                 # JSON file DB
data/
  students.json              # 30 seeded students
  records.json               # generated
```

## Swap-outs for Production
- Replace `lib/storage.ts` JSON with Postgres/Supabase
- Replace Whisper API with self-hosted `whisper.cpp` for privacy
- Wrap in React Native once UX is validated
- Add auth (Clerk/Auth0)
