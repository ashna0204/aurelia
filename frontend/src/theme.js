/**
 * Design tokens, in JavaScript.
 *
 * `src/styles/tokens.css` is the source of truth — it is what the browser
 * renders from, and Tailwind generates its utility classes from the same
 * block. This module mirrors those values for the handful of places that need
 * a colour as a *string* rather than a class: inline SVG geometry (gradient
 * stops, per-node stroke colours) and values handed to GSAP.
 *
 * Keep the two in step. Prefer a Tailwind class or `var(--…)`; reach for this
 * only when the value has to be a JS value.
 */

export const colors = {
  // Backgrounds (Greens)
  forest: "#071E12",
  forestDeep: "#040F09",
  emerald: "#0A2E1C",

  // Accent (Gold)
  gold: "#C8963E",
  goldDeep: "#A67B2E",

  // Neutral
  cream: "#F5F0E8",

  // Feedback
  error: "#e07060",

  // Functional / Legacy Aliases
  bg: "#071E12",
  surface: "#0A2E1C",
  ink: "#F5F0E8",
  inkSoft: "#C8963E",
  accent: "#C8963E",
  teal: "#0A2E1C",
  success: "#0A2E1C",
};

export const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
};

/** Shared easing curve — the CSS form of `--ease-soft` in tokens.css. */
export const EASE_SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

/** GSAP's name for the same feel, used by every entrance timeline. */
export const GSAP_EASE = "power3.out";
