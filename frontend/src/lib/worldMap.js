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

/** One dot-grid cell, in viewBox units. All other geometry follows from it. */
export const CELL = 10;
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
 * Aurelia's four offices, at their real coordinates.
 *
 * Kochi, Mumbai and Dubai are close enough together at this map scale that
 * their labels collide if all four are placed the same way, so each carries
 * its own offset and text anchor. These are the only hand-tuned numbers in
 * the map — everything else falls out of the projection.
 */
export const PLACES = {
  kochi: { label: "Kochi", note: "HQ", lon: 76.27, lat: 9.93, dx: 0, dy: 26, anchor: "middle" },
  mumbai: { label: "Mumbai", lon: 72.88, lat: 19.08, dx: 14, dy: 5, anchor: "start" },
  dubai: { label: "Dubai", lon: 55.27, lat: 25.2, dx: -14, dy: 5, anchor: "end" },
  london: { label: "London", lon: -0.13, lat: 51.51, dx: 0, dy: -18, anchor: "middle" },
};

/**
 * Operating regions, as longitude/latitude boxes. Dots inside one of these
 * are drawn at a stronger opacity so the map reads as "we work *here*" rather
 * than as generic decoration.
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
 * The two trade lanes the home page animates.
 *
 * `main` is deliberately a single continuous path: the container in the
 * signature scroll animation follows it with MotionPathPlugin, and a path
 * split into segments would make it jump between them.
 */
export const ROUTES = {
  main: { id: "route-main", d: routePath(["kochi", "dubai", "london"]), width: 2 },
  coastal: { id: "route-coastal", d: routePath(["kochi", "mumbai"], 0.3), width: 1.4 },
};

/**
 * Dots as one `<path>` of zero-length subpaths with a round line cap — the
 * SVG spec renders each as a disc. 1,395 dots therefore cost one DOM node
 * instead of 1,395 `<circle>`s, which is the difference between a map that
 * can be animated and one that janks.
 */
export function dotsPath(cells) {
  return cells.map(([col, row]) => `M${col * CELL + CELL / 2} ${row * CELL + CELL / 2}h0`).join("");
}
