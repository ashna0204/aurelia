/**
 * GSAP, registered exactly once.
 *
 * Every module imports gsap and its plugins from here rather than from the
 * package directly. `gsap.registerPlugin` is idempotent, but routing all uses
 * through one module means a plugin can never be *missing* at the moment a
 * timeline needs it — a class of bug that only shows up on the one page that
 * happens to load in a different order.
 */

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

/** Entrance defaults, so every reveal on the site shares one feel. */
export const REVEAL = {
  y: 32,
  opacity: 0,
  duration: 0.8,
  ease: "power3.out",
};

/** Where a reveal fires: the element's top crossing 85% of the viewport. */
export const REVEAL_START = "top 85%";

export { gsap, ScrollTrigger, MotionPathPlugin };
