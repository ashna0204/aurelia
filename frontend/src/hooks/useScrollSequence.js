import { useState, useEffect, useRef } from "react";
import { isProgrammaticScroll } from "../utils/programmaticScroll";

/**
 * Floor on how long the full sequence may take to play. A flick or a Page Down
 * asks for far more progress than this allows; the surplus is metered out
 * rather than skipped, so the animation is always actually seen.
 */
const MIN_PLAY_MS = 3200;

/**
 * How far ahead of the animation the scroll must get before the sequence takes
 * over and plays itself out. One wheel notch is roughly 100px — about 5% of a
 * 220vh travel — so this sits above unhurried scrolling and below a flick.
 * Lower it to gate more eagerly, raise it to let more scrolling through.
 */
const TAKEOVER_GAP = 0.14;

/**
 * Time constant of the follow, in ms. Larger glides more; smaller tracks the
 * wheel more literally.
 */
const FOLLOW_TAU = 120;

/** Below this, progress has not moved by an amount anything can render. */
const EPSILON = 0.0005;

/** Frame gaps longer than this come from a backgrounded tab. */
const MAX_FRAME_MS = 50;

/** Upward slack, in px, before an observed scroll counts as the user's. */
const UP_TOLERANCE = 2;

/**
 * Drives a pinned scroll sequence from the position of `ref`, returning
 * progress in 0…1.
 *
 * Two things separate this from reading the scroll offset directly:
 *
 *  - It *follows* the scroll rather than tracking it, so progress glides into
 *    place instead of quantising to whatever the wheel reported this frame.
 *  - It has a floor on playback duration. Scroll far enough ahead of the
 *    animation and the sequence takes the scroll position over, plays forward
 *    at its own pace, and releases once complete — so the page cannot be
 *    skipped past mid-animation. This happens at most once: after the sequence
 *    has run to the end, scrolling is never intercepted again.
 *
 * Scrolling up always cancels a takeover immediately, and a scroll the app
 * started itself (see utils/programmaticScroll) is never taken over — an anchor
 * jump past the section is a destination, not a flick.
 *
 * @param {import("react").RefObject<HTMLElement>} ref - the tall pinning container.
 * @param {boolean} [enabled=true] - false leaves the scroll entirely alone.
 * @returns {number} progress, 0…1.
 */
export function useScrollSequence(ref, enabled = true) {
  const [progress, setProgress] = useState(0);
  const stateRef = useRef({
    shown: 0,      // progress currently rendered
    lastY: 0,      // scrollY as of the previous frame
    lastTime: 0,
    frame: null,
    takingOver: false,
    played: false, // the sequence has reached the end at least once
    started: false,
  });

  useEffect(() => {
    if (!enabled) return;
    const s = stateRef.current;

    const request = () => {
      if (s.frame === null) s.frame = requestAnimationFrame(step);
    };

    const step = (now) => {
      s.frame = null;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;

      const y = window.scrollY;
      const documentTop = rect.top + y;
      const target = Math.max(0, Math.min(1, -rect.top / total));

      // The first frame adopts whatever is already on screen. A restored scroll
      // position must not be yanked back to replay the sequence from the top.
      if (!s.started) {
        s.started = true;
        s.lastTime = now;
        s.lastY = y;
        s.shown = target;
        if (target >= 1 - EPSILON) s.played = true;
        setProgress(target);
        return;
      }

      const dt = Math.min(now - s.lastTime, MAX_FRAME_MS);
      s.lastTime = now;

      // During a takeover this loop is the only thing writing scrollY, so any
      // decrease is the user reaching for the scrollbar — hand control back.
      if (s.takingOver && y < s.lastY - UP_TOLERANCE) s.takingOver = false;


      const ours = isProgrammaticScroll();

      // Deliberately not requiring the section to still be pinned: the fastest
      // flicks land past it entirely, and those are the ones worth catching.
      const entered = rect.top <= 0;
      if (!s.played && !s.takingOver && !ours && entered && target > s.shown + TAKEOVER_GAP) {
        s.takingOver = true;
      }

      if (s.takingOver) {
        s.shown = Math.min(1, s.shown + dt / MIN_PLAY_MS);
        // "instant" is required, not a preference: the page sets
        // scroll-behavior: smooth, and a plain scrollTo would start a fresh
        // animated scroll every frame that never gets time to arrive.
        window.scrollTo({ top: documentTop + s.shown * total, behavior: "instant" });
        if (s.shown >= 1) {
          s.takingOver = false;
          s.played = true;
        }
      } else if (ours) {
        s.shown = target;
        if (s.shown >= 1 - EPSILON) s.played = true;
      } else {
        // Frame-rate independent exponential follow. The snap has to come after
        // the step, not before: the run ends the moment the gap fits inside
        // EPSILON, so a check at the top of the next frame would never happen.
        s.shown += (target - s.shown) * (1 - Math.exp(-dt / FOLLOW_TAU));
        if (Math.abs(target - s.shown) <= EPSILON) s.shown = target;
        if (s.shown >= 1 - EPSILON) s.played = true;
      }

      s.lastY = window.scrollY;

      // Mid-flight, sub-epsilon changes are dropped: each one costs a re-render
      // of the whole map for something invisible. The frame that ends the run
      // always commits exactly, so a finished sequence reads as finished rather
      // than a rounding error short of it.
      const running = s.takingOver || Math.abs(target - s.shown) > EPSILON;
      setProgress((prev) => (running && Math.abs(prev - s.shown) < EPSILON ? prev : s.shown));

      if (running) request();
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (s.frame !== null) cancelAnimationFrame(s.frame);
      s.frame = null;
      s.started = false;
      s.takingOver = false;
    };
  }, [enabled, ref]);

  return progress;
}
