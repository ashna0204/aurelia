import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import spicesImg from "../assets/spices.jpg";
import autopartImg from "../assets/autopart.jpg";
import pharmaImg from "../assets/pharma.jpg";

const SECTORS = [
  {
    slug: "ethnic-food",
    label: "Ethnic Food & Grocery",
    tagline: "Celebrating heritage through authentic sourcing.",
    desc: "38 authenticated product lines sourced directly from growers and processors across Kerala, Tamil Nadu, and Rajasthan. From staple grains to artisan condiments — and featuring Sahya, our B2C label for the specialty grocer and diaspora markets.",
    stats: [{ v: "38", l: "Products" }, { v: "6", l: "Categories" }, { v: "Kerala", l: "Heartland" }],
    bg: spicesImg,
    accent: "#C8963E",
  },
  {
    slug: "vehicle-parts",
    label: "Vehicle Parts & Accessories",
    tagline: "OEM-quality components. Reliable delivery.",
    desc: "India is the world's third-largest automobile manufacturer. We connect buyers in Africa, the Middle East, and South-East Asia with certified Indian automotive suppliers — tyres, braking, engine components, electrical, filtration, and body parts.",
    stats: [{ v: "6", l: "Categories" }, { v: "OEM", l: "Quality Standard" }, { v: "Global", l: "Reach" }],
    bg: autopartImg,
    accent: "#8BA4C8",
  },
  {
    slug: "pharmaceuticals",
    label: "Pharmaceuticals & Healthcare",
    tagline: "Temperature-controlled. Compliance-first.",
    desc: "India supplies over 20% of the world's generic medicines. Aurelia sources from WHO-GMP and USFDA-certified manufacturers — finished formulations, Ayurvedic preparations, nutraceuticals, APIs, and medical consumables.",
    stats: [{ v: "6", l: "Categories" }, { v: "WHO-GMP", l: "Certified" }, { v: "USFDA", l: "Approved Sources" }],
    bg: pharmaImg,
    accent: "#7FC4A0",
  },
];

export default function Specialisations() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#071E12", minHeight: "100vh", paddingTop: 72 }}>

      {/* Header */}
      <section style={{ padding: "80px 24px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 60%, rgba(200,150,62,0.06) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <FadeIn><SectionTag label="Areas of Specialisation" /></FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 20px" }}>
              Three sectors.<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>Deep expertise.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "rgba(245,240,232,0.5)", lineHeight: 1.75, maxWidth: 580 }}>
              Aurelia Logistics operates across three distinct trade verticals — each backed by dedicated sourcing networks, compliance knowledge, and years of on-the-ground relationships in South Asia.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Sector cards */}
      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
          {SECTORS.map((s, i) => (
            <FadeIn key={s.slug} delay={i * 0.1}>
              <div
                onClick={() => navigate(`/specialisations/${s.slug}`)}
                style={{
                  borderRadius: 12, overflow: "hidden", cursor: "pointer",
                  display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1.2fr" : "1.2fr 1fr",
                  minHeight: 340,
                  background: "rgba(245,240,232,0.03)",
                  border: "1px solid rgba(245,240,232,0.06)",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,150,62,0.2)";
                  e.currentTarget.style.boxShadow = "0 16px 56px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(245,240,232,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                className="spec-card"
              >
                {/* Image — swap order for odd rows */}
                {i % 2 !== 0 && (
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src={s.bg} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, transparent 60%, rgba(7,30,18,0.7))" }} />
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.6)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 16 }}>
                    Specialisation {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(22px, 2.8vw, 34px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 10px", lineHeight: 1.2 }}>
                    {s.label}
                  </h2>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 15, color: "#C8963E", fontStyle: "italic", margin: "0 0 20px" }}>{s.tagline}</p>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.45)", lineHeight: 1.75, margin: "0 0 32px" }}>{s.desc}</p>

                  <div style={{ display: "flex", gap: 32, marginBottom: 32 }}>
                    {s.stats.map((st, j) => (
                      <div key={j}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: s.accent, fontWeight: 700 }}>{st.v}</div>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.16em", textTransform: "uppercase", marginTop: 2 }}>{st.l}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#C8963E", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    <span>Explore {s.label}</span>
                    <span style={{ fontSize: 16 }}>→</span>
                  </div>
                </div>

                {/* Image — even rows (right side) */}
                {i % 2 === 0 && (
                  <div style={{ position: "relative", overflow: "hidden" }}>
                    <img src={s.bg} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 60%, rgba(7,30,18,0.7))" }} />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
