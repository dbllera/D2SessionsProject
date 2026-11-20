# D2: The Half a Day Away Sessions — Gothic Reading Room

D2: The Half a Day Away Sessions is a dialogue incubator connecting Duke and Duke Kunshan University through a life-size audiovisual portal and an evolving 3D museum. Inspired by Shared Studios, the project explores how spatial design, sound, and guided conversation can create a sense of presence across distances without relying on expensive VR technology. Participants begin by exploring a virtual museum of artifacts from previous Duke-DKU encounters, selecting an object, memory, or question to initiate a live conversation through the portal. Following their discussion, participants collaboratively create an artifact that preserves the memories and perspectives/answers exchanged during their conversation. We will use this co-created product to expand a living archive, so future participants can revisit earlier dialogues, respond to previous answers, and build on the experiences of others. We will draw on concepts from somatic telepresence, second-order cybernetics, and distributed authorship to explore how dialogue can create an evolving memory between twelve-hour time zones

This is the first-person **Gothic Reading Room** museum prototype, built with Three.js, TypeScript and Vite. It uses the same project layout as the `dku-library` branch.

## Run it

Requires Node 18+.

```bash
npm install
npm run dev          # → http://127.0.0.1:5173/
```

Production build: `npm run build` (type-checks, then writes `dist/`), then `npm run preview` (→ http://127.0.0.1:4173/). `dist/` is static and can be hosted anywhere; asset paths are relative.

## Controls

| Input | Action |
| --- | --- |
| W A S D / arrows | Walk (hold Shift to walk faster) |
| Mouse | Look (click and drag if the browser refuses pointer lock) |
| E | Explore the artifact under the crosshair / close its panel |
| R | Ride the mechanical bull (when standing beside it) |
| M | Mute / unmute |
| Esc | Pause |

## Smoke test

With `npm run dev` running:

```bash
npm run smoke            # headless system Chrome; screenshots in ./smoke-shots
HEADED=1 npm run smoke   # watch it run
```

The smoke test uses `playwright-core` with the installed Google Chrome (`CHROME_PATH` overrides the path). It checks that:

- the page loads and all 10 artifacts are built
- walking works
- every artifact can be focused, opened and closed
- the counter reaches 10 / 10
- the bull ride works: menu, countdown, climbing off, results, back to the museum
- pause and resume work
- wall collisions stop the player
- the console shows no errors

## Where things live

```
index.html                 page markup: HUD, start screen, artifact panel, ride + pause dialogs
public/images/             photos served as-is
src/
  main.ts                  entry: builds room + artifacts, wires UI, frame loop, window.__d2 test hook
  style.css                all styles
  renderer.ts              WebGL renderer, scene, camera, root `world` group
  state.ts                 shared state: game screen, player, held keys, current room
  dims.ts                  room dimensions and truss/bay positions
  room.ts                  the Gothic Reading Room: walls, roof, windows, bookcases, furniture, lights
  textures.ts              canvas texture helpers + shared procedural textures
  materials.ts             shared materials; glowMat() = materials that highlight on focus
  geo.ts                   mesh / merge / instancing / Gothic arch helpers
  environment.ts           painted environment map for reflections
  player.ts                movement, collisions, mouse look
  pointer.ts               pointer lock (with drag-to-look fallback)
  input.ts                 keyboard + mouse handlers (routes keys by game state)
  focus.ts                 which artifact you are looking at; prompt + glow
  hud.ts                   discovered counter, toasts
  panel.ts                 artifact side panel; renderMedia() renders each media type
  screens.ts               start screen and pause menu
  audio.ts                 ambience, footsteps, generated music, speech
  ride.ts                  mechanical bull mini-game
  util.ts                  $, seeded rng, HTML escaping
  artifacts/
    data.ts                ← artifact content (titles, stories, positions)
    types.ts               Artifact / ArtifactMedia types
    builders/              one file per display (audioStation, letter, bull, …) + index.ts registry
    placard.ts             the brass "D2 MUSEUM" placard next to each artifact
    foodTextures.ts        illustrated meal pictures (artifact 04)
    menu.ts                I95 Burger menu drawing (artifact 10)
    photos.ts              photo asset paths
tools/smoke.mjs            browser smoke test
```

### Adding an artifact

1. Add an entry to `src/artifacts/data.ts`. Give it a unique `id`, a `pos` in the room, a `radius` (how close the player must be to focus it) and a `media` block. The media `type` values are listed in `src/artifacts/types.ts`.
2. Set `build` to an existing builder, or add one:
   - Create `src/artifacts/builders/<name>.ts`. It places meshes and calls `room.addBox(...)` for collisions and `placard(...)` for the label.
   - Have it return the `glowMat` materials that should pulse when the artifact is in focus.
   - Register it in `builders/index.ts`.
3. If the panel needs a new kind of media, add a branch to `renderMedia` in `src/panel.ts`.

## Notes

- three.js is pinned to **0.128.0**, the same release the original single-file prototype loaded from the CDN. This keeps lighting and colours identical. Newer releases change the light units and the colour-management API (`outputEncoding` → `outputColorSpace`), so upgrading needs a visual pass.
- TypeScript runs in non-strict mode for now. The scene code was moved over as-is from the single-file prototype, with only the module boundaries and types added. Strictness can be turned on file by file as the code gets refactored.
- `npm run format` runs Prettier over `src/` and `tools/`.
- Most stories are fictional placeholders. Artifact 10 comes from a D2 team member's own summer at DKU.
