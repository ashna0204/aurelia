import { useMemo } from "react";
import { LAND_CELLS } from "../data/worldDots";
import {
  PLACES,
  REGIONS,
  ROUTE_PATH_LENGTH,
  cellToLonLat,
  dotsPath,
  inRegion,
  project,
  viewBoxFor,
} from "../lib/worldMap";

/**
 * The recurring background motif: a dotted world map with the operating
 * regions picked out, optional animated trade routes, and city markers.
 *
 * Every visual knob is a prop because the same component backs both the hero
 * (a full-bleed backdrop behind the headline) and the pinned trade-route
 * section (a legible, cropped stage the journey plays out on).
 *
 * The two-tier treatment is the point of the thing: the world sits back at
 * low opacity while the regions Aurelia actually operates in come forward at
 * full strength, on larger dots. The map reads as "we work *here*" from
 * across the room, before anyone has read a word.
 *
 * All the geometry lives in `lib/worldMap`; this file is only the drawing.
 * Colours are plain hex/`rgba()` defaults (this codebase has no CSS-variable
 * theme layer), matching Aurelia's forest-and-gold palette.
 *
 * @param {object}   props
 * @param {string[]} [props.highlightRegions]  keys of REGIONS to bring forward
 * @param {object[]} [props.routes]            entries with {id, d, width}
 * @param {string[]} [props.markers]           keys of PLACES to pin
 * @param {boolean}  [props.showLabels]        render city names beside markers
 * @param {boolean}  [props.pulse]             animate the marker halos
 * @param {object}   [props.window]            lon/lat bounds to crop to
 * @param {number}   [props.detailScale]       shrinks markers, labels and route
 *                                             strokes to offset a cropped frame
 * @param {string}   [props.title]             accessible name; omit → decorative
 */
export default function WorldMap({
  highlightRegions = [],
  routes = [],
  markers = [],
  showLabels = false,
  pulse = false,
  window: frame,
  dotOpacity = 0.4,
  dotRadius = 1.2,
  dotColor = "rgba(245,240,232,0.5)",
  highlightOpacity = 1,
  highlightRadius = 1.55,
  highlightColor = "#C8963E",
  routeColor = "#C8963E",
  routeOpacity = 1,
  detailScale = 1,
  labelHalo = "#071E12",
  title,
  style,
  ...rest
}) {
  const box = viewBoxFor(frame);
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
      viewBox={`${box.x.toFixed(1)} ${box.y.toFixed(1)} ${box.width.toFixed(1)} ${box.height.toFixed(1)}`}
      style={{ display: "block", width: "100%", height: "auto", ...style }}
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
          stroke={highlightColor}
          strokeWidth={highlightRadius * 2}
          strokeLinecap="round"
          fill="none"
          opacity={highlightOpacity}
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
            strokeWidth={route.width * detailScale}
            strokeLinecap="round"
            opacity="0.14"
          />
          <path
            id={route.id}
            data-route={route.id}
            d={route.d}
            fill="none"
            stroke={routeColor}
            strokeWidth={route.width * detailScale}
            strokeLinecap="round"
            // pathLength normalises the dash maths regardless of the path's
            // real length, so the scrubbed timeline can map scroll progress
            // straight onto strokeDashoffset. Renders fully drawn by default,
            // which is exactly what the static fallback wants.
            pathLength={ROUTE_PATH_LENGTH}
            strokeDasharray={ROUTE_PATH_LENGTH}
            strokeDashoffset="0"
          />
        </g>
      ))}

      {markers.map((key) => {
        const place = PLACES[key];
        if (!place) return null;
        const { x, y } = project(place.lon, place.lat);
        const primary = key === "kochi";
        // A cropped frame magnifies everything it shows, so the caller scales
        // the detail back down to hold its on-screen size steady.
        const r = (size) => size * detailScale;
        return (
          <g key={key} data-marker={key}>
            {pulse ? (
              <circle
                cx={x}
                cy={y}
                r={r(primary ? 5 : 4)}
                fill="#C8963E"
                className="node-pulse"
                // The one inline style left on the site, and it earns it: the
                // delay is computed per marker so the halos ripple outward
                // from Kochi rather than all beating in unison. A utility
                // class cannot carry a per-instance value.
                style={{ animationDelay: `${Object.keys(PLACES).indexOf(key) * 0.45}s` }}
              />
            ) : null}
            <circle cx={x} cy={y} r={r(primary ? 5.5 : 4)} fill="#C8963E" />
            <circle
              cx={x}
              cy={y}
              r={r(primary ? 11 : 8.5)}
              fill="none"
              stroke="#C8963E"
              strokeWidth={detailScale}
              opacity="0.35"
            />
            {showLabels ? (
              <text
                x={x + place.dx * detailScale}
                y={y + place.dy * detailScale}
                textAnchor={place.anchor}
                fill="#F5F0E8"
                fontSize={13 * detailScale}
                fontFamily="'DM Sans', sans-serif"
                fontWeight="500"
                letterSpacing={1.4 * detailScale}
                // A halo in the section's own background colour, painted
                // behind the glyphs. The operating regions are a dense field
                // of dots and a city name laid straight onto them is
                // unreadable.
                stroke={labelHalo}
                strokeWidth={4 * detailScale}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {place.label.toUpperCase()}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
