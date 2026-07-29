import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSmartNavigate } from "../hooks/useSmartNavigate";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { scrollToTop } from "../lib/scroll";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Specialisations", to: "/specialisations" },
  { label: "Contact", to: "/#contact" },
];

const CTA = { label: "Request Quote", to: "/quote" };

// In-page anchor targets, top-to-bottom. Matched against whichever section is
// in view on the home page; the ids live on the sections in Home.jsx.
const HOME_SECTIONS = ["home", "about", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const barRef = useRef(null);
  const location = useLocation();
  const go = useSmartNavigate();
  const reduced = useReducedMotion();

  const onHome = location.pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    h();
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close the menu when the route changes. Adjusted during render rather than
  // in an effect: React re-runs this component immediately with the corrected
  // state and never commits the stale frame, so there is no moment where the
  // menu is open over the new page.
  const [menuPath, setMenuPath] = useState(location.pathname);
  if (menuPath !== location.pathname) {
    setMenuPath(location.pathname);
    setMenuOpen(false);
  }

  // The header shrinks over the first 120px of scroll. Driven by GSAP rather
  // than a CSS class so it interpolates with the scroll position instead of
  // snapping at a threshold — and so it runs on the same ScrollTrigger clock
  // as everything else on the page.
  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el || reduced) return undefined;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        height: 60,
        ease: "none",
        scrollTrigger: { start: 0, end: 120, scrub: 0.3 },
      });
    }, barRef);
    return () => ctx.revert();
  }, [reduced]);

  // Scroll-spy: on the home page, highlight whichever section is most in view.
  // IntersectionObserver reports real visibility, which — unlike a scroll-offset
  // marker — correctly tracks the final section even though it sits at the very
  // bottom and never reaches the top of the viewport. Off the home page the
  // sections don't exist, so this is a no-op.
  useEffect(() => {
    if (!onHome) return;
    const els = HOME_SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);
    if (els.length === 0) return;

    const ratios = new Map(HOME_SECTIONS.map((id) => [id, 0]));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        // The most-visible section wins; ties resolve to the topmost. When
        // nothing tracked is on screen (e.g. the tall between-sections regions)
        // the last active section is left in place.
        let best = null;
        let bestRatio = 0;
        for (const id of HOME_SECTIONS) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) setActiveSection(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [onHome]);

  // A pinned section changes the page height, which invalidates every trigger
  // measured before it. Refreshing on route change is what keeps the shrink —
  // and every reveal on the incoming page — firing at the right scroll offset.
  useEffect(() => {
    if (reduced) return;
    ScrollTrigger.refresh();
  }, [location.pathname, reduced]);

  const handleNav = (e, to) => {
    e.preventDefault();
    setMenuOpen(false);
    go(to);
  };

  const isActive = (to) => {
    // In-page anchors ("/#about") light up only on the home page, and only
    // when their section is the one currently in view — never on other routes.
    const hash = to.split("#")[1];
    if (hash) return onHome && activeSection === hash;
    // The Home link owns the top-of-page section, not the whole route.
    if (to === "/") return onHome && activeSection === "home";
    // Real routes match by path prefix, covering nested pages.
    return location.pathname.startsWith(to);
  };

  /** Shared props for a nav link, so desktop and mobile can never drift. */
  const linkProps = (to) => ({
    href: to,
    onClick: (e) => handleNav(e, to),
    "data-active": isActive(to),
    // aria-current is the machine-readable half of the highlight; the filled
    // pill is the visual half. A screen-reader user gets the same information
    // a sighted one does — which the old colour-only treatment never gave.
    "aria-current": isActive(to) ? "page" : undefined,
  });

  return (
    <header
      className={`fixed inset-x-0 top-0 z-200 transition-colors duration-500 ${
        scrolled || !onHome
          ? "border-b border-ink/8 bg-bg/80 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <div
        ref={barRef}
        className="mx-auto flex h-header max-w-[1240px] items-center justify-between px-6 md:px-8"
      >
        <Link
          to="/"
          onClick={() => scrollToTop({ immediate: true })}
          className="flex shrink-0 items-center gap-3 no-underline"
          aria-label="Aurelia Logistics — home"
        >
          <span
            className="grid size-9 shrink-0 place-items-center rounded-full bg-ink font-display text-[17px] font-bold text-white"
            aria-hidden="true"
          >
            A
          </span>
          <span className="font-display text-[19px] font-semibold tracking-[0.08em] text-ink">
            AURELIA
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ label, to }) => (
            <a key={label} {...linkProps(to)} className="pill border-transparent px-4 py-2.5">
              {label}
            </a>
          ))}
          <a {...linkProps(CTA.to)} className="btn-primary ml-3 px-6 py-3 text-[13px]">
            {CTA.label}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-full border border-ink/10 text-ink md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-ink/8 bg-bg/95 px-6 pt-2 pb-6 backdrop-blur-xl md:hidden"
        >
          {LINKS.map(({ label, to }) => (
            <a
              key={label}
              {...linkProps(to)}
              className="block border-b border-ink/5 py-3.5 text-[15px] font-medium text-ink data-[active=true]:text-accent"
            >
              {label}
            </a>
          ))}
          <a {...linkProps(CTA.to)} className="btn-primary mt-5 w-full">
            {CTA.label}
          </a>
        </nav>
      ) : null}
    </header>
  );
}
