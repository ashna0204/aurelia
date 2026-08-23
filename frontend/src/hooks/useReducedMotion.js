import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange) => {
  const mq = window.matchMedia?.(QUERY);
  if (!mq) return () => {};
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

// Read fresh on every render rather than cached in state, so a preference
// toggled between render and subscribe cannot leave the UI a frame behind.
const getSnapshot = () => window.matchMedia?.(QUERY).matches ?? false;

// Without a window there is no preference to honour; assume full motion.
const getServerSnapshot = () => false;

/**
 * Tracks the user's reduced-motion preference, and keeps tracking it — the OS
 * setting can be toggled while the page is open.
 *
 * Callers should render the *finished* state of an animation when this is true,
 * not hide the content: the information still has to be readable.
 *
 * @returns {boolean} true when the user has asked for reduced motion.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
