import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import WorldMap from "../WorldMap";
import ShippingContainer from "../ShippingContainer";
import VerticalDock from "./VerticalDock";
import { gsap } from "../../lib/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useDesktopMotion } from "../../hooks/useMediaQuery";
import { HERO_SLOT_ID } from "../../constants/sections";

export default function Hero() {
  const rootRef = useRef(null);
  const mapRef = useRef(null);
  const reduced = useReducedMotion();
  // When the journey runs, the container lives in the fixed layer instead —
  // the slot below still reserves its exact space, so nothing shifts.
  const journeyActive = useDesktopMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    const ctx = gsap.context(() => {
      // Load-in cascade. Not scroll-triggered: the hero is above the fold by
      // definition, so it plays on arrival.
      gsap.from("[data-hero-step]", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        delay: 0.1,
        clearProps: "transform,opacity",
      });

      // The map drifts slower than the page, which is what gives the hero
      // depth without a parallax library.
      gsap.to(mapRef.current, {
        y: 20,
        ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      id="home"
      ref={rootRef}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden bg-bg pt-header"
    >
      {/* ── Background: the world, at a whisper ── */}
      <div ref={mapRef} className="pointer-events-none absolute inset-0 flex items-center">
        <WorldMap
          className="w-full"
          highlightRegions={["southAsia", "gulf", "uk"]}
          markers={["kochi", "mumbai", "dubai", "london"]}
          pulse
          dotOpacity={0.07}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-10 text-center md:px-8">
        <p data-hero-step className="pre-header flex items-center justify-center gap-3">
          <span className="inline-block h-px w-6 bg-gold" aria-hidden="true" />
          Global trade, handled end-to-end
        </p>

        <h1
          data-hero-step
          className="mt-6 font-display font-bold leading-[1.02] tracking-[-0.02em] text-ink text-hero"
        >
          Sourcing the World.
          <br />
          <span className="italic text-accent">Delivered.</span>
        </h1>

        {/* ── Centrepiece ──
            Pulled up over the headline's baseline, the way a product shot sits
            in front of its own wordmark. The slot keeps its aspect ratio
            whether or not the container is drawn into it, so switching between
            the inline copy and the travelling one cannot shift the page. */}
        <div
          id={HERO_SLOT_ID}
          data-hero-step
          // No overlap on a phone: the headline wraps to three lines there and
          // the container would sit on top of the last one.
          className="mx-auto mt-3 aspect-640/330 w-full max-w-[min(620px,78vw)] md:mt-[-3vh]"
        >
          {journeyActive ? null : <ShippingContainer className="h-full w-full" />}
        </div>

        <p
          data-hero-step
          className="mx-auto mt-4 max-w-[620px] text-[17px] leading-relaxed text-ink-soft md:mt-[-2vh]"
        >
          Ethnic food, vehicle parts and pharmaceuticals — sourced, inspected, documented and
          shipped from South Asia by one partner.
        </p>

        <div data-hero-step className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/quote" className="btn-primary">
            Request a Quote
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <Link to="/specialisations" className="btn-ghost">
            Explore Products
          </Link>
        </div>

        <div data-hero-step className="mt-8 flex justify-center">
          <VerticalDock />
        </div>
      </div>
    </section>
  );
}
