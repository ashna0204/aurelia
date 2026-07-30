import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import WorldMap from "../WorldMap";
import ShippingContainer from "../ShippingContainer";
import { gsap } from "../../lib/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useDesktopMotion } from "../../hooks/useMediaQuery";
import { HERO_SLOT_ID } from "../../constants/sections";
import { WINDOWS } from "../../lib/worldMap";

/* ─── HERO ─── */
export default function Hero() {
  const rootRef = useRef(null);
  const mapRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  // When the journey runs, the container lives in the fixed layer instead —
  // the slot below still reserves its exact space, so nothing shifts.
  const journeyActive = useDesktopMotion();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    // The map drifts slower than the page, which is what gives the hero
    // depth without a parallax library.
    const tween = gsap.to(mapRef.current, {
      y: 20,
      ease: "none",
      scrollTrigger: { trigger: root, start: "top top", end: "bottom top", scrub: true },
    });

    return () => tween.scrollTrigger?.kill();
  }, [reduced]);

  const anim = (d) => ({
    opacity: loaded ? 1 : 0,
    transform: loaded ? "none" : "translateY(28px)",
    transition: `opacity 1.1s cubic-bezier(0.22,1,0.36,1) ${d}s, transform 1.1s cubic-bezier(0.22,1,0.36,1) ${d}s`,
  });

  return (
    <section
      id="home"
      ref={rootRef}
      style={{
        position: "relative", minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        overflow: "hidden", background: "#071E12",
      }}
    >
      {/* ── The stage: the world, legibly ──
          Not a watermark. The land sits back at low opacity, the three
          operating regions come forward in gold on larger dots, and the four
          hubs pulse. The trade geography is meant to read before a word of
          the headline does. */}
      <div ref={mapRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", pointerEvents: "none" }}>
        <WorldMap
          window={WINDOWS.world}
          highlightRegions={["southAsia", "gulf", "uk"]}
          markers={["kochi", "dubai", "london"]}
          pulse
          dotOpacity={0.35}
          dotRadius={1.2}
          highlightOpacity={0.85}
        />
      </div>
      {/* Gradient overlays, so the headline stays legible over the dot field. */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(4,15,9,0.9) 0%, rgba(7,30,18,0.55) 50%, rgba(4,15,9,0.85) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 25% 60%, rgba(200,150,62,0.07) 0%, transparent 55%)" }} />

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

        {/* ── Centrepiece ──
            The slot keeps its aspect ratio whether or not the container is
            drawn into it, so switching between the static copy and the
            travelling one cannot shift the page. */}
        <div
          id={HERO_SLOT_ID}
          style={{
            margin: "0 auto 40px",
            aspectRatio: "640 / 330",
            width: "100%",
            maxWidth: "min(460px, 62vw)",
            ...anim(0.55),
          }}
        >
          {journeyActive ? null : <ShippingContainer style={{ height: "100%", width: "100%" }} />}
        </div>

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
