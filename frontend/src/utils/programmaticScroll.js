/**
 * Marks the scrolls the app starts itself — anchor navigation from the navbar
 * and footer — so they can be told apart from the ones the user drives with a
 * wheel, key or drag.
 *
 * A scroll listener sees the two as identical. That matters for the pinned
 * scroll sequence on the home page, which gates itself on the page getting
 * ahead of the animation: an anchor jump to a section below it looks exactly
 * like a fast flick, so the sequence would take the scroll over and strand the
 * user in the animation instead of at the section they asked for.
 */

/**
 * How long a mark stands. Smooth scrolls report no completion event, so this is
 * a deadline rather than a signal: long enough to cover a full-page glide, short
 * enough that a flick a moment later is still the user's own.
 */
const PROGRAMMATIC_SCROLL_MS = 1500;

let until = 0;

/** Call immediately before starting a scroll the user did not drive. */
export function markProgrammaticScroll(ms = PROGRAMMATIC_SCROLL_MS) {
  until = performance.now() + ms;
}

/** True while a marked scroll may still be in flight. */
export function isProgrammaticScroll() {
  return performance.now() < until;
}

/** Drops any standing mark. Test seam. */
export function clearProgrammaticScroll() {
  until = 0;
}
