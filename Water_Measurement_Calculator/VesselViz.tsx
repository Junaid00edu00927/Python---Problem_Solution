import React, { useEffect, useRef, useState } from "react";
import {
  ContainerMeta,
  CX,
  cavityPath,
  halfWidthAt,
  topY,
  bottomY,
  maxHalfWidth,
} from "../lib/containers";

interface Bubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  wob: number;
  ph: number;
}

interface Props {
  meta: ContainerMeta;
  pct: number; // target fill fraction 0..1
  pouring: boolean;
  draining: boolean;
  splash: number; // increment to trigger a surface impulse
}

/**
 * Live vessel renderer — layered sine surface, rising bubbles,
 * pour stream + nozzle, graduation ticks and a floating level tag.
 * All motion is one rAF loop; React only re-renders this subtree.
 */
export default function VesselViz({ meta, pct, pouring, draining, splash }: Props) {
  const [, setTick] = useState(0);
  const fillRef = useRef(0);
  const phaseRef = useRef(0);
  const ampRef = useRef(2);
  const impulseRef = useRef(0);
  const bubblesRef = useRef<Bubble[]>([]);
  const propsRef = useRef({ meta, pct, pouring, draining });
  propsRef.current = { meta, pct, pouring, draining };

  useEffect(() => {
    if (splash > 0) impulseRef.current = 11;
  }, [splash]);

  // fresh vessel → clear water + bubbles instantly
  useEffect(() => {
    fillRef.current = 0;
    bubblesRef.current = [];
  }, [meta.id]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = propsRef.current;
      const m = p.meta;
      const tY = topY(m);
      const bY = bottomY(m);

      // smoothed fill chase
      fillRef.current +=
        (p.pct - fillRef.current) * (1 - Math.exp(-dt * 5.2));
      if (Math.abs(p.pct - fillRef.current) < 0.0005) fillRef.current = p.pct;

      // surface energy
      phaseRef.current += dt * (p.pouring ? 5.6 : p.draining ? 3.6 : 1.4);
      const ampTarget = p.pouring ? 6.4 : p.draining ? 4.6 : 1.9;
      impulseRef.current *= Math.exp(-dt * 2.4);
      ampRef.current +=
        (ampTarget + impulseRef.current - ampRef.current) *
        (1 - Math.exp(-dt * 7));

      // bubbles
      const levelY = bY - fillRef.current * (bY - tY);
      const hw = maxHalfWidth(m);
      const bs = bubblesRef.current;
      if (fillRef.current > 0.05) {
        const spawn = p.pouring ? 0.85 : 0.06;
        if (Math.random() < spawn) {
          const cx0 = p.pouring ? CX + (Math.random() - 0.5) * 16 : CX;
          bs.push({
            x: cx0 + (Math.random() - 0.5) * hw * (p.pouring ? 0.5 : 1.2),
            y: bY - 6 - Math.random() * 10,
            r: 1.6 + Math.random() * 3.4,
            vy: 26 + Math.random() * 46,
            wob: 0.6 + Math.random() * 1.4,
            ph: Math.random() * 6.28,
          });
        }
      }
      for (let i = bs.length - 1; i >= 0; i--) {
        const b = bs[i];
        b.y -= b.vy * dt;
        b.x += Math.sin(now / 1000 * b.wob * 4 + b.ph) * 0.35;
        if (b.y < levelY + 3 || bs.length > 34) bs.splice(i, 1);
      }

      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ── render geometry ─────────────────────────── */
  const tY = topY(meta);
  const bY = bottomY(meta);
  const hw = maxHalfWidth(meta);
  const fill = fillRef.current;
  const phase = phaseRef.current;
  const amp = ampRef.current;
  const levelY = bY - fill * (bY - tY);
  const isBottle = meta.id === "bottle";
  const streamTop = isBottle ? 38 : 26;
  const rimHw = meta.pts[0].hw;

  const wavePath = (a: number, ph: number, yOff: number): string => {
    const y0 = levelY + yOff;
    const x0 = CX - hw - 26;
    const x1 = CX + hw + 26;
    let d = `M ${x0} ${y0}`;
    for (let x = x0; x <= x1; x += 8) {
      const y =
        y0 +
        Math.sin(x * 0.045 + ph) * a +
        Math.sin(x * 0.021 - ph * 0.7) * a * 0.5;
      d += ` L ${x.toFixed(1)} ${y.toFixed(2)}`;
    }
    d += ` L ${x1} ${bY + 40} L ${x0} ${bY + 40} Z`;
    return d;
  };

  const lvlHw = halfWidthAt(meta, levelY);
  const ticks = [0.25, 0.5, 0.75, 1];
  const clipId = `cav-${meta.id}`;
  const gradId = `wg-${meta.id}`;
  const displayPct = Math.round(fill * 100);

  return (
    <svg viewBox="0 0 320 346" className="mx-auto w-full max-w-[350px] select-none">
      <defs>
        <clipPath id={clipId}>
          <path d={cavityPath(meta)} />
        </clipPath>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--water-a)" />
          <stop offset="100%" stopColor="var(--water-b)" />
        </linearGradient>
      </defs>

      {/* bench shadow */}
      <ellipse cx={CX} cy={bY + 13} rx={hw * 0.92} ry={8} fill="var(--line)" opacity={0.55} />

      {/* ── water (clipped to cavity) ── */}
      <g clipPath={`url(#${clipId})`}>
        {fill > 0.004 && (
          <>
            <path d={wavePath(amp * 0.62, phase * 1.7 + 2.1, -3)} fill="var(--water-c)" opacity={0.32} />
            <path d={wavePath(amp, phase, 0)} fill={`url(#${gradId})`} />
            {/* light streak */}
            <path
              d={`M ${CX - lvlHw + 9} ${levelY + 10} L ${CX - lvlHw + 19} ${levelY + 12} L ${CX - lvlHw + 15} ${bY - 8} L ${CX - lvlHw + 6} ${bY - 8} Z`}
              fill="#ffffff"
              opacity={0.14}
            />
            <ellipse cx={CX} cy={bY - 7} rx={hw * 0.66} ry={11} fill="var(--water-c)" opacity={0.16} />
            {/* bubbles */}
            {bubblesRef.current.map((b, i) => (
              <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="rgba(255,255,255,0.4)" />
            ))}
          </>
        )}
      </g>

      {/* level guide + floating tag */}
      {fill > 0.006 && (
        <g>
          <line
            x1={CX - lvlHw + 2}
            y1={levelY}
            x2={CX + lvlHw - 2}
            y2={levelY}
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={1.2}
            strokeDasharray="4 3"
          />
          <line
            x1={CX - hw - 6}
            y1={levelY}
            x2={CX - lvlHw}
            y2={levelY}
            stroke="var(--sub)"
            strokeWidth={1}
            strokeDasharray="2 3"
            opacity={0.7}
          />
          <g>
            <rect
              x={CX - hw - 50}
              y={levelY - 10}
              width={44}
              height={20}
              rx={5}
              fill="var(--accent)"
            />
            <text
              x={CX - hw - 28}
              y={levelY + 4}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fontWeight={700}
              fill="var(--accent-ink)"
            >
              {displayPct}%
            </text>
          </g>
        </g>
      )}

      {/* ── pour stream ── */}
      {pouring && (
        <g>
          {!isBottle && (
            <>
              <rect x={CX - 11} y={4} width={22} height={18} rx={4} fill="var(--panel2)" stroke="var(--accent-deep)" strokeWidth={2} />
              <rect x={CX - 5} y={20} width={10} height={7} rx={2} fill="var(--accent-deep)" />
            </>
          )}
          {(() => {
            const sBot = Math.max(levelY, tY - 6);
            const mid = (streamTop + sBot) / 2;
            const w = Math.sin(phase * 2.2) * 2.2;
            return (
              <>
                <path
                  d={`M ${CX - 3.5} ${streamTop}
                      C ${CX - 4.6 + w} ${mid}, ${CX - 2 - w} ${mid}, ${CX - 3.8} ${sBot}
                      L ${CX + 3.8} ${sBot}
                      C ${CX + 2 + w} ${mid}, ${CX + 4.6 - w} ${mid}, ${CX + 3.5} ${streamTop} Z`}
                  fill="var(--water-a)"
                  opacity={0.82}
                />
                {[0, 1, 2].map((i) => {
                  const span = Math.max(18, sBot - streamTop - 8);
                  const dy = streamTop + 5 + ((phase * 170 + i * 57) % span);
                  return (
                    <circle key={i} cx={CX + (i - 1) * 8} cy={dy} r={1.8} fill="var(--water-c)" opacity={0.85} />
                  );
                })}
                {fill > 0.02 && (
                  <ellipse
                    cx={CX}
                    cy={levelY}
                    rx={6 + ((phase * 52) % 22)}
                    ry={2.4}
                    fill="none"
                    stroke="var(--water-c)"
                    strokeWidth={1.4}
                    opacity={Math.max(0, 0.7 - ((phase * 52) % 22) / 30)}
                  />
                )}
              </>
            );
          })()}
        </g>
      )}

      {/* ── vessel outline + extras ── */}
      <path d={cavityPath(meta)} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinejoin="round" />
      {meta.extras.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
      ))}
      <ellipse cx={CX} cy={tY} rx={rimHw} ry={meta.rimRy} fill="var(--panel)" stroke="var(--accent)" strokeWidth={3} />

      {/* graduation ticks */}
      {ticks.map((f) => {
        const y = bY - f * (bY - tY);
        const tw = halfWidthAt(meta, y);
        const lbl = meta.maxL >= 5 ? (meta.maxL * f).toFixed(1) : (meta.maxL * f).toFixed(2);
        return (
          <g key={f}>
            <line x1={CX - tw + 3} y1={y} x2={CX - tw + 15} y2={y} stroke="var(--sub)" strokeWidth={1.1} opacity={0.85} />
            <line x1={CX + tw - 3} y1={y} x2={CX + tw - 15} y2={y} stroke="var(--sub)" strokeWidth={1.1} opacity={0.85} />
            <text
              x={CX + tw + 9}
              y={y + 3.4}
              fontFamily="var(--font-mono)"
              fontSize={9.5}
              fill="var(--sub)"
            >
              {lbl}L
            </text>
          </g>
        );
      })}

      {/* caption */}
      <text
        x={CX}
        y={bY + 34}
        textAnchor="middle"
        fontFamily="var(--font-disp)"
        fontSize={12}
        fontWeight={700}
        letterSpacing={4}
        fill="var(--sub)"
      >
        {meta.label.toUpperCase()}
      </text>
    </svg>
  );
}
