/**
 * Room dimensions in metres. These are INFERRED from the panoramas (furniture counts, chair and
 * table sizes, tile counts), not measured. See README "Assumptions".
 *
 * Plan orientation (looking down, +x east, +z south):
 *   z = -9   north: tall glazed window wall (exterior, night)
 *   x = +7.5 east : pale wall with the large dark display
 *   z = +9   south: pivoting wood lattice screens; corridor + atrium behind
 *   x = -7.5 west : illuminated oak shelf wall
 */
export const X0 = -7.5;
export const X1 = 7.5;
export const Z0 = -9;
export const Z1 = 9;
export const CEIL = 8.6;
export const SLAT_Y = 5.6; // bottom of the upper slat cladding on the side walls
export const CORRIDOR_Z = 11.2; // glass balustrade behind the lattice
export const BULK_Y0 = 3.55; // underside of the bulkhead above the lattice
export const BULK_Y1 = 6.0;
export const EYE = 1.65;
export const PLAYER_R = 0.28;
export const SPAWN = { x: 1.6, z: -7.3, yaw: Math.PI, pitch: -0.04 };
/** Atrium volume beyond the corridor balustrade (simplified): lower floor y0, skylight y1. */
export const ATRIUM = { x0: -12, x1: 12, z0: CORRIDOR_Z, z1: 26, y0: -4.5, y1: 14 };
/** Half-width of the gap in the corridor balustrade where the atrium stair starts (stairs.ts). */
export const STAIR_GAP_HALF = 0.9;
