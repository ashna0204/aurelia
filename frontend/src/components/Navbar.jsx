import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSmartNavigate } from "../hooks/useSmartNavigate";
import Logo from "./Logo";
import { EXPERTISE, expertisePath } from "../constants/expertise";

// The four sourcing areas plus Sahya sit under Areas of Expertise rather than
// in the bar itself: the rewrite's recommended navigation lists ten
// destinations, and ten uppercase links do not fit a 72px bar legibly.
const EXPERTISE_CHILDREN = [
  ...EXPERTISE.map((area) => ({ label: area.label, to: expertisePath(area.slug) })),
  { label: "Sahya", to: "/sahya" },
];

const LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Areas of Expertise", to: "/expertise", children: EXPERTISE_CHILDREN },
  { label: "Request a Quote", to: "/quote" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const go = useSmartNavigate();
  const dropdownRef = useRef(null);

  const onHome = location.pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // A click anywhere else closes an open dropdown — without this it stays open
  // over whatever the user was actually trying to reach.
  useEffect(() => {
    if (!openDropdown) return;
    const onDocClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openDropdown]);

  const handleNav = (e, to) => {
    e.preventDefault();
    setMenuOpen(false);
    setOpenDropdown(null);
    go(to);
  };

  // Routes match by path prefix, so a sub-page keeps its parent lit. Home owns
  // only "/" — a prefix match there would light it on every route.
  const isActive = (to) => (to === "/" ? onHome : location.pathname.startsWith(to));

  const linkStyle = (to) => ({
    textDecoration: "none", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
    color: isActive(to) ? "#C8963E" : "rgba(245,240,232,0.7)",
    letterSpacing: "0.18em", textTransform: "uppercase", transition: "color 0.3s",
    borderBottom: isActive(to) ? "1px solid #C8963E" : "1px solid transparent", paddingBottom: 3,
    whiteSpace: "nowrap",
  });

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
          <Logo size={60} style={{ flexShrink: 0 }} />
          {/* Brand wordmark — Concept E from aurelia-logos.html: Cinzel, house
              gold, uppercase with wide tracking. px size scaled down from the
              prototype (30) to sit in the 72px bar. */}
          <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 20, letterSpacing: "0.42em", textTransform: "uppercase", color: "#E8C547" }}>AURELIA</span>
        </Link>

        <div style={{ display: "flex", gap: 26, alignItems: "center" }} className="desk-nav">
          {LINKS.map(({ label, to, children }) =>
            children ? (
              <div
                key={label}
                ref={openDropdown === label ? dropdownRef : undefined}
                style={{ position: "relative" }}
                onMouseEnter={() => setOpenDropdown(label)}
                onMouseLeave={() => setOpenDropdown(null)}
                // Focus opens it too, so the sub-pages are reachable by
                // keyboard — hover alone would strand them. React's onFocus /
                // onBlur are focusin / focusout, so they fire for descendants;
                // relatedTarget is where focus went, and a move within the
                // group must not close the panel out from under it.
                onFocus={() => setOpenDropdown(label)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setOpenDropdown(null);
                }}
              >
                <a
                  href={to}
                  onClick={(e) => handleNav(e, to)}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === label}
                  style={{ ...linkStyle(to), display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  {label}
                  <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
                </a>
                {openDropdown === label && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, paddingTop: 14, minWidth: 280,
                  }}>
                    <div style={{
                      background: "rgba(5,21,14,0.98)", backdropFilter: "blur(16px)",
                      border: "1px solid rgba(200,150,62,0.15)", borderRadius: 6,
                      padding: "10px 0", boxShadow: "0 16px 40px rgba(0,0,0,0.45)",
                    }}>
                      {children.map((child) => (
                        <a key={child.to} href={child.to} onClick={(e) => handleNav(e, child.to)} style={{
                          display: "block", textDecoration: "none",
                          fontFamily: "'DM Sans', sans-serif", fontSize: 12.5,
                          color: location.pathname.startsWith(child.to) ? "#C8963E" : "rgba(245,240,232,0.72)",
                          padding: "10px 22px", letterSpacing: "0.04em", transition: "color 0.25s, background 0.25s",
                        }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#C8963E"; e.currentTarget.style.background = "rgba(200,150,62,0.07)"; }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = location.pathname.startsWith(child.to) ? "#C8963E" : "rgba(245,240,232,0.72)";
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a key={label} href={to} onClick={(e) => handleNav(e, to)} style={linkStyle(to)}>
                {label}
              </a>
            ),
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mob-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
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
        <div style={{ background: "rgba(5,21,14,0.98)", padding: "16px 28px 28px", borderTop: "1px solid rgba(200,150,62,0.1)", maxHeight: "calc(100vh - 72px)", overflowY: "auto" }}>
          {LINKS.map(({ label, to, children }) => (
            <div key={label}>
              <a href={to} onClick={(e) => handleNav(e, to)} style={{
                display: "block", textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                fontSize: 15, fontWeight: 500, color: "#F5F0E8", letterSpacing: "0.05em", padding: "11px 0",
                borderBottom: "1px solid rgba(245,240,232,0.06)",
              }}>
                {label}
              </a>
              {/* Sub-pages are listed inline on mobile — a hover dropdown has
                  no equivalent on touch. */}
              {children?.map((child) => (
                <a key={child.to} href={child.to} onClick={(e) => handleNav(e, child.to)} style={{
                  display: "block", textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, color: "rgba(245,240,232,0.6)", letterSpacing: "0.03em",
                  padding: "9px 0 9px 18px", borderBottom: "1px solid rgba(245,240,232,0.04)",
                }}>
                  {child.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
