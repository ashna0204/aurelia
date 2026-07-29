import { useNavigate, useLocation } from "react-router-dom";
import { scrollTo, scrollToTop } from "../lib/scroll";

// Delay before scrolling to an in-page anchor after a cross-route navigation,
// giving the target route time to mount.
const ANCHOR_SCROLL_DELAY = 120;

/**
 * Navigation helper shared by the Navbar, the hero dock and the Footer.
 *
 * Handles both plain routes ("/quote") and in-page anchors ("/#about"):
 *  - anchor on the current page  → smooth-scroll to the element
 *  - anchor on another page      → navigate, then scroll once mounted
 *  - plain route                 → navigate and scroll to top
 *
 * The scrolling goes through `lib/scroll`, which hands off to Lenis whenever
 * smooth scrolling is running. Calling `window.scrollTo` directly from here
 * would move the page out from under Lenis and leave the two disagreeing
 * about where they are.
 *
 * @param {object}  [options]
 * @param {boolean} [options.smoothScrollTop=true] - smooth vs. instant scroll-to-top on plain routes.
 * @returns {(to: string) => void} go
 */
export function useSmartNavigate({ smoothScrollTop = true } = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToAnchor = (hash) => {
    if (typeof document === "undefined") return;
    const el = document.getElementById(hash);
    if (el) scrollTo(el);
  };

  return function go(to) {
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      const targetPath = path || "/";
      if (location.pathname !== targetPath) {
        navigate(targetPath);
        setTimeout(() => scrollToAnchor(hash), ANCHOR_SCROLL_DELAY);
      } else {
        scrollToAnchor(hash);
      }
      return;
    }

    navigate(to);
    scrollToTop({ immediate: !smoothScrollTop });
  };
}
