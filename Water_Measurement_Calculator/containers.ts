/* ────────────────────────────────────────────────
   Vessel catalogue — geometry + metadata
   Geometry lives in a 320 × 360 SVG viewBox, cx = 160.
   `pts` traces the inner cavity top → bottom as
   (y, halfWidth) pairs; the cavity polygon is mirrored.
   ──────────────────────────────────────────────── */

export interface Pt {
  y: number;
  hw: number;
}

export interface ContainerMeta {
  id: string;
  label: string;
  maxL: number;
  blurb: string;
  pts: Pt[];
  rimRy: number;
  extras: string[]; // handles, spouts, caps…
}

export const CX = 160;

export const CONTAINERS: ContainerMeta[] = [
  {
    id: "glass",
    label: "Glass",
    maxL: 0.35,
    blurb: "a short sip",
    rimRy: 8,
    pts: [
      { y: 70, hw: 58 },
      { y: 100, hw: 55 },
      { y: 285, hw: 45 },
      { y: 300, hw: 45 },
    ],
    extras: [],
  },
  {
    id: "mug",
    label: "Mug",
    maxL: 0.5,
    blurb: "one honest coffee",
    rimRy: 8,
    pts: [
      { y: 85, hw: 55 },
      { y: 275, hw: 51 },
      { y: 288, hw: 51 },
    ],
    extras: ["M 214 130 C 264 138 264 220 214 226"],
  },
  {
    id: "jug",
    label: "Jug",
    maxL: 2.0,
    blurb: "table-top refill",
    rimRy: 7,
    pts: [
      { y: 62, hw: 30 },
      { y: 110, hw: 50 },
      { y: 175, hw: 64 },
      { y: 255, hw: 62 },
      { y: 308, hw: 52 },
    ],
    extras: [
      "M 222 132 C 272 144 268 232 218 242",
      "M 138 60 L 112 42 L 146 52",
    ],
  },
  {
    id: "bottle",
    label: "Bottle",
    maxL: 1.5,
    blurb: "gym companion",
    rimRy: 5,
    pts: [
      { y: 36, hw: 14 },
      { y: 84, hw: 14 },
      { y: 92, hw: 16 },
      { y: 122, hw: 50 },
      { y: 150, hw: 56 },
      { y: 288, hw: 50 },
      { y: 304, hw: 40 },
    ],
    extras: ["M 141 12 h 38 v 23 h -38 Z", "M 141 20 h 38"],
  },
  {
    id: "bucket",
    label: "Bucket",
    maxL: 10.0,
    blurb: "deep-clean duty",
    rimRy: 9,
    pts: [
      { y: 82, hw: 74 },
      { y: 296, hw: 52 },
      { y: 308, hw: 50 },
    ],
    extras: ["M 92 84 A 68 62 0 0 1 228 84"],
  },
];

export const containerById = (id: string): ContainerMeta =>
  CONTAINERS.find((c) => c.id === id) ?? CONTAINERS[0];

export const maxHalfWidth = (meta: ContainerMeta): number =>
  meta.pts.reduce((m, p) => Math.max(m, p.hw), 0);

export const topY = (meta: ContainerMeta): number => meta.pts[0].y;
export const bottomY = (meta: ContainerMeta): number =>
  meta.pts[meta.pts.length - 1].y;

/** Interpolated half-width of the cavity at height y. */
export function halfWidthAt(meta: ContainerMeta, y: number): number {
  const pts = meta.pts;
  if (y <= pts[0].y) return pts[0].hw;
  for (let i = 1; i < pts.length; i++) {
    if (y <= pts[i].y) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const t = (y - p0.y) / (p1.y - p0.y || 1);
      return p0.hw + (p1.hw - p0.hw) * t;
    }
  }
  return pts[pts.length - 1].hw;
}

/** Closed cavity polygon path (right side down, left side up). */
export function cavityPath(meta: ContainerMeta): string {
  const right = meta.pts.map((p) => `L ${CX + p.hw} ${p.y}`);
  const left = [...meta.pts]
    .reverse()
    .map((p) => `L ${CX - p.hw} ${p.y}`);
  return `M ${CX + meta.pts[0].hw} ${meta.pts[0].y} ${right
    .slice(1)
    .join(" ")} ${left.join(" ")} Z`;
}

/* ── unit conversions (SI → imperial, for readout) ── */
export const conversions = (liters: number) => ({
  mL: liters * 1000,
  cups: liters / 0.236588,
  flOz: liters / 0.0295735,
  gal: liters / 3.78541,
});
