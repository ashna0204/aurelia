import { useLayoutEffect, useRef } from "react";
import ShippingContainer from "./ShippingContainer";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useDesktopMotion } from "../hooks/useMediaQuery";
import { CORRIDOR_STOPS, PLACES, ROUTES, project } from "../lib/worldMap";
import {
  EXIT_ANCHOR_ID,
  HERO_SLOT_ID,
  PIN_TRIGGER_ID,
  TRADE_MAP_ID,
  TRADE_MAP_STICKY_ID,
} from "../constants/sections";

/** How many points to sample off the route path for the motion path. */
const ROUTE_SAMPLES = 72;
/** Scale the container settles at once it docks onto the map. */
const DOCKED_SCALE = 0.4;
/** How much of a viewport the container takes to leave frame at the end. */
const EXIT_VIEWPORTS = 0.6;

/**
 * Convert a point in the map's SVG user space to viewport pixels.
 *
 * The map is cropped to the trade network, so its viewBox does not start at
 * the origin — the offset has to come out before the scale goes on, or every
 * waypoint lands a continent away.
 */
function toViewport(point, frame) {
  return {
    x: frame.left + (point.x - frame.viewBox.x) * frame.scale,
    y: frame.top + (point.y - frame.viewBox.y) * frame.scale,
  };
}

/** Read an SVG's viewBox as numbers. */
function readViewBox(svg) {
  const parts = (svg.getAttribute("viewBox") || "").split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null;
  const [x, y, width, height] = parts;
  return width > 0 && height > 0 ? { x, y, width, height } : null;
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
  const exitAnchor = document.getElementById(EXIT_ANCHOR_ID);
  const pin = ScrollTrigger.getById(PIN_TRIGGER_ID);
  // Read the id off the route definition rather than repeating the string:
  // a rename would otherwise silently stop the journey from measuring.
  const route = document.getElementById(ROUTES.corridor.id);

  if (!slot || !map || !frame || !exitAnchor || !pin || !route) return null;
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
  const viewBox = readViewBox(map);
  if (!viewBox) return null;

  const mapRect = map.getBoundingClientRect();
  const frameRect = frame.getBoundingClientRect();
  const mapFrame = {
    left: mapRect.left,
    top: mapRect.top - frameRect.top,
    scale: mapRect.width / viewBox.width,
    viewBox,
  };

  // The first stop on the corridor is where the container docks before it
  // starts travelling — read from the corridor rather than named here, so the
  // two cannot disagree about where the journey begins.
  const originKey = CORRIDOR_STOPS[0];
  const origin = toViewport(
    project(PLACES[originKey].lon, PLACES[originKey].lat),
    mapFrame,
  );

  // Sample the same path the route line draws, so the container leads the
  // stroke instead of merely running alongside it.
  const length = route.getTotalLength();
  const path = Array.from({ length: ROUTE_SAMPLES }, (_, i) => {
    const point = route.getPointAtLength((i / (ROUTE_SAMPLES - 1)) * length);
    return toViewport(point, mapFrame);
  });

  // Phase boundaries, in scroll pixels. The sticky section's own measured
  // start and end are the authority — see PIN_TRIGGER_ID. The container
  // leaves frame just after the section releases, well before the next
  // section arrives.
  const start = 0;
  const exitDistance = window.innerHeight * EXIT_VIEWPORTS;
  const end = Math.min(
    pin.end + exitDistance,
    Math.max(exitAnchor.getBoundingClientRect().top + scrollY, pin.end + 1),
  );

  return {
    heroStage,
    origin,
    path,
    end,
    // Durations in arbitrary timeline units, made proportional to the real
    // scroll distance each phase covers. Without this the traverse would not
    // line up with the sticky range, and the container would reach London
    // while the lane was still drawing.
    approach: Math.max(pin.start - start, 1),
    travel: Math.max(pin.end - pin.start, 1),
    exit: Math.max(end - pin.end, 1),
  };
}

/**
 * The signature animation: one shipping container that travels with the
 * reader from the hero, down onto Kochi, across to Dubai and on to London,
 * and out of frame.
 *
 * A single fixed layer driven by one scrubbed master timeline, so the
 * container survives every section boundary it crosses. Everything animated
 * is `transform` or `opacity`, and the hero reserves the container's space
 * with a fixed aspect ratio, so none of this can move layout.
 *
 * The corridor runs Kochi → Dubai → London — westward, which on a faithful
 * map reads right-to-left. The five other places on the map (Rotterdam, New
 * York, Singapore, Sydney, Nairobi) sit on branches off this spine that draw
 * in on their own schedule; the travelling container only ever follows the
 * corridor, because a single continuous motion path cannot fork.
 *
 * Below 768px, and whenever reduced motion is requested, this renders nothing:
 * the hero draws a static container in its slot and the trade-route section
 * parks one at Kochi.
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

        // 1 · Hero → the origin node. Shrinks, tilts as if under a crane, and
        //     settles level on Kochi ready to depart.
        tl.to(
          craftRef.current,
          {
            x: stage.origin.x,
            y: stage.origin.y,
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

        // 2 · The traverse. Sampled off the same path the lane draws, so the
        //     container leads the stroke rather than trailing it, and passes
        //     over each office at the moment that office lights up.
        tl.to(craftRef.current, {
          duration: stage.travel,
          ease: "none",
          motionPath: { path: stage.path, curviness: 1, autoRotate: false },
        });

        // 3 · Out of frame as the section releases.
        tl.to(craftRef.current, {
          scale: DOCKED_SCALE * 0.7,
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
      style={{
        pointerEvents: "none",
        position: "fixed",
        inset: 0,
        zIndex: 40,
        overflow: "hidden",
      }}
    >
      <div
        ref={craftRef}
        data-craft
        // Starts invisible; the layout effect measures the page and then
        // reveals it in the right place, so there is no frame in which a
        // container sits in the corner of the viewport.
        style={{ visibility: "hidden", position: "absolute", top: 0, left: 0, willChange: "transform" }}
      >
        <div ref={floatRef}>
          <ShippingContainer style={{ height: "auto", width: "100%" }} />
        </div>
      </div>
    </div>
  );
}
