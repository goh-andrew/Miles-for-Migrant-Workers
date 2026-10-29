import { useEffect, useState } from "react";

function useMedia(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatches(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return matches;
}

export const usePrefersReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

/** Below this width the deck becomes a scrolling page with a sticky walkway. */
export const useIsNarrow = () => useMedia("(max-width: 899px)");

/** Scale that fits the 1920 x 1080 canvas inside the window. */
export function useCanvasScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  return scale;
}
