import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { ETHNIC_FOOD_CATEGORIES } from "../data";
import spicesImg from "../assets/spices.jpg";

/* ─── Sahya Brand Feature ─── */
function SahyaFeature() {
  const channels = [
    { label: "Grocer", sub: "Specialty & independent — Whole Foods, Eataly, Selfridges Food Hall" },
    { label: "HoReCa", sub: "Independent cafés & small restaurants. Buyers want sourcing stories." },
    { label: "DTC", sub: "The Harvest Crate via Sahya's site & partner subscription boxes." },
    { label: "Diaspora", sub: "Second-generation South Asian — the products without the dated packaging." },
  ];

  return (
    <section id="sahya" style={{ background: "#F4EDDD", padding: "100px 24px", position: "relative", overflow: "hidden" }}>
      {/* Subtle texture */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(#1F3454 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start", marginBottom: 80 }} className="sahya-grid">
          <div>
            <FadeIn>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.28em", color: "rgba(31,52,84,0.5)", textTransform: "uppercase", marginBottom: 12 }}>
                  Aurelia Logistics · Sister Label
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(52px, 7vw, 80px)", fontWeight: 700, color: "#1F3454", lineHeight: 0.95, fontStyle: "italic", letterSpacing: "-0.01em" }}>
                  Sahya.
                </div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "rgba(31,52,84,0.55)", fontStyle: "italic", marginTop: 10 }}>
                  A label from the mountains.
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.1}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(31,52,84,0.7)", lineHeight: 1.85, margin: "0 0 20px" }}>
                Sahya is Aurelia's B2C label — built to capture the specialty-grocer and direct-to-consumer market that our classical export brand cannot reach.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(31,52,84,0.6)", lineHeight: 1.85, margin: 0 }}>
                Same Kerala supply chain. Same quality standard. A deliberately different visual language: <strong>kraft paper instead of polished cream</strong>, stoneware ceramic instead of amber glass, laterite red and monsoon indigo instead of phthalo green and gilt gold.
              </p>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="left">
            <div style={{ background: "#1F3454", borderRadius: 12, padding: "40px 36px", color: "#F4EDDD" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(244,237,221,0.4)", marginBottom: 28 }}>Identity Vitals</div>
              {[
                { label: "Etymology", value: "From Sahyadri, the indigenous name for the Western Ghats" },
                { label: "Visual Tone", value: "Editorial, earthen, small-batch" },
                { label: "Display Type", value: "Fraunces — warm variable serif" },
                { label: "Substrate", value: "Kraft paper pouches · Stoneware ceramic" },
                { label: "Hero Format", value: "The Harvest Crate — straw-lined kraft board" },
                { label: "Audience", value: "Specialty grocers · Cafés · DTC · Diaspora" },
              ].map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, padding: "12px 0", borderBottom: i < 5 ? "1px solid rgba(244,237,221,0.07)" : "none" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(244,237,221,0.35)" }}>{row.label}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 14, color: "#F4EDDD", fontStyle: "italic" }}>{row.value}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Where Aurelia vs Sahya */}
        <FadeIn delay={0.2}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 72 }} className="brand-compare">
            <div style={{ background: "#0A2E1C", borderRadius: 10, padding: "36px 32px" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(245,240,232,0.3)", marginBottom: 16 }}>The Elder · Established Line</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, color: "#C8963E", letterSpacing: "0.12em", marginBottom: 20 }}>AURELIA</div>
              {[
                { label: "Audience", value: "Embassies, luxury HoReCa, premium gifting" },
                { label: "Format", value: "Cream pouches, amber glass, foil-stamped board" },
                { label: "Frequency", value: "Low repeat, high ticket" },
                { label: "Hero", value: "The Heritage Box — phthalo hamper" },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(245,240,232,0.3)", marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.65)" }}>{r.value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#9B3E1F", borderRadius: 10, padding: "36px 32px" }}>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(244,237,221,0.4)", marginBottom: 16 }}>The Younger · New Volume Driver</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, fontStyle: "italic", color: "#F4EDDD", marginBottom: 20 }}>Sahya</div>
              {[
                { label: "Audience", value: "Specialty grocers, cafés, DTC, diaspora" },
                { label: "Format", value: "Kraft pouches, stoneware ceramic, board crates" },
                { label: "Frequency", value: "High repeat, mid ticket" },
                { label: "Hero", value: "The Harvest Crate — straw-lined kraft" },
              ].map((r, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(244,237,221,0.35)", marginBottom: 2 }}>{r.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(244,237,221,0.75)" }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Four Channels */}
        <FadeIn delay={0.25}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.22em", color: "rgba(31,52,84,0.45)", textTransform: "uppercase", marginBottom: 28 }}>
              Where Sahya fits — four channels
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {channels.map((ch, i) => (
                <div key={i} style={{ background: "white", borderRadius: 8, padding: "28px 24px", border: "1px solid rgba(31,52,84,0.07)", boxShadow: "0 2px 16px rgba(31,52,84,0.04)" }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontStyle: "italic", color: "#9B3E1F", marginBottom: 10 }}>{ch.label}</div>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(31,52,84,0.55)", lineHeight: 1.7, margin: 0 }}>{ch.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── Product Catalog ─── */
function ProductCatalog() {
  const [openCat, setOpenCat] = useState(ETHNIC_FOOD_CATEGORIES[0].key);

  return (
    <section style={{ background: "#071E12", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeIn><SectionTag label="Product Catalogue" /></FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 12px" }}>
            38 product lines.<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>All sourced direct.</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.15}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.45)", margin: "0 0 56px", maxWidth: 520, lineHeight: 1.7 }}>
            FOB pricing from Unifarex — Aurelia's primary Kerala supplier. All prices in USD per package. Contact us for bulk rates and custom specifications.
          </p>
        </FadeIn>

        {/* Category tabs */}
        <FadeIn delay={0.2}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
            {ETHNIC_FOOD_CATEGORIES.map((cat) => (
              <button key={cat.key} onClick={() => setOpenCat(cat.key)} style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500,
                padding: "9px 20px", borderRadius: 40, cursor: "pointer", transition: "all 0.3s",
                background: openCat === cat.key ? "rgba(200,150,62,0.15)" : "rgba(245,240,232,0.04)",
                border: openCat === cat.key ? "1px solid #C8963E" : "1px solid rgba(245,240,232,0.1)",
                color: openCat === cat.key ? "#C8963E" : "rgba(245,240,232,0.5)",
                letterSpacing: "0.06em",
              }}>
                {cat.label} <span style={{ opacity: 0.6, fontSize: 11 }}>({cat.products.length})</span>
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Active category */}
        {ETHNIC_FOOD_CATEGORIES.filter((c) => c.key === openCat).map((cat) => (
          <div key={cat.key}>
            <FadeIn>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, marginBottom: 32, maxWidth: 600 }}>{cat.description}</p>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 1, border: "1px solid rgba(245,240,232,0.07)", borderRadius: 8, overflow: "hidden" }}>
              {cat.products.map((p, i) => (
                <div key={i} style={{
                  padding: "18px 22px", background: "rgba(245,240,232,0.02)",
                  borderRight: "1px solid rgba(245,240,232,0.06)",
                  borderBottom: "1px solid rgba(245,240,232,0.06)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  transition: "background 0.25s",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(200,150,62,0.06)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(245,240,232,0.02)"}
                >
                  <div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F5F0E8", fontWeight: 500, marginBottom: 3 }}>{p.name}</div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(245,240,232,0.3)", letterSpacing: "0.08em" }}>{p.pkg}</div>
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, color: "#C8963E", fontWeight: 600, flexShrink: 0, marginLeft: 16 }}>{p.price}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(245,240,232,0.2)", marginTop: 14, letterSpacing: "0.05em" }}>
              * All prices FOB — Kochi, India. Prices subject to change without notice. Contact us for bulk rates.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EthnicFood() {
  const navigate = useNavigate();
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Page hero */}
      <section style={{ background: "#071E12", padding: "80px 24px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `url(${spicesImg}) center/cover no-repeat`, opacity: 0.3 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(7,30,18,0.7), rgba(7,30,18,0.95))" }} />        <div style={{ position: "absolute", inset: 0, background: `url(${spicesImg}) center/cover no-repeat`, opacity: 0.3 }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <button onClick={() => navigate("/specialisations")} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(200,150,62,0.7)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24, padding: 0 }}>
            ← Specialisations
          </button>
          <FadeIn>
            <SectionTag label="Specialisation 01" />
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 62px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 20px" }}>
              Ethnic Food<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>& Grocery</span>
            </h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(245,240,232,0.5)", maxWidth: 560, lineHeight: 1.75 }}>
              Authentic South Asian dry goods sourced directly from Kerala's growers and processors — supplying importers, ethnic grocery chains, foodservice distributors, and Aurelia's own Sahya label.
            </p>
          </FadeIn>
        </div>
      </section>

      <SahyaFeature />
      <ProductCatalog />

      {/* CTA */}
      <section style={{ background: "#0A2212", padding: "72px 24px", textAlign: "center", borderTop: "1px solid rgba(200,150,62,0.1)" }}>
        <FadeIn>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(24px, 3.5vw, 38px)", color: "#F5F0E8", margin: "0 0 18px" }}>
            Ready to source?<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>Let's talk.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "rgba(245,240,232,0.4)", margin: "0 0 36px" }}>
            Request an FOB quote or ask about our Sahya partnership programme.
          </p>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
            padding: "16px 40px", background: "linear-gradient(135deg, #C8963E, #A67B2E)",
            color: "#071E12", border: "none", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.15em", textTransform: "uppercase", transition: "all 0.3s",
          }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            Request a Quote
          </button>
        </FadeIn>
      </section>
    </div>
  );
}
