/**
 * Geometry for the scroll-driven trade-route map on the home page.
 *
 * Routes are cubic béziers whose endpoints are always node positions, so the
 * `d` strings and the node arrival timings are both derived from the data below
 * rather than written out by hand — a node cannot drift away from the line that
 * lands on it.
 *
 * Point-along-path is computed here instead of measured from the DOM
 * (`getPointAtLength`), so the map is identical before layout settles and in
 * environments that do not implement SVG geometry.
 */

/** Nodes, positioned in the map's 1200 × 500 viewBox. */
export const NODES = {
  kochi:     { x: 710, y: 295, label: "Kochi", primary: true },
  dubai:     { x: 620, y: 238, label: "Dubai", hub: true },
  london:    { x: 335, y: 158, label: "London" },
  rotterdam: { x: 362, y: 148, label: "Rotterdam" },
  newYork:   { x: 160, y: 210, label: "New York" },
  singapore: { x: 870, y: 345, label: "Singapore", hub: true },
  sydney:    { x: 945, y: 428, label: "Sydney" },
  nairobi:   { x: 548, y: 328, label: "Nairobi" },
};

/**
 * Trade lanes. `c1`/`c2` are the bézier control points; `range` is the scroll
 * progress window over which the lane draws itself.
 */
const LANES = [
  { from: "kochi", to: "dubai",     c1: [680, 272], c2: [650, 255], range: [0.08, 0.22], width: 1.8 },
  { from: "dubai", to: "london",    c1: [525, 192], c2: [415, 170], range: [0.20, 0.38], width: 1.2 },
  { from: "dubai", to: "rotterdam", c1: [530, 188], c2: [435, 163], range: [0.22, 0.40], width: 1.0 },
  { from: "kochi", to: "singapore", c1: [780, 325], c2: [835, 338], range: [0.28, 0.44], width: 1.5 },
  { from: "singapore", to: "sydney", c1: [902, 382], c2: [928, 410], range: [0.40, 0.54], width: 1.0 },
  { from: "kochi", to: "newYork",   c1: [440, 90],  c2: [250, 130], range: [0.36, 0.56], width: 1.0 },
  { from: "dubai", to: "nairobi",   c1: [590, 285], c2: [568, 308], range: [0.44, 0.58], width: 0.8 },
];

/** Samples per lane for the arc-length lookup table. */
const SAMPLES = 32;

const cubic = (t, a, b, c, d) => {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
};

function buildRoute(lane) {
  const from = NODES[lane.from];
  const to = NODES[lane.to];
  const [c1x, c1y] = lane.c1;
  const [c2x, c2y] = lane.c2;

  // Evenly spaced samples in t, plus the cumulative distance along them. The
  // stroke reveal is driven by dash offset, which advances by *arc length*, so
  // anything riding the line has to be looked up by length rather than by t.
  const samples = [];
  const cumulative = [];
  let travelled = 0;
  for (let i = 0; i <= SAMPLES; i++) {
    const t = i / SAMPLES;
    const point = [
      cubic(t, from.x, c1x, c2x, to.x),
      cubic(t, from.y, c1y, c2y, to.y),
    ];
    if (i > 0) {
      const prev = samples[i - 1];
      travelled += Math.hypot(point[0] - prev[0], point[1] - prev[1]);
    }
    samples.push(point);
    cumulative.push(travelled);
  }
  const length = travelled || 1;

  return {
    ...lane,
    id: `lane-${lane.from}-${lane.to}`,
    d: `M ${from.x},${from.y} C ${c1x},${c1y} ${c2x},${c2y} ${to.x},${to.y}`,
    samples,
    cumulative: cumulative.map((l) => l / length),
  };
}

export const ROUTES = LANES.map(buildRoute);

/**
 * Point at a given fraction of a route's *length* (0 → origin, 1 → destination).
 *
 * @param {object} route - an entry of {@link ROUTES}.
 * @param {number} fraction - clamped to 0…1.
 * @returns {{x: number, y: number}}
 */
export function pointAtFraction(route, fraction) {
  const { samples, cumulative } = route;
  const target = Math.max(0, Math.min(1, fraction));
  let i = 1;
  while (i < cumulative.length - 1 && cumulative[i] < target) i++;
  const span = cumulative[i] - cumulative[i - 1] || 1;
  const k = (target - cumulative[i - 1]) / span;
  const [ax, ay] = samples[i - 1];
  const [bx, by] = samples[i];
  return { x: ax + (bx - ax) * k, y: ay + (by - ay) * k };
}

/** Scroll distance over which an arriving node fades up before it lands. */
const ARRIVAL_FADE = 0.05;

/**
 * When each node lights up, keyed to the moment its first inbound lane lands.
 * Kochi is the origin and has none, so it opens the sequence on its own.
 *
 * `arrive` is the progress value at which the node is fully present; `reveal`
 * is the window over which it fades up to that point.
 */
export const NODE_TIMING = (() => {
  const timing = { kochi: { arrive: 0.12 } };
  for (const route of ROUTES) {
    const arrive = route.range[1];
    const current = timing[route.to];
    if (!current || arrive < current.arrive) timing[route.to] = { arrive };
  }
  for (const key of Object.keys(timing)) {
    const { arrive } = timing[key];
    timing[key].reveal = [arrive - ARRIVAL_FADE, arrive];
  }
  return timing;
})();

/** Static background grid, in viewBox units. */
export const GRID_LINES = [
  ...Array.from({ length: 13 }, (_, i) => ({ x1: i * 100, y1: 0, x2: i * 100, y2: 500 })),
  ...Array.from({ length: 6 }, (_, i) => ({ x1: 0, y1: i * 100, x2: 1200, y2: i * 100 })),
];
