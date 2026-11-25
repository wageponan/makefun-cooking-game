# Screenshots still needed

The game is finished, but its 3 to 4 screenshots have NOT been captured yet.
The build machine has no desktop browser and no headless browser installed
(no chromium, firefox or playwright), and the kit's rules require real
renders of the game's own code in a browser: never edited, composited,
borrowed or fabricated. So no images were generated here on purpose.

## How to capture them (about 5 minutes on any PC with Chrome)

1. Serve the `game/` folder with any static file server, for example
   `python3 -m http.server -d game 8080` or `npx serve game`.
2. Open the game in desktop Chrome at a window near 1280x800.
3. The game poses real scenes for the camera through its `?shot=` scenes
   (the same trick the kit's starter uses). Capture these four, matching
   `shots.json` in this repo root:
   - `screenshots/1-mid-assembly.png` from `?shot=play&seed=7`
     (order board full, Nasi Goreng mid-assembly on the plate, timer running)
   - `screenshots/2-plate-ready.png` from `?shot=serve&seed=7`
     (a finished plate ready to serve)
   - `screenshots/3-start-screen.png` from the plain page (start screen)
   - `screenshots/4-day-over.png` from `?shot=end&seed=7`
     (game-over screen with the day's results)
4. Gate limits per image: PNG or JPEG, at most 256 KiB, long side at most
   1280 px, short side at least 480 px. 1280x800 PNGs of this flat game
   compress well under the cap; if one is over, save it as JPEG quality 85.
5. Delete `screenshots/.gitkeep` once the real images are in place; the
   folder must hold only the 3 or 4 screenshots when the entry is handed in.
6. Then verify the hand-in locally: `MAKEFUN_OUTPUT_DIR=out node main.ts`
   and check `out/dossier.json` is written without an error.
