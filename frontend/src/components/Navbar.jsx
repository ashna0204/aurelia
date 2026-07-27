import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSmartNavigate } from "../hooks/useSmartNavigate";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/#about" },
  { label: "Specialisations", to: "/specialisations" },
  { label: "Quote", to: "/quote" },
  { label: "Contact", to: "/#contact" },
];

// In-page anchor targets, top-to-bottom. Matched against whichever section is
// in view on the home page; the ids live on the sections in Home.jsx.
const HOME_SECTIONS = ["home", "about", "contact"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const go = useSmartNavigate();

  const onHome = location.pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  // Scroll-spy: on the home page, highlight whichever section is most in view.
  // IntersectionObserver reports real visibility, which — unlike a scroll-offset
  // marker — correctly tracks the final section even though it sits at the very
  // bottom and never reaches the top of the viewport. Off the home page the
  // sections don't exist, so this is a no-op.
  useEffect(() => {
    if (!onHome) return;
    const els = HOME_SECTIONS
      .map((id) => document.getElementById(id))
      .filter(Boolean);
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

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
      background: scrolled || !onHome ? "rgba(7,30,18,0.95)" : "transparent",
      backdropFilter: scrolled || !onHome ? "blur(16px)" : "none",
      borderBottom: scrolled || !onHome ? "1px solid rgba(200,150,62,0.12)" : "1px solid transparent",
      transition: "all 0.45s ease",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>

        <Link to="/" onClick={() => window.scrollTo({ top: 0 })} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #C8963E, #8B6914)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#F5F0E8", fontSize: 17, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>A</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 600, color: "#F5F0E8", letterSpacing: "0.06em" }}>AURELIA</span>
        </Link>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="desk-nav">
          {LINKS.map(({ label, to }) => (
            <a key={label} href={to} onClick={(e) => handleNav(e, to)} style={{
              textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
              color: isActive(to) ? "#C8963E" : "rgba(245,240,232,0.7)",
              letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.3s",
              borderBottom: isActive(to) ? "1px solid #C8963E" : "1px solid transparent", paddingBottom: 3,
            }}>
              {label}
            </a>
          ))}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mob-menu-btn"
          style={{ background: "none", border: "none", cursor: "pointer", display: "none", flexDirection: "column", gap: 5, padding: 8 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block", width: 24, height: 2, background: "#F5F0E8", borderRadius: 2, transition: "all 0.3s",
              transform: i === 0 && menuOpen ? "rotate(45deg) translate(5px,5px)" :
                i === 2 && menuOpen ? "rotate(-45deg) translate(5px,-5px)" : "none",
              opacity: i === 1 && menuOpen ? 0 : 1,
            }} />
          ))}
        </button>
      </div>

      {menuOpen && (
        <div style={{ background: "rgba(5,21,14,0.98)", padding: "16px 28px 28px", borderTop: "1px solid rgba(200,150,62,0.1)" }}>
          {LINKS.map(({ label, to }) => (
            <a key={label} href={to} onClick={(e) => handleNav(e, to)} style={{
              display: "block", textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
              fontSize: 15, fontWeight: 500, color: "#F5F0E8", letterSpacing: "0.05em", padding: "11px 0",
              borderBottom: "1px solid rgba(245,240,232,0.06)",
            }}>
              {label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
