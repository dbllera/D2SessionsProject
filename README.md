# DKU library reading room — first-person prototype

This is the `dku-library` branch of [D2SessionsProject](https://github.com/dbllera/D2SessionsProject). The Gothic Reading Room remains on the repository's `main` branch.

A walkable 3D reconstruction of the double-height reading room shown in the reference photos. It is built with real geometry and materials in Three.js, TypeScript and Vite. There is no score or quest; you explore and interact.

## Run it

Requires Node 18+ (tested with Node 25, Chrome on an Apple M3 Pro).

```bash
npm install
npm run dev          # → http://127.0.0.1:5173/
```

Production build: `npm run build`, then `npm run preview` (→ http://127.0.0.1:4173/).

Everything is local. There are no remote assets or runtime services, and all textures are either generated procedurally on a canvas or converted from the reference photos.

## Controls

| Input | Action |
| --- | --- |
| Click | Enter (captures the mouse) |
| W A S D / arrows | Walk (hold Shift to walk faster) |
| Mouse | Look |
| E | Interact when a prompt appears under the crosshair |
| R | Reset to the entrance by the glass doors |
| Esc | Release the mouse (click to resume) |

**Interactions** (all repeatable):

1. **Inspect books:** aim at any teal volume group on the lit shelf wall (west) and press E. The group slides forward and a panel shows the matching reference photo (IMG_9805). Press E again to put it back.
2. **Lights:**
   - The black control panel at the south end of the shelf (near the white door) turns the shelf lighting on or off: the cubby glow, the LED strips and the area light. Its LED turns green or orange.
   - Each silk pendant can be switched individually: look up at one and press E.
3. **Lattice panel:** the panel with the small brass pull, roughly in the middle of the south screen row, swings open on its floor pivot. You can walk through it into the corridor behind, up to the glass balustrade above the atrium. It won't close while you stand in its swing.

`?debug` in the URL shows an FPS/draw-call readout and exposes `window.__lib` for the smoke test.

## Smoke test

With the dev server running:

```bash
npm run smoke            # headless system Chrome; screenshots in ./smoke-shots
HEADED=1 npm run smoke   # watch it run
```

The test uses `playwright-core` with the installed Google Chrome (`CHROME_PATH` overrides the path). It uses real keyboard and mouse input to check:
- pointer lock and eye height
- WASD movement and mouse look
- collisions with all four walls, furniture and the closed lattice
- each interaction three times in a row
- walking through the opened panel, and the balustrade stop
- the refusal to close the panel on the player
- R reset and Esc release
- that walking distance is the same at 144, 60, 30 and 15 fps
- zero console errors

## How the images became the scene

The panoramas are photographic sweeps, not 360° images, so they were used to recover the order of the walls and the rough proportions. They are not used as a backdrop.

- **Plan.** Panorama 2 is shot from near the glass wall looking at the lattice. Panorama 1 is shot from near the lattice looking back at the glass. Both sweeps pass the walls in the same cyclic order: glass → display → lattice → shelves. That gives a rectangle with the **glass wall at north, display wall at east, lattice at south and shelf wall at west**.
- **Glass wall (N).** Lower curtain wall with mullions, a transom and glass double doors; a white spandrel band; upper glazing. Night exterior behind (IMG_9803/9804 show it is outside). Three dark open bookcases stand in front, with lounge pairs near both corners.
- **Display wall (E).** Pale wall with a large black display flanked by thin speaker columns, plus a white three-bin recycling cabinet near the glass corner (Panorama 1 and 2).
- **Lattice (S).** About 3.4 m honey-wood pivot screens: vertical slats, square-grid bands top and bottom, a triple rail at mid-height, and stainless floor pivots (IMG_9809). They are set in a shallow zig-zag (Panorama 1, right). Behind them: a corridor, a glass balustrade, and a bright atrium with wide wooden stair seating (IMG_9808). Above: a cream bulkhead with a slot diffuser and upper glazing to the floor above.
- **Shelf wall (W).** Oak base cabinets with five rows of cubbies above, with LED strips under each shelf and a warm glowing back. The vertical dividers are deliberately staggered, as in IMG_9801. Books are sparse teal volume groups (spine texture cropped from IMG_9805), a few spiral copybooks, two small black speakers and a brush rack. A white service door sits near the glass corner.
- **Upper walls and ceiling.** Vertical wood slat cladding above an LED cove line on both side walls, and a dark wood grid ceiling (IMG_9806, IMG_9810).
- **Pendants.** 14 silk lanterns in three lathe profiles (bell, bicone, hourglass) with rib textures, hung at mixed heights (IMG_9806, IMG_9810).
- **Furniture.**
  - Five-lobed walnut round tables with book-matched five-segment tops, brass ferrules and curved cross stretchers (IMG_9798).
  - Ming-style armchairs with S-curved splats and gray seat pads (IMG_9799).
  - Kidney tables with a high-back upholstered chair and four curved bench stools (IMG_9801).
  - The oval tea cabinet with stone top and faucet (IMG_9802).
  - Bentwood lounge chairs in blue-gray fabric (IMG_9803) and tripod tray side tables (IMG_9804).
- **Text in the images.** The spine title 崑曲藝術大典 and the shelf tag “Floor3 Tea House” are quoted in the inspect panel as source material. The English gloss of the title is my translation.

## Assumptions (inferred, not measured)

Nothing here was surveyed. These values are plausible readings of the photos, picked for believable human scale:

| Item | Value used | Basis |
| --- | --- | --- |
| Room footprint | 15 m (E–W) × 18 m (N–S) | Table and chair counts across the panoramas |
| Ceiling | 8.6 m; slat cladding from 5.6 m | Display height vs. wall height, roughly 2.5× |
| Floor tile | 0.8 m square | Chair seat (~0.5 m) vs. tile in IMG_9798/9803; could be rectangular |
| Display | 6.0 × 3.4 m, centred 1 m south of the room's middle | Panorama proportions |
| Shelf run | 12 m, 0.6 m columns, 5 rows × 0.52 m over 0.9 m cabinets | IMG_9801/9810 |
| Lattice | 18 panels, about 0.81 × 3.4 m; corridor 2.2 m deep | IMG_9808/9809 |
| Furniture | Table Ø1.0 × 0.76 m, seat 0.45 m, back 1.0 m, kidney 2.0 × 0.72 m | Standard sizes matched to the photos |
| Layout | 12 round tables on a jittered 3 × 4 grid plus extras; aisles ≥ 0.8 m | Loose match to the panoramas; exact positions are not recoverable |
| Pendants | 14 lanterns, bottoms at 4.3–6.4 m | Count and heights estimated from IMG_9806/9810 |
| Exterior / atrium | Painted night backdrop; simplified white atrium | Only glimpsed in the photos |
| Which panel opens | The one with the brass pull, chosen for gameplay | Not known which panels pivot in reality |

## Known limitations

- **Lighting is approximate.** One directional key light stands in for ceiling downlights and is the only shadow caster; its shadow map is rendered once and refreshed only while the panel swings. The 14 lanterns share 4 pooled point lights, so switching one off dims its quadrant only slightly while its shade goes dark. The shelf glow is one area light plus emissive surfaces. There is no global illumination or real-time floor reflection.
- Glass is a simple transparent material without refraction. Reflections come from a generic environment map, not the room itself.
- Furniture is modelled from primitives (lathe, extrude, tube, box). Silhouettes follow the photos, but joinery, upholstery seams and carving are simplified.
- Collision is 2D (floor plane). You can't sit, crouch, jump or climb stairs, and the atrium can only be looked at.
- A decrease-only resolution scaler lowers the render resolution if the frame rate stays under about 48 fps. It never raises it again within a session.
- The night exterior and atrium are stand-ins, not reconstructions.
- Desktop only: mouse and keyboard with pointer lock. No touch or gamepad.

## Project layout

```
D2SessionsProject/
  index.html            UI overlay, HUD, inspect panel
  src/main.ts           renderer, lighting, post-processing, interactions, loop
  src/dims.ts           room dimensions and spawn point (all assumed values in one place)
  src/room.ts           walls, glazing, ceiling, display wall, corridor, atrium, exterior
  src/shelf.ts          shelf wall, books, shelf lighting and switch
  src/lattice.ts        lattice screens and the pivoting panel
  src/pendants.ts       silk lantern pendants and pooled lights
  src/layout.ts         furniture placement and colliders
  src/furniture.ts      furniture geometry builders
  src/collision.ts      2D circle/box/segment collision
  src/player.ts         pointer-lock first-person controller
  src/textures.ts       procedural canvas textures
  src/materials.ts      shared materials
  public/reference/     reference photos converted from HEIC to JPEG (1600 px long edge; panoramas 4096 px)
  public/textures/      book-spine crop from IMG_9805
  tools/smoke.mjs       browser smoke test
```

The original HEIC files were only read, never modified. This branch contains optimized JPEG references; the HEIC originals remain in the separate source folder and are not served.
