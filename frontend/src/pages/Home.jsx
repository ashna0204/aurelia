import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollSequence } from "../hooks/useScrollSequence";
import { EXPERTISE, expertisePath } from "../constants/expertise";
import { NODES, ROUTES, GRID_LINES, NODE_TIMING, pointAtFraction, progressAtX, toViewBoxX } from "../utils/tradeRoutes";
import { LAND_DOTS, DOT_SPACING } from "../utils/worldMapBackdrop";

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

// Dot sizes for the world map behind the lanes, as fractions of the spacing
// between dots: the world sits back while the operating regions come forward on
// larger dots, so the map reads as "we work *here*" before a word is read.
const DOT_RADIUS = 0.18;
const REGION_DOT_RADIUS = 0.26;

// The lane the origin copy has to get out of the way of: it lands on New York,
// which sits on the same side of the map as the copy.
const NEW_YORK_LANE = ROUTES.find((r) => r.to === "newYork");
// Used until the overlay has been measured, and if it turns out never to reach
// the lane at all — the copy still has to clear before the lane arrives.
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

      {/* Dotted world map, fitted to the nodes rather than the other way
          round — see utils/worldMapBackdrop. Two paths, not 5,700 circles. */}
      <path d={LAND_DOTS.base} fill="none" stroke="rgba(245,240,232,0.5)"
        strokeWidth={DOT_SPACING * DOT_RADIUS * 2} strokeLinecap="round" opacity="0.3" />
      <path d={LAND_DOTS.highlighted} fill="none" stroke="#C8963E"
        strokeWidth={DOT_SPACING * REGION_DOT_RADIUS * 2} strokeLinecap="round" opacity="0.55" />

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

      {/* Sourcing-area badges at destination clusters */}
      {/* Food & grocery — London/EU cluster */}
      <g opacity={badgeOpacity}>
        <rect x={272} y={98} width={110} height={22} rx={11}
          fill="rgba(200,150,62,0.12)" stroke="rgba(200,150,62,0.3)" strokeWidth="0.8" />
        <text x={327} y={113} textAnchor="middle" fill="#C8963E" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">FOOD &amp; GROCERY</text>
      </g>

      {/* Automotive — North America */}
      <g opacity={badgeOpacity}>
        <rect x={115} y={228} width={90} height={22} rx={11}
          fill="rgba(200,150,62,0.08)" stroke="rgba(200,150,62,0.25)" strokeWidth="0.8" />
        <text x={160} y={243} textAnchor="middle" fill="rgba(200,150,62,0.85)" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">AUTOMOTIVE</text>
      </g>

      {/* Healthcare — Oceania */}
      <g opacity={badgeOpacity}>
        <rect x={958} y={446} width={94} height={22} rx={11}
          fill="rgba(200,150,62,0.08)" stroke="rgba(200,150,62,0.25)" strokeWidth="0.8" />
        <text x={1005} y={461} textAnchor="middle" fill="rgba(200,150,62,0.85)" fontSize="9"
          fontFamily="'DM Sans', sans-serif" letterSpacing="1.2">HEALTHCARE</text>
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
            <span style={{ color: "#C8963E", fontStyle: "italic" }}>to international buyers.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, marginTop: 20 }}>
            {reduced ? "Kochi to the markets our buyers serve." : "Scroll to trace the route."}
          </p>
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
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(4,15,9,0.78) 0%, rgba(7,30,18,0.42) 50%, rgba(4,15,9,0.72) 100%)" }} />
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
          <SectionTag label="UK-based sourcing and trade partner" />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(38px, 6.5vw, 76px)",
          fontWeight: 700, color: "#F5F0E8", lineHeight: 1.08,
          margin: "0 0 20px",
          ...anim(0.3),
        }}>
          Where Origin<br />
          <span style={{ color: "#C8963E", fontStyle: "italic" }}>meets opportunity.</span>
        </h1>

        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(20px, 2.6vw, 28px)",
          fontWeight: 500, color: "rgba(245,240,232,0.88)", lineHeight: 1.4,
          margin: "0 0 26px",
          ...anim(0.4),
        }}>
          Manufacturers and suppliers. Global buyers.
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(16px, 1.9vw, 19px)",
          color: "rgba(245,240,232,0.72)", lineHeight: 1.75,
          maxWidth: 640, margin: "0 auto 22px",
          ...anim(0.56),
        }}>
          Aurelia helps international businesses source products from trusted manufacturers and suppliers across global markets.
        </p>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "clamp(14px, 1.5vw, 16px)",
          color: "rgba(245,240,232,0.55)", lineHeight: 1.8,
          maxWidth: 700, margin: "0 auto 52px",
          ...anim(0.68),
        }}>
          We work across food and grocery, automotive components, healthcare products, and perfume ingredients and essential oils. We help buyers identify suitable suppliers, understand product requirements, coordinate the commercial process, and move suitable orders towards export.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", ...anim(0.8) }}>
          <button onClick={() => navigate("/quote")} style={{
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
            Request a Quote
          </button>
          <button onClick={() => navigate("/expertise")} style={{
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
            Explore Our Expertise
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

/* ─── BEYOND SOURCING ─── */
// Sits between the pinned trade-route animation and the cream About section,
// so it stays on the dark ground and reads as a beat of the same breath.
function BeyondSourcing() {
  return (
    <section style={{ background: "#071E12", padding: "120px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(200,150,62,0.06) 0%, transparent 60%)" }} />
      <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 50px)",
            fontWeight: 700, color: "#F5F0E8", lineHeight: 1.15, margin: 0,
          }}>
            Finding the right supplier is<br />
            <span style={{ color: "#C8963E", fontStyle: "italic" }}>only the first step.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.12}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(16px, 1.8vw, 18px)",
            color: "rgba(245,240,232,0.62)", lineHeight: 1.85,
            maxWidth: 720, margin: "30px auto 0",
          }}>
            Buying from a new market can involve more work than finding a product online. Aurelia helps buyers navigate the sourcing process in South Asia. We identify suitable suppliers, discuss specifications and pricing, coordinate samples and documentation, and help move enquiries towards a commercial decision.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── BRIDGE ─── */
