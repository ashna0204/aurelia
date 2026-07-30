import { useLayoutEffect, useRef } from "react";
import WorldMap from "../WorldMap";
import ShippingContainer from "../ShippingContainer";
import {
  BRANCH_ROUTES,
  CORRIDOR_STOPS,
  PLACES,
  ROUTES,
  ROUTE_PATH_LENGTH,
  WINDOWS,
} from "../../lib/worldMap";
import { gsap } from "../../lib/gsap";
import { useDesktopMotion } from "../../hooks/useMediaQuery";
import { PIN_TRIGGER_ID, TRADE_MAP_ID, TRADE_MAP_STICKY_ID } from "../../constants/sections";

const SECTORS = [
  { label: "Ethnic Food & Grocery", sub: "38 product lines · Direct from Kerala" },
  { label: "Vehicle Parts", sub: "OEM-quality · 6 categories" },
  { label: "Pharmaceuticals", sub: "WHO-GMP certified · APIs to OTC" },
];

const STATS = [
  { v: "3", l: "Trade Sectors" },
  { v: "40+", l: "Countries" },
  { v: "99%", l: "On-Time" },
];

/**
 * Sector badges, each pinned to the destination node its goods travel to.
 * Positions are percentages of the map frame, computed from the same real
 * lon/lat every other marker on the map uses — see `percentPos` below.
 */
const BADGES = [
  { label: "ETHNIC FOOD", near: "rotterdam", dx: -8, dy: -9 },
  { label: "VEHICLE PARTS", near: "newYork", dx: 0, dy: -9 },
  { label: "PHARMA", near: "sydney", dx: 0, dy: 9 },
];

/** A place's lon/lat → a percentage position within a framing window. */
function percentPos(place, frame) {
  const [lonMin, lonMax] = frame.lon;
  const [latMin, latMax] = frame.lat;
  return {
    left: ((place.lon - lonMin) / (lonMax - lonMin)) * 100,
    top: ((latMax - place.lat) / (latMax - latMin)) * 100,
  };
}

/**
 * The narrative centre of the home page: a map of Aurelia's trade network
 * holds still while the container crosses its main corridor, drawing the
 * lane behind it and lighting each hub as it arrives, while the five other
 * branches — and the sector badges riding them — draw in on their own
 * schedule.
 *
 * The frame holds still by CSS `position: sticky`, not a ScrollTrigger pin —
 * GSAP's pin inserts a spacer at refresh time, after first paint, which would
 * shove the whole section down the page. Sticky costs nothing.
 *
 * Under reduced motion, and on anything narrower than 768px, none of this is
 * built: every line renders fully drawn, every label and badge is visible,
 * and a container sits parked at the corridor's first stop. Static, complete,
 * no scroll tricks.
 */
