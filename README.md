# ZD Roadmap — Project Pathways 

Vite + React app rendering the `v1.6.3` integrated roadmap for Ziff Davis Travel.

## Quick start — local preview

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Deploy to Vercel

### Option A — drag-and-drop (no CLI, no git)

1. Run `npm install && npm run build` locally to generate the `dist/` folder
2. Go to [vercel.com/new](https://vercel.com/new) while logged in
3. Drag the entire project folder onto the page (or `dist/` for a pre-built deploy)

Vercel will detect Vite automatically and configure the build.

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel        # first time: follow prompts to link/create a project
```

Answer defaults to all prompts; Vercel auto-detects Vite.

For production:

```bash
vercel --prod
```

### Option C — GitHub-linked deploys (recommended for ongoing iteration)

1. Push this directory to a GitHub repo
2. Go to [vercel.com/new](https://vercel.com/new), import the repo
3. Every push to the default branch becomes a production deploy; branches become preview deploys

No special configuration needed — `vite.config.js` and `package.json` are everything Vercel requires.

## Project structure

```
.
├── index.html              ← HTML entry, title/meta
├── package.json            ← React + Vite deps
├── vite.config.js          ← Build config (outputs to dist/)
└── src/
    ├── main.jsx            ← React mount point
    └── Roadmap.jsx         ← The roadmap component (v1.6.3)
```

All roadmap data — phase windows, workstreams, activities, milestones — lives at the top of `src/Roadmap.jsx`. Edit in place and redeploy; no build configuration changes needed.

## Notes

- Page is marked `noindex, nofollow` — safe for an internal draft URL
- No analytics, no tracking
- Font stack: Georgia for body, Courier New for code-style labels, system sans for UI buttons
- Tested with Node 18+
