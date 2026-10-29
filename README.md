# Miles for Migrant Workers: presentation deck

## On the night

The deck works offline. Build it once beforehand:

```bash
npm install
npm run build
```

Then either:

- **Run it:** `npm run preview` and open http://localhost:4173, or
- **Open it straight from the folder:** double-click `dist/index.html`.

Press **F** for fullscreen.

## Controls

| Key | Does |
|---|---|
| → / Space / Page Down (clickers) | Next panel |
| ← / Page Up | Previous panel |
| 1 – 5 | Jump to Investigation, Preparation, Action, Reflection, Demonstration |
| Home / End | Title / last panel |
| N | Open this panel's notice (booth extras); Esc closes it |
| F | Fullscreen |

- The mouse cursor hides after 2 seconds of no movement.
- On the booth laptop, the deck walks back to the title after 3 minutes with no input. Add `?attract=off` to the address to turn that off.
- The address remembers the panel (`#/7`), so a refresh keeps your place.

## Changing the content

- **Main panels:** `src/panels.tsx`
- **Booth notices:** `src/notices.tsx`
- **Photos:** `public/img`, resized copies of the files in `../Resources`

## Still to add

- One line from each member about working together (the "Working as a team" notice).
- The date of the MWLC visit, for the "From idea to plan" notice.
- The fixed Canva poster, if you want it in the gallery. The current one still has template text.
