import { useEffect, useRef, useState } from "react";
import Peer, { type DataConnection } from "peerjs";
import "./remote.css";

/** What the deck tells a connected remote. */
export type DeckState = {
  index: number;
  total: number;
  title: string;
  when: string;
  stage: number;
  stages: readonly string[];
  nextLabel: string;
  canBack: boolean;
  canNext: boolean;
  loop: LoopState;
};
export type LoopState = { on: boolean; secs: number };
/** What a remote asks the deck to do. */
export type Command =
  | { t: "next" }
  | { t: "back" }
  | { t: "go"; n: number }
  | { t: "stage"; s: number }
  | { t: "loop"; on?: boolean; secs?: number };

export const LOOP_CHOICES = [10, 15, 20, 30, 45, 60];
const PEER_PREFIX = "mfmw-";
const KEY = "mfmw-remote-id";
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/** A random code that stays the same on this laptop, so the hidden link keeps working after a reload. */
function deckCode() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return saved;
  } catch {
    /* storage blocked: use a fresh code each time */
  }
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const code = Array.from(bytes, (b) => ALPHABET[b % 32]).join("");
  try {
    localStorage.setItem(KEY, code);
  } catch {
    /* ignore */
  }
  return code;
}

export function remoteUrl(code: string, host?: string) {
  const u = new URL(window.location.href);
  if (host) u.host = host;
  u.search = `?remote=${code}`;
  u.hash = "";
  return u.toString();
}

type RelayInfo = { port: number; hosts: string[] };
/** When the deck is served by `npm run present`, a relay on the laptop works with no internet. */
function probeRelay(): Promise<RelayInfo | null> {
  return fetch("relay/info", { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<RelayInfo>) : null))
    .catch(() => null);
}
const post = (path: string, msg: unknown) =>
  fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(msg) }).catch(() => {});

/** The deck side: waits for remotes to connect, sends them the state, and runs their commands. */
export function useRemoteHost(state: DeckState, onCommand: (c: Command) => void) {
  const [code] = useState(deckCode);
  const [linked, setLinked] = useState(0);
  const [online, setOnline] = useState(false);
  const [relay, setRelay] = useState<RelayInfo | null>(null);
  const relayOn = useRef(false);
  const conns = useRef(new Set<DataConnection>());
  const latest = useRef(state);
  latest.current = state;
  const handler = useRef(onCommand);
  handler.current = onCommand;

  // The local relay, when present, runs alongside the internet route.
  useEffect(() => {
    let es: EventSource | undefined;
    let dead = false;
    probeRelay().then((info) => {
      if (dead || !info) return;
      setRelay(info);
      relayOn.current = true;
      es = new EventSource("relay/stream?role=deck");
      es.onopen = () => void post("relay/state", latest.current);
      es.onmessage = (e) => handler.current(JSON.parse(e.data) as Command);
    });
    return () => {
      dead = true;
      relayOn.current = false;
      es?.close();
    };
  }, []);

  useEffect(() => {
    const peer = new Peer(PEER_PREFIX + code);
    peer.on("open", () => setOnline(true));
    peer.on("disconnected", () => {
      setOnline(false);
      if (!peer.destroyed) peer.reconnect();
    });
    // Another copy of the deck already holds this code (a second tab); leave it be.
    peer.on("error", () => setOnline(false));
    peer.on("connection", (c) => {
      c.on("open", () => {
        conns.current.add(c);
        setLinked(conns.current.size);
        c.send(latest.current);
      });
      c.on("data", (d) => handler.current(d as Command));
      const drop = () => {
        conns.current.delete(c);
        setLinked(conns.current.size);
      };
      c.on("close", drop);
      c.on("error", drop);
    });
    return () => {
      conns.current.clear();
      peer.destroy();
    };
  }, [code]);

  useEffect(() => {
    conns.current.forEach((c) => c.open && c.send(state));
    if (relayOn.current) void post("relay/state", state);
  }, [state, relay]);

  return { code, linked, online, relay };
}

