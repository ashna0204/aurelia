/**
 * Controllable `matchMedia` for tests.
 *
 * jsdom has no layout and no animation frames worth the name, so the suite
 * runs in the reduced-motion, narrow-viewport configuration by default: no
 * Lenis, no ScrollTrigger, no pinning, and every element rendered in its final
 * state. That makes assertions about the DOM deterministic instead of racing a
 * tween.
 *
 * `setMedia` opts a single test back into the motion path, which is how the
 * GSAP-driven code gets exercised at all.
 */

const DEFAULTS = {
  "(prefers-reduced-motion: reduce)": true,
  "(min-width: 768px)": false,
};

let state = { ...DEFAULTS };

/** Override one or more queries for the current test. */
export function setMedia(overrides) {
  state = { ...state, ...overrides };
}

/** Restore the default (reduced-motion, narrow) configuration. */
export function resetMedia() {
  state = { ...DEFAULTS };
}

/** Shorthand: run this test with animation enabled on a desktop viewport. */
export function enableMotion() {
  setMedia({ "(prefers-reduced-motion: reduce)": false, "(min-width: 768px)": true });
}

/** Install the stub on `window`. Called once from setup.js. */
export function installMatchMedia() {
  window.matchMedia = (query) => ({
    matches: state[query] ?? false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
