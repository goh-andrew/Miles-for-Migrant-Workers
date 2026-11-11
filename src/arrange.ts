/* Arrange mode: a dev-only helper for placing the pasted prints by hand.
   Open the dev server with ?arrange in the address. Drag a print to move it, drag its
   bottom-right corner to resize it, then press Copy and paste the result to Claude.
   Nothing here is saved or shipped: main.tsx only loads it on the dev server. */

const TARGETS = "[data-paste], .p-title__credit img";
const CORNER = 28; // screen px from the bottom-right corner that counts as the resize handle

type Change = { el: HTMLElement; dx: number; dy: number; w0: number; h0: number; w: number; h: number };
const changes = new Map<HTMLElement, Change>();

/** Design px per screen px: the board is scaled to fit the window. */
function scaleOf(el: HTMLElement) {
  const box = (el.closest(".panel, section") as HTMLElement | null) ?? document.body;
  return box.offsetWidth ? box.getBoundingClientRect().width / box.offsetWidth : 1;
}

function selectorOf(el: HTMLElement) {
  const page = el.closest(".page") ? ".page " : "";
  if (el.matches(".p-title__credit img")) return `${page}.p-title__credit img`;
  const cls = [...el.classList].find((c) => c.startsWith("p-")) ?? el.classList[0] ?? el.tagName.toLowerCase();
  return `${page}.${cls}`;
}

function changeFor(el: HTMLElement): Change {
  let c = changes.get(el);
  if (!c) {
    c = { el, dx: 0, dy: 0, w0: el.offsetWidth, h0: el.offsetHeight, w: el.offsetWidth, h: el.offsetHeight };
    changes.set(el, c);
  }
  return c;
}

function apply(c: Change) {
  c.el.style.translate = `${Math.round(c.dx)}px ${Math.round(c.dy)}px`;
  if (c.w !== c.w0 || c.h !== c.h0) {
    c.el.style.width = `${Math.round(c.w)}px`;
    c.el.style.height = `${Math.round(c.h)}px`;
    c.el.style.maxWidth = "none";
  }
}

function report() {
  const blocks = [...changes.values()]
    .filter((c) => c.dx || c.dy || c.w !== c.w0 || c.h !== c.h0)
    .map((c) => {
      const lines = [`  translate: ${Math.round(c.dx)}px ${Math.round(c.dy)}px;`];
      if (c.w !== c.w0 || c.h !== c.h0) {
        lines.push(`  width: ${Math.round(c.w)}px; /* was ${c.w0}px */`);
        lines.push(`  height: ${Math.round(c.h)}px; /* was ${c.h0}px */`);
      }
      return `${selectorOf(c.el)} {\n${lines.join("\n")}\n}`;
    });
  const first = changes.values().next().value as Change | undefined;
  const wallH = first ? getComputedStyle(first.el).getPropertyValue("--wall-h").trim() : "";
  const head = `/* arrange mode, window ${innerWidth}x${innerHeight}${wallH ? `, --wall-h ${wallH}` : ""} */`;
  return blocks.length ? `${head}\n${blocks.join("\n")}` : "";
}

/* ------------------------------ panel ------------------------------ */
const style = document.createElement("style");
style.textContent = `
  ${TARGETS.split(",").map((s) => `${s.trim()}`).join(", ")} { cursor: move; }
  ${TARGETS.split(",").map((s) => `${s.trim()}:hover`).join(", ")} { outline: 3px dashed #f5c518; outline-offset: 4px; }
  .arrange-dragging, .arrange-dragging * { user-select: none !important; }
  .arrange-panel { position: fixed; right: 16px; bottom: 16px; z-index: 2147483647; width: min(420px, calc(100vw - 32px));
    background: #111; color: #eee; font: 12px/1.45 ui-monospace, Consolas, monospace; border-radius: 8px;
    box-shadow: 0 8px 32px rgb(0 0 0 / 0.4); padding: 12px; }
  .arrange-panel b { display: block; font: 600 13px system-ui, sans-serif; cursor: grab; padding-bottom: 4px; }
  .arrange-panel pre { margin: 8px 0; max-height: 40vh; overflow: auto; white-space: pre-wrap; color: #f5c518; }
  .arrange-panel button { font: 600 13px system-ui, sans-serif; padding: 6px 12px; margin-right: 6px; border: 0;
    border-radius: 4px; cursor: pointer; background: #f5c518; color: #111; }
  .arrange-panel button.ghost { background: #333; color: #eee; }
`;
document.head.append(style);

