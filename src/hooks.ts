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

/** Below this width the page drops the route spine and uses the phone layout. */
export const useIsNarrow = () => useMedia("(max-width: 1099px)");

/**
 * Width of the route spine, the scale that fits a 1920px-wide section into the column
 * beside it, and how tall that section's board must be (in board px) to fill the
 * screen under a top bar of headH.
 */
export function usePageLayout(headH: number) {
  const measure = () => {
    const w = document.documentElement.clientWidth;
    const spineW = Math.round(Math.min(420, Math.max(260, w * 0.2)));
    const k = (w - spineW) / 1920;
    const wallH = Math.max(880, Math.round((window.innerHeight - headH) / k));
    return { spineW, k, wallH };
  };
  const [layout, setLayout] = useState(measure);
  useEffect(() => {
    const on = () => setLayout(measure());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
    // headH is fixed for the page's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return layout;
}
