import { type CSSProperties, type ReactNode } from "react";
import { FlipTiles } from "./components/FlipTiles";
import { PledgeDial } from "./components/PledgeDial";
import { RouteMap } from "./components/RouteMap";

export type PanelProps = {
  active: boolean;
  headingId: string;
  /** For panels that step through parts before the deck moves on (the five riders). */
  step?: number;
  onStep?: (n: number) => void;
};

const CAMPAIGN_URL = "https://www.giving.sg/donate/campaign/miles-for-migrant-workers";

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;
const i = (n: number) => ({ "--i": n }) as CSSProperties;

function Seams({ at }: { at: number[] }) {
  return (
    <>
      {at.map((x) => (
        <div key={x} className="seam" style={{ left: `${x}%` }} aria-hidden="true" />
      ))}
    </>
  );
}

/* 00 ----------------------------------------------------------------- */
export function Title({ active, headingId }: PanelProps) {
  return (
    <div className="p-title">
      <div className="p-title__wall">
        <h1 id={headingId} className="h-display" data-enter style={i(0)}>
          <span>Miles for</span> <span>Migrant Workers</span>
        </h1>
        <p className="statement p-title__lede" data-enter style={i(1)}>
          We rode 70.19&nbsp;km and raised $5,067 for ProBono&nbsp;SG's Migrant Workers Law Centre.
        </p>
        <div className="p-title__credit" data-enter style={i(3)}>
          <img src={img("probono-shield.png")} alt="ProBono SG shield" width={145} height={184} />
          <p>
            <strong>For ProBono SG</strong>
            The money went to its Migrant Workers Law Centre.
          </p>
        </div>
        <figure className="paste p-title__photo" data-paste style={{ "--r": "4deg" } as CSSProperties}>
          <img
            src={img("group.jpg")}
            alt="Andrew, Harley, Bruce, Chenyu and Oliver by the water after the ride, with the Sports Hub dome behind them"
            width={1600}
            height={1200}
          />
        </figure>
      </div>
      <aside className="board p-title__board" aria-label="Project signboard">
        <div>
          <FlipTiles value="70.19" unit="km" active={active} label="70.19 kilometres" />
          <p className="tile-caption">ridden on 1 June 2026</p>
        </div>
        <div>
          <FlipTiles value="5067" prefix="$" active={active} label="5,067 dollars" />
          <p className="tile-caption">raised from 50+ donors</p>
        </div>
        <table className="credits">
          <tbody>
            <tr><th scope="row">For</th><td>Migrant Workers Law Centre</td></tr>
            <tr><th scope="row">Fundraising</th><td>Andrew Goh</td></tr>
            <tr><th scope="row">Outreach</th><td>Oliver Oo</td></tr>
            <tr><th scope="row">Route</th><td>Harley Huang</td></tr>
            <tr><th scope="row">Logistics</th><td>Bruce Liau, Chenyu Hsiao</td></tr>
            <tr><th scope="row">Commenced</th><td>17 March 2026</td></tr>
          </tbody>
        </table>
      </aside>
    </div>
  );
}

/* 01 ----------------------------------------------------------------- */
export function Skyline({ headingId }: PanelProps) {
  return (
    <div className="p-skyline">
      <div className="p-skyline__slogan" data-enter style={i(0)}>
        <p className="statement">
          We often walk past construction sites, clean public spaces and new skyscrapers without thinking twice about
          the people behind them.
        </p>
        <h2 id={headingId} className="h-panel">
          <span>The people behind</span> <span>the skyline</span>
        </h2>
      </div>
      <div className="board p-skyline__issues" data-enter style={i(1)}>
        <p className="label">Problems at work</p>
        <ul>
          <li>Unpaid wages</li>
          <li>Wrongful dismissal</li>
          <li>Unsafe conditions</li>
          <li>Contract disputes</li>
        </ul>
      </div>
      <p className="statement p-skyline__close">
        Most migrant workers can't afford a lawyer when this happens.
      </p>
    </div>
  );
}

