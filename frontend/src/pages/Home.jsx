import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { submitContact } from "../api/client";
import { validateContactForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { LIMITS } from "../constants/quoteForm";

/* ─── Contact form ─── */
const contactLabelStyle = {
  fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)",
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 7,
};

// Mirrors ContactCreate in backend/app/schemas.py.
const CONTACT_MAX = {
  name: LIMITS.NAME_MAX,
  email: LIMITS.EMAIL_MAX,
  company: LIMITS.COMPANY_MAX,
  message: LIMITS.MESSAGE_MAX,
};

/* ─── Easing ─── */
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v, a, b) => Math.max(0, Math.min(1, (v - a) / (b - a)));

/* ─── Trade Route SVG Animation ─── */
function TradeRouteMap({ progress }) {
  // Nodes (in a 1200 x 500 viewBox)
  const nodes = {
    kochi:     { x: 710, y: 295, label: "Kochi", primary: true },
    dubai:     { x: 620, y: 238, label: "Dubai", hub: true },
    london:    { x: 335, y: 158, label: "London" },
    rotterdam: { x: 362, y: 148, label: "Rotterdam" },
    newYork:   { x: 160, y: 210, label: "New York" },
    singapore: { x: 870, y: 345, label: "Singapore", hub: true },
    sydney:    { x: 945, y: 428, label: "Sydney" },
    nairobi:   { x: 548, y: 328, label: "Nairobi" },
  };

  // Route phases: [startP, endP]
  const routes = [
    { d: "M 710,295 C 680,272 650,255 620,238",         range: [0.08, 0.22], width: 1.8 },
    { d: "M 620,238 C 525,192 415,170 335,158",          range: [0.20, 0.38], width: 1.2 },
    { d: "M 620,238 C 530,188 435,163 362,148",          range: [0.22, 0.40], width: 1.0 },
    { d: "M 710,295 C 780,325 835,338 870,345",          range: [0.28, 0.44], width: 1.5 },
    { d: "M 870,345 C 902,382 928,410 945,428",          range: [0.40, 0.54], width: 1.0 },
    { d: "M 710,295 C 440,90  250,130 160,210",          range: [0.36, 0.56], width: 1.0 },
    { d: "M 620,238 C 590,285 568,308 548,328",          range: [0.44, 0.58], width: 0.8 },
  ];

  const p = (a, b) => easeOut(clamp01(progress, a, b));

  const nodeOpacity = (key) => {
    const map = { kochi: [0.05, 0.12], dubai: [0.18, 0.26], london: [0.32, 0.42],
      rotterdam: [0.34, 0.44], newYork: [0.38, 0.50], singapore: [0.30, 0.40],
      sydney: [0.42, 0.52], nairobi: [0.44, 0.54] };
    return p(...map[key]);
  };

  // Grid lines
  const gridLines = [];
  for (let i = 0; i <= 12; i++) {
    gridLines.push({ x1: i * 100, y1: 0, x2: i * 100, y2: 500 });
  }
  for (let i = 0; i <= 5; i++) {
    gridLines.push({ x1: 0, y1: i * 100, x2: 1200, y2: i * 100 });
  }

  const badgeOpacity = easeOut(clamp01(progress, 0.65, 0.82));

  return (
    <svg viewBox="0 0 1200 500" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-sm" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="origin-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8963E" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C8963E" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="route-fade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C8963E" />
          <stop offset="100%" stopColor="rgba(200,150,62,0.4)" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {gridLines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(200,150,62,0.04)" strokeWidth="1" />
      ))}

      {/* Origin pulse ring */}
      <circle cx={nodes.kochi.x} cy={nodes.kochi.y} r={60}
        fill="url(#origin-glow)" opacity={nodeOpacity("kochi")} />

      {/* Animated trade routes */}
      {routes.map((r, i) => (
        <path key={i} d={r.d} fill="none"
          stroke="#C8963E" strokeWidth={r.width}
          strokeOpacity={0.65}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - p(...r.range)}
        />
      ))}

      {/* Subtle dashed echo on main routes */}
      {routes.slice(0, 4).map((r, i) => (
        <path key={"d" + i} d={r.d} fill="none"
          stroke="#C8963E" strokeWidth={0.4}
          strokeOpacity={0.25}
          strokeLinecap="round"
          strokeDasharray="4 8"
          pathLength="1"
          strokeDashoffset={1 - p(...r.range)}
        />
      ))}

      {/* Nodes */}
      {Object.entries(nodes).map(([key, n]) => (
        <g key={key} opacity={nodeOpacity(key)}>
          {n.primary && <circle cx={n.x} cy={n.y} r={22} fill="#C8963E" opacity={0.08} />}
          <circle cx={n.x} cy={n.y} r={n.primary ? 7 : n.hub ? 5 : 3.5}
            fill={n.primary ? "#C8963E" : n.hub ? "#C8963E" : "#F5F0E8"}
            filter={n.primary ? "url(#glow-gold)" : "url(#glow-sm)"}
            opacity={n.primary ? 1 : 0.9}
          />
          {n.primary && <circle cx={n.x} cy={n.y} r={12} fill="none" stroke="#C8963E" strokeWidth="0.8" strokeOpacity="0.4" />}
        </g>
      ))}

      {/* City labels */}
      {Object.entries(nodes).map(([key, n]) => (
        <text key={"lbl-" + key}
          x={n.x + (n.x > 700 ? 12 : -12)} y={n.y + 4}
          textAnchor={n.x > 700 ? "start" : "end"}
          fill="#F5F0E8" fontSize="10" fontFamily="'DM Sans', sans-serif"
          letterSpacing="1.5" opacity={nodeOpacity(key) * 0.6}
        >
          {n.label.toUpperCase()}
        </text>
      ))}

      {/* Sector badges at destination clusters */}
      {/* Ethnic food — London/EU cluster */}
      <g opacity={badgeOpacity}>
        <rect x={272} y={118} width={90} height={22} rx={11}
          fill="rgba(200,150,62,0.12)" stroke="rgba(200,150,62,0.3)" strokeWidth="0.8" />
        <text x={317} y={133} textAnchor="middle" fill="#C8963E" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">ETHNIC FOOD</text>
      </g>

      {/* Vehicle parts — North America */}
      <g opacity={badgeOpacity}>
        <rect x={88} y={192} width={90} height={22} rx={11}
          fill="rgba(200,150,62,0.08)" stroke="rgba(200,150,62,0.25)" strokeWidth="0.8" />
        <text x={133} y={207} textAnchor="middle" fill="rgba(200,150,62,0.85)" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">VEHICLE PARTS</text>
      </g>

      {/* Pharma — Oceania */}
      <g opacity={badgeOpacity}>
        <rect x={962} y={432} width={86} height={22} rx={11}
          fill="rgba(200,150,62,0.08)" stroke="rgba(200,150,62,0.25)" strokeWidth="0.8" />
        <text x={1005} y={447} textAnchor="middle" fill="rgba(200,150,62,0.85)" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">PHARMA</text>
      </g>
    </svg>
  );
}