// Two columns rather than another centred statement, so it does not read as a
// repeat of BeyondSourcing above it, and a step lighter on the way to About's
// cream. Shares .about-grid's mobile collapse.
function Bridge() {
  return (
    <section style={{ background: "#0A2E1C", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(#F5F0E8 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="about-grid">
          <FadeIn>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(28px, 3.6vw, 44px)",
              fontWeight: 700, color: "#F5F0E8", lineHeight: 1.2, margin: 0,
            }}>
              A bridge between buyers and{" "}
              <span style={{ color: "#C8963E", fontStyle: "italic" }}>manufacturers and suppliers worldwide.</span>
            </h2>
          </FadeIn>
          <FadeIn delay={0.12} direction="left">
            <p style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "clamp(16px, 1.8vw, 18px)",
              color: "rgba(245,240,232,0.62)", lineHeight: 1.85, margin: 0,
            }}>
              Aurelia works between international buyers and manufacturers and suppliers worldwide. We help translate a buyer's requirement into a practical sourcing brief, then work with the supply side to find options that fit.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}


/* ─── AREAS OF EXPERTISE ─── */
function ExpertisePreview() {
  const navigate = useNavigate();

  return (
    <section id="expertise" style={{ background: "#F5F0E8", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(#071E12 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <FadeIn><SectionTag label="What We Source" light /></FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 700, color: "#0A2E1C", lineHeight: 1.15, margin: "0 0 56px" }}>
            Our areas of <span style={{ color: "#C8963E", fontStyle: "italic" }}>expertise.</span>
          </h2>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {EXPERTISE.map((area, i) => (
            <FadeIn key={area.slug} delay={0.08 + i * 0.08}>
              <div
                onClick={() => navigate(expertisePath(area.slug))}
                style={{
                  borderRadius: 10, overflow: "hidden", cursor: "pointer", height: "100%",
                  background: "white", border: "1px solid rgba(7,30,18,0.07)",
                  boxShadow: "0 2px 20px rgba(7,30,18,0.05)",
                  display: "flex", flexDirection: "column",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 16px 44px rgba(7,30,18,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 2px 20px rgba(7,30,18,0.05)";
                }}
              >
                <div style={{ height: 170, position: "relative", overflow: "hidden" }}>
                  <img src={area.image} alt={area.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${area.background}cc 0%, transparent 65%)` }} />
                </div>
                <div style={{ padding: "24px 26px 28px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 600, color: "#0A2E1C", margin: "0 0 12px", lineHeight: 1.3 }}>{area.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, color: "rgba(7,30,18,0.55)", lineHeight: 1.75, margin: "0 0 20px", flexGrow: 1 }}>{area.home}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8963E", fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    <span>Learn more</span>
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

/* ─── CLOSING ─── */
function ClosingCTA() {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#0A2212", borderTop: "1px solid rgba(200,150,62,0.1)", padding: "100px 24px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 22px", lineHeight: 1.2 }}>
            Have a product <span style={{ color: "#C8963E", fontStyle: "italic" }}>in mind?</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.55)", margin: "0 0 40px", lineHeight: 1.85 }}>
            Tell us what you are looking for, where you need it, approximate quantity, and any specifications you already have. We will assess the requirement and come back with the next steps.
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

/* ─── HOME PAGE ─── */
export default function Home() {
  return (
    <>
      <Hero />
      <ScrollJourney />
      <BeyondSourcing />
      <Bridge />
      <ExpertisePreview />
      <ClosingCTA />
    </>
  );
}
