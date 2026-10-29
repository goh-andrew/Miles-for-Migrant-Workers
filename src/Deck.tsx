import { useCallback, useEffect, useRef, useState, type CSSProperties, type ComponentType } from "react";
import { AnimatePresence, motion } from "motion/react";
import * as P from "./panels";
import { NOTICES } from "./notices";
import { Spine } from "./components/Spine";
import { useIsNarrow, usePageLayout, usePrefersReducedMotion } from "./hooks";

const STAGES = ["Investigation", "Preparation", "Action", "Reflection", "Demonstration"] as const;

type PanelDef = {
  key: string;
  stage: number; // -1 for the title, before the stages begin
  title: string;
  /** When this part of the project happened. */
  when: string;
  Comp: ComponentType<P.PanelProps & { onNotices: () => void }>;
  notice?: keyof typeof NOTICES;
  /** Parts the Next button steps through before the page moves on, and what to call them. */
  steps?: number;
  stepLabel?: string;
};

const PANELS: PanelDef[] = [
  { key: "title", stage: -1, title: "Miles for Migrant Workers", when: "March to August 2026", Comp: P.Title, notice: "route" },
  { key: "skyline", stage: 0, title: "The people behind the skyline", when: "March 2026", Comp: P.Skyline },
  { key: "why", stage: 0, title: "Why the MWLC", when: "March 2026", Comp: P.Why },
  { key: "probono", stage: 0, title: "Learning from ProBono SG", when: "26 March 2026", Comp: P.ProBono },
  { key: "roles", stage: 1, title: "Our roles", when: "17 March 2026", Comp: P.Roles, notice: "team", steps: P.ROLE_COUNT, stepLabel: "Next rider" },
  { key: "goals", stage: 1, title: "Our goals", when: "26 March 2026", Comp: P.Goals, notice: "timeline" },
  { key: "mwlc", stage: 1, title: "Visiting the MWLC", when: "28 May 2026", Comp: P.Mwlc },
  { key: "give", stage: 1, title: "Two ways to give", when: "From 29 March 2026", Comp: P.Give, notice: "training" },
  { key: "people", stage: 2, title: "Talking to people", when: "April to June 2026", Comp: P.People },
  { key: "online", stage: 2, title: "Going online", when: "April to June 2026", Comp: P.Online, notice: "gallery" },
  { key: "ride", stage: 2, title: "Ride day, 1 June", when: "1 June 2026", Comp: P.Ride, notice: "numbers" },
  { key: "plan", stage: 2, title: "Not everything went to plan", when: "1 June 2026", Comp: P.Plan, notice: "loop" },
  { key: "result", stage: 3, title: "What we raised", when: "29 March to August 2026", Comp: P.Result },
  { key: "learnt", stage: 3, title: "What we learnt", when: "August 2026", Comp: P.Learnt, notice: "dignity" },
  { key: "questions", stage: 4, title: "Any questions?", when: "Tonight", Comp: P.Questions, notice: "thanks" },
];

const LAST = PANELS.length - 1;
const firstOfStage = (s: number) => PANELS.findIndex((p) => p.stage === s);
const STAGE_STARTS = STAGES.map((_, s) => firstOfStage(s));
const ATTRACT_MS = 3 * 60 * 1000;
const HEAD_H = 64; // top bar on wide screens
const NARROW_HEAD_H = 80; // sticky stage bar on phones
const LOGO = `${import.meta.env.BASE_URL}logo.svg`;

