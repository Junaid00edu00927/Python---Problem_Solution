import React, { useState } from "react";
import { CONTAINERS, containerById } from "../lib/containers";
import { DiceIcon, DropIcon, ResetIcon, VesselIcon, WaveIcon } from "./icons";

interface Props {
  activeId: string;
  liters: number;
  pouring: boolean;
  draining: boolean;
  simRunning: boolean;
  onSelect: (id: string) => void;
  onSlider: (v: number) => void;
  onCommit: () => void;
  onSetValue: (v: number) => string | null;
  onQuick: (frac: number) => void;
  onRandom: () => void;
  onPour: () => void;
  onDrain: () => void;
  onReset: () => void;
}

export default function Controls(p: Props) {
  const meta = containerById(p.activeId);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [shakeKey, setShakeKey] = useState(0);

  const frac = meta.maxL > 0 ? p.liters / meta.maxL : 0;
  const trackBg = `linear-gradient(90deg, var(--accent) ${frac * 100}%, var(--line) ${frac * 100}%)`;

  const submit = () => {
    const v = parseFloat(text.replace(",", "."));
    if (Number.isNaN(v)) {
      setError("Enter a valid number, e.g. 0.25");
      setShakeKey((k) => k + 1);
      return;
    }
    const err = p.onSetValue(v);
    setError(err);
    if (err) setShakeKey((k) => k + 1);
    else setText("");
  };

  return (
    <div className="panel p-5">
      {/* vessel selector */}
      <div className="flex items-baseline justify-between">
        <span className="kicker">01 · Vessel</span>
        <span className="font-mono text-[11px] text-[var(--sub)]">
          max {meta.maxL.toFixed(2)} L · {(meta.maxL * 1000).toFixed(0)} mL
        </span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5">
        {CONTAINERS.map((c) => {
          const active = c.id === p.activeId;
          return (
            <button
              key={c.id}
              onClick={() => p.onSelect(c.id)}
              className={`pressable flex flex-col items-center gap-1 rounded-md border px-1 py-2.5 ${
                active
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
                  : "border-[var(--line)] bg-[var(--panel2)] text-[var(--sub)] hover:border-[var(--line2)] hover:text-[var(--ink)]"
              }`}
              title={`${c.label} — ${c.maxL} L max`}
            >
              <VesselIcon id={c.id} size={20} />
              <span className="font-disp text-[11px] font-semibold leading-none">{c.label}</span>
              <span className="font-mono text-[9px] opacity-70">{c.maxL}L</span>
            </button>
          );
        })}
      </div>

      {/* slider */}
      <div className="mt-5 flex items-baseline justify-between">
        <span className="kicker">02 · Fill level</span>
        <span className="font-mono text-[11px] tabular text-[var(--sub)]">
          {p.liters.toFixed(3)} / {meta.maxL.toFixed(2)} L
        </span>
      </div>
      <input
        type="range"
        className="aqua-range mt-3"
        min={0}
        max={meta.maxL}
        step={meta.maxL >= 5 ? 0.01 : 0.001}
        value={Math.min(p.liters, meta.maxL)}
        style={{ background: trackBg }}
        onChange={(e) => p.onSlider(parseFloat(e.target.value))}
        onPointerUp={() => p.onCommit()}
        onKeyUp={(e) => {
          if (e.key.startsWith("Arrow")) p.onCommit();
        }}
        aria-label="Water volume in liters"
      />

      {/* manual entry */}
      <div className="mt-4 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder={`0 – ${meta.maxL}`}
          inputMode="decimal"
          className={`w-24 rounded-md border bg-[var(--panel2)] px-3 py-2 font-mono text-sm text-[var(--ink)] outline-none transition-colors placeholder:text-[var(--sub)]/60 focus:border-[var(--accent)] ${
            error ? "border-[var(--danger)]" : "border-[var(--line)]"
          }`}
        />
        <span className="font-mono text-xs text-[var(--sub)]">L</span>
        <button
          onClick={submit}
          className="pressable rounded-md border border-[var(--line2)] bg-[var(--panel2)] px-3.5 py-2 font-disp text-xs font-semibold text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Set exact
        </button>
        <div className="ml-auto flex gap-1.5">
          {[25, 50, 75, 100].map((q) => (
            <button
              key={q}
              onClick={() => p.onQuick(q / 100)}
              className="pressable rounded-md border border-[var(--line)] bg-[var(--panel2)] px-2 py-1.5 font-mono text-[11px] text-[var(--sub)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {q}%
            </button>
          ))}
          <button
            onClick={p.onRandom}
            className="pressable rounded-md border border-[var(--line)] bg-[var(--panel2)] px-2 py-1.5 text-[var(--sub)] hover:border-[var(--warm)] hover:text-[var(--warm)]"
            title="Random fill (normal draw)"
          >
            <DiceIcon size={14} />
          </button>
        </div>
      </div>
      <div className="h-5 pt-1">
        {error && (
          <p key={shakeKey} className="shake font-mono text-[11px] text-[var(--danger)]">
            ⚠ {error}
          </p>
        )}
      </div>

      {/* actions */}
      <div className="mt-2 grid grid-cols-3 gap-2">
        <button
          onClick={p.onPour}
          disabled={p.simRunning}
          className={`pressable col-span-1 flex items-center justify-center gap-2 rounded-md px-3 py-2.5 font-disp text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
            p.pouring
              ? "pouring-stripes bg-[var(--accent-deep)] text-[var(--accent-ink)]"
              : "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_6px_18px_-6px_var(--glow)] hover:bg-[var(--accent-deep)] hover:text-[var(--accent-ink)]"
          }`}
        >
          <DropIcon size={15} strokeWidth={2.2} />
          {p.pouring ? "Stop pour" : "Pour"}
        </button>
        <button
          onClick={p.onDrain}
          disabled={p.simRunning}
          className={`pressable flex items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-disp text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
            p.draining
              ? "pouring-stripes border-[var(--danger)] text-[var(--danger)]"
              : "border-[var(--line2)] text-[var(--ink)] hover:border-[var(--danger)] hover:text-[var(--danger)]"
          }`}
        >
          <WaveIcon size={15} strokeWidth={2.2} />
          {p.draining ? "Stop drain" : "Drain"}
        </button>
        <button
          onClick={p.onReset}
          className="group pressable flex items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 py-2.5 font-disp text-sm font-semibold text-[var(--sub)] hover:border-[var(--line2)] hover:text-[var(--ink)]"
        >
          <ResetIcon size={15} className="transition-transform duration-500 group-hover:-rotate-180" />
          Reset
        </button>
      </div>
    </div>
  );
}
