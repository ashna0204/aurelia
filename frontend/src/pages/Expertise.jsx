import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { PageHero, CTABand } from "../components/PageLayout";
import { EXPERTISE, expertisePath } from "../constants/expertise";
import { colors, fonts } from "../theme";

export default function Expertise() {
  const navigate = useNavigate();

  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <PageHero
        tag="Areas of Expertise"
        title={<>What we <span style={{ color: colors.gold, fontStyle: "italic" }}>source.</span></>}
        intro="Aurelia focuses on a small number of sourcing areas where we can build useful supplier relationships and understand the requirements of international buyers."
      />

      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          {EXPERTISE.map((area, i) => (
            <FadeIn key={area.slug} delay={i * 0.08}>
              <div
                onClick={() => navigate(expertisePath(area.slug))}
                className="spec-card"
                style={{
                  borderRadius: 12, overflow: "hidden", cursor: "pointer",
                  display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1.1fr" : "1.1fr 1fr",
                  minHeight: 300,
                  background: "rgba(245,240,232,0.03)",
                  border: "1px solid rgba(245,240,232,0.06)",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${area.accent}44`;
                  e.currentTarget.style.boxShadow = "0 16px 56px rgba(0,0,0,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(245,240,232,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {i % 2 !== 0 && <AreaImage area={area} side="right" />}

                <div style={{ padding: "48px 52px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(22px, 2.7vw, 32px)", fontWeight: 700, color: colors.cream, margin: "0 0 18px", lineHeight: 1.2 }}>
                    {area.label}
                  </h2>
                  <p style={{ fontFamily: fonts.sans, fontSize: 14.5, color: "rgba(245,240,232,0.5)", lineHeight: 1.8, margin: "0 0 32px" }}>
                    {area.index}
                  </p>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: area.accent, fontFamily: fonts.sans, fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    <span>Explore {area.label}</span>
                    <span style={{ fontSize: 16 }}>→</span>
                  </div>
                </div>

                {i % 2 === 0 && <AreaImage area={area} side="left" />}
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <CTABand
        heading="Something outside these categories?"
        copy="Do you have a product requirement that does not fit neatly into one of these categories? Contact us. If it is within our supplier network or capabilities, we will assess it."
        label="Contact Us"
        onClick={() => navigate("/contact")}
      />
    </div>
  );
}

function AreaImage({ area, side }) {
  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <img src={area.image} alt={area.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to ${side}, transparent 60%, rgba(7,30,18,0.7))` }} />
    </div>
  );
}
