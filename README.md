# Miles for Migrant Workers: presentation deck

## On the night

Build it once beforehand:

```bash
npm install
npm run build
```

Then either run `npm run preview` and open http://localhost:4173, or double-click `dist/index.html`. It works offline.

It is one scrolling page. On a laptop or projector, the route down the left shows the five CAS stages, and the rider marks how far through the story you are. Each section fills the screen, and a mouse-wheel notch or a touchpad swipe glides to the next one, just like the keys or a clicker.

| Key | Does |
|---|---|
| → / ↓ / Space / Page Down (clickers) | Next section (on "Our roles" it steps through each rider first) |
| ← / ↑ / Page Up | Previous section |
| 1 – 5 | Jump to a CAS stage |
| Home / End | Top / last section |
| F | Fullscreen |

| R | Show the hidden remote link (see below) |
| L | Start or stop the auto-loop |

### Control it from a phone

Press **R** on the laptop. A panel shows a private link (`...?remote=<code>`). Open it on a phone or tablet: it shows the current section with big Back and Next buttons, the five stage buttons, and the auto-loop switch. The code is random and saved in the laptop's browser, so the same link keeps working after a reload. Nothing on the slides points to it. Anyone with the link can drive the deck, so do not post it.

There are two ways it connects:

- **Internet (default).** The devices connect directly (WebRTC), using PeerJS's free public relay only to introduce them. Both need internet, and it fails on networks that block WebRTC, which some school wifi does.
- **Local, no internet (use this at school).** On the laptop run `npm run build` once, then `npm run present` instead of opening `dist/index.html`. Open http://localhost:4173 on the laptop. The phone must be on the same network as the laptop; press **R** and the link it shows uses the laptop's network address. If the school wifi isolates devices from each other, turn on the laptop's mobile hotspot, join the phone to it, and use the link from the terminal output (`Remote: http://<address>:4173/?remote=1`). The deck and remote switch to this mode automatically.

### Auto-loop

Press **L** (or use the switch in the R panel or on the phone). It advances every 10 to 60 seconds (default 20), steps through the riders on "Our roles", and goes back to the title after the last section. Any manual move restarts the countdown, and an open notice pauses it. While it runs, the 3-minute idle reset is off.

The cursor hides after 2 seconds. On the booth laptop the page scrolls back to the top after 3 minutes idle; add `?attract=off` to the address to stop that. Screens narrower than 1100px get the phone layout.

## Hosting on GitHub Pages

Put **only this `site` folder** online, in a repository of its own. The project folder above it holds `Resources/` (reflections, emails, the CAS write-up), and a GitHub Pages repository on a free account has to be public.

1. On GitHub, create a new empty repository, e.g. `miles-for-migrant-workers`. Do not add a README.
2. In a terminal, inside this `site` folder:

   ```bash
   git init -b main
   git add .
   git commit -m "Miles for Migrant Workers deck"
   git remote add origin https://github.com/<your-username>/miles-for-migrant-workers.git
   git push -u origin main
   ```

3. On GitHub, open the repository's **Settings → Pages**, and under **Build and deployment → Source** choose **GitHub Actions**.
4. Open the **Actions** tab. The "Deploy to GitHub Pages" workflow runs on every push to `main`; when it finishes (about a minute), the deck is live at `https://<your-username>.github.io/miles-for-migrant-workers/`.

To update the site later, commit and push again from this folder; it redeploys by itself.

## Credits

- The ride map is our own Strava screenshot.
- Typeface: Archivo (SIL Open Font License), self-hosted.
