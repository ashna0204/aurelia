import { useLayoutEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { registerLenis } from "../lib/scroll";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Smooth scrolling, wired to GSAP.
 *
 * Three things have to agree on the scroll position: the browser, Lenis, and
 * ScrollTrigger. The wiring below is what keeps them in step —
 *
 *   1. Lenis emits `scroll`; ScrollTrigger.update runs on it, so pinned
 *      sections and scrubbed timelines see the interpolated position rather
 *      than the raw one, and never lag a frame behind the content.
 *   2. Lenis's own RAF loop is replaced by GSAP's ticker, so there is one
 *      animation loop on the page instead of two competing ones.
 *   3. `lagSmoothing(0)` stops GSAP from silently swallowing a long frame,
 *      which would otherwise desynchronise Lenis from the real scrollbar.
 *
 * Under reduced motion this renders nothing at all: no Lenis, no ticker
 * callback, native scrolling throughout.
 */
export default function SmoothScroll() {
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (reduced) return undefined;

    const lenis = new Lenis({ lerp: 0.1 });
    const unregister = registerLenis(lenis);

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    // GSAP's ticker reports seconds; Lenis wants milliseconds.
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      unregister();
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
