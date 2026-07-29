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
  // Surfaces
  bg: "#F5F5F7",
  surface: "#FFFFFF",

  // Ink
  ink: "#0B0F14",
  inkSoft: "#5A6472",

  // Accents
  accent: "#0E4C92", // deep maritime blue
  teal: "#0FA3A3", // supporting accent
  gold: "#C8A24B", // micro-accent — ticks, Sahya

  // Feedback
  error: "#B3261E",
  success: "#0F7A5A",
};

export const fonts = {
  serif: "'Playfair Display', Georgia, serif",
  sans: "'DM Sans', ui-sans-serif, system-ui, sans-serif",
};

/** Shared easing curve — the CSS form of `--ease-soft` in tokens.css. */
export const EASE_SOFT = "cubic-bezier(0.22, 1, 0.36, 1)";

/** GSAP's name for the same feel, used by every entrance timeline. */
export const GSAP_EASE = "power3.out";
