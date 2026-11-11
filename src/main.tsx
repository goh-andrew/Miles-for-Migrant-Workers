import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck } from "./Deck";
import { Remote } from "./remote";
import "./styles.css";
import "./panels.css";
import "./screen.css";

// The hidden link (?remote=<code>) opens the phone remote instead of the deck.
const remote = new URLSearchParams(window.location.search).get("remote");

// Dev server only: ?arrange lets the prints be dragged into place (see arrange.ts).
if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("arrange")) {
  void import("./arrange");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{remote ? <Remote code={remote.replace(/[^a-z0-9]/gi, "")} /> : <Deck />}</StrictMode>,
);
