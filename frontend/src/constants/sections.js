/**
 * Ids shared across the home page.
 *
 * Several of these are read by code that lives nowhere near the markup that
 * renders them — the container journey measures the hero slot and the pinned
 * map, and the nav's scroll-spy watches the anchor sections. Naming them once
 * means a rename cannot silently break a lookup that only fails at runtime.
 */

/** Where the hero reserves space for the container. */
export const HERO_SLOT_ID = "hero-container-slot";

/**
 * The pinned trade-route section: the section, the sticky frame inside it,
 * and the map inside that.
 *
 * The "pin" is CSS `position: sticky`, not a ScrollTrigger pin. ScrollTrigger's
 * pin works by wrapping the element in a spacer it inserts at refresh time,
 * which lands *after* first paint and shoves three viewports of content down
 * the page — a layout shift of well over 1.0. Sticky costs nothing: the
 * section is tall from the very first frame, and the frame sticks inside.
 */
export const TRADE_MAP_SECTION_ID = "trade-routes";
export const TRADE_MAP_STICKY_ID = "trade-routes-frame";
export const TRADE_MAP_ID = "trade-route-map";

/**
 * ScrollTrigger id for the section's scrub, so the container journey can read
 * its measured start and end rather than recomputing them. Two independent
 * calculations of the same boundary is exactly how a container ends up
 * arriving at Kochi half a screen after the line starts drawing.
 */
export const PIN_TRIGGER_ID = "trade-map-scrub";

/**
 * Where the travelling container fades out — the existing "about" anchor
 * the navbar's scroll-spy already tracks, reused rather than duplicated.
 */
export const EXIT_ANCHOR_ID = "about";
