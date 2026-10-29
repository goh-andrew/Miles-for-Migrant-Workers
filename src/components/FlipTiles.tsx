import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../hooks";

type Props = {
  /** The figure as it should read when settled, e.g. "70.19" or "5067". */
  value: string;
  /** Replays the flip whenever this becomes true (the panel arrives). */
  active: boolean;
  /** Set before the digits, e.g. "$". */
  prefix?: string;
  /** Set after the digits, e.g. "km". */
  unit?: string;
  /** Spoken in place of the tiles. */
  label: string;
};

const DIGITS = "0123456789";

/**
 * Split-flap number tiles on the site signboard. Each digit flips through a
 * few faces and lands on its value, left to right.
 */
export function FlipTiles({ value, active, prefix, unit, label }: Props) {
  const reduced = usePrefersReducedMotion();
  const [faces, setFaces] = useState<string[]>(() => value.split(""));
  const [flipping, setFlipping] = useState<boolean[]>(() => value.split("").map(() => false));
  const timers = useRef<number[]>([]);
  const first = useRef(true);

  useEffect(() => {
    const target = value.split("");
    timers.current.forEach(clearTimeout);
    timers.current = [];

    if (reduced || (!active && !first.current)) {
      setFaces(target);
      setFlipping(target.map(() => false));
      return;
    }
    if (!active) return;
    first.current = false;

    // Each digit shows `steps` intermediate faces before its own.
    target.forEach((ch, i) => {
      if (!DIGITS.includes(ch)) return;
      const steps = 3 + i;
      for (let s = 0; s <= steps; s++) {
        const t = window.setTimeout(
          () => {
            const face = s === steps ? ch : DIGITS[(Number(ch) + s + 1 + i) % 10];
            setFaces((prev) => {
              const next = [...prev];
              next[i] = face;
              return next;
            });
            setFlipping((prev) => {
              const next = [...prev];
              next[i] = !next[i];
              return next;
            });
          },
          250 + i * 90 + s * 110,
        );
        timers.current.push(t);
      }
    });
    return () => timers.current.forEach(clearTimeout);
  }, [value, active, reduced]);

  // Keep the face count in step with the value (the pledge dial changes length).
  const chars = value.split("");
  const shown = chars.map((ch, i) => (DIGITS.includes(ch) ? (faces[i] ?? ch) : ch));

  return (
    <div className="tiles" role="img" aria-label={label}>
      {prefix && <span className="tile-unit">{prefix}</span>}
      {shown.map((ch, i) => (
        <span
          key={`${i}-${flipping[i] ? "a" : "b"}`}
          className={`tile${DIGITS.includes(chars[i]) ? "" : " narrow"}${active && !reduced ? " flip" : ""}`}
          aria-hidden="true"
        >
          <span>{ch}</span>
        </span>
      ))}
      {unit && <span className="tile-unit">{unit}</span>}
    </div>
  );
}
