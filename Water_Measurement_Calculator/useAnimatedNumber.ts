import { useEffect, useRef, useState } from "react";

/** Smoothly chases `target` with an exponential ease (rAF driven). */
export function useAnimatedNumber(target: number, speed = 7): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const targetRef = useRef(target);
  const rafRef = useRef(0);

  targetRef.current = target;

  useEffect(() => {
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const diff = targetRef.current - displayRef.current;
      if (Math.abs(diff) < 0.0004) {
        displayRef.current = targetRef.current;
        setDisplay(targetRef.current);
        return;
      }
      displayRef.current += diff * (1 - Math.exp(-dt * speed));
      setDisplay(displayRef.current);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, speed]);

  return display;
}
