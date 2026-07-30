/**
 * Geometry for the world-map motif: the projection, the places on it, and the
 * trade lanes between them.
 *
 * Kept out of `WorldMap.jsx` so the component file exports nothing but a
 * component, and so the pieces that need the *maths* without the markup — the
 * container journey samples the same route the map draws — can import it
 * without pulling in a React tree.
 */

import { GRID_COLS, GRID_ROWS } from "../data/worldDots";

/**
 * One dot-grid cell, in viewBox units. All other geometry follows from it.
 *
 * Derived so the viewBox stays 1100 × 410 whatever the grid density: at 220
 * columns that is 5 units per cell. Holding the viewBox fixed means route
 * paths, city positions and framing windows are all unaffected by a change
 * in dot resolution.
 */
export const CELL = 1100 / GRID_COLS;
export const VIEW_W = GRID_COLS * CELL; // 1100
export const VIEW_H = GRID_ROWS * CELL; // 410

const LON_MIN = -180;
const LON_SPAN = 360;
const LAT_TOP = 78;
const LAT_SPAN = 134; // 78°N down to 56°S — see data/worldDots.js

/**
 * Longitude/latitude → viewBox coordinates.
 *
 * The projection is plain equirectangular and shares its constants with the
 * dot grid, so a city plotted from its real coordinates lands exactly on the
 * grid rather than near it.
 */
export function project(lon, lat) {
  return {
    x: ((lon - LON_MIN) / LON_SPAN) * VIEW_W,
    y: ((LAT_TOP - lat) / LAT_SPAN) * VIEW_H,
  };
}

/** A dot-grid cell → the longitude/latitude at its centre. */
export function cellToLonLat(col, row) {
  return {
    lon: LON_MIN + ((col + 0.5) / GRID_COLS) * LON_SPAN,
    lat: LAT_TOP - ((row + 0.5) / GRID_ROWS) * LAT_SPAN,
  };
}

/**
 * The eight places the home page's trade map names, at their real
 * coordinates. Kochi and Dubai are the hubs the other six branch out from —
 * see CORRIDOR_STOPS and BRANCH_ROUTES below.
 *
 * Label offsets are hand-tuned per place, same as upstream: several of these
 * sit close enough together at this map scale that their labels would
 * collide otherwise.
 */
export const PLACES = {
  kochi: { label: "Kochi", lon: 76.27, lat: 9.93, dx: 0, dy: 26, anchor: "middle" },
  dubai: { label: "Dubai", lon: 55.27, lat: 25.2, dx: -14, dy: 5, anchor: "end" },
  london: { label: "London", lon: -0.13, lat: 51.51, dx: 0, dy: -18, anchor: "middle" },
  rotterdam: { label: "Rotterdam", lon: 4.48, lat: 51.92, dx: 14, dy: 5, anchor: "start" },
  newYork: { label: "New York", lon: -74.01, lat: 40.71, dx: 14, dy: 20, anchor: "start" },
  singapore: { label: "Singapore", lon: 103.82, lat: 1.35, dx: 14, dy: -8, anchor: "start" },
  sydney: { label: "Sydney", lon: 151.21, lat: -33.87, dx: -14, dy: 22, anchor: "end" },
  nairobi: { label: "Nairobi", lon: 36.82, lat: -1.29, dx: 14, dy: 5, anchor: "start" },
};

/**
 * Operating regions, as longitude/latitude boxes. Dots inside one of these
 * are drawn at a stronger opacity so the map reads as "we work *here*" rather
 * than as generic decoration — independent of how far the trade routes reach.
 */
export const REGIONS = {
  southAsia: { lon: [67, 91], lat: [5, 30] },
  gulf: { lon: [44, 61], lat: [21, 33] },
  uk: { lon: [-11, 3], lat: [48, 60] },
};

/** Whether a coordinate falls inside one of the REGIONS boxes. */
export function inRegion(lon, lat, region) {
  return (
    lon >= region.lon[0] && lon <= region.lon[1] && lat >= region.lat[0] && lat <= region.lat[1]
  );
}

/**
 * A gently bowed arc between two projected points.
 *
 * The control point sits on the chord's perpendicular, always displaced
 * towards the top of the map, so a route reads like a great-circle track
 * instead of a straight ruler line.
 */
function arcSegment(from, to, bow) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  // Flip whichever way the perpendicular happens to point, so the bow is
  // never below the chord.
  const sign = ny > 0 ? -1 : 1;
  const cx = (from.x + to.x) / 2 + nx * len * bow * sign;
  const cy = (from.y + to.y) / 2 + ny * len * bow * sign;
  return `Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`;
}

/** Build one `d` string running through a list of place keys. */
export function routePath(keys, bow = 0.16) {
  const points = keys.map((key) => project(PLACES[key].lon, PLACES[key].lat));
  const [head, ...rest] = points;
  return rest.reduce(
    (d, point, i) => `${d} ${arcSegment(points[i], point, bow)}`,
    `M ${head.x.toFixed(1)} ${head.y.toFixed(1)}`,
  );
}

