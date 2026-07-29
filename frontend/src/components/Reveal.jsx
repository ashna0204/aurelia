import { useLayoutEffect, useRef } from "react";
import { gsap, REVEAL, REVEAL_START } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * Scroll-triggered entrance.
 *
 * Wraps content (or, with `stagger`, cascades its direct children) from
 * `y: 32, opacity: 0` to its natural state as it crosses into view. Replaces
 * the old IntersectionObserver `FadeIn`: same job, but the tween lives on the
 * GSAP timeline alongside every other animation on the page, so entrances and
 * scrubbed timelines share one clock.
 *
 * Two properties matter for the quality bar:
 *
 *  - Only `transform` and `opacity` are animated, so an entrance can never
 *    shift layout — no CLS.
 *  - Under reduced motion no timeline is built at all, and because the
 *    hidden state is applied *by* the tween rather than by a class, the
 *    content simply renders in its final state. There is no path where a
 *    reduced-motion user is left looking at an invisible element.
 *
 * @param {object}  props
 * @param {string}  [props.as="div"]   element to render
 * @param {number|boolean} [props.stagger] cascade direct children; `true` → 0.1s
 * @param {number}  [props.delay=0]
 * @param {number}  [props.y=32]       travel distance in px
 * @param {string}  [props.start]      ScrollTrigger start, defaults to "top 85%"
 */
export default function Reveal({
  as: Tag = "div",
  children,
  stagger = 0,
  delay = 0,
  y = REVEAL.y,
  start = REVEAL_START,
  className,
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;

    const ctx = gsap.context(() => {
      // `stagger` animates the children so they cascade; without it the
      // wrapper itself moves as one block.
      const targets = stagger ? Array.from(el.children) : el;
      if (Array.isArray(targets) && targets.length === 0) return;

      gsap.from(targets, {
        ...REVEAL,
        y,
        delay,
        stagger: stagger === true ? 0.1 : stagger,
        // Hand the element back with no leftover inline transform, so it does
        // not create a stacking context the fixed container layer has to
        // compete with.
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: el, start, once: true },
      });
    }, ref);

    // revert() kills the tween *and* the ScrollTrigger it created, which is
    // what stops triggers leaking across client-side route changes.
    return () => ctx.revert();
  }, [reduced, stagger, delay, y, start]);

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
