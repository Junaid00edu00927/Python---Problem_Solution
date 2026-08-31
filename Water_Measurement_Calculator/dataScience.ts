/* ────────────────────────────────────────────────
   dataScience.ts — numpy / pandas-flavoured stats,
   re-implemented in TypeScript so the session
   analytics run entirely in the browser.
   ──────────────────────────────────────────────── */

export interface SessionRow {
  id: number;
  t: number; // epoch ms
  container: string;
  liters: number;
  pct: number; // 0..100
  delta: number;
}

/* ── numpy-style reductions ─────────────────────── */
export const sum = (xs: number[]): number =>
  xs.reduce((a, b) => a + b, 0);

export const mean = (xs: number[]): number =>
  xs.length ? sum(xs) / xs.length : 0;

export function quantile(xs: number[], q: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

export const median = (xs: number[]): number => quantile(xs, 0.5);

export function stdSample(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  return Math.sqrt(sum(xs.map((x) => (x - m) ** 2)) / (xs.length - 1));
}

export const min = (xs: number[]): number =>
  xs.length ? Math.min(...xs) : 0;
export const max = (xs: number[]): number =>
  xs.length ? Math.max(...xs) : 0;

/** pandas `df.describe()` equivalent over the liters column. */
export function describe(xs: number[]) {
  return {
    count: xs.length,
    sum: sum(xs),
    mean: mean(xs),
    std: stdSample(xs),
    min: min(xs),
    q25: quantile(xs, 0.25),
    median: median(xs),
    q75: quantile(xs, 0.75),
    max: max(xs),
  };
}

/** np.histogram with fixed bin edges. */
export function histogram(
  xs: number[],
  bins: number,
  lo: number,
  hi: number
): { edges: number[]; counts: number[] } {
  const edges = Array.from(
    { length: bins + 1 },
    (_, i) => lo + ((hi - lo) * i) / bins
  );
  const counts = new Array(bins).fill(0);
  for (const x of xs) {
    let idx = Math.floor(((x - lo) / (hi - lo)) * bins);
    if (idx >= bins) idx = bins - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  return { edges, counts };
}

/** Exponential moving average — trend line for the sparkline. */
export function ema(xs: number[], alpha = 0.3): number[] {
  const out: number[] = [];
  let prev = xs[0] ?? 0;
  for (const x of xs) {
    prev = alpha * x + (1 - alpha) * prev;
    out.push(prev);
  }
  return out;
}

/* ── numpy-style RNG for the session simulator ──── */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Box–Muller standard normal. */
export function randNormal(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export interface SimStep {
  containerId: string;
  liters: number;
  pct: number;
}

/** Draw n pours: weighted vessel pick + normal-distributed fill. */
export function simulatePlan(
  n: number,
  vessels: { id: string; maxL: number; weight: number }[]
): SimStep[] {
  const rng = mulberry32((Date.now() ^ (n * 2654435761)) >>> 0);
  const totalW = sum(vessels.map((v) => v.weight));
  const steps: SimStep[] = [];
  for (let i = 0; i < n; i++) {
    let r = rng() * totalW;
    let vessel = vessels[0];
    for (const v of vessels) {
      r -= v.weight;
      if (r <= 0) {
        vessel = v;
        break;
      }
    }
    const pct = Math.min(1, Math.max(0.06, 0.52 + 0.26 * randNormal(rng)));
    const liters = Math.round(vessel.maxL * pct * 1000) / 1000;
    steps.push({
      containerId: vessel.id,
      liters,
      pct: Math.round((liters / vessel.maxL) * 1000) / 10,
    });
  }
  return steps;
}

/* ── pandas-style export ────────────────────────── */
export function toCSV(rows: SessionRow[]): string {
  const head = "index,time_iso,container,liters,fill_pct,delta_liters";
  const body = rows.map((r, i) =>
    [
      i,
      new Date(r.t).toISOString(),
      r.container,
      r.liters.toFixed(3),
      r.pct.toFixed(1),
      r.delta.toFixed(3),
    ].join(",")
  );
  return [head, ...body].join("\n");
}

export function triggerDownload(
  filename: string,
  content: string,
  mime: string
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
