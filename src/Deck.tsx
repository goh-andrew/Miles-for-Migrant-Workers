import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import * as P from "./panels";
import { NOTICES } from "./notices";
import { useCanvasScale, useIsNarrow, usePrefersReducedMotion } from "./hooks";

const STAGES = ["Investigation", "Preparation", "Action", "Reflection", "Demonstration"] as const;

type PanelDef = {
  key: string;
  stage: number; // -1 for the title, before the stages begin
  title: string;
  Comp: ComponentType<P.PanelProps & { onNotices: () => void }>;
  notice?: keyof typeof NOTICES;
  /** Parts the Next button steps through before the deck moves on, and what to call them. */
  steps?: number;
  stepLabel?: string;
};

const PANELS: PanelDef[] = [
  { key: "title", stage: -1, title: "Miles for Migrant Workers", Comp: P.Title, notice: "route" },
  { key: "skyline", stage: 0, title: "The people behind the skyline", Comp: P.Skyline },
  { key: "why", stage: 0, title: "Why the MWLC", Comp: P.Why },
  { key: "probono", stage: 0, title: "Learning from ProBono SG", Comp: P.ProBono },
  { key: "roles", stage: 1, title: "Five riders, five roles", Comp: P.Roles, notice: "team", steps: P.ROLE_COUNT, stepLabel: "Next rider" },
  { key: "goals", stage: 1, title: "Our goals", Comp: P.Goals, notice: "timeline" },
  { key: "mwlc", stage: 1, title: "Visiting the MWLC", Comp: P.Mwlc },
  { key: "give", stage: 1, title: "Two ways to give", Comp: P.Give, notice: "training" },
  { key: "people", stage: 2, title: "Talking to people", Comp: P.People },
  { key: "online", stage: 2, title: "Going online", Comp: P.Online, notice: "gallery" },
  { key: "ride", stage: 2, title: "Ride day, 1 June", Comp: P.Ride, notice: "numbers" },
  { key: "plan", stage: 2, title: "Not everything went to plan", Comp: P.Plan, notice: "loop" },
  { key: "result", stage: 3, title: "What we raised", Comp: P.Result },
  { key: "learnt", stage: 3, title: "What we learnt", Comp: P.Learnt, notice: "dignity" },
  { key: "questions", stage: 4, title: "Any questions?", Comp: P.Questions, notice: "thanks" },
];

const LAST = PANELS.length - 1;
const firstOfStage = (s: number) => PANELS.findIndex((p) => p.stage === s);
const ATTRACT_MS = 3 * 60 * 1000;

