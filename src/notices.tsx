import type { ReactNode } from "react";

const img = (name: string) => `${import.meta.env.BASE_URL}img/${name}`;

export type Notice = { id: string; title: string; body: ReactNode };

export const NOTICES: Record<string, Notice> = {
  route: {
    id: "route",
    title: "Our route tonight",
    body: (
      <ol className="n-stages">
        <li><h3>Investigation</h3><p>Choosing a cause, and learning how ProBono SG works.</p></li>
        <li><h3>Preparation</h3><p>Roles, goals, a visit to the MWLC, and setting up the campaign.</p></li>
        <li><h3>Action</h3><p>Telling people about the cause, online and in person, then riding 70.19 km on 1 June.</p></li>
        <li><h3>Reflection</h3><p>What we raised, and what we learnt.</p></li>
        <li><h3>Demonstration</h3><p>Tonight's presentation.</p></li>
      </ol>
    ),
  },
  team: {
    id: "team",
    title: "Working as a team",
    body: (
      <div className="n-cols">
        <div>
          <h3>What worked</h3>
          <p>
            We gave out roles at our second meeting, on 17 March, so each of us knew what we were responsible
            for.
          </p>
          <p>
            Each of us also messaged our own friends and family, so between us we reached more people than one
            person could.
          </p>
        </div>
        <div>
          <h3>Making decisions together</h3>
          <p>
            We chose the cause, the pledge-per-kilometre model and the name together, after comparing options such as
            Miles for Migrants, Journey for Justice and Rights for Every Worker.
          </p>
          <p>All five of us were on the call with ProBono SG and at the MWLC visit, so we all heard the same things first-hand.</p>
        </div>
      </div>
    ),
  },
  timeline: {
    id: "timeline",
    title: "From idea to plan",
    body: (
      <ol className="n-timeline">
        <li><strong>Meeting 1</strong><span>Chose the MWLC, the pledge-per-km model and Giving.sg.</span></li>
        <li><strong>17 March</strong><span>Meeting 2: gave out roles; checked ProBono SG's charity status.</span></li>
        <li><strong>20 March</strong><span>Meeting 3: set the first practice ride; drafted the email to ProBono SG.</span></li>
        <li><strong>21 March</strong><span>Email sent to ProBono SG; Tricia Teo replied.</span></li>
        <li><strong>26 March</strong><span>Call with ProBono SG; set our goals; chose the name.</span></li>
        <li><strong>17 April</strong><span>First practice ride.</span></li>
        <li><strong>28 May</strong><span>Visited the MWLC and met Nur.</span></li>
        <li><strong>1 June</strong><span>Ride day: 70.19 km.</span></li>
        <li><strong>August</strong><span>Campaign closed at $5,067; final reflections.</span></li>
      </ol>
    ),
  },
  training: {
    id: "training",
    title: "Training for 70 km",
    body: (
      <div className="n-split">
        <img src={img("stretching.jpg")} alt="Four of us stretching at an exercise corner before a practice ride" width={1600} height={1200} loading="lazy" />
        <div>
          <p>Harley planned the route along the East Coast, towards Changi and back to Marina Bay, so the whole group could ride it safely.</p>
          <p>Our first practice ride was on 17 April. Bruce and Chenyu handled safety, timing and equipment.</p>
        </div>
      </div>
    ),
  },
  gallery: {
    id: "gallery",
    title: "The campaign in the wild",
    body: (
      <div className="n-gallery">
        <figure>
          <img src={img("linkedin-post.jpg")} alt="Andrew's LinkedIn post about the campaign" width={1050} height={1792} loading="lazy" />
          <figcaption>LinkedIn: 1,770 impressions</figcaption>
        </figure>
        <figure>
          <img src={img("pledge-banner.jpg")} alt="The pledge banner with its QR code" width={1014} height={548} loading="lazy" />
          <figcaption>The pledge banner and QR code</figcaption>
        </figure>
        <figure>
          <img src={img("strava-card.jpg")} alt="The Strava ride summary we shared" width={988} height={1756} loading="lazy" />
          <figcaption>The ride summary we shared afterwards</figcaption>
        </figure>
      </div>
    ),
  },
  numbers: {
    id: "numbers",
    title: "The ride in numbers",
    body: (
      <div className="n-split">
        <dl className="n-stats">
          <div><dt>Distance</dt><dd>70.19 km</dd></div>
          <div><dt>Moving time</dt><dd>4:06:48</dd></div>
          <div><dt>Average speed</dt><dd>17.1 km/h</dd></div>
          <div><dt>Top speed</dt><dd>36.0 km/h</dd></div>
          <div><dt>Elevation gain</dt><dd>95 m</dd></div>
          <div><dt>Highest point</dt><dd>18 m</dd></div>
        </dl>
        <img src={img("strava-stats.jpg")} alt="Strava's summary of the ride: 70.19 km in 4 hours 6 minutes" width={738} height={1028} loading="lazy" />
      </div>
    ),
  },
  loop: {
    id: "loop",
    title: "Closing the loop",
    body: (
      <div className="n-cols">
        <div>
          <h3>Collecting pledges</h3>
          <p>After the ride we sent our pledgers the Strava record as proof of the distance and asked them to give what they had pledged.</p>
        </div>
        <div>
          <h3>Thanking supporters</h3>
          <p>We posted the ride summary to thank everyone and kept following up until the Giving.sg campaign closed.</p>
        </div>
      </div>
    ),
  },
  dignity: {
    id: "dignity",
    title: "Doing it with dignity",
    body: (
      <ul className="n-points">
        <li><h3>Showing people with dignity</h3><p>We wanted to show migrant workers accurately, as people with rights rather than people to feel sorry for. That is why there are no photos of workers in this presentation.</p></li>
        <li><h3>Being honest about the problem</h3><p>Each case at the MWLC involves a real person dealing with an unfamiliar legal system. We tried not to oversimplify that in our posts.</p></li>
        <li><h3>Being open about money</h3><p>We worked directly with ProBono SG and raised through Giving.sg, so no donor's money ever passed through us.</p></li>
      </ul>
    ),
  },
  thanks: {
    id: "thanks",
    title: "Thank you",
    body: (
      <ul className="n-points">
        <li><h3>ProBono SG</h3><p>Tricia Teo, for the call that shaped our goals and her guidance on running the campaign.</p></li>
        <li><h3>The Migrant Workers Law Centre</h3><p>Nur, for walking us through the centre's work.</p></li>
        <li><h3>Our donors and pledgers</h3><p>Everyone who donated or pledged. Together you gave $5,067.</p></li>
      </ul>
    ),
  },
};
