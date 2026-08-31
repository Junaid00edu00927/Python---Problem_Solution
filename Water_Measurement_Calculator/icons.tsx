import React from "react";

interface IconProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
}

const base = (p: IconProps) => ({
  width: p.size ?? 16,
  height: p.size ?? 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: p.strokeWidth ?? 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: p.className,
});

export const DropIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z" />
    <path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const MoonIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 13.5A8 8 0 0 1 10.5 4a8 8 0 1 0 9.5 9.5Z" />
  </svg>
);

export const CodeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.2 4.5l-2.4 15" />
  </svg>
);

export const DownloadIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4v10M8 10.5l4 4 4-4M4.5 19.5h15" />
  </svg>
);

export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </svg>
);

export const ResetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10a8 8 0 1 1 2 6.5" />
    <path d="M4 5v5h5" />
  </svg>
);

export const DiceIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
    <circle cx="9" cy="9" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="15" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="9" r="1.1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" />
  </svg>
);

export const WaveIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 8c2.4 0 2.4 2 4.8 2s2.4-2 4.7-2 2.4 2 4.8 2 2.3-2 4.7-2" />
    <path d="M2.5 14c2.4 0 2.4 2 4.8 2s2.4-2 4.7-2 2.4 2 4.8 2 2.3-2 4.7-2" />
  </svg>
);

/** Mini vessel silhouettes used by selector chips + history rows. */
export const VesselIcon = ({
  id,
  ...p
}: IconProps & { id: string }) => {
  const b = base(p);
  switch (id) {
    case "glass":
      return (
        <svg {...b}>
          <path d="M7 3.5h10l-1.4 17H8.4L7 3.5Z" />
          <path d="M7.7 9h8.6" />
        </svg>
      );
    case "mug":
      return (
        <svg {...b}>
          <path d="M5.5 5h10v13.5a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V5Z" />
          <path d="M15.5 8.5h1.6a2.7 2.7 0 0 1 0 5.4h-1.6" />
        </svg>
      );
    case "jug":
      return (
        <svg {...b}>
          <path d="M9.5 3h5l.9 3.4c2.2 1 3.6 3 3.6 5.6v6a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18v-6c0-2.6 1.4-4.6 3.6-5.6L9.5 3Z" />
          <path d="M19 10c1.6.7 2.4 1.9 2.4 3.4" />
        </svg>
      );
    case "bottle":
      return (
        <svg {...b}>
          <path d="M10 2.5h4V7l2.2 3.4V19a2.5 2.5 0 0 1-2.5 2.5h-3.4A2.5 2.5 0 0 1 7.8 19V10.4L10 7V2.5Z" />
          <path d="M7.8 13.5h8.4" />
        </svg>
      );
    default: // bucket
      return (
        <svg {...b}>
          <path d="M4.5 7.5h15L17.6 20a1.8 1.8 0 0 1-1.8 1.5H8.2A1.8 1.8 0 0 1 6.4 20L4.5 7.5Z" />
          <path d="M6.8 7.5c0-2.8 2.4-4.7 5.2-4.7s5.2 1.9 5.2 4.7" />
        </svg>
      );
  }
};
