/**
 * Design tokens — the single source of truth for the brand palette and type.
 *
 * The rest of the app still uses inline styles; these constants exist so that
 * shared logic (and any future style refactors) reference brand values by name
 * instead of repeating raw literals. Prefer importing from here over hardcoding
 * new colour/font strings.
 */

export const colors = {
  // Greens (backgrounds)
  forest: "#071E12",
  forestDeep: "#040F09",
  emerald: "#0A2E1C",

  // Gold (accent)
  gold: "#C8963E",
  goldDeep: "#A67B2E",

  // Neutrals
  cream: "#F5F0E8",

  // Feedback
  error: "#e07060",
};

export const fonts = {
  serif: "'Playfair Display', serif",
  sans: "'DM Sans', sans-serif",
};
