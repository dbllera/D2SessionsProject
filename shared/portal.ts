/**
 * Travel contract between the two worlds. This is the ONLY code shared by dku/ and duke/;
 * change it together (see README "Ownership").
 *
 * A world calls `travel(to, arrive)` to fade out and load the other world's page with
 * `?arrive=<point>`. The receiving world calls `readArrival()` on load and decides for itself
 * where that named point is in its own coordinates, then `fadeIn()`.
 *
 * Page URLs come from `__D2_WORLD_URLS__`, which each world's vite.config.ts defines relative
 * to that world (absolute dev-server URLs under `vite`, relative paths in a build).
 */
export type WorldId = 'dku' | 'duke';
/** 'stairs-top': top of the DKU atrium stair. 'south-door': inside the Duke room's south door. */
export type Arrival = 'stairs-top' | 'south-door';

declare const __D2_WORLD_URLS__: Record<WorldId, string>;

const ARRIVALS: readonly Arrival[] = ['stairs-top', 'south-door'];
const FADE_MS = 600;
let traveling = false;

function veil(opaque: boolean): HTMLDivElement {
  let el = document.getElementById('d2-portal-veil') as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = 'd2-portal-veil';
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;inset:0;background:#000;z-index:2147483647;pointer-events:none;visibility:visible;' +
      `transition:opacity ${FADE_MS}ms ease;opacity:${opaque ? 1 : 0}`;
    document.body.appendChild(el);
  }
  return el;
}

/** True once travel() has started; worlds should stop accepting input. */
export function isTraveling(): boolean {
  return traveling;
}

/** Fade to black, then load the other world at the named arrival point. Safe to call repeatedly. */
export function travel(to: WorldId, arrive: Arrival): void {
  if (traveling) return;
  traveling = true;
  const url = new URL(__D2_WORLD_URLS__[to], location.href);
  url.searchParams.set('arrive', arrive);
  // keep debug flags (e.g. ?debug) across the trip
  new URLSearchParams(location.search).forEach((v, k) => {
    if (k !== 'arrive') url.searchParams.set(k, v);
  });
  const el = veil(false);
  el.style.pointerEvents = 'auto';
  void el.offsetWidth; // commit the transparent state so the transition runs
  el.style.opacity = '1';
  if (document.pointerLockElement) document.exitPointerLock();
  window.setTimeout(() => location.assign(url.href), FADE_MS);
}

/** The arrival point this page was loaded with, if any. Removes it from the address bar. */
export function readArrival(): Arrival | null {
  const params = new URLSearchParams(location.search);
  const a = params.get('arrive');
  if (a === null) return null;
  params.delete('arrive');
  const q = params.toString();
  history.replaceState(
    history.state,
    '',
    location.pathname + (q ? '?' + q.replace(/=(&|$)/g, '$1') : '') + location.hash,
  );
  return (ARRIVALS as readonly string[]).includes(a) ? (a as Arrival) : null;
}

/**
 * Show the page. Each index.html hides <body> (and keeps the background black) until this runs,
 * so the raw, unstyled HTML never flashes while a world is loading. Call after the world's CSS
 * is imported and, on arrival, after fadeIn() so the black veil is already in place.
 */
export function revealPage(): void {
  document.documentElement.classList.add('d2-ready');
}

/** Start opaque and fade the page in. Call once on arrival. */
export function fadeIn(): void {
  const el = veil(true);
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      el.style.opacity = '0';
      window.setTimeout(() => el.remove(), FADE_MS + 50);
    }),
  );
}
