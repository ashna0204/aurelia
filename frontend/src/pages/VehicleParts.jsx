import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { VEHICLE_PARTS_CATEGORIES } from "../data";

export default function VehicleParts() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <section style={{ background: "#0B1A28", padding: "80px 24px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=1600&q=70') center/cover no-repeat", opacity: 0.12 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(11,26,40,0.75), rgba(11,26,40,0.97))" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(139,164,200,0.06) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <button onClick={() => navigate("/specialisations")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(139,164,200,0.65)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24, padding: 0 }}>
            ← Specialisations
          </button>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "7px 18px", border: "1px solid rgba(139,164,200,0.2)", borderRadius: 40 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8BA4C8" }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(139,164,200,0.55)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Specialisation 02</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 62px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 20px" }}>
              Vehicle Parts<br /><span style={{ color: "#8BA4C8", fontStyle: "italic" }}>& Accessories</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(245,240,232,0.45)", maxWidth: 580, lineHeight: 1.75 }}>
              OEM-quality automotive components from India's world-class manufacturing base — connecting buyers in Africa, the Middle East, and South-East Asia with certified Indian suppliers.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Why India */}
      <section style={{ background: "#F5F0E8", padding: "90px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="about-grid">
            <div>
              <FadeIn>
                <SectionTag label="Why India" light />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#0A2E1C", margin: "0 0 24px", lineHeight: 1.2 }}>
                  The world's <span style={{ color: "#C8963E", fontStyle: "italic" }}>third-largest</span><br />auto manufacturer.
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(7,30,18,0.62)", lineHeight: 1.85, margin: "0 0 18px" }}>
                  India produces over 25 million vehicles annually and is home to world-class Tier 1 and Tier 2 suppliers to brands including Tata, Mahindra, Maruti, Hero, and international OEMs.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(7,30,18,0.62)", lineHeight: 1.85 }}>
                  Aurelia's sourcing team works directly with certified manufacturers and trading houses to bring competitive pricing, quality assurance, and reliable logistics to import markets.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.15} direction="left">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { v: "25M+", l: "Vehicles/Year" },
                  { v: "3rd", l: "Largest Globally" },
                  { v: "ISO/TS", l: "16949 Certified" },
                  { v: "Direct", l: "Manufacturer Access" },
                ].map((s, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? "#0B1A28" : "white", borderRadius: 8, padding: "28px 22px", border: i % 2 !== 0 ? "1px solid rgba(7,30,18,0.07)" : "none", boxShadow: i % 2 !== 0 ? "0 2px 16px rgba(7,30,18,0.05)" : "none" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: i % 2 === 0 ? "#8BA4C8" : "#0A2E1C", fontWeight: 700, marginBottom: 6 }}>{s.v}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: i % 2 === 0 ? "rgba(245,240,232,0.45)" : "rgba(7,30,18,0.4)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section style={{ background: "#071E12", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn><SectionTag label="Product Categories" /></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 56px" }}>
              Six categories.<br /><span style={{ color: "#8BA4C8", fontStyle: "italic" }}>Full coverage.</span>
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {VEHICLE_PARTS_CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.key} delay={0.06 + i * 0.07}>
                <div
                  onClick={() => setOpen(open === cat.key ? null : cat.key)}
                  style={{
                    background: open === cat.key ? "rgba(139,164,200,0.07)" : "rgba(245,240,232,0.03)",
                    border: `1px solid ${open === cat.key ? "rgba(139,164,200,0.25)" : "rgba(245,240,232,0.07)"}`,
                    borderRadius: 9, padding: "28px 28px", cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    transform: open === cat.key ? "translateY(-3px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: "rgba(139,164,200,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                        Category {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#F5F0E8", margin: 0, fontWeight: 600 }}>{cat.label}</h3>
                    </div>
                    <span style={{ color: "#8BA4C8", fontSize: 16, transition: "transform 0.35s", transform: open === cat.key ? "rotate(180deg)" : "none", display: "inline-block", marginTop: 4 }}>▾</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.38)", lineHeight: 1.7, margin: 0 }}>{cat.description}</p>

                  <div style={{ maxHeight: open === cat.key ? 220 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(0.22,1,0.36,1)", opacity: open === cat.key ? 1 : 0 }}>
                    <div style={{ borderTop: "1px solid rgba(245,240,232,0.07)", marginTop: 18, paddingTop: 18, display: "flex", flexWrap: "wrap", gap: "10px 14px" }}>
                      {cat.items.map((item, j) => (
                        <span key={j} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.55)", padding: "5px 12px", background: "rgba(245,240,232,0.05)", borderRadius: 20, border: "1px solid rgba(245,240,232,0.08)" }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#0B1828", padding: "72px 24px", textAlign: "center", borderTop: "1px solid rgba(139,164,200,0.1)" }}>
        <FadeIn>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 38px)", color: "#F5F0E8", margin: "0 0 18px" }}>
            Sourcing automotive components?<br /><span style={{ color: "#8BA4C8", fontStyle: "italic" }}>We can help.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.38)", margin: "0 0 36px" }}>
            Tell us what you need — part numbers, specifications, volumes — and we'll source it.
          </p>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            padding: "16px 40px", background: "#8BA4C8", color: "#0B1A28",
            border: "none", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.3s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Request a Quote
          </button>
        </FadeIn>
      </section>
    </div>
  );
}