/* 02 ----------------------------------------------------------------- */
function Mark({ children, tone = "board" }: { children: ReactNode; tone?: "board" | "ink" | "seam" }) {
  return <mark className={`hl hl--${tone}`}>{children}</mark>;
}

export function Why({ headingId }: PanelProps) {
  return (
    <div className="p-why">
      <Seams at={[33.3]} />
      <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
        <span>Why the</span> <span>MWLC</span>
      </h2>
      <p className="p-why__text" data-enter style={i(1)}>
        We wanted our ride to fund one specific thing. The Migrant Workers Law Centre, run by ProBono SG, gives{" "}
        <Mark>free legal aid</Mark> to migrant workers who cannot afford a lawyer, in cases like{" "}
        <Mark tone="ink">unpaid wages</Mark> and <Mark tone="ink">wrongful dismissal</Mark>. Before asking anyone for
        money, we checked that ProBono SG is a <Mark>registered charity with IPC status</Mark> (UEN 201700430E). We
        raised through <Mark tone="seam">Giving.sg</Mark>, so every dollar went straight to the charity and none of it
        passed through us. <Mark>We also asked people to pledge an amount for each kilometre we rode.</Mark>
      </p>
    </div>
  );
}

/* 03 ----------------------------------------------------------------- */
export function ProBono({ headingId }: PanelProps) {
  return (
    <div className="p-probono">
      <div className="p-probono__caption">
        <h2 id={headingId} className="h-panel">
          <span>Learning from</span> <span>ProBono&nbsp;SG</span>
        </h2>
        <ul className="p-probono__list">
          <li>The MWLC is one part of a wider legal-aid network, alongside criminal defence and community law centres in Hougang and Woodlands.</li>
          <li>ProBono SG also refers clients to social services for problems outside the law.</li>
          <li>We started to see access to justice as something that affects people's wellbeing as well as their legal rights.</li>
        </ul>
      </div>
      <figure className="p-probono__photo">
        <div className="p-probono__frame">
          <img
            src={img("probono-call.jpg")}
            alt="The five of us around a table for our call with ProBono SG"
            width={2400}
            height={1350}
          />
        </div>
        <figcaption className="body">
          26 March 2026: our call with Tricia Teo, Manager of Development and Communications at ProBono SG.
        </figcaption>
      </figure>
    </div>
  );
}

/* 04 ----------------------------------------------------------------- */
const ROLES = [
  { name: "Andrew Goh", role: "Fundraising", text: "Set up the Giving.sg campaign and the pledge form, wrote to ProBono SG, and checked the charity's status." },
  { name: "Oliver Oo", role: "Outreach and nutrition", text: "Ran our Instagram posts and was also our nutritionist." },
  { name: "Harley Huang", role: "Route", text: "Researched and planned a safe 70 km route along the East Coast to Changi and back towards Marina Bay." },
  { name: "Bruce Liau", role: "Health and safety", text: "Led safety planning, timing and our arrangements on the day, together with Chenyu." },
  { name: "Chenyu Hsiao", role: "Equipment", text: "Looked after bikes and kit, and shared the logistics of the day with Bruce." },
];

export const ROLE_COUNT = ROLES.length;

