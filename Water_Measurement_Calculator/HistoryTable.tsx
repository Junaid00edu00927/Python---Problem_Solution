import React from "react";
import { containerById } from "../lib/containers";
import { SessionRow } from "../lib/dataScience";
import { VesselIcon } from "./icons";

export default function HistoryTable({ rows }: { rows: SessionRow[] }) {
  const tail = [...rows].reverse().slice(0, 12);

  return (
    <div className="panel flex h-full flex-col p-4">
      <div className="flex items-baseline justify-between">
        <span className="font-disp text-sm font-bold">
          pour_log <span className="font-mono text-[11px] font-normal text-[var(--sub)]">· df.tail(12)</span>
        </span>
        <span className="rounded border border-[var(--line)] bg-[var(--panel2)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--sub)]">
          df.shape = ({rows.length}, 6)
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="max-w-[220px] text-center font-mono text-xs leading-relaxed text-[var(--sub)]">
            empty frame — every pour, quick-fill and simulated draw appends a row here
          </p>
        </div>
      ) : (
        <div className="nice-scroll mt-3 flex-1 overflow-auto rounded-md border border-[var(--line)]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-10 bg-[var(--panel2)] font-mono text-[10px] uppercase tracking-wider text-[var(--sub)]">
              <tr>
                <th className="px-2.5 py-2 font-medium">#</th>
                <th className="px-2 py-2 font-medium">time</th>
                <th className="px-2 py-2 font-medium">vessel</th>
                <th className="px-2 py-2 text-right font-medium">liters</th>
                <th className="px-2 py-2 font-medium">fill</th>
                <th className="px-2.5 py-2 text-right font-medium">Δ L</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {tail.map((r, i) => {
                const idx = rows.length - 1 - i;
                const c = containerById(r.container);
                return (
                  <tr
                    key={r.id}
                    className={`border-t border-[var(--line)] transition-colors hover:bg-[var(--accent-soft)] ${
                      i === 0 ? "row-flash" : ""
                    }`}
                  >
                    <td className="px-2.5 py-1.5 text-[var(--sub)]">{idx}</td>
                    <td className="px-2 py-1.5 tabular text-[var(--sub)]">
                      {new Date(r.t).toTimeString().slice(0, 8)}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="flex items-center gap-1.5 font-sans text-[11.5px] font-medium text-[var(--ink)]">
                        <span className="text-[var(--accent)]">
                          <VesselIcon id={r.container} size={13} />
                        </span>
                        {c.label}
                      </span>
                    </td>
                    <td className="tabular px-2 py-1.5 text-right font-semibold text-[var(--ink)]">
                      {r.liters.toFixed(3)}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="flex items-center gap-1.5">
                        <span className="inline-block h-1.5 w-12 overflow-hidden rounded-full bg-[var(--panel3)]">
                          <span
                            className="block h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                            style={{ width: `${Math.min(100, r.pct)}%` }}
                          />
                        </span>
                        <span className="tabular text-[10px] text-[var(--sub)]">{r.pct.toFixed(1)}%</span>
                      </span>
                    </td>
                    <td
                      className="tabular px-2.5 py-1.5 text-right font-semibold"
                      style={{
                        color:
                          r.delta > 0.0004
                            ? "var(--good)"
                            : r.delta < -0.0004
                            ? "var(--danger)"
                            : "var(--sub)",
                      }}
                    >
                      {r.delta > 0.0004 ? "+" : ""}
                      {r.delta.toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
