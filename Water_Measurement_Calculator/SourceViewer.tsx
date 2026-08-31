import React, { useEffect, useMemo, useState } from "react";
// The app's own source, bundled verbatim via Vite ?raw imports
import appSrc from "../App.tsx?raw";
import dsSrc from "../lib/dataScience.ts?raw";
import vizSrc from "../components/VesselViz.tsx?raw";
import cssSrc from "../index.css?raw";

const FILES = [
  { name: "App.tsx", src: appSrc },
  { name: "VesselViz.tsx", src: vizSrc },
  { name: "dataScience.ts", src: dsSrc },
  { name: "index.css", src: cssSrc },
];

const MASTER =
  /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(`(?:\\[\s\S]|[^\\`])*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|\b(0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b|\b(const|let|var|function|return|if|else|for|while|do|import|from|export|default|new|type|interface|extends|implements|class|async|await|switch|case|break|continue|typeof|instanceof|in|of|null|undefined|true|false|this|void|try|catch|finally|throw|keyof|readonly|enum|as|satisfies)\b|([A-Za-z_$][\w$]*)/g;

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let lastIdx = 0;
  let k = 0;
  for (const m of code.matchAll(MASTER)) {
    const idx = m.index ?? 0;
    if (idx > lastIdx) out.push(code.slice(lastIdx, idx));
    const tok = m[0];
    if (m[1]) out.push(<span key={k++} className="hl-com">{tok}</span>);
    else if (m[2]) out.push(<span key={k++} className="hl-str">{tok}</span>);
    else if (m[3]) out.push(<span key={k++} className="hl-num">{tok}</span>);
    else if (m[4]) out.push(<span key={k++} className="hl-kw">{tok}</span>);
    else if (m[5]) {
      const next = code[idx + tok.length];
      if (next === "(") out.push(<span key={k++} className="hl-fn">{tok}</span>);
      else if (/^[A-Z]/.test(tok)) out.push(<span key={k++} className="hl-typ">{tok}</span>);
      else out.push(tok);
    }
    lastIdx = idx + tok.length;
  }
  if (lastIdx < code.length) out.push(code.slice(lastIdx));
  return out;
}

export default function SourceViewer({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const file = FILES[tab];

  const nodes = useMemo(() => highlight(file.src), [file]);
  const loc = useMemo(() => file.src.split("\n").length, [file]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(file.src);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[#04141b]/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[var(--line2)] bg-[#07202a] shadow-2xl">
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-[#123a48] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-[#e0715f]" />
          <span className="h-3 w-3 rounded-full bg-[#e8a13a]" />
          <span className="h-3 w-3 rounded-full bg-[#4cc38a]" />
          <span className="ml-3 font-mono text-[11px] text-[#7fa3ae]">
            aqualab-v2.0 — source
          </span>
          <span className="ml-auto rounded border border-[#1d4c5d] px-2 py-0.5 font-mono text-[10px] text-[#7fa3ae]">
            {loc} LOC
          </span>
          <button
            onClick={copy}
            className="pressable rounded border border-[#1d4c5d] px-2.5 py-1 font-mono text-[11px] text-[#8fd99a] hover:border-[#8fd99a]"
          >
            {copied ? "copied ✓" : "copy file"}
          </button>
          <button
            onClick={onClose}
            className="pressable rounded px-2 py-0.5 font-mono text-sm text-[#7fa3ae] hover:text-white"
            aria-label="Close source viewer"
          >
            ✕
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#123a48] bg-[#082531] px-3 pt-2">
          {FILES.map((f, i) => (
            <button
              key={f.name}
              onClick={() => setTab(i)}
              className={`whitespace-nowrap rounded-t-md px-3.5 py-1.5 font-mono text-[11.5px] transition-colors ${
                i === tab
                  ? "bg-[#07202a] text-[#59c9de]"
                  : "text-[#7fa3ae] hover:text-[#c9e4ec]"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* code */}
        <div className="nice-scroll codebox flex-1 overflow-auto p-4 text-[12.5px] leading-[1.65]">
          <pre className="whitespace-pre">{nodes}<span className="blink text-[#59c9de]">▍</span></pre>
        </div>

        <div className="border-t border-[#123a48] px-4 py-2 font-mono text-[10px] text-[#58808d]">
          bundled verbatim with Vite `?raw` imports · Esc to close
        </div>
      </div>
    </div>
  );
}
