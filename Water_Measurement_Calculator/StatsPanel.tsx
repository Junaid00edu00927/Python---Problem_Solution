import React, { useMemo } from "react";
import { SessionRow, describe, mean } from "../lib/dataScience";

const fmt = (x: number, d = 3) =>
  x.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export default function StatsPanel({ rows }: { rows: SessionRow[] }) {
  const s = useMemo(() => {
    const liters = rows.map((r) => r.liters);
    return { d: describe(liters), meanPct: mean(rows.map((r) => r.pct)) };
  }, [rows]);

  const tiles: { k: string; v: string; u?: string; tone?: string }[] = [
    { k: "count · n", v: String(s.d.count) },
    { k: "Σ volume", v: fmt(s.d.sum), u: "L", tone: "var(--accent)" },
    { k: "μ mean", v: fmt(s.d.mean), u: "L" },
    { k: "x̃ median", v: fmt(s.d.median), u: "L" },
    { k: "σ std dev", v: fmt(s.d.std), u: "L", tone: "var(--warm)" },
    { k: "min", v: fmt(s.d.min), u: "L" },
    { k: "max", v: fmt(s.d.max), u: "L" },
    { k: "μ fill", v: fmt(s.meanPct, 1), u: "%", tone: "var(--good)" },
  ];

  return (
    <div className="panel p-5">
      <div className="flex items-baseline justify-between">
        <span className="kicker">df.describe() · liters</span>
        <span className="font-mono text-[10px] text-[var(--sub)]">numpy-style</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.k}
            className="pressable rounded-md border border-[var(--line)] bg-[var(--panel2)] px-3 py-2.5"
          >
            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[var(--sub)]">
              {t.k}
            </div>
            <div
              className="tabular mt-1 font-mono text-lg font-semibold leading-none"
              style={{ color: t.tone ?? "var(--ink)" }}
            >
              {t.v}
              {t.u && <span className="ml-1 text-[10px] font-normal text-[var(--sub)]">{t.u}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
