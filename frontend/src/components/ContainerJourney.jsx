import { useLayoutEffect, useRef } from "react";
import ShippingContainer from "./ShippingContainer";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useDesktopMotion } from "../hooks/useMediaQuery";
import { PLACES, project, VIEW_W } from "../lib/worldMap";
import {
  HERO_SLOT_ID,
  PIN_TRIGGER_ID,
  TRADE_MAP_ID,
  TRADE_MAP_STICKY_ID,
  VERTICALS_ID,
} from "../constants/sections";

/** How many points to sample off the route path for the motion path. */
const ROUTE_SAMPLES = 60;
/** Scale the container settles at once it docks onto the map. */
const DOCKED_SCALE = 0.35;

/**
 * Convert a point in the map's SVG user space to viewport pixels, given where
 * the map sits on screen while its section is pinned.
 */
function toViewport(point, frame) {
  return {
    x: frame.left + point.x * frame.scale,
    y: frame.top + point.y * frame.scale,
  };
}

/**
 * Measure everything the timeline needs, in viewport coordinates.
 *
 * The container layer is `position: fixed`, so every waypoint has to be
 * expressed relative to the viewport rather than the document — which is what
 * lets one element persist across section boundaries while the page scrolls
 * underneath it.
 *
 * Returns null when the page is not in a state that can be measured (a route
 * without these sections, or an environment with no SVG geometry API).
 */
function measure() {
  const slot = document.getElementById(HERO_SLOT_ID);
  const map = document.getElementById(TRADE_MAP_ID);
  const frame = document.getElementById(TRADE_MAP_STICKY_ID);
  const verticals = document.getElementById(VERTICALS_ID);
  const pin = ScrollTrigger.getById(PIN_TRIGGER_ID);
  const route = document.getElementById("route-main");

  if (!slot || !map || !frame || !verticals || !pin || !route) return null;
  // jsdom and other non-rendering environments have no path geometry.
  if (typeof route.getTotalLength !== "function") return null;

  const scrollY = window.scrollY;
  const slotRect = slot.getBoundingClientRect();
  if (!slotRect.width) return null;

  // Where the hero slot sits when the page is at the very top — the position
  // the container has to occupy for the fixed copy to land exactly where the
  // reserved space is.
  const heroStage = {
    x: slotRect.left + slotRect.width / 2,
    y: slotRect.top + scrollY + slotRect.height / 2,
    width: slotRect.width,
  };

  // Where the map ends up while the section is stuck. The frame sticks to
  // `top: 0`, so the map's offset *inside* the frame — which never changes —
  // is its on-screen offset for the whole of the sticky phase.
  const mapRect = map.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const mapFrame = {
    left: mapRect.left,
    top: mapRect.top - frameRect.top,
    scale: mapRect.width / VIEW_W,
  };

  const kochi = toViewport(project(PLACES.kochi.lon, PLACES.kochi.lat), mapFrame);

  // Sample the same path the route line draws, so the container leads the
  // stroke instead of merely running alongside it.
  const length = route.getTotalLength();
  const path = Array.from({ length: ROUTE_SAMPLES }, (_, i) => {
    const point = route.getPointAtLength((i / (ROUTE_SAMPLES - 1)) * length);
    return toViewport(point, mapFrame);
  });

  // Phase boundaries, in scroll pixels. The pin's own measured start and end
  // are the authority — see PIN_TRIGGER_ID.
  // The exit finishes well before the verticals cards are in view, so the
  // container is gone by the time there is anything for it to sit on top of.
  const start = 0;
  const end = Math.max(
    verticals.getBoundingClientRect().top + scrollY - window.innerHeight * 0.75,
    pin.end + 1,
  );

  return {
    heroStage,
    kochi,
    path,
    end,
    // Durations in arbitrary timeline units, made proportional to the real
    // scroll distance each phase covers. Without this the travel phase would
    // not line up with the pin, and the container would reach London while
    // the map was still drawing.
    approach: Math.max(pin.start - start, 1),
    travel: Math.max(pin.end - pin.start, 1),
    exit: Math.max(end - pin.end, 1),
  };
}

/**
 * The signature animation: one shipping container that travels with the
 * reader from the hero, down onto Kochi, along the trade lane to London, and
 * out of the page at the verticals grid.
 *
 * It is a single fixed layer driven by one scrubbed master timeline, so the
 * container survives every section boundary it crosses. Everything animated
 * is `transform` or `opacity`, and the hero reserves the container's space
 * with a fixed aspect ratio, so none of this can move layout.
 *
 * Below 768px, and whenever reduced motion is requested, this renders nothing
 * and the hero draws a static container in the slot instead.
 */
export default function ContainerJourney() {
  const layerRef = useRef(null);
  const craftRef = useRef(null);
  const floatRef = useRef(null);
  const active = useDesktopMotion();

  useLayoutEffect(() => {
    if (!active) return undefined;

    let ctx;

    const build = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        const stage = measure();
        if (!stage) {
          // Nothing measurable — leave the layer hidden rather than parking a
          // container in the top-left corner.
          gsap.set(craftRef.current, { autoAlpha: 0 });
          return;
        }

        gsap.set(craftRef.current, {
          width: stage.heroStage.width,
          xPercent: -50,
          yPercent: -50,
          x: stage.heroStage.x,
          y: stage.heroStage.y,
          scale: 1,
          rotation: 0,
          autoAlpha: 1,
        });

        // Idle float, on an inner element so it never fights the timeline's
        // transform on the wrapper.
        gsap.to(floatRef.current, {
          y: 6,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            // Absolute scroll positions, not an element's edges: the phase
            // durations above are already expressed in scroll pixels from the
            // top of the document, and the pin's measured start/end are what
            // they are keyed to.
            start: 0,
            end: () => stage.end,
            scrub: 1,
            invalidateOnRefresh: true,
            // Measured after the pin, which changes the document height.
            refreshPriority: -1,
          },
        });

        // 1 · Hero → Kochi. Shrinks, tilts as if under a crane, and settles
        //     level on the node.
        tl.to(
          craftRef.current,
          {
            x: stage.kochi.x,
            y: stage.kochi.y,
            scale: DOCKED_SCALE,
            duration: stage.approach,
            ease: "power1.inOut",
          },
          0,
        ).to(
          craftRef.current,
          { rotation: -8, duration: stage.approach / 2, yoyo: true, repeat: 1 },
          0,
        );

        // 2 · Along the lane, in step with the line drawing beneath it.
        tl.to(craftRef.current, {
          duration: stage.travel,
          motionPath: { path: stage.path, curviness: 1, autoRotate: false },
        });

        // 3 · Out. The remaining sections carry the map motif alone.
        tl.to(craftRef.current, {
          scale: DOCKED_SCALE * 0.55,
          autoAlpha: 0,
          duration: stage.exit,
          ease: "power2.in",
        });
      }, layerRef);
    };

    // Build after the pin has measured itself, so its start/end are real.
    const raf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      build();
    });

    // Every waypoint is a pixel measurement, so a resize invalidates all of
    // them. Rebuilding is cheaper to reason about than patching in place.
    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 200);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      ctx?.revert();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      <div
        ref={craftRef}
        // Starts invisible; the layout effect measures the page and then
        // reveals it in the right place, so there is no frame in which a
        // container sits in the corner of the viewport.
        className="invisible absolute top-0 left-0 will-change-transform"
      >
        <div ref={floatRef}>
          <ShippingContainer className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}
