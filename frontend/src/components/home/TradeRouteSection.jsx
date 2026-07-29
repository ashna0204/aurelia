import { useLayoutEffect, useRef } from "react";
import SectionTag from "../SectionTag";
import WorldMap from "../WorldMap";
import ShippingContainer from "../ShippingContainer";
import {
  CORRIDOR_STOP_PROGRESS,
  PLACES,
  ROUTES,
  ROUTE_PATH_LENGTH,
  WINDOWS,
} from "../../lib/worldMap";
import { gsap } from "../../lib/gsap";
import { useDesktopMotion } from "../../hooks/useMediaQuery";
import {
  PIN_TRIGGER_ID,
  TRADE_MAP_ID,
  TRADE_MAP_SECTION_ID,
  TRADE_MAP_STICKY_ID,
} from "../../constants/sections";

const LANES = [
  { lane: "Kochi → Mumbai", detail: "Feeder & inland haulage" },
  { lane: "Mumbai → Jebel Ali", detail: "Gulf consolidation" },
  { lane: "Jebel Ali → Felixstowe", detail: "FCL & LCL, weekly" },
];

/**
 * How much of the traverse each node's label waits for, and how long the
 * whole timeline runs in arbitrary units. Keeping the timeline one unit long
 * lets a stop's progress fraction be used directly as its position on it.
 */
const TIMELINE = 1;

/**
 * The narrative centre of the home page: a map of the trade corridor holds
 * still while the container crosses it, drawing the lane behind it and
 * lighting each office as it arrives.
 *
 * Three things are worth knowing about how it is built:
 *
 *  - The frame holds still by CSS `position: sticky`, not by a ScrollTrigger
 *    pin. GSAP's pin inserts a spacer at refresh time — after first paint —
 *    which shoves three viewports of content down the page. Sticky costs
 *    nothing: the section is 400svh from the first frame and the frame sticks
 *    inside it.
 *  - The map is cropped to the London–Kochi corridor rather than showing the
 *    whole globe. On a world map those four cities occupy a fifth of the
 *    width, and the container would inch across a corner of it; cropped, the
 *    traverse spans most of the frame. The projection is untouched, so every
 *    city is still exactly where geography puts it.
 *  - Each label pops when the container reaches that office, because both are
 *    keyed to the same fractions along the lane (CORRIDOR_STOP_PROGRESS).
 *
 * Under reduced motion, and on anything narrower than 768px, none of this is
 * built: the lane renders fully drawn, every label is visible, and a container
 * sits parked at Kochi. Static, complete, and no scrolling tricks.
 */