/* ─── Scroll Journey Section ─── */
function ScrollJourney() {
  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      setProgress(Math.max(0, Math.min(1, -rect.top / total)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const p = (a, b) => easeOut(clamp01(progress, a, b));

  // Phase text transitions
  const line1Op = p(0.02, 0.12);
  const line1Exit = 1 - easeOut(clamp01(progress, 0.52, 0.64));
  const phase2Op = easeOut(clamp01(progress, 0.56, 0.70)) * (1 - easeOut(clamp01(progress, 0.84, 0.95)));
  const statsOp = p(0.86, 0.97);

  const sectors = [
    { label: "Ethnic Food & Grocery", sub: "38 product lines · Direct from Kerala" },
    { label: "Vehicle Parts", sub: "OEM-quality · 6 categories" },
    { label: "Pharmaceuticals", sub: "WHO-GMP certified · APIs to OTC" },
  ];

  return (
    <div ref={containerRef} style={{ height: "320vh", position: "relative" }}>
      <div style={{
        position: "sticky", top: 0, height: "100vh",
        background: "#040F09", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Background vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 59% 60%, rgba(200,150,62,0.04) 0%, transparent 60%)" }} />

        {/* Trade route map */}
        <TradeRouteMap progress={progress} />

        {/* Phase 1: Origin text */}
        <div style={{
          position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)",
          zIndex: 10, opacity: line1Op * line1Exit,
          transition: "opacity 0.2s",
          maxWidth: 420,
        }}>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "rgba(200,150,62,0.65)", textTransform: "uppercase", marginBottom: 18 }}>
            Aurelia Logistics
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.15, margin: 0 }}>
            From the Indian<br />Subcontinent,<br />
            <span style={{ color: "#C8963E", fontStyle: "italic" }}>to every market.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, marginTop: 20 }}>
            Scroll to trace the route.
          </p>
        </div>

        {/* Phase 2: Three sectors */}
        <div style={{
          position: "absolute", bottom: "12%", left: "50%", transform: "translateX(-50%)",
          zIndex: 10, opacity: phase2Op, transition: "opacity 0.25s",
          display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "center",
          pointerEvents: "none",
        }}>
          {sectors.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              transform: `translateY(${(1 - phase2Op) * 20}px)`,
              transition: `transform 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 0.08}s`,
            }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(14px, 1.6vw, 17px)", color: "#F5F0E8", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(200,150,62,0.65)", letterSpacing: "0.15em" }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Phase 3: Stats */}
        <div style={{
          position: "absolute", top: "14%", right: "5%",
          zIndex: 10, opacity: statsOp, transition: "opacity 0.2s",
          display: "flex", flexDirection: "column", gap: 28,
          alignItems: "flex-end",
          pointerEvents: "none",
        }}>
          {[
            { v: "3", l: "Trade Sectors" },
            { v: "40+", l: "Countries" },
            { v: "99%", l: "On-Time" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 3.5vw, 44px)", color: "#C8963E", fontWeight: 700, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.4)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Scroll progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(200,150,62,0.08)" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(to right, #C8963E, #A67B2E)", transition: "width 0.1s" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── HERO ─── */
function Hero() {
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 80); return () => clearTimeout(t); }, []);

  const anim = (d) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "none" : "translateY(28px)",
    transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${d}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${d}s`,
  });

  return (
    <section id="home" style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden", background: "#071E12",
    }}>
      {/* Background image */}
      <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1920&q=75') center/cover no-repeat", opacity: 0.28 }} />
      {/* Gradient overlays */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(4,15,9,0.9) 0%, rgba(7,30,18,0.55) 50%, rgba(4,15,9,0.85) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 60%, rgba(200,150,62,0.07) 0%, transparent 55%)" }} />

      {/* Animated particles */}
      {[...Array(8)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: 3 + (i % 3),
          height: 3 + (i % 3),
          borderRadius: "50%",
          background: `rgba(200,150,62,${0.08 + i * 0.03})`,
          left: `${8 + i * 11}%`,
          top: `${18 + (i % 4) * 18}%`,
          animation: `float${i % 3} ${7 + i * 1.2}s ease-in-out infinite`,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "120px 24px 80px", maxWidth: 920, margin: "0 auto" }}>

        <div style={anim(0.15)}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 36, padding: "7px 20px", border: "1px solid rgba(200,150,62,0.28)", borderRadius: 40 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#C8963E" }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(245,240,232,0.65)", letterSpacing: "0.24em", textTransform: "uppercase" }}>
              UK-Registered Global Trade Facilitator
            </span>
          </div>
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(38px, 6.5vw, 76px)",
          fontWeight: 700, color: "#F5F0E8", lineHeight: 1.08,
          margin: "0 0 32px",
          ...anim(0.3),
        }}>
          Where Origin<br />
          <span style={{ color: "#C8963E", fontStyle: "italic" }}>meets opportunity.</span>
        </h1>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(16px, 1.9vw, 19px)",
          color: "rgba(245,240,232,0.6)", lineHeight: 1.75,
          maxWidth: 600, margin: "0 auto 52px",
          ...anim(0.48),
        }}>
          Aurelia Logistics connects the finest goods from South Asia with global markets — across ethnic foods, vehicle components, and pharmaceutical supplies.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", ...anim(0.62) }}>
          <button onClick={() => navigate("/specialisations")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            padding: "16px 38px", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.14em", textTransform: "uppercase",
            background: "linear-gradient(135deg, #C8963E, #A67B2E)",
            color: "#071E12", border: "none",
            boxShadow: "0 4px 24px rgba(200,150,62,0.22)",
            transition: "all 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,150,62,0.32)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,150,62,0.22)"; }}
          >
            Our Specialisations
          </button>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
            padding: "16px 38px", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.14em", textTransform: "uppercase",
            background: "transparent", color: "#F5F0E8",
            border: "1px solid rgba(245,240,232,0.22)",
            transition: "all 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C8963E"; e.currentTarget.style.color = "#C8963E"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(245,240,232,0.22)"; e.currentTarget.style.color = "#F5F0E8"; }}
          >
            Request a Quote
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "#F5F0E8", letterSpacing: "0.3em", textTransform: "uppercase" }}>Scroll</span>
        <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, #C8963E, transparent)" }} />
      </div>
    </section>
  );
}

/* ─── ABOUT ─── */
function About() {
  const navigate = useNavigate();
  return (
    <section id="about" style={{ background: "#F5F0E8", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(#071E12 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
          <div>
            <FadeIn><SectionTag label="Who We Are" light /></FadeIn>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 700, color: "#0A2E1C", lineHeight: 1.15, margin: "0 0 28px" }}>
                A different kind<br />of <span style={{ color: "#C8963E", fontStyle: "italic" }}>logistics partner.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(7,30,18,0.65)", lineHeight: 1.85, margin: "0 0 20px" }}>
                We don't just move freight. We understand the goods we carry — the cultural significance of a Kerala pantry staple, the precision tolerance of an OEM engine component, the cold-chain requirements of a pharmaceutical shipment.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(7,30,18,0.65)", lineHeight: 1.85, margin: 0 }}>
                That domain knowledge, built over years of sourcing directly from manufacturers and growers across South Asia, is what separates Aurelia from a freight broker.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <button onClick={() => navigate("/specialisations")} style={{
                marginTop: 36, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                padding: "13px 32px", background: "#0A2E1C", color: "#F5F0E8",
                border: "none", borderRadius: 3, cursor: "pointer",
                letterSpacing: "0.16em", textTransform: "uppercase", transition: "all 0.3s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C8963E"; e.currentTarget.style.color = "#071E12"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#0A2E1C"; e.currentTarget.style.color = "#F5F0E8"; }}
              >
                Explore Specialisations
              </button>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="left">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { v: "3", l: "Trade Sectors" },
                { v: "40+", l: "Countries Served" },
                { v: "200+", l: "B2B Partners" },
                { v: "99%", l: "On-Time Delivery" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: i % 2 === 0 ? "#0A2E1C" : "white",
                  borderRadius: 8, padding: "32px 24px",
                  boxShadow: i % 2 !== 0 ? "0 2px 20px rgba(7,30,18,0.06)" : "none",
                  border: i % 2 !== 0 ? "1px solid rgba(7,30,18,0.07)" : "none",
                  transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: i % 2 === 0 ? "#C8963E" : "#0A2E1C", marginBottom: 6 }}>{s.v}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: i % 2 === 0 ? "rgba(245,240,232,0.55)" : "rgba(7,30,18,0.45)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── SPECIALISATIONS PREVIEW ─── */
function SpecialisationsPreview() {
  const navigate = useNavigate();
  const cards = [
    {
      slug: "ethnic-food",
      label: "Ethnic Food & Grocery",
      sub: "Kerala dry goods · Spices · Snacks · Condiments",
      desc: "38 authenticated product lines sourced directly from growers and manufacturers across Kerala, Tamil Nadu, and Rajasthan.",
      tag: "38 Products",
      bg: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=70",
    },
    {
      slug: "vehicle-parts",
      label: "Vehicle Parts",
      sub: "Tyres · Braking · Engine · Electrical",
      desc: "OEM-quality automotive components from India's leading manufacturers — for commercial, passenger, and two-wheeler fleets.",
      tag: "6 Categories",
      bg: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=800&q=70",
    },
    {
      slug: "pharmaceuticals",
      label: "Pharmaceuticals",
      sub: "Generics · Ayurvedic · APIs · Consumables",
      desc: "WHO-GMP and USFDA-certified pharmaceutical products — from finished formulations to active pharmaceutical ingredients.",
      tag: "6 Categories",
      bg: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=70",
    },
  ];

  return (
    <section style={{ background: "#071E12", padding: "110px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,150,62,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <FadeIn><SectionTag label="Areas of Specialisation" /></FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.15, margin: "0 0 56px" }}>
            Three sectors.<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>One trusted partner.</span>
          </h2>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {cards.map((c, i) => (
            <FadeIn key={c.slug} delay={0.08 + i * 0.1}>
              <div
                onClick={() => navigate(`/specialisations/${c.slug}`)}
                style={{
                  borderRadius: 10, overflow: "hidden", cursor: "pointer",
                  background: "rgba(245,240,232,0.03)",
                  border: "1px solid rgba(245,240,232,0.06)",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(200,150,62,0.28)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(245,240,232,0.06)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
                  <img src={c.bg} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,30,18,0.85) 0%, rgba(7,30,18,0.2) 60%)" }} />
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.9)",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    background: "rgba(200,150,62,0.12)", backdropFilter: "blur(8px)",
                    padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(200,150,62,0.2)",
                  }}>
                    {c.tag}
                  </span>
                </div>
                <div style={{ padding: "24px 28px 28px" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.65)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{c.sub}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5F0E8", margin: "0 0 12px" }}>{c.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.42)", lineHeight: 1.7, margin: "0 0 20px" }}>{c.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8963E", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    <span>View Products</span>
                    <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── QUOTE CTA BANNER ─── */
function QuoteCTA() {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#0A2212", borderTop: "1px solid rgba(200,150,62,0.1)", borderBottom: "1px solid rgba(200,150,62,0.1)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "rgba(200,150,62,0.6)", textTransform: "uppercase", marginBottom: 20 }}>Ready to Import?</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 20px" }}>
            Tell us what you need.<br />
            <span style={{ color: "#C8963E", fontStyle: "italic" }}>We'll handle the rest.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.45)", margin: "0 0 40px", lineHeight: 1.7 }}>
            From a single container to a recurring supply contract — request a quote and our trade team will respond within 24 hours.
          </p>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            padding: "17px 44px", background: "linear-gradient(135deg, #C8963E, #A67B2E)",
            color: "#071E12", border: "none", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.15em", textTransform: "uppercase",
            boxShadow: "0 4px 24px rgba(200,150,62,0.22)", transition: "all 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,150,62,0.32)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,150,62,0.22)"; }}
          >
            Request a Quote
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── CONTACT ─── */
function HomeContact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const fieldRefs = useRef({});

  const { loading, submitted, error, fieldErrors, handleSubmit, revalidate } = useFormSubmit({
    validate: validateContactForm,
    submit: submitContact,
    onValidationError: (field) => {
      const el = fieldRefs.current[field];
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(form);
  };

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "white",
    background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 3, padding: "13px 16px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s",
  };

  // Same pattern as the quote form: an invalid field keeps a red border while
  // unfocused so the message and the input it refers to read as one unit.
  const styleFor = (field) => ({
    ...inputStyle,
    borderColor: fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)",
  });
  const contactField = (field) => ({
    id: `contact-${field}`,
    ref: (el) => { fieldRefs.current[field] = el; },
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    maxLength: CONTACT_MAX[field],
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `contact-${field}-error` : undefined,
    style: styleFor(field),
    onFocus: (e) => { e.target.style.borderColor = "#C8963E"; },
    onBlur: (e) => {
      e.target.style.borderColor = fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)";
      revalidate(form);
    },
  });
  const contactError = (field) =>
    fieldErrors[field] ? (
      <p id={`contact-${field}-error`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#e07060", margin: "6px 0 0" }}>
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <section id="contact" style={{ background: "#071E12", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }} className="contact-grid">
          <div>
            <FadeIn><SectionTag label="Contact Us" /></FadeIn>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 28px" }}>
                Get in <span style={{ color: "#C8963E", fontStyle: "italic" }}>touch.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  { icon: "✉", label: "Email", value: "enquiries@aurelialogistics.co.uk", sub: "For trade enquiries and partnerships" },
                  { icon: "◉", label: "Headquarters", value: "Kochi, Kerala, India", sub: "Offices in Mumbai, Dubai & London" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,150,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#C8963E", fontSize: 18 }}>{item.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#F5F0E8", fontWeight: 500, marginBottom: 3 }}>{item.value}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.35)" }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="left">
            {submitted ? (
              <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(200,150,62,0.2)", borderRadius: 10, padding: "56px 40px", textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #C8963E, #A67B2E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <span style={{ color: "#071E12", fontSize: 26, fontWeight: 700 }}>✓</span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5F0E8", margin: "0 0 10px" }}>Message Sent</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.45)", margin: 0 }}>We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label htmlFor="contact-name" style={contactLabelStyle}>Name *</label>
                    <input {...contactField("name")} required autoComplete="name" placeholder="Your name" />
                    {contactError("name")}
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={contactLabelStyle}>Email *</label>
                    <input {...contactField("email")} type="email" required autoComplete="email" placeholder="you@company.com" />
                    {contactError("email")}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-company" style={contactLabelStyle}>Company</label>
                  <input {...contactField("company")} autoComplete="organization" placeholder="Company name" />
                  {contactError("company")}
                </div>
                <div>
                  <label htmlFor="contact-message" style={contactLabelStyle}>Message *</label>
                  <textarea {...contactField("message")} rows={4} required placeholder="How can we help?"
                    style={{ ...styleFor("message"), resize: "vertical" }} />
                  {contactError("message")}
                </div>
                {/* Announced on appearance — see the note in QuotePage. */}
                <div role="alert" aria-live="assertive">
                  {error ? (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e07060", margin: 0 }}>{error}</p>
                  ) : Object.keys(fieldErrors).length > 0 ? (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e07060", margin: 0 }}>
                      Please correct the {Object.keys(fieldErrors).length === 1 ? "highlighted field" : "highlighted fields"} above.
                    </p>
                  ) : null}
                </div>
                <button type="submit" disabled={loading} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                  padding: "15px 36px", background: loading ? "rgba(200,150,62,0.4)" : "linear-gradient(135deg, #C8963E, #A67B2E)",
                  color: "#071E12", border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer",
                  letterSpacing: "0.15em", textTransform: "uppercase", alignSelf: "flex-start", transition: "all 0.3s",
                }}>
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── HOME PAGE ─── */
export default function Home() {
  return (
    <>
      <Hero />
      <ScrollJourney />
      <About />
      <SpecialisationsPreview />
      <QuoteCTA />
      <HomeContact />
    </>
  );
}
