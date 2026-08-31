import React, { useCallback, useEffect, useRef, useState } from "react";
import { CONTAINERS, containerById, conversions } from "./lib/containers";
import {
  SessionRow,
  describe,
  simulatePlan,
  toCSV,
  triggerDownload,
} from "./lib/dataScience";
import { useAnimatedNumber } from "./hooks/useAnimatedNumber";
import { useReveal } from "./hooks/useReveal";
import BackgroundFX from "./components/BackgroundFX";
import VesselViz from "./components/VesselViz";
import Controls from "./components/Controls";
import StatsPanel from "./components/StatsPanel";
import Charts from "./components/Charts";
import HistoryTable from "./components/HistoryTable";
import SourceViewer from "./components/SourceViewer";
import {
  CodeIcon,
  DownloadIcon,
  DropIcon,
  MoonIcon,
  PlayIcon,
  SunIcon,
} from "./components/icons";

/* ── status zones (mirrors v1.0 messages) ─────────── */
function zoneFor(frac: number, label: string, liters: number) {
  const L = liters.toFixed(3);
  if (frac <= 0.0005)
    return { color: "var(--sub)", tag: "EMPTY", msg: "Vessel is empty — pour, slide, or set an exact volume." };
  if (frac < 0.25)
    return { color: "var(--warm)", tag: "LOW", msg: `Low water — ${L} L filled in the ${label.toLowerCase()}.` };
  if (frac < 0.75)
    return { color: "var(--accent)", tag: "STEADY", msg: `Half-filled — ${L} L sitting in the ${label.toLowerCase()}.` };
  if (frac < 0.999)
    return { color: "var(--accent-deep)", tag: "NEARLY FULL", msg: `Nearly full — ${L} L, mind the rim!` };
  return { color: "var(--good)", tag: "FULL", msg: `${label} is completely full — ${L} L. Surface tension holding.` };
}

function ExportButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => {
        onClick();
        setSaved(true);
        setTimeout(() => setSaved(false), 1400);
      }}
      className="pressable flex items-center gap-1.5 rounded-md border border-[var(--line2)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[11px] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <DownloadIcon size={13} />
      {saved ? "saved ✓" : label}
    </button>
  );
}