const panel = document.createElement("div");
panel.className = "arrange-panel";
panel.innerHTML = `<b title="Drag to move this box">Arrange mode ⠿</b><div>Drag a print to move it. Drag its bottom-right corner to resize.</div>
  <pre></pre><button type="button" data-a="copy">Copy</button><button type="button" class="ghost" data-a="reset">Reset</button>`;
document.body.append(panel);
const out = panel.querySelector("pre")!;
const render = () => (out.textContent = report() || "(nothing moved yet)");
render();

panel.addEventListener("click", async (e) => {
  const a = (e.target as HTMLElement).closest("button")?.dataset.a;
  if (a === "copy") {
    const text = report();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // clipboard blocked: select the text so it can be copied by hand
      getSelection()?.selectAllChildren(out);
    }
    (e.target as HTMLElement).textContent = "Copied";
    setTimeout(() => ((e.target as HTMLElement).textContent = "Copy"), 1200);
  } else if (a === "reset") {
    for (const c of changes.values()) c.el.style.removeProperty("translate"), c.el.style.removeProperty("width"),
      c.el.style.removeProperty("height"), c.el.style.removeProperty("max-width");
    changes.clear();
    render();
  }
});

// the box itself moves by its title, so it never has to sit on top of a print
panel.querySelector("b")!.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  const r = panel.getBoundingClientRect();
  const ox = e.clientX - r.left;
  const oy = e.clientY - r.top;
  const move = (m: PointerEvent) => {
    panel.style.left = `${Math.max(0, m.clientX - ox)}px`;
    panel.style.top = `${Math.max(0, m.clientY - oy)}px`;
    panel.style.right = panel.style.bottom = "auto";
  };
  const up = () => (removeEventListener("pointermove", move), removeEventListener("pointerup", up));
  addEventListener("pointermove", move);
  addEventListener("pointerup", up);
});

/* ------------------------------ dragging ------------------------------ */
/** Is the pointer near the print's own bottom-right corner? Prints are tilted, so undo the
    rotation about the centre and measure in the print's unrotated frame. */
function nearCorner(el: HTMLElement, x: number, y: number) {
  const r = el.getBoundingClientRect();
  const m = new DOMMatrix(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
  const a = -Math.atan2(m.b, m.a);
  const k = scaleOf(el);
  const px = x - (r.left + r.width / 2);
  const py = y - (r.top + r.height / 2);
  const lx = px * Math.cos(a) - py * Math.sin(a) + (el.offsetWidth * k) / 2;
  const ly = px * Math.sin(a) + py * Math.cos(a) + (el.offsetHeight * k) / 2;
  return el.offsetWidth * k - lx < CORNER && el.offsetHeight * k - ly < CORNER && lx > 0 && ly > 0;
}

document.addEventListener(
  "pointermove",
  (e) => {
    const el = (e.target as HTMLElement).closest?.(TARGETS) as HTMLElement | null;
    if (el && !document.body.classList.contains("arrange-dragging"))
      el.style.cursor = nearCorner(el, e.clientX, e.clientY) ? "nwse-resize" : "move";
  },
  true,
);

document.addEventListener(
  "pointerdown",
  (e) => {
    if (e.button !== 0) return;
    const el = (e.target as HTMLElement).closest?.(TARGETS) as HTMLElement | null;
    if (!el || panel.contains(el)) return;
    e.preventDefault();
    e.stopPropagation();
    const c = changeFor(el);
    const k = scaleOf(el);
    const resize = nearCorner(el, e.clientX, e.clientY);
    const start = { x: e.clientX, y: e.clientY, dx: c.dx, dy: c.dy, w: c.w, h: c.h };
    const ratio = c.w0 / c.h0;
    document.body.classList.add("arrange-dragging");

    const move = (m: PointerEvent) => {
      m.preventDefault();
      const mx = (m.clientX - start.x) / k;
      const my = (m.clientY - start.y) / k;
      if (resize) {
        // keep the print's proportions; follow whichever way the pointer moved further
        const h = Math.max(80, Math.abs(mx) > Math.abs(my) ? start.h + mx / ratio : start.h + my);
        c.h = h;
        c.w = h * ratio;
      } else {
        c.dx = start.dx + mx;
        c.dy = start.dy + my;
      }
      apply(c);
      render();
    };
    const up = () => {
      document.body.classList.remove("arrange-dragging");
      removeEventListener("pointermove", move, true);
      removeEventListener("pointerup", up, true);
    };
    addEventListener("pointermove", move, true);
    addEventListener("pointerup", up, true);
  },
  true,
);

// a click on a print must not also trigger the deck (next slide, video controls)
document.addEventListener(
  "click",
  (e) => {
    if ((e.target as HTMLElement).closest?.(TARGETS)) e.preventDefault(), e.stopPropagation();
  },
  true,
);

export {};
