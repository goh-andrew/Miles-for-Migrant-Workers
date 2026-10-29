import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

const TOP = 36; // space above the first checkpoint
const FOOT = 216; // room under the route for the readout and buttons
const LABEL_GAP = 84; // closest two stage labels may sit
const STAGE_INFO = [
  { when: "March 2026", what: "Choosing a cause" },
  { when: "March to May 2026", what: "Roles, goals, the MWLC" },
  { when: "April to June 2026", what: "Outreach and the ride" },
  { when: "June to August 2026", what: "What we raised and learnt" },
  { when: "Tonight", what: "Sharing it with you" },
];

/** The route wanders a little, like the coast road. */
const waveX = (y: number) => 50 + 14 * Math.sin(y / 95);

type Props = {
  stages: readonly string[];
  /** Index of the section where each stage begins. */
  stageStarts: number[];
  sections: MutableRefObject<(HTMLElement | null)[]>;
  headH: number;
  /** Changes whenever the page's layout does, so stage positions are measured again. */
  layoutKey: number;
  currentStage: number;
  currentTitle: string;
  currentWhen: string;
  nextLabel: string;
  canBack: boolean;
  canNext: boolean;
  onBack: () => void;
  onNext: () => void;
  onStage: (stage: number) => void;
};

/**
 * The ride as the page's spine: a route line down the left with the five CAS stages as
 * checkpoints. The rider marks how far through the story the reader has scrolled.
 */
export function Spine(p: Props) {
  const box = useRef<HTMLElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const rider = useRef<SVGGElement>(null);
  const [h, setH] = useState(0);
  const [fracs, setFracs] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setH(el.clientHeight));
    ro.observe(el);
    setH(el.clientHeight);
    return () => ro.disconnect();
  }, []);

  // Where each stage begins, as a share of the page's scroll.
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setFracs(
        p.stageStarts.map((n) => {
          const el = p.sections.current[n];
          if (!el || max <= 0) return 0;
          const top = el.getBoundingClientRect().top + window.scrollY - p.headH;
          return Math.min(1, Math.max(0, top / max));
        }),
      );
    };
    measure();
    const t = window.setTimeout(measure, 400);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", measure);
    };
  }, [p.layoutKey, p.headH, p.stageStarts, p.sections]);

  const y0 = TOP;
  const y1 = Math.max(TOP + 1, h - FOOT);
  const yAt = (f: number) => y0 + f * (y1 - y0);

  const d = useMemo(() => {
    if (!h) return "";
    const pts: string[] = [];
    for (let y = -20; y < y1; y += 6) pts.push(`${waveX(y).toFixed(1)} ${y}`);
    pts.push(`${waveX(y1).toFixed(1)} ${y1}`);
    return `M${pts.join(" L")}`;
  }, [h, y1]);

  // Stage labels at their checkpoints, nudged apart where stages sit close together.
  const labelY = useMemo(() => {
    const ys = fracs.map(yAt);
    for (let i = 1; i < ys.length; i++) ys[i] = Math.max(ys[i], ys[i - 1] + LABEL_GAP);
    const over = (ys[ys.length - 1] ?? 0) - y1;
    return over > 0 ? ys.map((y) => y - over) : ys;
    // yAt depends only on y0 and y1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fracs, y1]);

  // Move the rider with the scroll.
  useEffect(() => {
    const draw = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const f = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const y = yAt(f);
      clip.current?.setAttribute("height", String(y + 20));
      rider.current?.setAttribute("transform", `translate(${waveX(y).toFixed(1)} ${y.toFixed(1)})`);
    };
    draw();
    window.addEventListener("scroll", draw, { passive: true });
    window.addEventListener("resize", draw);
    return () => {
      window.removeEventListener("scroll", draw);
      window.removeEventListener("resize", draw);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [h, y1]);

  return (
    <aside className="spine" ref={box} aria-label="Our route through the project">
      {h > 0 && (
        <svg className="spine__svg" width="100%" height={h} aria-hidden="true">
          <defs>
            <clipPath id="spine-travelled">
              <rect ref={clip} x="0" y="-20" width="200" height="0" />
            </clipPath>
          </defs>
          <path d={d} className="spine__casing" />
          <path d={d} className="spine__ahead" />
          <path d={d} className="spine__done" clipPath="url(#spine-travelled)" />
          {fracs.map((f, s) => {
            const y = yAt(f);
            return (
              <rect
                key={s}
                x={waveX(y) - 13}
                y={y - 13}
                width="26"
                height="26"
                className={s <= p.currentStage ? "spine__cp is-passed" : "spine__cp"}
              />
            );
          })}
          <g ref={rider}>
            <circle r="18" className="spine__rider" />
          </g>
        </svg>
      )}
      <ol className="spine__stops">
        {p.stages.map((name, s) => (
          <li key={name} className={s === p.currentStage ? "is-current" : undefined} style={{ top: labelY[s] ?? -999 }}>
            <button onClick={() => p.onStage(s)} aria-current={s === p.currentStage ? "step" : undefined}>
              <span className="spine__stage">{name}</span>
              <span className="spine__when">{STAGE_INFO[s].when}</span>
              <span className="spine__sub">{s === p.currentStage ? "You are here" : STAGE_INFO[s].what}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="spine__foot">
        <p className="spine__where">
          <strong>{p.currentTitle}</strong>
          <span>{p.currentWhen}</span>
        </p>
        <div className="spine__ctrl">
          <button className="spine__btn" onClick={p.onBack} disabled={!p.canBack} aria-label="Previous">
            <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
              <path d="M10 20V3M2 10l8-8 8 8" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </button>
          <button className="spine__btn spine__btn--next" onClick={p.onNext} disabled={!p.canNext}>
            {p.nextLabel}
            <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden="true">
              <path d="M10 2v17M2 12l8 8 8-8" stroke="currentColor" strokeWidth="4" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
