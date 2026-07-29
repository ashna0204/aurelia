/**
 * One place that knows how to move the page.
 *
 * Lenis takes ownership of the scroll position, so anything that scrolls
 * programmatically — the nav's in-page anchors, the hero dock, the
 * scroll-to-top on route change — has to go through Lenis when it is running,
 * or the two fight and the page jitters.
 *
 * The instance is held in a module-level slot rather than React context on
 * purpose: there is exactly one page scroller, and the callers that need it
 * are plain helpers (`useSmartNavigate`) rather than components. Everything
 * here degrades to the native API when Lenis is absent — which is the case
 * under reduced motion, and in tests.
 */

let lenis = null;

/**
 * Hand the active Lenis instance to the helpers below.
 * @returns {() => void} an unregister function for effect cleanup.
 */
export function registerLenis(instance) {
  lenis = instance;
  return () => {
    // Guard against a later instance having replaced this one already.
    if (lenis === instance) lenis = null;
  };
}

/** The active Lenis instance, or null when smooth scrolling is off. */
export function getLenis() {
  return lenis;
}

/**
 * Scroll to an element (or a y offset, or a selector).
 *
 * @param {Element|string|number} target
 * @param {{ offset?: number, immediate?: boolean }} [options]
 */
export function scrollTo(target, { offset = 0, immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, immediate });
    return;
  }

  // Native fallback. `immediate` maps to "auto" so a route change lands at the
  // top instantly rather than animating the whole page height.
  const behavior = immediate ? "auto" : "smooth";

  if (typeof target === "number") {
    window.scrollTo({ top: target + offset, behavior });
    return;
  }

  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el?.scrollIntoView) el.scrollIntoView({ behavior, block: "start" });
}

/** Scroll to the top of the page. */
export function scrollToTop({ immediate = false } = {}) {
  scrollTo(0, { immediate });
}
