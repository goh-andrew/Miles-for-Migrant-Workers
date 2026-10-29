const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

// Our own map of the ride. Coastlines come from OpenStreetMap (land built from its
// coastline ways; Malaysia shaded using geoBoundaries). The route is the line from our
// Strava summary card, placed by fitting that card's map onto the real coastline.
// route-base.png is land and water; route-line.png is the route. Both 2400 x 1157,
// covering lon 103.60-104.10 from lat 1.4705 down, in Web Mercator.
const VIEW = { w: 2400, h: 1157 };

// Tags sit beside the places on the route; plain labels name the land around it.
const PLACES = [
  { name: "Changi", left: 79, top: 29 },
  { name: "East Coast Park", left: 59, top: 74 },
  { name: "Marina Bay", left: 48, top: 84 },
];
const AREAS = [
  { name: "Singapore", left: 34, top: 42 },
  { name: "Pulau Ubin", left: 65, top: 13 },
  { name: "Malaysia", left: 5, top: 4 },
];

export function RouteMap({ active }: { active: boolean }) {
  return (
    <figure className="route shutter">
      <div className="route__frame" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
        <img
          className="route__map"
          src={img("route-base.png")}
          alt="Map of Singapore with our route from Marina Bay along East Coast Park to Changi"
          width={VIEW.w}
          height={VIEW.h}
        />
        <img
          className={active ? "route__line is-drawing" : "route__line"}
          src={img("route-line.png")}
          alt=""
          width={VIEW.w}
          height={VIEW.h}
        />
        {AREAS.map((a) => (
          <span key={a.name} className="route__area" style={{ left: `${a.left}%`, top: `${a.top}%` }} aria-hidden="true">
            {a.name}
          </span>
        ))}
        {PLACES.map((p) => (
          <span key={p.name} className="route__place" style={{ left: `${p.left}%`, top: `${p.top}%` }} aria-hidden="true">
            {p.name}
          </span>
        ))}
        <span className="route__credit">© OpenStreetMap</span>
      </div>
    </figure>
  );
}