/**
 * The offices the signature traveling container visits, in travel order.
 *
 * London → Dubai → Kochi → Singapore → Sydney is the "one custody chain" the
 * container itself traces — ordered north to south (descending latitude) so
 * the container reads as travelling top-to-bottom down the map. The other
 * three places sit on branches off this spine (see BRANCH_ROUTES) that draw
 * in on scroll but are never themselves the container's path, because a
 * single continuous MotionPath cannot fork.
 */
export const CORRIDOR_STOPS = ["london", "dubai", "kochi", "singapore", "sydney"];

/**
 * The `pathLength` every route declares, and therefore the units its
 * `strokeDasharray`/`strokeDashoffset` are counted in.
 *
 * Normalising to 1 would be the obvious choice, and it is wrong: GSAP rounds
 * pixel-unit CSS values to whole numbers, so a dash offset tweened from 1 to 0
 * only ever renders 1 or 0 and the lane snaps from undrawn to fully drawn at
 * the halfway point. A thousand units gives a thousand steps, which is far
 * more than any screen can show — and the maths stays as simple as 0…1 was,
 * just scaled.
 */
export const ROUTE_PATH_LENGTH = 1000;

/**
 * The main corridor, as one continuous path.
 *
 * Deliberately not split into segments: the container in the signature scroll
 * animation follows this path with MotionPathPlugin, and a path made of
 * separate segments would make it jump between them.
 */
export const ROUTES = {
  corridor: { id: "route-corridor", d: routePath(CORRIDOR_STOPS), width: 1.8 },
};

/**
 * The three background branches off the two hubs — the legs to the places the
 * corridor itself does not visit, plotted on the real projection. Each carries
 * the `[start, end]` window (as a fraction of the pinned section's scroll
 * range) it draws across, so the order branches light up in is deterministic.
 *
 * Not container-followed: only the corridor above is. Singapore and Sydney are
 * on the corridor now, so they are no longer branch destinations.
 */
export const BRANCH_ROUTES = [
  { id: "branch-dubai-rotterdam", from: "dubai", to: "rotterdam", width: 1.0, range: [0.22, 0.4] },
  { id: "branch-kochi-newyork", from: "kochi", to: "newYork", width: 1.0, range: [0.36, 0.56] },
  { id: "branch-dubai-nairobi", from: "dubai", to: "nairobi", width: 0.8, range: [0.44, 0.58] },
].map((branch) => ({ ...branch, d: routePath([branch.from, branch.to]) }));

/**
 * How far along the corridor each stop sits, as a fraction of the whole.
 *
 * Measured on the straight chords between stops rather than on the drawn
 * arcs. The arcs are barely bowed, so the two agree to well under a percent —
 * and this way the figures are available at module load, without needing an
 * SVG in a document to measure against. They are what lets a node's label pop
 * at the moment the container arrives rather than at some fixed time.
 */
export const CORRIDOR_STOP_PROGRESS = (() => {
  const points = CORRIDOR_STOPS.map((key) => project(PLACES[key].lon, PLACES[key].lat));
  const legs = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  const total = legs.reduce((sum, leg) => sum + leg, 0);

  let travelled = 0;
  return CORRIDOR_STOPS.map((key, i) => {
    if (i > 0) travelled += legs[i - 1];
    return { key, progress: travelled / total };
  });
})();

/**
 * When each branch destination's marker should reveal — the moment its own
 * incoming line finishes drawing, i.e. the end of its `range`.
 */
export const BRANCH_STOP_PROGRESS = BRANCH_ROUTES.map((branch) => ({
  key: branch.to,
  progress: branch.range[1],
}));

/**
 * Framing windows, as longitude/latitude bounds.
 *
 * `network` crops to a box bounding all eight places (with padding) so the
 * hub-and-spoke journey spans most of the frame instead of creeping across a
 * corner of a whole-world map. The projection is untouched — this is a
 * viewBox crop, so every dot and every city stays exactly where geography
 * puts it.
 *
 * The northern edge carries extra headroom (up to 78°N) on purpose: the
 * pinned section's map sits under a fixed navbar, and without the sky above
 * them London and Rotterdam — the northernmost places — would tuck up behind
 * it. The padding drops them clear of the bar.
 */
export const WINDOWS = {
  world: { lon: [-180, 180], lat: [-56, 78] },
  network: { lon: [-95, 168], lat: [-45, 78] },
};

/** A framing window → the SVG viewBox rectangle that shows it. */
export function viewBoxFor(window) {
  const [lonMin, lonMax] = window.lon;
  const [latMin, latMax] = window.lat;
  const topLeft = project(lonMin, latMax);
  const bottomRight = project(lonMax, latMin);
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y,
  };
}

/**
 * Dots as one `<path>` of zero-length subpaths with a round line cap — the
 * SVG spec renders each as a disc. The land cells therefore cost one DOM
 * node instead of one per cell, which is the difference between a map that
 * can be animated and one that janks.
 */
export function dotsPath(cells) {
  return cells.map(([col, row]) => `M${col * CELL + CELL / 2} ${row * CELL + CELL / 2}h0`).join("");
}
