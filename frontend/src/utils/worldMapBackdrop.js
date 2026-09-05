/**
 * The dotted world map behind the scroll-driven trade-route animation.
 *
 * The land mask in data/worldDots.js is a plain equirectangular grid of real
 * longitudes and latitudes. The route map it sits behind is not: its nodes are
 * hand-placed in a 1200 × 500 viewBox — geographic in spirit, but with the
 * Atlantic and the Pacific squeezed in so New York and Sydney fall inside the
 * frame instead of off its edges.
 *
 * So the map is fitted to the node layout, never the layout to the map: the
 * animation's geometry is untouched and every city still lands on its own
 * coastline. Latitude takes a least-squares line through the eight nodes, which
 * are near enough linear in it that the worst node is ~20 units out. Longitude
 * is interpolated between the nodes themselves — that is what absorbs the
 * squeezed oceans — and extends the outermost segment's slope beyond them.
 *
 * Both fits are derived from NODES at load, so moving a node moves the land
 * under it rather than leaving the two disagreeing.
 */

import { LAND_CELLS, GRID_COLS, GRID_ROWS } from "../data/worldDots";
import { NODES } from "./tradeRoutes";

/** Grid geometry. Must match the constants data/worldDots.js was sampled on. */
const LON_MIN = -180;
const LON_SPAN = 360;
const LAT_TOP = 78;
const LAT_SPAN = 134; // 78°N down to 56°S

/** Where the named nodes actually are, in degrees. */
const PLACES = {
  kochi: { lon: 76.27, lat: 9.93 },
  dubai: { lon: 55.27, lat: 25.2 },
  london: { lon: -0.13, lat: 51.51 },
  rotterdam: { lon: 4.48, lat: 51.92 },
  newYork: { lon: -74.01, lat: 40.71 },
  singapore: { lon: 103.82, lat: 1.35 },
  sydney: { lon: 151.21, lat: -33.87 },
  nairobi: { lon: 36.82, lat: -1.29 },
};

/** [degrees, viewBox units] pairs for every node, on one axis. */
const anchors = (axis, coord) =>
  Object.entries(PLACES)
    .filter(([key]) => NODES[key])
    .map(([key, place]) => [place[axis], NODES[key][coord]])
    .sort((a, b) => a[0] - b[0]);

/** Least-squares line through a set of anchors. */
function fitLine(points) {
  const n = points.length;
  const mx = points.reduce((s, [d]) => s + d, 0) / n;
  const my = points.reduce((s, [, v]) => s + v, 0) / n;
  const slope =
    points.reduce((s, [d, v]) => s + (d - mx) * (v - my), 0) /
    points.reduce((s, [d]) => s + (d - mx) ** 2, 0);
  return { slope, intercept: my - slope * mx };
}

const LAT_LINE = fitLine(anchors("lat", "y"));
const LON_ANCHORS = anchors("lon", "x");

/** Latitude → viewBox y. */
export const projectLat = (lat) => LAT_LINE.slope * lat + LAT_LINE.intercept;

/**
 * Longitude → viewBox x, interpolated between the nodes. Outside them the
 * nearest segment's slope carries on, so the map keeps running to the edge of
 * the frame rather than piling up at the last city.
 */
export function projectLon(lon) {
  let i = 1;
  while (i < LON_ANCHORS.length - 1 && LON_ANCHORS[i][0] < lon) i++;
  const [d0, x0] = LON_ANCHORS[i - 1];
  const [d1, x1] = LON_ANCHORS[i];
  return x0 + ((lon - d0) / (d1 - d0)) * (x1 - x0);
}

/** A dot-grid cell → the longitude/latitude at its centre. */
function cellToLonLat(col, row) {
  return {
    lon: LON_MIN + ((col + 0.5) / GRID_COLS) * LON_SPAN,
    lat: LAT_TOP - ((row + 0.5) / GRID_ROWS) * LAT_SPAN,
  };
}

/**
 * The regions Aurelia operates in, as longitude/latitude boxes. Dots inside one
 * are drawn stronger, so the map reads as "we work *here*" rather than as
 * generic decoration.
 */
const REGIONS = [
  { lon: [67, 91], lat: [5, 30] },   // South Asia
  { lon: [44, 61], lat: [21, 33] },  // the Gulf
  { lon: [-11, 3], lat: [48, 60] },  // the UK
];

const inRegion = (lon, lat, r) =>
  lon >= r.lon[0] && lon <= r.lon[1] && lat >= r.lat[0] && lat <= r.lat[1];

/**
 * Dots as one `<path>` of zero-length subpaths with a round line cap — the SVG
 * spec renders each as a disc. The land cells therefore cost one DOM node
 * instead of one per cell, which is the difference between a map that can sit
 * under an animation and one that janks it.
 */
const dotsPath = (cells) =>
  cells
    .map(({ lon, lat }) => `M${projectLon(lon).toFixed(1)} ${projectLat(lat).toFixed(1)}h0`)
    .join("");

/** Land split into the operating regions and everything else, drawn once. */
export const LAND_DOTS = (() => {
  const highlighted = [];
  const base = [];
  for (const [col, row] of LAND_CELLS) {
    const point = cellToLonLat(col, row);
    (REGIONS.some((r) => inRegion(point.lon, point.lat, r)) ? highlighted : base).push(point);
  }
  return { base: dotsPath(base), highlighted: dotsPath(highlighted) };
})();

/**
 * Spacing between neighbouring dots, in viewBox units, measured on latitude —
 * the axis with a single constant scale. Dot radii are set from it so the map's
 * density reads the same whatever the grid resolution is.
 */
export const DOT_SPACING = Math.abs(LAT_LINE.slope) * (LAT_SPAN / GRID_ROWS);
