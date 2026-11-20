# D2: The Half a Day Away Sessions — connected worlds

D2: The Half a Day Away Sessions is a dialogue incubator connecting Duke and Duke Kunshan University through a life-size audiovisual portal and an evolving 3D museum. Inspired by Shared Studios, the project explores how spatial design, sound, and guided conversation can create a sense of presence across distances without relying on expensive VR technology. Participants begin by exploring a virtual museum of artifacts from previous Duke-DKU encounters, selecting an object, memory, or question to initiate a live conversation through the portal. Following their discussion, participants collaboratively create an artifact that preserves the memories and perspectives/answers exchanged during their conversation. We will use this co-created product to expand a living archive, so future participants can revisit earlier dialogues, respond to previous answers, and build on the experiences of others. We will draw on concepts from somatic telepresence, second-order cybernetics, and distributed authorship to explore how dialogue can create an evolving memory between twelve-hour time zones

This branch joins the two first-person prototypes into one walk:

1. Visitors **start in the DKU Library** (`dku/`).
2. Behind the brass-handled lattice panel (south side), the **atrium stair** climbs to a doorway marked *To Duke*. Walking into it fades to black and loads the Duke world.
3. Visitors **arrive in the Duke Gothic Reading Room** (`duke/`) just inside the **south door**.
4. Facing that door and pressing **E** takes them back to the DKU Library, at the top of the stair.

## Layout and ownership

```
dku/                 DKU engineer  — DKU Library app (three r171, strict TS)
duke/                Duke engineer — Gothic Reading Room app (three r128)
shared/portal.ts     both          — the travel contract (the only shared code)
tools/smoke-portal.mjs  both       — end-to-end crossing test
package.json         both          — root scripts only
```

Each world is a **complete, independent Vite app**, with its own `package.json`, lockfile, `tsconfig.json`, `vite.config.ts`, `public/` and smoke test. A DKU change never touches `duke/` and a Duke change never touches `dku/`, so the two engineers don't get merge conflicts. Even the three.js versions are separate. `.github/CODEOWNERS` enforces this. Replace its placeholder usernames.

**Change `shared/portal.ts` together.** It defines:

- `travel(to, arrive)`: fades out, then loads the other world with `?arrive=<point>`.
- `readArrival()`: reads (and removes) that parameter on load.
- `fadeIn()`

Arrival points are names (`'stairs-top'`, `'south-door'`). Each world decides where its name puts the player, so neither world needs to know the other's coordinates. Add a new crossing by adding a name to `Arrival`.

| Crossing | Code |
| --- | --- |
| DKU stair doorway → Duke | `dku/src/stairs.ts` (`AtriumStair`), trigger in `dku/src/main.ts` |
| Duke south door → DKU | `duke/src/portalDoor.ts`, `E` in `duke/src/input.ts` |
| Arrival in DKU (`stairs-top`) | `dku/src/main.ts` → `stair.topArrival` |
| Arrival in Duke (`south-door`) | `duke/src/main.ts` → existing `room.spawn` |

## Run it

Requires Node 18+.

```bash
npm run setup        # installs root, dku/ and duke/ dependencies
npm run dev          # DKU → http://127.0.0.1:5173/   Duke → http://127.0.0.1:5174/
```

Working on one world only: `npm run dev --prefix dku` or `npm run dev --prefix duke`. The crossing then leads to a server that isn't running, which is fine while working on one world.

Production: `npm run build` type-checks both worlds and writes one static site. `dist/` holds the DKU Library and `dist/duke/` holds the Duke room, and the links between them are relative. Then run `npm run preview` (→ http://127.0.0.1:4173/).

## Tests

With `npm run dev` running:

```bash
npm run smoke          # dku smoke, duke smoke, then the portal crossing test
npm run smoke:portal   # just DKU → Duke → DKU (HEADED=1 to watch)
DKU_URL=http://127.0.0.1:4173/ DUKE_URL=http://127.0.0.1:4173/duke/ npm run smoke:portal   # against `npm run preview`
```

## History

`dku/` and `duke/` were imported, with their full history, from the former `dku-library` and `gothic-modular` branches (`gothic-modular` was itself built from the single-file `duke` branch). Those branches have been retired; everything they contained is in this branch's history (`git log -- dku/` or `git log -- duke/`).
