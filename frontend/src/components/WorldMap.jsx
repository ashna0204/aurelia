import { useMemo } from "react";
import { LAND_CELLS } from "../data/worldDots";
import {
  PLACES,
  REGIONS,
  VIEW_H,
  VIEW_W,
  cellToLonLat,
  dotsPath,
  inRegion,
  project,
} from "../lib/worldMap";

/**
 * The recurring background motif: a dotted world map with the operating
 * regions picked out, optional animated trade routes, and city markers.
 *
 * Every visual knob is a prop because the same component backs several very
 * different surfaces — a near-invisible hero wash at 7% opacity, the pinned
 * narrative map where the routes are the subject, and white-on-ink linework
 * inside the dark CTA.
 *
 * All the geometry lives in `lib/worldMap`; this file is only the drawing.
 *
 * @param {object}   props
 * @param {string[]} [props.highlightRegions]  keys of REGIONS to emphasise
 * @param {object[]} [props.routes]            entries from ROUTES to draw
 * @param {string[]} [props.markers]           keys of PLACES to pin
 * @param {boolean}  [props.showLabels]        render city names beside markers
 * @param {boolean}  [props.pulse]             animate the marker halos
 * @param {number}   [props.dotOpacity]        base land-dot opacity
 * @param {string}   [props.title]             accessible name; omit → decorative
 */
export default function WorldMap({
  highlightRegions = [],
  routes = [],
  markers = [],
  showLabels = false,
  pulse = false,
  dotOpacity = 0.07,
  dotRadius = 2.1,
  dotColor = "var(--ink)",
  routeColor = "var(--accent)",
  routeOpacity = 1,
  title,
  className = "",
  ...rest
}) {
  const { base, highlighted } = useMemo(() => {
    const regions = highlightRegions.map((key) => REGIONS[key]).filter(Boolean);
    if (regions.length === 0) return { base: dotsPath(LAND_CELLS), highlighted: "" };

    const hit = [];
    const miss = [];
    for (const cell of LAND_CELLS) {
      const { lon, lat } = cellToLonLat(cell[0], cell[1]);
      (regions.some((r) => inRegion(lon, lat, r)) ? hit : miss).push(cell);
    }
    return { base: dotsPath(miss), highlighted: dotsPath(hit) };
  }, [highlightRegions]);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className={className}
      focusable="false"
      // A map with no title is pure decoration and is hidden from assistive
      // tech; the pinned narrative map passes one and becomes an image.
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : "true"}
      {...rest}
    >
      {title ? <title>{title}</title> : null}

      <path
        d={base}
        stroke={dotColor}
        strokeWidth={dotRadius * 2}
        strokeLinecap="round"
        fill="none"
        opacity={dotOpacity}
      />
      {highlighted ? (
        <path
          d={highlighted}
          stroke={dotColor}
          strokeWidth={dotRadius * 2}
          strokeLinecap="round"
          fill="none"
          opacity={Math.min(dotOpacity * 3.2, 0.42)}
        />
      ) : null}

      {routes.map((route) => (
        <g key={route.id} opacity={routeOpacity}>
          {/* Faint full-length ghost, so the lane is legible before the
              animated stroke has drawn over it. */}
          <path
            d={route.d}
            fill="none"
            stroke={routeColor}
            strokeWidth={route.width}
            strokeLinecap="round"
            opacity="0.12"
          />
          <path
            id={route.id}
            data-route={route.id}
            d={route.d}
            fill="none"
            stroke={routeColor}
            strokeWidth={route.width}
            strokeLinecap="round"
            // pathLength normalises the dash maths to 0…1 regardless of the
            // path's real length, so the scrubbed timeline can map scroll
            // progress straight onto strokeDashoffset.
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0"
          />
        </g>
      ))}

      {markers.map((key) => {
        const place = PLACES[key];
        if (!place) return null;
        const { x, y } = project(place.lon, place.lat);
        const primary = key === "kochi";
        return (
          <g key={key} data-marker={key}>
            {pulse ? (
              <circle
                cx={x}
                cy={y}
                r={primary ? 5 : 4}
                fill="var(--teal)"
                className="node-pulse"
                // The one inline style left on the site, and it earns it: the
                // delay is computed per marker so the halos ripple outward
                // from Kochi rather than all beating in unison. A utility
                // class cannot carry a per-instance value.
                style={{ animationDelay: `${Object.keys(PLACES).indexOf(key) * 0.45}s` }}
              />
            ) : null}
            <circle cx={x} cy={y} r={primary ? 5.5 : 4} fill="var(--accent)" />
            <circle
              cx={x}
              cy={y}
              r={primary ? 11 : 8.5}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="1"
              opacity="0.35"
            />
            {showLabels ? (
              <text
                x={x + place.dx}
                y={y + place.dy}
                textAnchor={place.anchor}
                fill="var(--ink)"
                fontSize="13"
                fontFamily="var(--font-sans)"
                fontWeight="500"
                letterSpacing="1.4"
              >
                {place.label.toUpperCase()}
                {place.note ? (
                  <tspan fill="var(--ink-soft)" fontWeight="400">
                    {` · ${place.note}`}
                  </tspan>
                ) : null}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
