# Miles for Migrant Workers: presentation deck

## On the night

Build it once beforehand:

```bash
npm install
npm run build
```

Then either run `npm run preview` and open http://localhost:4173, or double-click `dist/index.html`. It works offline.

It is one scrolling page. On a laptop or projector, the route down the left shows the five CAS stages, and the rider marks how far through the story you are. Visitors can simply scroll; when presenting, use the keys or a clicker to jump section by section.

| Key | Does |
|---|---|
| → / ↓ / Space / Page Down (clickers) | Next section (on "Our roles" it steps through each rider first) |
| ← / ↑ / Page Up | Previous section |
| 1 – 5 | Jump to a CAS stage |
| Home / End | Top / last section |
| F | Fullscreen |

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