/** The phone side, opened from the hidden link. */
export function Remote({ code }: { code: string }) {
  const [deck, setDeck] = useState<DeckState | null>(null);
  const [status, setStatus] = useState<"connecting" | "live" | "lost">("connecting");
  const conn = useRef<DataConnection | null>(null);
  const viaRelay = useRef(false);

  useEffect(() => {
    let dead = false;
    let retry = 0;
    let es: EventSource | undefined;
    let peer: Peer | undefined;
    // On the laptop's own network the relay is used; otherwise the internet route.
    probeRelay().then((info) => {
      if (dead) return;
      if (info) {
        viaRelay.current = true;
        es = new EventSource("relay/stream?role=remote");
        es.onopen = () => setStatus("live");
        es.onerror = () => setStatus("lost");
        es.onmessage = (e) => setDeck(JSON.parse(e.data) as DeckState);
      } else peer = startPeer();
    });
    function startPeer() {
    const peer = new Peer();
    const connect = () => {
      if (dead) return;
      const c = peer.connect(PEER_PREFIX + code, { reliable: true });
      conn.current = c;
      let settled = false;
      const lost = () => {
        if (dead || settled || conn.current !== c) return;
        settled = true;
        setStatus("lost");
        clearTimeout(retry);
        retry = window.setTimeout(connect, 2000);
      };
      c.on("open", () => {
        clearTimeout(retry);
        setStatus("live");
      });
      c.on("data", (d) => setDeck(d as DeckState));
      c.on("close", lost);
      c.on("error", lost);
      // Nobody answered (the deck is not open yet): try again.
      retry = window.setTimeout(() => {
        if (!c.open) {
          c.close();
          lost();
        }
      }, 6000);
    };
    peer.on("open", connect);
    peer.on("error", () => {
      if (dead) return;
      setStatus("lost");
      clearTimeout(retry);
      retry = window.setTimeout(() => {
        if (peer.open) connect();
      }, 3000);
    });
    return peer;
    }
    document.title = "Remote · Miles for Migrant Workers";
    return () => {
      dead = true;
      clearTimeout(retry);
      es?.close();
      peer?.destroy();
    };
  }, [code]);

  const send = (c: Command) => {
    if (viaRelay.current) void post("relay/cmd", c);
    else if (conn.current?.open) conn.current.send(c);
    navigator.vibrate?.(8);
  };
  const loop = deck?.loop;

  return (
    <div className="rm">
      <header className="rm__head">
        <span className={`rm__dot rm__dot--${status}`} />
        <span>{status === "live" ? "Connected" : status === "connecting" ? "Connecting…" : "Reconnecting…"}</span>
        {deck && (
          <span className="rm__count">
            {deck.index + 1} / {deck.total}
          </span>
        )}
      </header>

      {!deck ? (
        <p className="rm__wait">Open the deck on the laptop, then this page links up by itself.</p>
      ) : (
        <>
          <main className="rm__now">
            <p className="rm__stage">{deck.stage >= 0 ? deck.stages[deck.stage] : "Title"}</p>
            <h1>{deck.title}</h1>
            <p className="rm__when">{deck.when}</p>
          </main>

          <div className="rm__pad">
            <button className="rm__btn rm__btn--back" disabled={!deck.canBack} onClick={() => send({ t: "back" })}>
              Back
            </button>
            <button className="rm__btn rm__btn--next" disabled={!deck.canNext} onClick={() => send({ t: "next" })}>
              {deck.nextLabel}
            </button>
          </div>

          <nav className="rm__stages" aria-label="Jump to a stage">
            <button className={deck.index === 0 ? "is-current" : undefined} onClick={() => send({ t: "go", n: 0 })}>
              Home
            </button>
            {deck.stages.map((name, s) => (
              <button key={name} className={s === deck.stage ? "is-current" : undefined} onClick={() => send({ t: "stage", s })}>
                {name}
              </button>
            ))}
          </nav>

          {loop && (
            <section className="rm__loop">
              <button
                className={`rm__toggle${loop.on ? " is-on" : ""}`}
                aria-pressed={loop.on}
                onClick={() => send({ t: "loop", on: !loop.on })}
              >
                {loop.on ? "Auto-loop on" : "Auto-loop off"}
              </button>
              <label>
                Every
                <select value={loop.secs} onChange={(e) => send({ t: "loop", secs: Number(e.target.value) })}>
                  {LOOP_CHOICES.map((s) => (
                    <option key={s} value={s}>
                      {s} seconds
                    </option>
                  ))}
                </select>
              </label>
            </section>
          )}
        </>
      )}
    </div>
  );
}
