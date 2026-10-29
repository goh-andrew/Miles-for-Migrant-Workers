const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

// Our ride as Strava drew it: the route band of "Strava Map.jpeg" (x 40, y 432, 698 x 337),
// cropped clear of the app's buttons. It keeps Strava's own map, route and PR badges.
const VIEW = { w: 698, h: 337 };

export function RouteMap(_props: { active: boolean }) {
  return (
    <figure className="route shutter">
      <div className="route__frame" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
        <img
          className="route__map"
          src={img("strava-route.jpg")}
          alt="Strava map of our ride from Marina Bay along East Coast Park to Changi, with personal-best badges for our fastest 20K, 30K and 40K"
          width={VIEW.w}
          height={VIEW.h}
        />
      </div>
    </figure>
  );
}