export default function App() {
  /* ── state ─────────────────────────────────────── */
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("aqualab-theme") as "dark" | "light") || "dark"
  );
  const [containerId, setContainerId] = useState("glass");
  const [liters, setLiters] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [draining, setDraining] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  const [history, setHistory] = useState<SessionRow[]>([]);
  const [splash, setSplash] = useState(0);
  const [sourceOpen, setSourceOpen] = useState(false);

  const meta = containerById(containerId);
  const litersRef = useRef(liters);
  litersRef.current = liters;
  const activeRef = useRef(containerId);
  activeRef.current = containerId;
  const idRef = useRef(1);
  const simTimers = useRef<number[]>([]);

  /* ── theme ─────────────────────────────────────── */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("aqualab-theme", theme);
  }, [theme]);

  /* ── logging (pandas-style append) ─────────────── */
  const log = useCallback((cid: string, L: number) => {
    setHistory((h) => {
      const m = containerById(cid);
      const pct = Math.round(Math.min(100, (L / m.maxL) * 100) * 10) / 10;
      const prev = h[h.length - 1];
      const row: SessionRow = {
        id: idRef.current++,
        t: Date.now(),
        container: cid,
        liters: Math.round(L * 1000) / 1000,
        pct,
        delta: Math.round((L - (prev ? prev.liters : 0)) * 1000) / 1000,
      };
      const next = [...h, row];
      return next.length > 240 ? next.slice(next.length - 240) : next;
    });
    setSplash((s) => s + 1);
  }, []);

  /* ── pour / drain engine ───────────────────────── */
  useEffect(() => {
    if (!pouring && !draining) return;
    let raf = 0;
    let last = performance.now();
    const m = containerById(activeRef.current);
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setLiters((prev) => {
        let next = pouring
          ? prev + m.maxL * 0.38 * dt
          : prev - m.maxL * 0.55 * dt;
        if (pouring) next = Math.min(next, m.maxL);
        if (draining) next = Math.max(next, 0);
        return next;
      });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pouring, draining]);

  // boundary stops
  useEffect(() => {
    if (pouring && liters >= meta.maxL - 1e-9) setPouring(false);
    if (draining && liters <= 1e-9) setDraining(false);
  }, [liters, pouring, draining, meta.maxL]);

  // log when a pour/drain run ends (transition true → false)
  const prevPour = useRef(false);
  const prevDrain = useRef(false);
  useEffect(() => {
    if (prevPour.current && !pouring && litersRef.current > 0.0005)
      log(activeRef.current, litersRef.current);
    prevPour.current = pouring;
  }, [pouring, log]);
  useEffect(() => {
    if (prevDrain.current && !draining) log(activeRef.current, litersRef.current);
    prevDrain.current = draining;
  }, [draining, log]);

  /* ── handlers ──────────────────────────────────── */
  const selectContainer = (id: string) => {
    setPouring(false);
    setDraining(false);
    setContainerId(id);
    setLiters(0);
    setSplash((s) => s + 1);
  };

  const onSlider = (v: number) => setLiters(v);
  const onCommit = () => {
    const v = litersRef.current;
    if (v <= 0.0005) return;
    const last = history[history.length - 1];
    // skip no-change commits (e.g. bare clicks on the slider track)
    if (last && last.container === activeRef.current && Math.abs(last.liters - v) < 0.0005) return;
    log(activeRef.current, v);
  };

  const onSetValue = (v: number): string | null => {
    if (v < 0 || v > meta.maxL)
      return `Value must be between 0 and ${meta.maxL} L`;
    setPouring(false);
    setDraining(false);
    setLiters(v);
    log(containerId, v);
    return null;
  };

  const onQuick = (frac: number) => {
    setPouring(false);
    setDraining(false);
    const v = Math.round(meta.maxL * frac * 1000) / 1000;
    setLiters(v);
    log(containerId, v);
  };

  const onRandom = () => {
    const f = Math.min(1, Math.max(0.06, ((Math.random() + Math.random()) / 2) * 1.15));
    const v = Math.round(meta.maxL * f * 1000) / 1000;
    setPouring(false);
    setDraining(false);
    setLiters(v);
    log(containerId, v);
  };

  const togglePour = () => {
    if (draining) setDraining(false);
    if (!pouring && liters >= meta.maxL - 1e-6) {
      setSplash((s) => s + 1); // already full — ripple feedback
      return;
    }
    setPouring((p) => !p);
  };

  const toggleDrain = () => {
    if (pouring) setPouring(false);
    if (!draining && liters <= 1e-6) return; // already empty
    setDraining((d) => !d);
  };

  const onReset = () => {
    setPouring(false);
    setDraining(false);
    setLiters(0);
    setSplash((s) => s + 1);
  };

  /* ── session simulator (numpy-flavoured draws) ── */
  const simulate = () => {
    if (simRunning) return;
    setSimRunning(true);
    setPouring(false);
    setDraining(false);
    const plan = simulatePlan(
      10,
      CONTAINERS.map((c) => ({
        id: c.id,
        maxL: c.maxL,
        weight:
          c.id === "glass" ? 3 : c.id === "mug" ? 2.2 : c.id === "bottle" ? 2 : c.id === "jug" ? 1.6 : 1.2,
      }))
    );
    plan.forEach((s, i) => {
      const t = window.setTimeout(() => {
        setContainerId(s.containerId);
        setLiters(s.liters);
        log(s.containerId, s.liters);
        if (i === plan.length - 1) setSimRunning(false);
      }, 350 + i * 640);
      simTimers.current.push(t);
    });
  };

  useEffect(() => () => simTimers.current.forEach(clearTimeout), []);

  /* ── export ────────────────────────────────────── */
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const exportCSV = () =>
    triggerDownload(`aqualab_session_${stamp}.csv`, toCSV(history), "text/csv");
  const exportJSON = () =>
    triggerDownload(
      `aqualab_session_${stamp}.json`,
      JSON.stringify(
        {
          generated: new Date().toISOString(),
          describe_liters: describe(history.map((r) => r.liters)),
          rows: history,
        },
        null,
        2
      ),
      "application/json"
    );

  /* ── derived ───────────────────────────────────── */
  const animatedL = useAnimatedNumber(liters, 9);
  const frac = meta.maxL > 0 ? liters / meta.maxL : 0;
  const zone = zoneFor(frac, meta.label, liters);
  const conv = conversions(animatedL);
  const analytics = useReveal<HTMLDivElement>(0.08);
  const top = useReveal<HTMLDivElement>(0.05);

  return (
    <div className="relative min-h-screen font-sans text-[var(--ink)]">
      <BackgroundFX />

      {/* ── header ─────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <span className="flex h-9 w-9 rotate-3 items-center justify-center rounded-md bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_4px_18px_-4px_var(--glow)] transition-transform hover:rotate-0">
            <DropIcon size={20} strokeWidth={2} />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="font-disp text-lg font-bold tracking-tight">AQUALAB</span>
              <span className="rounded border border-[var(--accent)] px-1.5 py-px font-mono text-[10px] font-semibold text-[var(--accent)]">
                v2.0
              </span>
            </div>
            <span className="kicker" style={{ fontSize: 9 }}>water measurement studio</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSourceOpen(true)}
              className="pressable flex items-center gap-1.5 rounded-md border border-[var(--line2)] px-3 py-1.5 font-mono text-[11px] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              <CodeIcon size={13} />
              <span className="hidden sm:inline">source</span>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="pressable flex items-center gap-1.5 rounded-md border border-[var(--line2)] px-3 py-1.5 font-mono text-[11px] text-[var(--ink)] hover:border-[var(--warm)] hover:text-[var(--warm)]"
              title="Toggle theme"
            >
              {theme === "dark" ? <SunIcon size={13} /> : <MoonIcon size={13} />}
              <span className="hidden sm:inline">{theme === "dark" ? "light" : "dark"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── main instrument ────────────────────────── */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div ref={top.ref} className={`reveal ${top.on ? "on" : ""} mt-6 grid gap-4 lg:grid-cols-12`}>
          {/* stage */}
          <div className="panel relative flex flex-col overflow-hidden p-5 lg:col-span-7">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,var(--accent-soft),transparent)]" />
            <div className="relative flex items-center justify-between">
              <span className="kicker">live vessel · svg @ 60 fps</span>
              <span
                className="flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--panel2)] px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest"
                style={{ color: zone.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: zone.color, boxShadow: `0 0 8px ${zone.color}` }}
                />
                {zone.tag}
              </span>
            </div>

            <div className="relative mt-2 flex-1">
              <VesselViz
                meta={meta}
                pct={frac}
                pouring={pouring}
                draining={draining}
                splash={splash}
              />
            </div>

            {/* readout */}
            <div className="relative mt-3 grid gap-4 rounded-md border border-[var(--line)] bg-[var(--panel2)] p-4 sm:grid-cols-[auto_1fr]">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="tabular font-disp text-[44px] font-bold leading-none tracking-tight">
                    {animatedL.toFixed(3)}
                  </span>
                  <span className="font-disp text-xl font-semibold text-[var(--accent)]">L</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--sub)]">
                  of {meta.maxL.toFixed(2)} L · {meta.blurb}
                </div>
              </div>
              <div className="grid grid-cols-2 content-center gap-x-6 gap-y-1.5 sm:grid-cols-4">
                {[
                  { k: "milliliters", v: `${conv.mL.toFixed(0)}`, u: "mL" },
                  { k: "us cups", v: conv.cups.toFixed(2), u: "cup" },
                  { k: "fluid oz", v: conv.flOz.toFixed(1), u: "fl oz" },
                  { k: "us gallons", v: conv.gal.toFixed(3), u: "gal" },
                ].map((c) => (
                  <div key={c.k}>
                    <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--sub)]">{c.k}</div>
                    <div className="tabular font-mono text-sm font-semibold">
                      {c.v} <span className="text-[10px] font-normal text-[var(--sub)]">{c.u}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* status line */}
            <div className="relative mt-3 flex items-center gap-2 font-mono text-[11.5px] text-[var(--sub)]">
              <span className="inline-block h-3 w-1 rounded-sm" style={{ background: zone.color }} />
              <span className="font-semibold" style={{ color: zone.color }}>[{zone.tag}]</span>
              <span>{zone.msg}</span>
            </div>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Controls
              activeId={containerId}
              liters={liters}
              pouring={pouring}
              draining={draining}
              simRunning={simRunning}
              onSelect={selectContainer}
              onSlider={onSlider}
              onCommit={onCommit}
              onSetValue={onSetValue}
              onQuick={onQuick}
              onRandom={onRandom}
              onPour={togglePour}
              onDrain={toggleDrain}
              onReset={onReset}
            />
            <StatsPanel rows={history} />

            <div className="panel flex items-center gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">
                <PlayIcon size={15} />
              </span>
              <p className="text-xs leading-relaxed text-[var(--sub)]">
                <span className="font-semibold text-[var(--ink)]">Tip —</span> hold{" "}
                <span className="font-mono text-[var(--accent)]">Pour</span> and watch the surface
                turbulence rise, or fire the session simulator below to feed the charts
                ten statistically-drawn pours.
              </p>
            </div>
          </div>
        </div>

        {/* ── analytics ─────────────────────────────── */}
        <div ref={analytics.ref} className={`reveal ${analytics.on ? "on" : ""} mt-10`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="kicker">session analytics</span>
              <h2 className="mt-1 font-disp text-2xl font-bold tracking-tight sm:text-3xl">
                Every pour becomes data<span className="text-[var(--accent)]">.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={simulate}
                disabled={simRunning}
                className={`pressable flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-disp text-xs font-bold disabled:cursor-wait ${
                  simRunning
                    ? "pouring-stripes bg-[var(--accent-deep)] text-[var(--accent-ink)]"
                    : "bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_6px_18px_-6px_var(--glow)]"
                }`}
              >
                <PlayIcon size={13} strokeWidth={2.2} />
                {simRunning ? "simulating…" : "simulate 10 pours"}
              </button>
              <ExportButton label="to_csv()" onClick={exportCSV} />
              <ExportButton label="to_json()" onClick={exportJSON} />
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Charts rows={history} />
            </div>
            <div className="lg:col-span-5">
              <HistoryTable rows={history} />
            </div>
          </div>
        </div>
      </main>

      {/* ── footer ─────────────────────────────────── */}
      <footer className="relative z-10 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--bg)_70%,transparent)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 font-mono text-[10.5px] text-[var(--sub)] sm:px-6">
          <span>AquaLab v2.0 — rebuilt from the Tkinter original for the web</span>
          <span>numpy-style stats · pandas-style export · static build, deploy anywhere</span>
        </div>
      </footer>

      {sourceOpen && <SourceViewer onClose={() => setSourceOpen(false)} />}
    </div>
  );
}
