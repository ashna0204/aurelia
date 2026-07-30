import { useId } from "react";

/* ─── Geometry ────────────────────────────────────────────────────────────
   An axonometric 40′ container: no perspective convergence, so every edge
   parallel in the world stays parallel on screen. The whole shape is derived
   from one corner and three edge vectors, which is what keeps the corrugation,
   the markings and the corner castings in register with each other.

     O   the near-bottom corner, where the long side meets the door end
     L   along the length, receding up-left (away from the viewer)
     W   across the width, receding up-right
     H   straight up

   Because H is exactly vertical, both corrugated faces get *vertical* ribs —
   true to a real container, and it means the ribs need no shear.
   ────────────────────────────────────────────────────────────────────────── */

const O = { x: 470, y: 272 };
const L = { x: -400, y: -34 };
const W = { x: 100, y: -46 };
const H = { x: 0, y: -168 };

const add = (...points) =>
  points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
const mul = (p, k) => ({ x: p.x * k, y: p.y * k });
const at = (p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
const quad = (...points) => points.map(at).join(" ");

// Named corners, so the faces below read as geometry rather than magic numbers.
const C = {
  nearBottom: O,
  nearTop: add(O, H),
  farBottom: add(O, L),
  farTop: add(O, L, H),
  backBottom: add(O, W),
  backTop: add(O, W, H),
  farBackTop: add(O, L, W, H),
};

/** Shear that lays flat text onto the long side, following its edge. */
const SIDE_SKEW = (Math.atan2(-L.y, -L.x) * 180) / Math.PI; // ≈ 4.86°

/** Rib positions as fractions along a face, inset to clear the corner posts. */
function ribs(count, from = 0.035, to = 0.965) {
  return Array.from({ length: count }, (_, i) => from + ((to - from) * i) / (count - 1));
}

const SIDE_RIBS = ribs(30);
const DOOR_RIBS = ribs(8, 0.06, 0.94);

const RAIL = 15; // depth of the solid top/bottom rails, in viewBox units

/**
 * The hero centrepiece: a 40′ high-cube shipping container in Aurelia's
 * forest-and-gold livery.
 *
 * Drawn rather than photographed, for one decisive reason: the signature
 * scroll animation scales this from full-bleed down to 0.35 and then runs it
 * along an SVG motion path. A raster cutout would either ship at a size that
 * wrecks the performance budget or turn soft the moment it grows — vector
 * stays exact at every step, weighs a few kB, and carries no licensing
 * question.
 *
 * Decorative by default: the headline beside it already names the business,
 * so an alt text here would only be repeated noise for a screen-reader user.
 */
export default function ShippingContainer({ className = "", style, shadow = true, ...rest }) {
  // Instance-scoped gradient ids — the hero and the mobile fallback can both
  // be in the DOM at once, and duplicate ids would cross-wire their fills.
  const uid = useId().replace(/[:]/g, "");
  const id = (name) => `${uid}-${name}`;

  return (
    <svg
      viewBox="0 0 640 330"
      className={className}
      style={{ display: "block", width: "100%", height: "auto", ...style }}
      focusable="false"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        {/* Top face catches the most light, the door end the least. */}
        <linearGradient id={id("top")} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#0F4A29" />
          <stop offset="100%" stopColor="#1F6B3E" />
        </linearGradient>
        <linearGradient id={id("side")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F4A29" />
          <stop offset="55%" stopColor="#0A2E1C" />
          <stop offset="100%" stopColor="#040F09" />
        </linearGradient>
        <linearGradient id={id("door")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#071E12" />
          <stop offset="100%" stopColor="#020805" />
        </linearGradient>
        {/* Sheen sweeping down the long side, so the flat fill reads as steel. */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
        <radialGradient id={id("contact")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#010805" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#010805" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#010805" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Contact shadow — centred on the base quad, dropped just enough to
          read as ground contact rather than as a detached blob. */}
      {shadow ? (
        <ellipse cx="322" cy="262" rx="238" ry="25" fill={`url(#${id("contact")})`} />
      ) : null}

      {/* ── Top face ── */}
      <polygon
        points={quad(C.nearTop, C.farTop, C.farBackTop, C.backTop)}
        fill={`url(#${id("top")})`}
      />
      {/* Roof stiffening ribs, running across the width. */}
      {ribs(9, 0.06, 0.94).map((t) => {
        const a = add(C.nearTop, mul(L, t));
        const b = add(a, W);
        return (
          <line
            key={`roof-${t}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="#010603"
            strokeOpacity="0.15"
            strokeWidth="1.4"
          />
        );
      })}

      {/* ── Door end ── */}
      <polygon
        points={quad(C.nearBottom, C.backBottom, C.backTop, C.nearTop)}
        fill={`url(#${id("door")})`}
      />
      {DOOR_RIBS.map((t) => {
        const base = add(C.nearBottom, mul(W, t));
        return (
          <line
            key={`door-${t}`}
            x1={base.x}
            y1={base.y}
            x2={base.x}
            y2={base.y + H.y}
            stroke="#fff"
            strokeOpacity="0.06"
            strokeWidth="2.4"
          />
        );
      })}
      {/* Door seam, then the four locking rods and their keepers. */}
      {[0.5].map((t) => {
        const base = add(C.nearBottom, mul(W, t));
        return (
          <line
            key="seam"
            x1={base.x}
            y1={base.y}
            x2={base.x}
            y2={base.y + H.y}
            stroke="#010603"
            strokeOpacity="0.85"
            strokeWidth="2"
          />
        );
      })}
      {[0.16, 0.34, 0.66, 0.84].map((t) => {
        const base = add(C.nearBottom, mul(W, t));
        const top = { x: base.x, y: base.y + H.y };
        return (
          <g key={`rod-${t}`}>
            <line
              x1={base.x}
              y1={base.y - 8}
              x2={top.x}
              y2={top.y + 8}
              stroke="#C8963E"
              strokeOpacity="0.55"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
            {/* Cam handle, roughly at waist height. */}
            <rect
              x={base.x - 3.5}
              y={base.y - 74}
              width="7"
              height="20"
              rx="3"
              fill="#C8963E"
              fillOpacity="0.8"
            />
          </g>
        );
      })}

      {/* ── Long side ── */}
      <polygon
        points={quad(C.nearBottom, C.farBottom, C.farTop, C.nearTop)}
        fill={`url(#${id("side")})`}
      />
      {/* Corrugation: each rib is a bright leading edge with a shadowed
          trailing edge, which is what makes a flat fill read as folded steel. */}
      {SIDE_RIBS.map((t) => {
        const base = add(C.nearBottom, mul(L, t));
        return (
          <g key={`rib-${t}`}>
            <line
              x1={base.x}
              y1={base.y}
              x2={base.x}
              y2={base.y + H.y}
              stroke="#fff"
              strokeOpacity="0.09"
              strokeWidth="3"
            />
            <line
              x1={base.x + 4.5}
              y1={base.y + 0.4}
              x2={base.x + 4.5}
              y2={base.y + H.y + 0.4}
              stroke="#010603"
              strokeOpacity="0.28"
              strokeWidth="3"
            />
          </g>
        );
      })}
      {/* Top and bottom rails are smooth plate, so they mask the ribs. */}
      <polygon
        points={quad(
          C.nearTop,
          C.farTop,
          add(C.farTop, { x: 0, y: RAIL }),
          add(C.nearTop, { x: 0, y: RAIL }),
        )}
        fill="#0A2E1C"
      />
      <polygon
        points={quad(
          C.nearBottom,
          C.farBottom,
          add(C.farBottom, { x: 0, y: -RAIL }),
          add(C.nearBottom, { x: 0, y: -RAIL }),
        )}
        fill="#051A0F"
      />
      <polygon
        points={quad(C.nearBottom, C.farBottom, C.farTop, C.nearTop)}
        fill={`url(#${id("sheen")})`}
      />

      {/* ── Markings ── */}
      <g transform={`translate(150 ${C.farBottom.y - 118}) skewY(${SIDE_SKEW.toFixed(2)})`}>
        <text
          fontFamily="'Playfair Display', serif"
          fontSize="46"
          fontWeight="700"
          letterSpacing="5"
          fill="#F5F0E8"
          fillOpacity="0.94"
        >
          AURELIA
        </text>
        <text
          y="26"
          fontFamily="'DM Sans', sans-serif"
          fontSize="13"
          fontWeight="500"
          letterSpacing="4.2"
          fill="#C8963E"
          fillOpacity="0.7"
        >
          LOGISTICS LTD · UNITED KINGDOM
        </text>
      </g>
      <g transform={`translate(104 ${C.farBottom.y - 30}) skewY(${SIDE_SKEW.toFixed(2)})`}>
        <text
          fontFamily="'DM Sans', sans-serif"
          fontSize="12"
          fontWeight="500"
          letterSpacing="2.6"
          fill="#F5F0E8"
          fillOpacity="0.4"
        >
          AURU 472019 3 · 40′ HC · MAX 30,480 KG
        </text>
      </g>
      {/* ── Corner castings ── the blocks cranes and twistlocks grab.
          `inset` pushes each block back inside its own face, so none of them
          hangs off the silhouette. */}
      {[
        { corner: C.nearTop, inset: -1, down: true },
        { corner: C.farTop, inset: 1, down: true },
        { corner: C.nearBottom, inset: -1, down: false },
        { corner: C.farBottom, inset: 1, down: false },
        { corner: C.backTop, inset: -1, down: true },
        { corner: C.backBottom, inset: -1, down: false },
      ].map(({ corner, inset, down }, i) => (
        <rect
          key={`cast-${i}`}
          x={inset < 0 ? corner.x - 17 : corner.x}
          y={down ? corner.y : corner.y - 17}
          width="17"
          height="17"
          fill="#040F09"
          stroke="#010603"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
      ))}

      {/* Crisp silhouette over the whole body, to sharpen the read at any scale. */}
      <g fill="none" stroke="#010603" strokeOpacity="0.55" strokeWidth="1.6">
        <polygon points={quad(C.nearBottom, C.farBottom, C.farTop, C.nearTop)} />
        <polygon points={quad(C.nearBottom, C.backBottom, C.backTop, C.nearTop)} />
        <polygon points={quad(C.nearTop, C.farTop, C.farBackTop, C.backTop)} />
      </g>
    </svg>
  );
}