export default function TradeRouteSection() {
  const sectionRef = useRef(null);
  const barRef = useRef(null);
  const animate = useDesktopMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !animate) return undefined;

    const ctx = gsap.context(() => {
      // Every place marker is visible from the start; only the lanes, badges
      // and copy animate in on scroll.
      gsap.set("[data-badge]", { opacity: 0 });
      gsap.set("[data-phase='origin']", { opacity: 0 });
      gsap.set("[data-phase='sectors'] > *", { opacity: 0, y: 16 });
      gsap.set("[data-phase='stats'] > *", { opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: PIN_TRIGGER_ID,
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          // Measured before anything downstream that depends on where the
          // sections after it end up.
          refreshPriority: 1,
          onUpdate: (self) => {
            if (barRef.current) barRef.current.style.width = `${self.progress * 100}%`;
          },
        },
      });

      // The main corridor draws at a constant rate across the whole
      // traverse, so its leading tip is wherever the container is.
      tl.fromTo(
        `#${ROUTES.corridor.id}`,
        { strokeDashoffset: ROUTE_PATH_LENGTH },
        { strokeDashoffset: 0, duration: 1, ease: "none" },
        0,
      );

      // Each branch draws in during its own window, same windows the map
      // already used before this port.
      for (const branch of BRANCH_ROUTES) {
        const [start, end] = branch.range;
        tl.fromTo(
          `#${branch.id}`,
          { strokeDashoffset: ROUTE_PATH_LENGTH },
          { strokeDashoffset: 0, duration: end - start, ease: "none" },
          start,
        );
      }

      // Origin line: in early, out before the sector list arrives.
      tl.to("[data-phase='origin']", { opacity: 1, duration: 0.1 }, 0.02)
        .to("[data-phase='origin']", { opacity: 0, duration: 0.12 }, 0.52);

      // Sector list: in as the branches finish, out before the stats.
      tl.to(
        "[data-phase='sectors'] > *",
        { opacity: 1, y: 0, duration: 0.14, stagger: 0.08, ease: "power2.out" },
        0.58,
      ).to("[data-phase='sectors'] > *", { opacity: 0, duration: 0.11 }, 0.84);

      // Sector badges pop alongside the sector list.
      tl.to("[data-badge]", { opacity: 1, duration: 0.17 }, 0.65);

      // Stats settle in last.
      tl.to(
        "[data-phase='stats'] > *",
        { opacity: 1, duration: 0.11, stagger: 0.06 },
        0.86,
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [animate]);

  const frame = WINDOWS.network;

  if (!animate) {
    // Static fallback: normal document flow, nothing absolutely stacked on
    // top of anything else — the sticky/overlay layout below only makes
    // sense pinned to a fixed viewport.
    return (
      <section
        ref={sectionRef}
        style={{ position: "relative", background: "#040F09", padding: "110px 24px" }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto 56px" }}>
          <OriginText />
        </div>
        <div style={{ position: "relative", width: "100%", maxWidth: 1100, margin: "0 auto 48px" }}>
          <MapStage frame={frame} animate={false} />
        </div>
        <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          <SectorList />
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
          <StatsList />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} style={{ position: "relative", height: "320vh", background: "#040F09" }}>
      <div
        id={TRADE_MAP_STICKY_ID}
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "#040F09",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 59% 60%, rgba(200,150,62,0.04) 0%, transparent 60%)" }} />

        <div style={{ position: "absolute", inset: 0 }}>
          <MapStage frame={frame} animate />
        </div>

        {/* Phase 1: Origin text */}
        <div
          data-phase="origin"
          style={{
            position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)",
            zIndex: 10, maxWidth: 420,
          }}
        >
          <OriginText />
        </div>

        {/* Phase 2: Three sectors */}
        <div
          data-phase="sectors"
          style={{
            position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)",
            zIndex: 10, display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <SectorList />
        </div>

        {/* Phase 3: Stats */}
        <div
          data-phase="stats"
          style={{
            position: "absolute", top: "14%", right: "5%",
            zIndex: 10, display: "flex", flexDirection: "column", gap: 28,
            alignItems: "flex-end",
            pointerEvents: "none",
          }}
        >
          <StatsList align="right" />
        </div>

        {/* Scroll progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(200,150,62,0.08)" }}>
          <div ref={barRef} style={{ height: "100%", width: "0%", background: "linear-gradient(to right, #C8963E, #A67B2E)" }} />
        </div>
      </div>
    </section>
  );
}

function OriginText() {
  return (
    <>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "rgba(200,150,62,0.65)", textTransform: "uppercase", marginBottom: 18 }}>
        Aurelia Logistics
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.15, margin: 0 }}>
        From the Indian<br />Subcontinent,<br />
        <span style={{ color: "#C8963E", fontStyle: "italic" }}>to every market.</span>
      </h2>
      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, marginTop: 20 }}>
        Scroll to trace the route.
      </p>
    </>
  );
}

function SectorList() {
  return SECTORS.map((s) => (
    <div key={s.label} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "#F5F0E8", marginBottom: 4 }}>{s.label}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(200,150,62,0.65)", letterSpacing: "0.15em" }}>{s.sub}</div>
    </div>
  ));
}

function StatsList({ align = "center" }) {
  return STATS.map((s) => (
    <div key={s.l} style={{ textAlign: align }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3.5vw, 44px)", color: "#C8963E", fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
    </div>
  ));
}

/** The map, its sector badges, and (in the static fallback) the parked container. */
function MapStage({ frame, animate }) {
  return (
    <>
      <WorldMap
        id={TRADE_MAP_ID}
        window={frame}
        title={animate ? undefined : "Aurelia's trade network"}
        highlightRegions={["southAsia", "gulf", "uk"]}
        routes={[
          ROUTES.corridor,
          ...BRANCH_ROUTES.map((b) => ({ id: b.id, d: b.d, width: b.width })),
        ]}
        markers={Object.keys(PLACES)}
        showLabels
        dotOpacity={0.3}
        dotRadius={0.9}
        highlightRadius={1.3}
        style={animate ? { position: "absolute", inset: 0 } : undefined}
      />
      {BADGES.map((badge) => {
        const place = PLACES[badge.near];
        const pos = percentPos(place, frame);
        return (
          <div
            key={badge.label}
            data-badge
            style={{
              position: "absolute",
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              transform: `translate(calc(-50% + ${badge.dx}px), calc(-100% + ${badge.dy}px))`,
              padding: "5px 14px",
              borderRadius: 11,
              background: "rgba(200,150,62,0.1)",
              border: "1px solid rgba(200,150,62,0.28)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "1.2px", color: "#C8963E" }}>
              {badge.label}
            </span>
          </div>
        );
      })}
      {animate ? null : <ParkedContainer place={CORRIDOR_STOPS[0]} frame={frame} />}
    </>
  );
}

/**
 * A container sitting on one node, for the static fallback.
 *
 * Positioned as a percentage of the map's box rather than in pixels, so it
 * tracks the map at any width without needing to be measured.
 */
function ParkedContainer({ place, frame }) {
  const pos = percentPos(PLACES[place], frame);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: `${pos.left}%`,
        top: `${pos.top}%`,
        width: "22%",
        transform: "translate(-50%, -70%)",
        pointerEvents: "none",
      }}
    >
      <ShippingContainer style={{ height: "auto", width: "100%" }} />
    </div>
  );
}
