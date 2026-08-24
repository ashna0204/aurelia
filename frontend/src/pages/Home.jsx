import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { submitContact } from "../api/client";
import { validateContactForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollSequence } from "../hooks/useScrollSequence";
import { LIMITS } from "../constants/quoteForm";
import { NODES, ROUTES, GRID_LINES, NODE_TIMING, pointAtFraction, progressAtX, toViewBoxX } from "../utils/tradeRoutes";

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

// Dash pattern for the flowing underlay on a completed lane. The paths declare
// pathLength="1", so dash values are in normalised units — the whole lane is 1
// unit long, which is why an unnormalised pattern renders as a solid line.
// (the matching `routeFlow` keyframe in index.css shifts by one full period)
const FLOW_DASH = "0.014 0.022";

// How long after a lane lands its flow and cargo fade in.
const LANE_SETTLE = 0.08;
// Scroll distance an arrival ring takes to expand and fade.
const PING_SPAN = 0.07;

// The lane the origin copy has to get out of the way of: it lands on New York,
// which sits on the same side of the map as the copy.
const NEW_YORK_LANE = ROUTES.find((r) => r.to === "newYork");
// Used until the overlay has been measured, and if it turns out never to reach
// the lane at all — the copy still has to clear before the stats phase.
const ORIGIN_FADE_FALLBACK = [0.52, 0.64];

