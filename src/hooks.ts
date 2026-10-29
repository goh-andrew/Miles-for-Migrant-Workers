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
 * Width of the route spine, and the scale that fits a 1920px-wide section into the
 * column beside it.
 */
export function usePageLayout() {
  const measure = () => {
    const w = document.documentElement.clientWidth;
    const spineW = Math.round(Math.min(420, Math.max(260, w * 0.2)));
    return { spineW, k: (w - spineW) / 1920 };
  };
  const [layout, setLayout] = useState(measure);
  useEffect(() => {
    const on = () => setLayout(measure());
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return layout;
}
