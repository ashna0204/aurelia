import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Delay before scrolling to an in-page anchor after a cross-route navigation,
// giving the target route time to mount.
const ANCHOR_SCROLL_DELAY = 120;

/**
 * Navigation helper shared by the Navbar and Footer.
 *
 * Handles both plain routes ("/quote") and in-page anchors ("/#about"):
 *  - anchor on the current page  → smooth-scroll to the element
 *  - anchor on another page      → navigate, then scroll once mounted
 *  - plain route                 → navigate and scroll to top
 *
 * @param {object}  [options]
 * @param {boolean} [options.smoothScrollTop=true] - smooth vs. instant scroll-to-top on plain routes.
 * @returns {(to: string) => void} go
 */
export function useSmartNavigate({ smoothScrollTop = true } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Cancel any pending anchor-scroll timers on unmount so they can't fire
  // against a torn-down document.
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const scrollToAnchor = (hash) =>
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });

  return function go(to) {
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      const targetPath = path || "/";
      if (location.pathname !== targetPath) {
        navigate(targetPath);
        timers.current.push(setTimeout(() => scrollToAnchor(hash), ANCHOR_SCROLL_DELAY));
      } else {
        scrollToAnchor(hash);
      }
      return;
    }

    navigate(to);
    window.scrollTo(smoothScrollTop ? { top: 0, behavior: "smooth" } : { top: 0 });
  };
}