export function Roles({ headingId, step = 0, onStep }: PanelProps) {
  const open = step;
  const setOpen = (n: number) => onStep?.(n);
  return (
    <div className="p-roles">
      <div className="p-roles__intro">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Our roles
        </h2>
        <p className="body" data-enter style={i(1)}>
          We gave out roles at our second meeting, on 17 March. Each of us took charge of one part of the
          project.
        </p>
      </div>
      <div className="p-roles__row" data-enter style={i(2)}>
        {ROLES.map((r, n) => {
          const isOpen = n === open;
          return (
            <div key={r.name} className={`role role--${n + 1}${isOpen ? " is-open" : ""}`}>
              <button
                className="role__tab"
                aria-expanded={isOpen}
                aria-controls={`role-${n}`}
                onClick={() => setOpen(n)}
              >
                <span>{r.name}</span>
              </button>
              <div
                id={`role-${n}`}
                className="role__body"
                aria-hidden={!isOpen}
                {...(!isOpen ? ({ inert: "" } as Record<string, string>) : {})}
              >
                <p className="role__role">{r.role}</p>
                <p className="body">{r.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* 05 ----------------------------------------------------------------- */
export function Goals({ active, headingId }: PanelProps) {
  return (
    <div className="p-goals">
      <div className="p-goals__head">
        <h2 id={headingId} className="h-panel">
          <span>Our</span> <span>goals</span>
        </h2>
        <p className="body">We set these on 26 March, after our call with ProBono SG.</p>
      </div>
      <aside className="board p-goals__board" aria-label="Our targets">
        <div>
          <FlipTiles value="2500" prefix="$" active={active} label="2,500 dollars" />
          <p className="tile-caption">our fundraising target for the MWLC</p>
        </div>
        <table className="credits">
          <tbody>
            <tr><th scope="row">People reached</th><td>100 or more</td></tr>
            <tr><th scope="row">Raised by each of us</th><td>About $500</td></tr>
            <tr><th scope="row">Distance</th><td>70 km</td></tr>
            <tr><th scope="row">Ride day</th><td>1 June 2026</td></tr>
          </tbody>
        </table>
      </aside>
    </div>
  );
}
/* 06 ----------------------------------------------------------------- */
export function Mwlc({ headingId }: PanelProps) {
  return (
    <div className="p-mwlc">
      <figure className="p-mwlc__photo">
        <img
          src={img("mwlc.jpg")}
          alt="The five of us outside the Migrant Workers' Law Centre at 579 Serangoon Road"
          width={1600}
          height={900}
        />
      </figure>
      <div className="p-mwlc__text">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Visiting the MWLC
        </h2>
        <p className="body p-mwlc__where" data-enter style={i(1)}>
          On 28 May we visited 579 Serangoon Road, an office shared with the Migrant Workers' Centre, and met
          Nur, the MWLC's only full-time lawyer.
        </p>
        <ul className="p-mwlc__list" data-enter style={i(2)}>
          <li>Most cases are unpaid wages, wrongful dismissal and contract disputes.</li>
          <li>Many clients know little about their rights or about Singapore's legal system.</li>
          <li>Free legal clinics teach workers their rights before problems start.</li>
        </ul>
        <p className="statement" data-enter style={i(3)}>
          So part of the MWLC's work is helping workers before they ever need a lawyer.
        </p>
      </div>
    </div>
  );
}

/* 07 ----------------------------------------------------------------- */
export function Give({ active, headingId }: PanelProps) {
  return (
    <div className="p-give">
      <div className="p-give__donate">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Two ways to give
        </h2>
        <div className="p-give__copy" data-enter style={i(1)}>
          <h3 className="label">Donate directly</h3>
          <p className="body">A one-off donation through our Giving.sg page. ProBono SG passed the money on to the MWLC.</p>
        </div>
        <a
          className="browser"
          data-ui
          data-enter
          style={i(2)}
          href={CAMPAIGN_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Our Giving.sg campaign page (opens in a new tab)"
        >
          <span className="browser__bar" aria-hidden="true">
            <span className="browser__url">giving.sg/donate/campaign/miles-for-migrant-workers</span>
          </span>
          <img
            src={img("giving-campaign.jpg")}
            alt="Our Giving.sg campaign page: $5,067 raised of a $2,500 goal from 33 donors. The campaign has ended."
            width={1240}
            height={526}
          />
        </a>
      </div>
      <PledgeDial active={active} />
    </div>
  );
}

/* 08 ----------------------------------------------------------------- */
export function People({ headingId }: PanelProps) {
  const rows = [
    { what: "Friends and family", how: "Each of us messaged our own circle, then followed up in person." },
    { what: "Around school", how: "We talked to classmates and teachers about it." },
    { what: "Our Geography trip", how: "In Thailand, our teacher let us speak to the whole trip group." },
    { what: "Parents' networks", how: "ProBono SG suggested we ask the adults around us, too." },
  ];
  return (
    <div className="p-people">
      <Seams at={[66.6]} />
      <div className="p-people__list">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Talking to people
        </h2>
        <ul>
          {rows.map((r, n) => (
            <li key={r.what} data-enter style={i(n + 1)}>
              <span className="p-people__what">{r.what}</span>
              <span className="body">{r.how}</span>
            </li>
          ))}
        </ul>
      </div>
      <blockquote className="p-people__quote" data-enter style={i(5)}>
        <p className="statement">
          Fundraising is not just about collecting money but about getting people to care about an issue they might
          not have considered before.
        </p>
      </blockquote>
    </div>
  );
}

/* 09 ----------------------------------------------------------------- */
export function Online({ headingId }: PanelProps) {
  return (
    <div className="p-online">
      <div className="p-online__cell p-online__head" data-enter style={i(0)}>
        <h2 id={headingId} className="h-panel">
          Going online
        </h2>
      </div>
      <div className="p-online__cell board" data-enter style={i(1)}>
        <p className="p-online__word">WhatsApp</p>
        <p className="body">sent by each of us to our own contacts</p>
      </div>
      <div className="p-online__cell p-online__dark" data-enter style={i(2)}>
        <p className="p-online__word">1,770</p>
        <p className="body">LinkedIn impressions</p>
      </div>
      <div className="p-online__cell board" data-enter style={i(3)}>
        <p className="p-online__word">Instagram</p>
        <p className="body">stories from the MWLC visit, our progress and the ride</p>
      </div>
      <div className="p-online__cell p-online__dark" data-enter style={i(4)}>
        <p className="p-online__word">Giving.sg</p>
        <p className="body">our campaign page, with the full story and a donate button</p>
      </div>
      <div className="p-online__pile">
        <figure className="paste p-online__post p-online__post--1" data-paste style={{ ...i(0), "--r": "-3deg" } as CSSProperties}>
          <img src={img("linkedin-post.jpg")} alt="Andrew's LinkedIn post launching Miles for Migrant Workers" width={1050} height={1792} />
        </figure>
        <figure className="paste p-online__post p-online__post--2" data-paste style={i(1)}>
          <img src={img("pledge-banner.jpg")} alt="The pledge banner we shared, with its QR code" width={1014} height={548} />
        </figure>
        <figure className="paste p-online__post p-online__post--3" data-paste style={i(2)}>
          <img src={img("strava-card.jpg")} alt="The Strava summary we posted after the ride" width={988} height={1756} />
        </figure>
      </div>
    </div>
  );
}

/* 10 ----------------------------------------------------------------- */
export function Ride({ active, headingId }: PanelProps) {
  return (
    <div className="p-ride">
      <div className="p-ride__text">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Ride day, 1&nbsp;June
        </h2>
        <p className="body" data-enter style={i(1)}>
          We set off at about 8:30 am and rode East Coast Park, out to Changi, and back towards Marina Bay.
        </p>
      </div>
      <RouteMap active={active} />
      <aside className="board p-ride__board" aria-label="Ride figures">
        <div>
          <FlipTiles value="70.19" unit="km" active={active} label="70.19 kilometres" />
          <p className="tile-caption">distance</p>
        </div>
        <div>
          <FlipTiles value="4:06" unit="h" active={active} label="4 hours 6 minutes" />
          <p className="tile-caption">moving time</p>
        </div>
        <div>
          <FlipTiles value="17.1" unit="km/h" active={active} label="17.1 kilometres per hour" />
          <p className="tile-caption">average speed</p>
        </div>
      </aside>
    </div>
  );
}

/* 11 ----------------------------------------------------------------- */
export function Plan({ headingId }: PanelProps) {
  return (
    <div className="p-plan">
      <div className="p-plan__text">
        <h2 id={headingId} className="h-panel" data-enter style={i(0)}>
          Not everything went to plan
        </h2>
        <div className="p-plan__events">
          <div data-enter style={i(1)}>
            <p className="label">A slow puncture</p>
            <p className="body">One bike kept losing air, so we stopped every so often to pump it back up.</p>
          </div>
          <div data-enter style={i(2)}>
            <p className="label">Rain near Kallang</p>
            <p className="body">We sped up to stay ahead of the clouds, and it cleared.</p>
          </div>
        </div>
        <p className="statement" data-enter style={i(3)}>
          We still finished all 70.19&nbsp;km.
        </p>
      </div>
      <figure className="paste p-plan__photo" data-paste style={{ "--r": "-4deg" } as CSSProperties}>
        <img
          src={img("tyre.jpg")}
          alt="Three of us crouched over an upturned bike, pumping up the leaking tyre"
          width={900}
          height={1600}
        />
        <span className="sticker p-plan__sticker">Slow puncture, 1 June</span>
      </figure>
    </div>
  );
}

/* 12 ----------------------------------------------------------------- */
export function Result({ headingId }: PanelProps) {
  const max = 5067;
  const at = (v: number) => `${(v / max) * 100}%`;
  return (
    <div className="p-result">
      <h2 id={headingId} className="p-result__claim" data-enter style={i(0)}>
        What we raised
      </h2>
      <p className="figure p-result__figure" data-enter style={i(1)}>
        <span className="p-result__unit">$</span>5,067
      </p>
      <p className="body p-result__caption" data-enter style={i(2)}>
        From 50+ donors, through Giving.sg and pledges, by the time the campaign closed in August. That is just over
        double our goal.
      </p>
      <div className="p-result__bar" role="img" aria-label="$5,067 raised against a goal of $2,500; $2,111 had been raised before the ride">
        <div className="p-result__fill" />
        <div className="p-result__tick" style={{ left: at(2111) }}>
          <span>$2,111 before the ride</span>
        </div>
        <div className="p-result__tick p-result__tick--goal" style={{ left: at(2500) }}>
          <span>$2,500 goal</span>
        </div>
      </div>
    </div>
  );
}

/* 13 ----------------------------------------------------------------- */
export function Learnt({ headingId }: PanelProps) {
  const items = [
    {
      lo: "Global engagement",
      quote:
        "Before we started, we understood the issue in a fairly abstract way. After visiting the MWLC, speaking with Nur and spending months fundraising and advocating for the cause, it feels far more personal.",
    },
    {
      lo: "Initiative and planning",
      quote:
        "Every stage required a different kind of effort, from setting up the Giving.sg page, to drafting outreach emails and following up with donors after the ride.",
    },
    {
      lo: "Ethics of choices",
      quote:
        "Framing it in a way that was honest about the problem without being exploitative or reductive about the people it affects.",
    },
  ];
  return (
    <div className="p-learnt">
      <div className="p-learnt__head">
        <h2 id={headingId} className="h-panel">
          <span>What we</span> <span>learnt</span>
        </h2>
      </div>
      <ul className="p-learnt__list">
        {items.map((it) => (
          <li key={it.lo}>
            <figure className="p-learnt__item">
              <figcaption className="label">{it.lo}</figcaption>
              <blockquote>
                <p className="body">{it.quote}</p>
              </blockquote>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
/* 14 ----------------------------------------------------------------- */
export function Questions({ headingId }: PanelProps) {
  return (
    <div className="p-questions">
      <h2 id={headingId} className="p-questions__q">
        <span className="p-questions__top">Any</span> <span className="p-questions__bottom">questions?</span>
      </h2>
      <div className="p-questions__middle">
        <p className="statement" data-enter style={i(0)}>
          Tonight is our Demonstration stage. We're sharing what we did so more people know the MWLC exists.
        </p>
        <div className="p-questions__actions" data-enter style={i(1)}>
          <a className="btn btn-ghost" href="https://www.probono.sg/" target="_blank" rel="noreferrer">
            Learn about ProBono SG
          </a>
        </div>
        <p className="body p-questions__thanks" data-enter style={i(2)}>
          Thank you to ProBono SG, Tricia Teo, Nur at the MWLC and our 50+ donors.
        </p>
      </div>
    </div>
  );
}