export default function TradeRouteSection() {
  const sectionRef = useRef(null);
  const animate = useDesktopMotion();

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || !animate) return undefined;

    const ctx = gsap.context(() => {
      const routes = gsap.utils.toArray("[data-route]");
      const markers = gsap.utils.toArray("[data-marker]");

      // Start unlabelled. The route's own start value is declared on its
      // tween below rather than here — see the note on `fromTo`.
      gsap.set(markers, { opacity: 0, scale: 0.4, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: PIN_TRIGGER_ID,
          trigger: section,
          // The section is 400svh and the frame inside it is 100svh, so this
          // range is exactly the three viewports the frame spends stuck.
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          // Measured before anything downstream that depends on where the
          // sections after it end up.
          refreshPriority: 1,
        },
      });

      // The lane draws at a constant rate across the whole traverse, so its
      // leading tip is wherever the container is.
      //
      // `fromTo`, not `set` + `to`: the trigger sets `invalidateOnRefresh`,
      // and on every refresh an inferred start value is re-read from whatever
      // the element happens to show at that moment. Declaring both ends on
      // the tween is the formulation a refresh cannot corrupt.
      tl.fromTo(
        routes,
        { strokeDashoffset: ROUTE_PATH_LENGTH },
        { strokeDashoffset: 0, duration: TIMELINE, ease: "none" },
        0,
      );

      // Each office lights as the container arrives at it.
      for (const { key, progress } of CORRIDOR_STOP_PROGRESS) {
        tl.to(
          `[data-marker='${key}']`,
          { opacity: 1, scale: 1, duration: 0.12, ease: "back.out(2.2)" },
          progress * TIMELINE,
        );
      }

      tl.from("[data-lane]", { opacity: 0, y: 16, duration: 0.2, stagger: 0.08 }, TIMELINE * 0.72);
    }, sectionRef);

    return () => ctx.revert();
  }, [animate]);

  return (
    <section
      id={TRADE_MAP_SECTION_ID}
      ref={sectionRef}
      // 400svh = one frame (100svh) plus the three viewports of scroll spent
      // travelling across it. Set from the first render, so the page height
      // never changes under the reader. Without animation the section is
      // simply as tall as its content.
      className={`relative bg-bg ${animate ? "h-[400svh]" : ""}`}
    >
      <div
        id={TRADE_MAP_STICKY_ID}
        className={`flex flex-col justify-center px-6 md:px-8 ${
          animate ? "sticky top-0 h-svh overflow-hidden py-[4svh]" : "py-24 md:py-32"
        }`}
      >
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="max-w-[620px]">
              <SectionTag label="The lane" />
              <h2 className="mt-4 font-display text-subsection font-bold leading-[1.05] tracking-[-0.015em] text-ink">
                Kochi to London, <span className="italic text-accent">one custody chain.</span>
              </h2>
            </div>
            <p className="max-w-[360px] text-[15px] leading-relaxed text-ink-soft">
              Four offices on three continents — so a consignment never changes hands between
              companies that have never met.
            </p>
          </div>

          {/* The stage. Cropped to the corridor so the traverse reads as a
              journey across the map rather than a twitch in one corner. */}
          <div className="relative mx-auto mt-[3svh] w-full max-w-[1040px]">
            <WorldMap
              id={TRADE_MAP_ID}
              className="h-auto w-full"
              title="Aurelia's trade lane: Kochi to Mumbai to Dubai to London"
              window={WINDOWS.corridor}
              highlightRegions={["southAsia", "gulf", "uk"]}
              routes={[ROUTES.corridor]}
              markers={["kochi", "mumbai", "dubai", "london"]}
              showLabels
              dotOpacity={0.3}
              dotRadius={0.85}
              highlightColor="var(--accent)"
              highlightRadius={1.15}
              highlightOpacity={0.85}
              detailScale={0.5}
            />

            {/* Static fallback only: the animated container lives in the fixed
                journey layer, which does not run here. */}
            {animate ? null : (
              <ParkedContainer place="kochi" window={WINDOWS.corridor} />
            )}
          </div>

          <ul className="mt-[3svh] flex flex-wrap gap-x-10 gap-y-3">
            {LANES.map(({ lane, detail }) => (
              <li key={lane} data-lane>
                <p className="font-display text-[17px] font-semibold text-ink">{lane}</p>
                <p className="mt-0.5 text-[13px] text-ink-soft">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * A container sitting on one node, for the static fallback.
 *
 * Positioned as a percentage of the map's box rather than in pixels, so it
 * tracks the map at any width without needing to be measured.
 */
function ParkedContainer({ place, window: frame }) {
  const [lonMin, lonMax] = frame.lon;
  const [latMin, latMax] = frame.lat;
  const { lon, lat } = PLACES[place];
  const left = ((lon - lonMin) / (lonMax - lonMin)) * 100;
  const top = ((latMax - lat) / (latMax - latMin)) * 100;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute w-[26%] -translate-x-1/2 -translate-y-[70%]"
      // Computed from the place's real coordinates against the frame's bounds,
      // so it cannot be a utility class.
      style={{ left: `${left}%`, top: `${top}%` }}
    >
      <ShippingContainer className="h-auto w-full" />
    </div>
  );
}
