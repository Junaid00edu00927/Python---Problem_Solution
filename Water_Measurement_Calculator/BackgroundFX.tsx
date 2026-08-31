import React from "react";

/* Deterministic pseudo-random field so SSR/CSR renders agree. */
const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61 + 7) % 100,
  size: 7 + ((i * 37) % 22),
  dur: 15 + ((i * 53) % 17),
  delay: -((i * 29) % 22),
  op: 0.1 + ((i * 13) % 14) / 100,
}));

export default function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* lab grid */}
      <div className="labgrid absolute inset-0" />

      {/* drifting caustic light bands */}
      <svg
        className="absolute -inset-[8%] h-[116%] w-[116%]"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <path className="caustic c1" d="M -80 260 C 240 140, 480 400, 1080 240" />
        <path className="caustic c2" d="M -80 620 C 300 500, 620 760, 1080 580" />
        <path className="caustic c3" d="M -80 880 C 260 800, 700 980, 1080 860" />
      </svg>

      {/* rising bubbles */}
      {BUBBLES.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            opacity: b.op,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}

      {/* vignette to blend edges into the page bg */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 90% at 50% 30%, transparent 55%, var(--bg) 100%)",
        }}
      />
    </div>
  );
}
