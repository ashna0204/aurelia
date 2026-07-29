import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Read the reduced-motion preference once, outside React.
 *
 * Callers that only need the value at a single moment — a `useLayoutEffect`
 * deciding whether to build a timeline at all — should use this rather than
 * the hook, because it costs no render.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    // No matchMedia means no way to ask. Assume motion is fine; the CSS
    // media query in index.css still covers the declarative animations.
    return false;
  }
  return window.matchMedia(QUERY).matches;
}

/**
 * Subscribe to the reduced-motion preference.
 *
 * The value is read during the first render rather than in an effect, so a
 * user who has the preference set never sees a frame of the motion-enabled
 * tree before it is torn down again.
 *
 * @returns {boolean} true when the user has asked for reduced motion.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    const mql = window.matchMedia(QUERY);
    const onChange = (event) => setReduced(event.matches);

    // Subscribe only. The current value was already read by the lazy
    // initialiser above, during the first render; re-reading it here would
    // set state synchronously on mount for no gain. Older Safari exposes
    // addListener rather than addEventListener.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  return reduced;
}
