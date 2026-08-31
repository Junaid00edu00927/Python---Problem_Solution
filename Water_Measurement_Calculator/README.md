# 💧 AquaLab v2.0 — Water Measurement Studio

A deployable web rebuild of the classic Tkinter *Water Measurement App* (v1.0),
re-imagined as a data-visualization dashboard: animated SVG vessels, live water
physics, pandas/numpy-style session analytics, and an in-app source viewer.

> Built with **React 18 · Vite · Tailwind CSS v4 · TypeScript** — no backend,
> fully static, runs anywhere.

---

## ✨ Features

| Area | What you get |
|---|---|
| **Vessels** | Glass (0.35 L) · Mug (0.5 L) · Jug (2 L) · Bottle (1.5 L) · Bucket (10 L) |
| **Animation** | Layered sine-wave surface · rising bubbles · pour stream with droplets & ripples · drain mode · splash impulses |
| **Controls** | Slider, exact entry with inline validation, 25/50/75/100% quick fills, random normal draw, pour/drain/reset |
| **Readout** | Live count-up liters + mL / cups / fl oz / gallons · fill % tag · zone indicator (EMPTY → FULL) |
| **Data science** | `df.describe()` tiles (n, Σ, μ, median, σ, min, max) · `np.histogram` (10 bins) · EMA(α=.3) sparkline · volume-by-vessel |
| **Session log** | pandas-style `pour_log` DataFrame (`df.tail(12)`, `df.shape`) |
| **Simulator** | 10 statistically-drawn pours (seeded PRNG, Box–Muller normal fills, weighted vessel picks) |
| **Export** | Real `to_csv()` / `to_json()` file downloads |
| **See the code** | In-app source viewer with syntax highlighting, LOC counts and copy-to-clipboard |
| **Themes** | Deep-water dark + daylight light, persisted in `localStorage` |

---

## 🚀 Quick start (local)

```bash
git clone https://github.com/<your-username>/aqualab-v2.git
cd aqualab-v2
npm install
npm run dev        # → http://localhost:3000
npm run build      # → production bundle in dist/
```

---

## 🌍 Publish to GitHub Pages (3 steps)

The repo ships a ready-made **GitHub Actions workflow**
(`.github/workflows/pages.yml`) that builds with relative asset paths
(`--base=./`), so it works on any `username.github.io/<repo>/` sub-path.

**1. Create the repo & push**

```bash
git init
git add .
git commit -m "AquaLab v2.0 — water measurement studio"
git branch -M main
git remote add origin https://github.com/<your-username>/aqualab-v2.git
git push -u origin main
```

**2. Enable Pages**

`Settings → Pages → Build and deployment → Source →` select **"GitHub Actions"**.

**3. Done.** Every push to `main` redeploys automatically to:

```
https://<your-username>.github.io/aqualab-v2/
```

> **Custom domain?** In `Settings → Pages → Custom domain`, then the workflow
> keeps working — no code changes needed.

### Alternatives (zero config)

- **Vercel** — import the repo; framework preset *Vite*, build `npm run build`, output `dist`.
- **Netlify** — same as Vercel, or drag-and-drop the `dist/` folder at app.netlify.com/drop.
- **Cloudflare Pages** — import repo, build `npm run build`, output `dist`.

---

## 📁 Project structure

```
├── src/
│   ├── App.tsx                 # app shell, state, pour/drain engine, export
│   ├── index.css               # theme tokens, keyframes, micro-interactions
│   ├── components/
│   │   ├── VesselViz.tsx       # animated SVG water renderer (rAF loop)
│   │   ├── Controls.tsx        # vessel picker, slider, actions
│   │   ├── StatsPanel.tsx      # describe() tiles
│   │   ├── Charts.tsx          # sparkline + EMA, histogram, vessel totals
│   │   ├── HistoryTable.tsx    # pandas-style pour_log table
│   │   ├── SourceViewer.tsx    # in-app "see this code" modal
│   │   ├── BackgroundFX.tsx    # caustics, bubbles, grid
│   │   └── icons.tsx           # inline SVG icon set
│   ├── lib/
│   │   ├── containers.ts       # vessel geometry + metadata
│   │   └── dataScience.ts      # mean/std/quantile/histogram/ema + CSV/JSON
│   └── hooks/                  # useAnimatedNumber, useReveal
└── .github/workflows/pages.yml # GitHub Pages CI/CD
```

---

## ✅ GitHub policy check

| Check | Status |
|---|---|
| Original code, no third-party copyrighted assets | ✅ |
| No secrets, tokens or API keys in source | ✅ |
| No tracking, analytics or cookies | ✅ |
| Open-source license included (MIT) | ✅ |
| `node_modules` / `dist` git-ignored | ✅ |
| Only external requests: Google Fonts + Font Awesome CDN (with graceful fallbacks) | ✅ |

Nothing in this project conflicts with GitHub's Terms of Service,
Acceptable Use Policies, or Pages restrictions.

---

## 📜 License

MIT — see [LICENSE](LICENSE). Port freely, remix freely.
