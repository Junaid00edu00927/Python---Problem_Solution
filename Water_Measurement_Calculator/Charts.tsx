import React, { useMemo } from "react";
import { CONTAINERS } from "../lib/containers";
import { SessionRow, ema, histogram, sum } from "../lib/dataScience";
import { VesselIcon } from "./icons";

const W = 560;
const H = 138;
const PL = 36;
const PR = 12;
const PT = 12;
const PB = 20;

function Sparkline({ rows }: { rows: SessionRow[] }) {
  const { lineD, areaD, emaD, last, n } = useMemo(() => {
    const pcts = rows.map((r) => r.pct);
    const n = pcts.length;
    const x = (i: number) => PL + (i * (W - PL - PR)) / Math.max(1, n - 1);
    const y = (p: number) => PT + (1 - p / 100) * (H - PT - PB);
    const line =
      n > 0
        ? `M ${pcts.map((p, i) => `${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" L ")}`
        : "";
    const area = n > 0 ? `${line} L ${x(n - 1).toFixed(1)} ${H - PB} L ${PL} ${H - PB} Z` : "";
    const e = ema(pcts, 0.3);
    const emaLine = n > 0 ? `M ${e.map((p, i) => `${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" L ")}` : "";
    return {
      lineD: line,
      areaD: area,
      emaD: emaLine,
      last: n > 0 ? { cx: x(n - 1), cy: y(pcts[n - 1]) } : null,
      n,
    };
  }, [rows]);

  const t0 = rows.length ? new Date(rows[0].t) : null;
  const t1 = rows.length ? new Date(rows[rows.length - 1].t) : null;
  const hhmmss = (d: Date | null) =>
    d ? d.toTimeString().slice(0, 8) : "—";

  if (rows.length === 0) {
    return (
      <div className="flex h-[138px] items-center justify-center rounded-md border border-dashed border-[var(--line2)]">
        <p className="font-mono text-xs text-[var(--sub)]">
          awaiting samples — pour, slide, or simulate a session
        </p>
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.34} />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {[0, 25, 50, 75, 100].map((g) => {
        const y = PT + (1 - g / 100) * (H - PT - PB);
        return (
          <g key={g}>
            <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="var(--line)" strokeWidth={1} strokeDasharray="3 4" />
            <text x={PL - 6} y={y + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8.5} fill="var(--sub)">
              {g}
            </text>
          </g>
        );
      })}
      <path d={areaD} fill="url(#sparkFill)" />
      <path d={emaD} fill="none" stroke="var(--warm)" strokeWidth={1.4} strokeDasharray="5 4" opacity={0.85} />
      <path
        key={n}
        d={lineD}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2}
        pathLength={1}
        className="spark-anim"
        strokeLinejoin="round"
      />
      {last && (
        <g>
          <circle className="pulse-dot" cx={last.cx} cy={last.cy} r={4} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
          <circle cx={last.cx} cy={last.cy} r={3} fill="var(--accent)" />
        </g>
      )}
      <text x={PL} y={H - 5} fontFamily="var(--font-mono)" fontSize={8.5} fill="var(--sub)">
        {hhmmss(t0)}
      </text>
      <text x={W - PR} y={H - 5} textAnchor="end" fontFamily="var(--font-mono)" fontSize={8.5} fill="var(--sub)">
        {hhmmss(t1)} · fill % over session
      </text>
    </svg>
  );
}

function Hist({ rows }: { rows: SessionRow[] }) {
  const { counts, maxCount } = useMemo(() => {
    const h = histogram(rows.map((r) => r.pct), 10, 0, 100);
    return { counts: h.counts, maxCount: Math.max(1, ...h.counts) };
  }, [rows]);

  return (
    <div>
      <div className="flex h-24 items-end gap-1">
        {counts.map((c, i) => (
          <div key={i} className="group relative flex-1" title={`${i * 10}–${i * 10 + 10}% : ${c} pour${c === 1 ? "" : "s"}`}>
            <div
              className="w-full rounded-sm transition-all duration-500 group-hover:brightness-125"
              style={{
                height: c > 0 ? `${Math.max(8, (c / maxCount) * 100)}%` : "3px",
                background:
                  c > 0
                    ? "linear-gradient(180deg, var(--water-a), var(--water-b))"
                    : "var(--line)",
              }}
            />
            {c > 0 && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[9px] text-[var(--sub)]">
                {c}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-[var(--sub)]">
        <span>0%</span>
        <span>fill distribution · 10 bins</span>
        <span>100%</span>
      </div>
    </div>
  );
}

function VesselTotals({ rows }: { rows: SessionRow[] }) {
  const totals = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.container, (map.get(r.container) ?? 0) + r.liters);
    const arr = CONTAINERS.map((c) => ({ c, v: map.get(c.id) ?? 0 }));
    return { arr, max: Math.max(0.001, ...arr.map((a) => a.v)) };
  }, [rows]);

  return (
    <div className="space-y-2">
      {totals.arr.map(({ c, v }) => (
        <div key={c.id} className="flex items-center gap-2.5">
          <span className="flex w-6 justify-center text-[var(--sub)]">
            <VesselIcon id={c.id} size={16} />
          </span>
          <span className="w-14 font-disp text-xs font-semibold text-[var(--ink)]">{c.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--panel3)]">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${(v / totals.max) * 100}%`,
                background: "linear-gradient(90deg, var(--accent-deep), var(--accent))",
              }}
            />
          </div>
          <span className="tabular w-16 text-right font-mono text-[11px] text-[var(--sub)]">
            {v.toFixed(2)} L
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Charts({ rows }: { rows: SessionRow[] }) {
  const total = useMemo(() => sum(rows.map((r) => r.liters)), [rows]);
  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <div className="mb-1 flex items-baseline justify-between">
          <span className="font-disp text-sm font-bold">Fill-level time series</span>
          <span className="font-mono text-[10px] text-[var(--sub)]">
            — raw · <span className="text-[var(--warm)]">- - ema(α=.3)</span>
          </span>
        </div>
        <Sparkline rows={rows} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-disp text-sm font-bold">Histogram</span>
            <span className="font-mono text-[10px] text-[var(--sub)]">np.histogram</span>
          </div>
          <Hist rows={rows} />
        </div>
        <div className="panel p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="font-disp text-sm font-bold">Volume by vessel</span>
            <span className="font-mono text-[10px] text-[var(--sub)]">Σ {total.toFixed(2)} L</span>
          </div>
          <VesselTotals rows={rows} />
        </div>
      </div>
    </div>
  );
}
