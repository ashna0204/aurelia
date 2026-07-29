import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

/** Breakpoint above which the scroll-driven container journey runs. */
const DESKTOP = "(min-width: 768px)";

function read(query) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia(query).matches;
}

/**
 * Track a media query.
 *
 * The initial value is read during render rather than in an effect, so the
 * first paint is already correct — a layout that flips on the second frame is
 * a layout shift, and the quality bar here is zero CLS.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => read(query));

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const onChange = (event) => setMatches(event.matches);

    // Subscribe only; the initial value came from the lazy initialiser.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

/**
 * Whether the heavyweight scroll choreography — pinning and the container
 * journey — should run at all.
 *
 * Three components need this answer and they must agree:
 *
 *  - the hero decides whether to draw the container inline,
 *  - the journey layer decides whether to draw the travelling copy,
 *  - the trade-route section decides whether to pin.
 *
 * If the first two disagreed there would be either two containers on screen
 * or none; if the third disagreed, the container would dock onto a map that
 * scrolls away underneath it.
 *
 * Narrow screens get the static fallback: pinning a full-height section on a
 * phone costs a large layout shift for an effect nobody has room to see.
 */
export function useDesktopMotion() {
  const reduced = useReducedMotion();
  const desktop = useMediaQuery(DESKTOP);
  return !reduced && desktop;
}
