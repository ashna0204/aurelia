import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { PHARMA_CATEGORIES } from "../data";

export default function Pharmaceuticals() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const ACCENT = "#7FC4A0";
  const BG = "#071810";

  const certifications = [
    { label: "WHO-GMP", desc: "World Health Organisation Good Manufacturing Practice" },
    { label: "USFDA", desc: "US Food & Drug Administration approved facilities" },
    { label: "EU-GMP", desc: "European Union manufacturing standards" },
    { label: "CDSCO", desc: "Central Drugs Standard Control Organisation (India)" },
    { label: "ISO 9001", desc: "Quality management systems certification" },
    { label: "Ayush GMP", desc: "Ministry of Ayush compliance for herbal products" },
  ];

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <section style={{ background: BG, padding: "80px 24px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1600&q=70') center/cover no-repeat", opacity: 0.1 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,24,16,0.8), rgba(7,24,16,0.97))" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(127,196,160,0.05) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <button onClick={() => navigate("/specialisations")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(127,196,160,0.65)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24, padding: 0 }}>
            ← Specialisations
          </button>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "7px 18px", border: "1px solid rgba(127,196,160,0.2)", borderRadius: 40 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: ACCENT }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(127,196,160,0.55)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Specialisation 03</span>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 62px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 20px" }}>
              Pharmaceuticals<br /><span style={{ color: ACCENT, fontStyle: "italic" }}>& Healthcare</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(245,240,232,0.45)", maxWidth: 580, lineHeight: 1.75 }}>
              Temperature-controlled, compliance-first pharmaceutical logistics — from WHO-GMP finished formulations and Ayurvedic preparations to APIs and medical consumables.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* India's pharma position */}
      <section style={{ background: "#F5F0E8", padding: "90px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="about-grid">
            <div>
              <FadeIn>
                <SectionTag label="Why India" light />
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 700, color: "#0A2E1C", margin: "0 0 24px", lineHeight: 1.2 }}>
                  The world's <span style={{ color: "#C8963E", fontStyle: "italic" }}>pharmacy.</span>
                </h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(7,30,18,0.62)", lineHeight: 1.85, margin: "0 0 18px" }}>
                  India supplies over 20% of the world's generic medicines and 60% of global vaccine demand. The country is home to more USFDA-approved manufacturing sites outside the US than any other nation.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(7,30,18,0.62)", lineHeight: 1.85 }}>
                  Aurelia sources exclusively from certified facilities — WHO-GMP, USFDA, and EU-GMP approved — ensuring every shipment meets the regulatory requirements of destination markets.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.15} direction="left">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { v: "20%+", l: "Global Generic Supply" },
                  { v: "60%", l: "Global Vaccines" },
                  { v: "#1", l: "USFDA Approved (ex-US)" },
                  { v: "Cold Chain", l: "Full Capability" },
                ].map((s, i) => (
                  <div key={i} style={{ background: i % 2 === 0 ? "#071810" : "white", borderRadius: 8, padding: "26px 20px", border: i % 2 !== 0 ? "1px solid rgba(7,30,18,0.07)" : "none", boxShadow: i % 2 !== 0 ? "0 2px 16px rgba(7,30,18,0.05)" : "none" }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, color: i % 2 === 0 ? ACCENT : "#0A2E1C", fontWeight: 700, marginBottom: 6 }}>{s.v}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: i % 2 === 0 ? "rgba(245,240,232,0.42)" : "rgba(7,30,18,0.38)", letterSpacing: "0.14em", textTransform: "uppercase" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={{ background: "#0C1E14", padding: "80px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.22em", color: `rgba(127,196,160,0.5)`, textTransform: "uppercase", marginBottom: 32 }}>
              Compliance Standards We Work To
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {certifications.map((c, i) => (
                <div key={i} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(127,196,160,0.12)", borderRadius: 8, padding: "22px 24px" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: ACCENT, fontWeight: 600, marginBottom: 8 }}>{c.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.4)", lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Product Categories */}
      <section style={{ background: "#071E12", padding: "100px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn><SectionTag label="Product Categories" /></FadeIn>
          <FadeIn delay={0.1}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 56px" }}>
              Six categories.<br /><span style={{ color: ACCENT, fontStyle: "italic" }}>End-to-end coverage.</span>
            </h2>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
            {PHARMA_CATEGORIES.map((cat, i) => (
              <FadeIn key={cat.key} delay={0.06 + i * 0.07}>
                <div
                  onClick={() => setOpen(open === cat.key ? null : cat.key)}
                  style={{
                    background: open === cat.key ? "rgba(127,196,160,0.06)" : "rgba(245,240,232,0.03)",
                    border: `1px solid ${open === cat.key ? "rgba(127,196,160,0.22)" : "rgba(245,240,232,0.07)"}`,
                    borderRadius: 9, padding: "28px 28px", cursor: "pointer",
                    transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                    transform: open === cat.key ? "translateY(-3px)" : "none",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, color: `rgba(127,196,160,0.48)`, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                        Category {String(i + 1).padStart(2, "0")}
                      </div>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: "#F5F0E8", margin: 0, fontWeight: 600 }}>{cat.label}</h3>
                    </div>
                    <span style={{ color: ACCENT, fontSize: 16, transition: "transform 0.35s", transform: open === cat.key ? "rotate(180deg)" : "none", display: "inline-block", marginTop: 4 }}>▾</span>
                  </div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.38)", lineHeight: 1.7, margin: 0 }}>{cat.description}</p>
                  <div style={{ maxHeight: open === cat.key ? 220 : 0, overflow: "hidden", transition: "max-height 0.45s cubic-bezier(0.22,1,0.36,1)", opacity: open === cat.key ? 1 : 0 }}>
                    <div style={{ borderTop: "1px solid rgba(245,240,232,0.07)", marginTop: 18, paddingTop: 18, display: "flex", flexWrap: "wrap", gap: "10px 14px" }}>
                      {cat.items.map((item, j) => (
                        <span key={j} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.55)", padding: "5px 12px", background: "rgba(127,196,160,0.06)", borderRadius: 20, border: "1px solid rgba(127,196,160,0.1)" }}>
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
      <section style={{ background: "#071810", padding: "72px 24px", textAlign: "center", borderTop: `1px solid rgba(127,196,160,0.1)` }}>
        <FadeIn>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 38px)", color: "#F5F0E8", margin: "0 0 18px" }}>
            Sourcing pharmaceuticals?<br /><span style={{ color: ACCENT, fontStyle: "italic" }}>Let's discuss.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.38)", margin: "0 0 36px" }}>
            We'll match your requirements with certified manufacturers and handle compliance documentation end-to-end.
          </p>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            padding: "16px 40px", background: ACCENT, color: "#071810",
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
