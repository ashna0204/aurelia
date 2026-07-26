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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const go = useSmartNavigate();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleNav = (e, to) => {
    e.preventDefault();
    setMenuOpen(false);
    go(to);
  };

  const isActive = (to) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to.split("#")[0]) && to !== "/";
  };

  const onHome = location.pathname === "/";

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