function TradeRouteMap({ progress, animate }) {
  const p = (a, b) => easeOut(clamp01(progress, a, b));

  // Drawn fraction of each lane, plus how settled the completed lane is.
  const lanes = ROUTES.map((route) => ({
    route,
    drawn: p(...route.range),
    settled: p(route.range[1], route.range[1] + LANE_SETTLE),
  }));

  // Node state is read twice — once for the marker, once for the label — so
  // it is derived once here rather than recomputed per pass.
  const nodeState = Object.fromEntries(
    Object.entries(NODE_TIMING).map(([key, { arrive, reveal }]) => {
      // A destination is faintly present before its lane lands, so the line is
      // drawn *towards* something, then lands with a pop and a ring.
      const pending = p(reveal[0] - 0.09, reveal[0]);
      const landed = p(arrive - 0.02, arrive + 0.03);
      const ping = clamp01(progress, arrive, arrive + PING_SPAN);
      return [key, {
        opacity: 0.2 * pending + 0.8 * landed,
        scale: 1 + 0.32 * Math.sin(Math.PI * landed),
        landed,
        ping,
      }];
    })
  );

  const badgeOpacity = easeOut(clamp01(progress, 0.65, 0.82));

  return (
    <svg viewBox="0 0 1200 500" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} preserveAspectRatio="xMidYMid slice">
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
        {/* Unstroked copies for <animateMotion> to follow, kept separate from
            the visible paths so the pathLength normalisation there cannot
            affect how far along the cargo has travelled. */}
        {ROUTES.map((route) => (
          <path key={route.id} id={route.id} d={route.d} fill="none" />
        ))}
      </defs>

      {/* Grid */}
      {GRID_LINES.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke="rgba(200,150,62,0.04)" strokeWidth="1" />
      ))}

      {/* Origin pulse ring */}
      <circle cx={NODES.kochi.x} cy={NODES.kochi.y} r={60}
        fill="url(#origin-glow)" opacity={nodeState.kochi.opacity} />

      {/* Animated trade routes */}
      {lanes.map(({ route, drawn }) => (
        <path key={route.id} d={route.d} fill="none"
          stroke="#C8963E" strokeWidth={route.width}
          strokeOpacity={0.65}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - drawn}
        />
      ))}

      {/* Flowing underlay: a landed lane keeps moving, so the network reads as
          operating rather than finished once the scroll is parked. */}
      {lanes.map(({ route, settled }, i) => (
        <path key={"flow-" + route.id} d={route.d} fill="none"
          stroke="#C8963E" strokeWidth={0.5}
          strokeOpacity={0.3 * settled}
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray={FLOW_DASH}
          style={animate ? { animation: `routeFlow ${3 + (i % 3) * 0.7}s linear infinite` } : undefined}
        />
      ))}

      {/* Cargo riding each landed lane */}
      {animate && lanes.map(({ route, settled }, i) => (
        <g key={"cargo-" + route.id} opacity={settled}>
          <circle r={5} fill="#C8963E" opacity={0.16}>
            <animateMotion dur={`${6 + i * 0.8}s`} begin={`-${i * 1.3}s`} repeatCount="indefinite">
              <mpath href={`#${route.id}`} xlinkHref={`#${route.id}`} />
            </animateMotion>
          </circle>
          <circle r={1.8} fill="#F5F0E8" opacity={0.85}>
            <animateMotion dur={`${6 + i * 0.8}s`} begin={`-${i * 1.3}s`} repeatCount="indefinite">
              <mpath href={`#${route.id}`} xlinkHref={`#${route.id}`} />
            </animateMotion>
          </circle>
        </g>
      ))}

      {/* Bright head on the lane currently being drawn */}
      {lanes.map(({ route, drawn }) => {
        if (drawn <= 0 || drawn >= 1) return null;
        const { x, y } = pointAtFraction(route, drawn);
        const opacity = Math.min(1, drawn * 14, (1 - drawn) * 10);
        return (
          <g key={"head-" + route.id} opacity={opacity}>
            <circle cx={x} cy={y} r={7} fill="#C8963E" opacity={0.18} />
            <circle cx={x} cy={y} r={2.4} fill="#F5F0E8" />
          </g>
        );
      })}

      {/* Nodes */}
      {Object.entries(NODES).map(([key, n]) => {
        const { opacity, scale, ping } = nodeState[key];
        return (
          <g key={key} opacity={opacity}>
            {/* Arrival ring, expanding outward as the lane lands */}
            {ping > 0 && ping < 1 && (
              <circle cx={n.x} cy={n.y} r={8 + 30 * ping} fill="none"
                stroke="#C8963E" strokeWidth={1.2} strokeOpacity={0.5 * (1 - ping)} />
            )}
            <g transform={`translate(${n.x} ${n.y}) scale(${scale})`}>
              {n.primary && <circle r={22} fill="#C8963E" opacity={0.08} />}
              <circle r={n.primary ? 7 : n.hub ? 5 : 3.5}
                fill={n.primary || n.hub ? "#C8963E" : "#F5F0E8"}
                filter={n.primary ? "url(#glow-gold)" : "url(#glow-sm)"}
                opacity={n.primary ? 1 : 0.9}
              />
              {n.primary && <circle r={12} fill="none" stroke="#C8963E" strokeWidth="0.8" strokeOpacity="0.4" />}
            </g>
          </g>
        );
      })}

      {/* City labels — settle in behind their node */}
      {Object.entries(NODES).map(([key, n]) => {
        const { landed } = nodeState[key];
        const side = n.x > 700 ? 1 : -1;
        return (
          <text key={"lbl-" + key}
            x={n.x + side * (12 + (1 - landed) * 7)} y={n.y + 4}
            textAnchor={side > 0 ? "start" : "end"}
            fill="#F5F0E8" fontSize="10" fontFamily="'DM Sans', sans-serif"
            letterSpacing="1.5" opacity={landed * 0.6}
          >
            {n.label.toUpperCase()}
          </text>
        );
      })}

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
  const stageRef = useRef(null);
  const originRef = useRef(null);
  const reduced = useReducedMotion();
  // Follows the scroll rather than tracking it, and will not let the sequence
  // be skipped past on a fast flick. See useScrollSequence.
  const scrolled = useScrollSequence(containerRef, !reduced);

  const [originEdgeX, setOriginEdgeX] = useState(null);

  useEffect(() => {
    const stage = stageRef.current;
    const origin = originRef.current;
    if (!stage || !origin || typeof ResizeObserver === "undefined") return;

    const measure = () => {
      const box = stage.getBoundingClientRect();
      if (!box.width || !box.height) return;
      const copy = origin.getBoundingClientRect();
      setOriginEdgeX(toViewBoxX(copy.right - box.left, box));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(origin);
    return () => observer.disconnect();
  }, []);

  // Reduced motion gets the finished map and all three phases at once, rather
  // than 320vh of scroll that has to be travelled to read the content.
  const progress = reduced ? 1 : scrolled;
  const p = (a, b) => (reduced ? 1 : easeOut(clamp01(progress, a, b)));

  const originFade = useMemo(() => {
    if (originEdgeX == null) return ORIGIN_FADE_FALLBACK;
    const [start, arrival] = NEW_YORK_LANE.range;
    const contact = progressAtX(NEW_YORK_LANE, originEdgeX);
    if (contact != null) return contact < arrival ? [contact, arrival] : ORIGIN_FADE_FALLBACK;
    return originEdgeX > NODES.kochi.x ? [start, arrival] : ORIGIN_FADE_FALLBACK;
  }, [originEdgeX]);

  // Phase text transitions. These track scroll position directly, so they carry
  // no CSS transition — a transition would lag behind and fight the scrubbing.
  const line1Op = p(0.02, 0.12) * (reduced ? 1 : 1 - easeOut(clamp01(progress, ...originFade)));
  const statsOp = p(0.86, 0.97);

  return (
    <div ref={containerRef} style={{ height: reduced ? "100vh" : "320vh", position: "relative" }}>
      <div ref={stageRef} style={{
        position: "sticky", top: 0, height: "100vh",
        background: "#040F09", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {/* Background vignette */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 59% 60%, rgba(200,150,62,0.04) 0%, transparent 60%)" }} />

        {/* Trade route map */}
        <TradeRouteMap progress={progress} animate={!reduced} />

        {/* Phase 1: Origin text */}
        <div ref={originRef} style={{
          position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)",
          zIndex: 10, opacity: line1Op,
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
            {reduced ? "Kochi to forty markets." : "Scroll to trace the route."}
          </p>
        </div>

        {/* Phase 3: Stats */}
        <div style={{
          position: "absolute", top: "14%", right: "5%",
          zIndex: 10, opacity: statsOp,
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

        {/* Scroll progress bar — nothing to track when the section is not pinned */}
        {!reduced && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "rgba(200,150,62,0.08)" }}>
            <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(to right, #C8963E, #A67B2E)" }} />
          </div>
        )}
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