function readHash() {
  const n = Number(window.location.hash.replace(/^#\/?/, ""));
  return Number.isInteger(n) && n >= 0 && n <= LAST ? n : 0;
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true" style={dir === "left" ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M0 12h30M19 2l11 10-11 10" stroke="currentColor" strokeWidth="5" fill="none" />
    </svg>
  );
}

export function Deck() {
  const narrow = useIsNarrow();
  const reduced = usePrefersReducedMotion();
  const scale = useCanvasScale();
  const [index, setIndex] = useState(readHash);
  // Which part of each stepped panel is showing, kept per panel so it holds while the panel slides away.
  const [steps, setSteps] = useState<Record<number, number>>({});
  const [seen, setSeen] = useState<Set<number>>(() => new Set([readHash()]));
  const [notice, setNotice] = useState<string | null>(null);
  const [wipeKey, setWipeKey] = useState(0);
  const [cursorHidden, setCursorHidden] = useState(false);
  const lastStage = useRef(PANELS[index].stage);
  const noticeReturn = useRef<HTMLElement | null>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);

  const go = useCallback(
    (n: number, atEnd = false) => {
      const next = Math.max(0, Math.min(LAST, n));
      if (narrow) {
        sections.current[next]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        return;
      }
      setSteps((s) => ({ ...s, [next]: atEnd ? (PANELS[next].steps ?? 1) - 1 : 0 }));
      setIndex(next);
    },
    [narrow, reduced],
  );

  const step = steps[index] ?? 0;
  const lastStep = (PANELS[index].steps ?? 1) - 1;
  const forward = useCallback(() => {
    if (!narrow && step < lastStep) setSteps((s) => ({ ...s, [index]: step + 1 }));
    else go(index + 1);
  }, [narrow, step, lastStep, index, go]);
  const back = useCallback(() => {
    if (!narrow && step > 0) setSteps((s) => ({ ...s, [index]: step - 1 }));
    else go(index - 1, true);
  }, [narrow, step, index, go]);

  // Keep the hash and the stage-change wipe in step with the current panel.
  useEffect(() => {
    if (window.location.hash !== `#/${index}`) history.replaceState(null, "", `#/${index}`);
    setSeen((s) => (s.has(index) ? s : new Set(s).add(index)));
    const stage = PANELS[index].stage;
    if (stage !== lastStage.current && !narrow) setWipeKey((k) => k + 1);
    lastStage.current = stage;
  }, [index, narrow]);

  useEffect(() => {
    const onHash = () => setIndex(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const openNotice = useCallback((id: string) => {
    noticeReturn.current = document.activeElement as HTMLElement | null;
    setNotice(id);
  }, []);
  const closeNotice = useCallback(() => {
    setNotice(null);
    requestAnimationFrame(() => noticeReturn.current?.focus());
  }, []);

  // Keyboard: clickers send arrows and Page keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (notice) {
        if (e.key === "Escape") closeNotice();
        return;
      }
      const t = e.target as HTMLElement;
      const inControl = t.closest("input, textarea, select, [role='slider']");
      const onButton = t.tagName === "BUTTON" || t.tagName === "A";
      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          if (inControl) return;
          e.preventDefault();
          forward();
          break;
        case " ":
          if (inControl || onButton) return;
          e.preventDefault();
          forward();
          break;
        case "ArrowLeft":
        case "PageUp":
          if (inControl) return;
          e.preventDefault();
          back();
          break;
        case "Home":
          if (inControl) return;
          go(0);
          break;
        case "End":
          if (inControl) return;
          go(LAST);
          break;
        case "n":
        case "N": {
          const id = PANELS[index].notice;
          if (id) openNotice(id);
          break;
        }
        case "f":
        case "F":
          if (document.fullscreenElement) document.exitFullscreen();
          else document.documentElement.requestFullscreen?.();
          break;
        default:
          if (/^[1-5]$/.test(e.key) && !inControl) go(firstOfStage(Number(e.key) - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, notice, go, forward, back, openNotice, closeNotice]);

  // Hide the cursor while presenting; walk back to the title when the booth is left alone.
  useEffect(() => {
    if (narrow) return;
    const attractOff = new URLSearchParams(window.location.search).get("attract") === "off";
    let hideT = 0;
    let attractT = 0;
    const wake = () => {
      setCursorHidden(false);
      clearTimeout(hideT);
      clearTimeout(attractT);
      hideT = window.setTimeout(() => setCursorHidden(true), 2000);
      if (!attractOff)
        attractT = window.setTimeout(() => {
          setSteps({});
          setIndex(0);
        }, ATTRACT_MS);
    };
    wake();
    const evs = ["mousemove", "mousedown", "keydown", "touchstart", "wheel"] as const;
    evs.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
    return () => {
      clearTimeout(hideT);
      clearTimeout(attractT);
      evs.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, [narrow]);

  // Narrow screens scroll; the panel most in view becomes current.
  useEffect(() => {
    if (!narrow) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          const n = Number((en.target as HTMLElement).dataset.index);
          if (en.isIntersecting) setSeen((s) => (s.has(n) ? s : new Set(s).add(n)));
          if (en.intersectionRatio > 0.5) setIndex(n);
        });
      },
      { threshold: [0, 0.2, 0.5, 0.75] },
    );
    sections.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, [narrow]);

  const current = PANELS[index];
  const stage = current.stage;

  const panels = PANELS.map((p, n) => {
    const here = narrow ? seen.has(n) : n === index;
    const headingId = `h-${p.key}`;
    return (
      <section
        key={p.key}
        ref={(el) => {
          sections.current[n] = el;
        }}
        data-index={n}
        className={`panel panel--${p.key}`}
        data-state={here ? "here" : "away"}
        aria-labelledby={headingId}
        aria-hidden={!narrow && n !== index ? true : undefined}
        // React 18 has no typed `inert` prop; an empty string sets the attribute.
        {...(!narrow && n !== index ? ({ inert: "" } as Record<string, string>) : {})}
      >
        <p.Comp
          active={here}
          headingId={headingId}
          step={steps[n] ?? 0}
          onStep={(s) => setSteps((all) => ({ ...all, [n]: s }))}
          onNotices={() => openNotice("all")}
        />
      </section>
    );
  });

  const walkway = (
    <nav className="walkway" aria-label="Presentation">
      {!narrow && (
        <button className="btn btn-back" onClick={back} disabled={index === 0 && step === 0} aria-label="Previous">
          <Arrow dir="left" />
        </button>
      )}
      <ol className="plates">
        {STAGES.map((name, s) => {
          const inStage = PANELS.filter((p) => p.stage === s);
          const pos = inStage.findIndex((p) => p === current);
          const fill = s < stage ? 100 : s === stage ? ((pos + 1) / inStage.length) * 100 : 0;
          return (
            <li key={name} className={s === stage ? "is-current" : undefined}>
              <button className="plate" aria-current={s === stage ? "step" : undefined} onClick={() => go(firstOfStage(s))}>
                {name}
                <span className="fill" style={{ width: `${fill}%` }} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
      <button className="btn btn-next" onClick={forward} disabled={index === LAST}>
        {!narrow && step < lastStep ? current.stepLabel : "Next panel"} <Arrow dir="right" />
      </button>
    </nav>
  );

  const sheet = (
    <AnimatePresence>
      {notice && (
        <>
          <motion.div
            key="backdrop"
            className="notice-backdrop"
            onClick={closeNotice}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          />
          <NoticeSheet id={notice} onClose={closeNotice} onOpen={openNotice} reduced={reduced} />
        </>
      )}
    </AnimatePresence>
  );

  if (narrow) {
    return (
      <div className="flow">
        {walkway}
        <main>{panels}</main>
        {sheet}
      </div>
    );
  }

  return (
    <div className={`stage${cursorHidden ? " no-cursor" : ""}`}>
      <div className="canvas" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
        <main className="viewport">
          <div className="track" style={{ transform: `translate3d(${-index * 1920}px, 0, 0)` }}>
            {panels}
          </div>
          <AnimatePresence>
            {wipeKey > 0 && !reduced && (
              <motion.div
                key={wipeKey}
                className="wipe"
                aria-hidden="true"
                initial={{ x: -240 }}
                animate={{ x: 1940 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
              />
            )}
          </AnimatePresence>
        </main>
        {walkway}
        {sheet}
      </div>
    </div>
  );
}

function NoticeSheet({
  id,
  onClose,
  onOpen,
  reduced,
}: {
  id: string;
  onClose: () => void;
  onOpen: (id: string) => void;
  reduced: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), [id]);
  const n = id === "all" ? null : NOTICES[id];
  const title = n ? n.title : "Notices on the hoarding";

  return (
    <motion.div
      className="notice"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-title"
      initial={{ y: reduced ? 0 : 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: reduced ? 0 : 60, opacity: 0 }}
      transition={{ duration: reduced ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
      onKeyDown={(e) => {
        // Keep focus inside the sheet.
        if (e.key !== "Tab") return;
        const items = e.currentTarget.querySelectorAll<HTMLElement>("button, a[href], input");
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="notice-head">
        <h2 id="notice-title">{title}</h2>
        <button ref={closeRef} className="btn notice-close" onClick={onClose}>
          Close
        </button>
      </div>
      <div className="notice-body">
        {n ? (
          n.body
        ) : (
          <ul className="n-index">
            {PANELS.filter((p) => p.notice).map((p) => (
              <li key={p.key}>
                <button className="n-index__item" onClick={() => onOpen(p.notice!)}>
                  <span className="n-index__title">{NOTICES[p.notice!].title}</span>
                  <span className="n-index__from">from “{p.title}”</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
