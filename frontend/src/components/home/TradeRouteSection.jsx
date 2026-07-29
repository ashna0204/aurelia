import { useLayoutEffect, useRef } from "react";
import SectionTag from "../SectionTag";
import WorldMap from "../WorldMap";
import { ROUTES } from "../../lib/worldMap";
import { gsap } from "../../lib/gsap";
import { useDesktopMotion } from "../../hooks/useMediaQuery";
import {
  PIN_TRIGGER_ID,
  TRADE_MAP_ID,
  TRADE_MAP_SECTION_ID,
  TRADE_MAP_STICKY_ID,
} from "../../constants/sections";

const LANES = [
  { lane: "Kochi → Dubai → London", detail: "Consolidated LCL & FCL, weekly" },
  { lane: "Kochi → Mumbai", detail: "Domestic feeder & inland haulage" },
];

/**
 * The narrative centre of the home page: the map pins, and the trade lanes
 * draw themselves as the reader scrolls through it.
 *
 * The drawing is a `strokeDashoffset` sweep on a path whose `pathLength` is
 * normalised to 1, so progress maps straight onto scroll with no measuring —
 * and it is the same path the container follows overhead, which is what makes
 * the container look like it is leading the line rather than tracing it.
 *
 * Under reduced motion — and on anything narrower than 768px — nothing here
 * is built. The routes keep their rendered `strokeDashoffset="0"`, the labels
 * keep their natural opacity, and the section is simply a static map:
 * complete, legible, no scrolling tricks. Pinning a full-height section on a
 * phone buys an effect there is no room to see, and costs a layout shift to
 * do it.
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

      // Start undrawn and unlabelled. Done in JS rather than in the markup so
      // the reduced-motion path never has to undo it.
      gsap.set(routes, { strokeDashoffset: 1 });
      gsap.set(markers, { opacity: 0, scale: 0.4, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: PIN_TRIGGER_ID,
          trigger: section,
          // The section is 250svh and the frame inside it is 100svh, so this
          // range is exactly the 150svh the frame spends stuck to the top.
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          // Measured before anything downstream that depends on where the
          // sections after it end up.
          refreshPriority: 1,
        },
      });

      // Kochi first — every lane starts there.
      tl.to("[data-marker='kochi']", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" })
        .to("#route-main", { strokeDashoffset: 0, duration: 3, ease: "none" }, 0.2)
        .to(
          "[data-marker='dubai']",
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
          1.5,
        )
        .to(
          "[data-marker='london']",
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
          3,
        )
        .to("#route-coastal", { strokeDashoffset: 0, duration: 1, ease: "none" }, 2.4)
        .to(
          "[data-marker='mumbai']",
          { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" },
          3.2,
        )
        .from("[data-lane]", { opacity: 0, y: 16, duration: 0.6, stagger: 0.15 }, 3.2);
    }, sectionRef);

    return () => ctx.revert();
  }, [animate]);

  return (
    <section
      id={TRADE_MAP_SECTION_ID}
      ref={sectionRef}
      // 250svh = one frame (100svh) plus the 150svh of scroll spent inside it.
      // Set from the first render, so the page height never changes under the
      // reader. Without animation the section is just as tall as its content.
      className={`relative bg-bg ${animate ? "h-[250svh]" : ""}`}
    >
      <div
        id={TRADE_MAP_STICKY_ID}
        className={`flex flex-col justify-center px-6 md:px-8 ${
          animate ? "sticky top-0 h-svh overflow-hidden py-[4svh]" : "py-24 md:py-32"
        }`}
      >
        <div className="mx-auto w-full max-w-[1240px]">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
            <div className="max-w-[620px]">
              <SectionTag label="Trade lanes" />
              <h2
                className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
              >
                From Kochi,
                <br />
                <span className="italic text-accent">to anywhere.</span>
              </h2>
            </div>
            <p className="max-w-[380px] text-[15px] leading-relaxed text-ink-soft">
              Four offices on three continents, on one continuous chain of custody — so a
              consignment never changes hands between companies that have never met.
            </p>
          </div>

          {/* Narrower than the text column above it: at full width the map's
              vertical extent pushes the lane list out of the pinned frame. */}
          <div className="relative mx-auto mt-8 w-full max-w-[980px]">
            <WorldMap
              id={TRADE_MAP_ID}
              className="h-auto w-full"
              title="Aurelia's trade lanes: Kochi to Dubai to London, and Kochi to Mumbai"
              highlightRegions={["southAsia", "gulf", "uk"]}
              routes={[ROUTES.main, ROUTES.coastal]}
              markers={["kochi", "mumbai", "dubai", "london"]}
              showLabels
              dotOpacity={0.08}
            />
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
            {LANES.map(({ lane, detail }) => (
              <li key={lane} data-lane>
                <p className="font-display text-lg font-semibold text-ink">{lane}</p>
                <p className="mt-1 text-sm text-ink-soft">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