function readHash() {
  const n = Number(window.location.hash.replace(/^#\/?/, ""));
  return Number.isInteger(n) && n >= 0 && n <= LAST ? n : 0;
}

function Arrow() {
  return (
    <svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true">
      <path d="M0 12h30M19 2l11 10-11 10" stroke="currentColor" strokeWidth="5" fill="none" />
    </svg>
  );
}

export function Deck() {
  const narrow = useIsNarrow();
  const reduced = usePrefersReducedMotion();
  const { spineW, k } = usePageLayout();
  const headH = narrow ? NARROW_HEAD_H : HEAD_H;
  const [index, setIndex] = useState(0);
  // Which part of each stepped section is showing (the five riders).
  const [steps, setSteps] = useState<Record<number, number>>({});
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]));
  const [notice, setNotice] = useState<string | null>(null);
  const [cursorHidden, setCursorHidden] = useState(false);
  const noticeReturn = useRef<HTMLElement | null>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  // While a jump is scrolling, the scroll position should not overrule where we are going.
  const lockUntil = useRef(0);
  // Read before the address is rewritten to follow the scroll.
  const startAt = useRef(readHash());

  const scrollToSection = useCallback(
    (n: number, behavior: ScrollBehavior) => {
      const el = sections.current[n];
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - headH;
      lockUntil.current = Date.now() + (behavior === "smooth" ? 900 : 50);
      setIndex(n);
      window.scrollTo({ top, behavior });
      // If the browser skips or stalls the smooth scroll, land there anyway.
      if (behavior === "smooth")
        window.setTimeout(() => {
          if (Math.abs(window.scrollY - top) > 4) window.scrollTo({ top, behavior: "auto" });
        }, 1000);
    },
    [headH],
  );

  const go = useCallback(
    (n: number, atEnd = false) => {
      const next = Math.max(0, Math.min(LAST, n));
      setSteps((s) => ({ ...s, [next]: atEnd ? (PANELS[next].steps ?? 1) - 1 : 0 }));
      scrollToSection(next, reduced ? "auto" : "smooth");
    },
    [reduced, scrollToSection],
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

  // The section whose top has passed a line a third of the way down the screen is current.
  useEffect(() => {
    const update = () => {
      const line = headH + window.innerHeight * 0.35;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      let cur = 0;
      const visible: number[] = [];
      sections.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top <= line) cur = i;
        if (r.top < window.innerHeight * 0.9 && r.bottom > 0) visible.push(i);
      });
      if (window.scrollY >= max - 2) cur = LAST;
      if (Date.now() > lockUntil.current) setIndex(cur);
      setSeen((s) => (visible.every((v) => s.has(v)) ? s : new Set([...s, ...visible])));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headH]);

  // Keep the address in step, and open at the section it names.
  useEffect(() => {
    if (window.location.hash !== `#/${index}`) history.replaceState(null, "", `#/${index}`);
  }, [index]);
  useEffect(() => {
    const start = startAt.current;
    if (start > 0) window.setTimeout(() => scrollToSection(start, "auto"), 0);
    const onHash = () => go(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
    // Only on first load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        case "ArrowDown":
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
        case "ArrowUp":
        case "PageUp":
          if (inControl) return;
          e.preventDefault();
          back();
          break;
        case "Home":
          if (inControl) return;
          e.preventDefault();
          go(0);
          break;
        case "End":
          if (inControl) return;
          e.preventDefault();
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

  // Hide the cursor while presenting; go back to the top when the booth is left alone.
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
          window.scrollTo({ top: 0, behavior: "smooth" });
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

  const current = PANELS[index];
  const stage = current.stage;

  const section = (p: PanelDef, n: number) => {
    const headingId = `h-${p.key}`;
    return (
      <section
        key={p.key}
        ref={(el) => {
          sections.current[n] = el;
        }}
        data-index={n}
        className={`panel panel--${p.key}`}
        data-state={seen.has(n) ? "here" : "away"}
        aria-labelledby={headingId}
      >
        <p.Comp
          active={seen.has(n)}
          headingId={headingId}
          step={steps[n] ?? 0}
          onStep={(s) => setSteps((all) => ({ ...all, [n]: s }))}
          onNotices={() => openNotice("all")}
        />
      </section>
    );
  };

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
        <nav className="walkway" aria-label="Presentation">
          <ol className="plates">
            {STAGES.map((name, s) => (
              <li key={name} className={s === stage ? "is-current" : undefined}>
                <button className="plate" aria-current={s === stage ? "step" : undefined} onClick={() => go(firstOfStage(s))}>
                  {name}
                </button>
              </li>
            ))}
          </ol>
          <button className="btn btn-next" onClick={forward} disabled={index === LAST}>
            Next <Arrow />
          </button>
        </nav>
        <main>{PANELS.map(section)}</main>
        {sheet}
      </div>
    );
  }

  const pageStyle = { "--k": k, "--spine-w": `${spineW}px`, "--head-h": `${HEAD_H}px` } as CSSProperties;
  return (
    <div className={`page${cursorHidden ? " no-cursor" : ""}`} style={pageStyle}>
      <header className="topbar">
        <a
          className="topbar__mark"
          href="#/0"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <img src={LOGO} alt="" width={32} height={32} />
          Miles for Migrant Workers
        </a>
        <nav aria-label="CAS stages">
          <ol className="topbar__stages">
            {STAGES.map((name, s) => (
              <li key={name}>
                <button className="topbar__stage" aria-current={s === stage ? "step" : undefined} onClick={() => go(firstOfStage(s))}>
                  {name}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </header>
      <div className="page__body">
        <Spine
          stages={STAGES}
          stageStarts={STAGE_STARTS}
          sections={sections}
          headH={HEAD_H}
          layoutKey={k}
          currentStage={stage}
          currentTitle={current.title}
          currentWhen={current.when}
          nextLabel={step < lastStep && current.stepLabel ? current.stepLabel : "Next"}
          canBack={index > 0 || step > 0}
          canNext={index < LAST}
          onBack={back}
          onNext={forward}
          onStage={(s) => go(firstOfStage(s))}
        />
        <main className="page__main">
          {PANELS.map((p, n) => (
            // Earlier sections sit above later ones, so a pasted photo can hang over the next one.
            <div key={p.key} className="sect" style={{ zIndex: PANELS.length - n }}>
              {section(p, n)}
            </div>
          ))}
          <footer className="page__end">
            <img src={LOGO} alt="" width={40} height={40} />
            <p>Miles for Migrant Workers · a CAS project by Andrew, Harley, Bruce, Chenyu and Oliver, 2026</p>
          </footer>
        </main>
      </div>
      {sheet}
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
