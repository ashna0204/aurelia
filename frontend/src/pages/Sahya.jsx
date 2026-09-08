import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { CopySection, CTABand } from "../components/PageLayout";
import { colors, fonts } from "../theme";

const RANGE = [
  "Rice and grains",
  "Flours and mixes",
  "Snacks and sweets",
  "Pickles and condiments",
  "Other regional specialties",
];

export default function Sahya() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      {/* The brand's own ground rather than the Aurelia green — Sahya is a
          separate label, and the page should read that way from the first
          screen. */}
      <section style={{ background: "#F4EDDD", padding: "96px 24px 88px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "radial-gradient(#1F3454 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
          <FadeIn>
            <div style={{ fontFamily: fonts.sans, fontSize: 9, letterSpacing: "0.28em", color: "rgba(31,52,84,0.5)", textTransform: "uppercase", marginBottom: 16 }}>
              An Aurelia food brand
            </div>
            <h1 style={{
              fontFamily: fonts.serif, fontSize: "clamp(52px, 8vw, 92px)", fontWeight: 700,
              color: "#1F3454", lineHeight: 0.95, fontStyle: "italic", letterSpacing: "-0.01em", margin: 0,
            }}>
              Sahya
            </h1>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p style={{ fontFamily: fonts.serif, fontSize: "clamp(19px, 2.4vw, 26px)", color: "rgba(31,52,84,0.7)", lineHeight: 1.5, marginTop: 26, maxWidth: 620 }}>
              Food from South India, presented for a new generation of buyers.
            </p>
          </FadeIn>
        </div>
      </section>

      <CopySection heading={<>Why Sahya <span style={{ color: colors.gold, fontStyle: "italic" }}>exists.</span></>}>
        <p style={{ margin: 0 }}>
          Sahya is Aurelia's food brand, developed around the products, flavours and ingredients of South India. It is intended for specialty retail, foodservice and selected direct-to-consumer opportunities.
        </p>
      </CopySection>

      <section style={{ background: colors.emerald, padding: "96px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 700, color: colors.cream, margin: "0 0 36px", lineHeight: 1.2 }}>
              The <span style={{ color: colors.gold, fontStyle: "italic" }}>range.</span>
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {RANGE.map((item, i) => (
              <FadeIn key={item} delay={0.05 + i * 0.06}>
                <div style={{
                  background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.08)",
                  borderRadius: 8, padding: "26px 24px", height: "100%",
                  fontFamily: fonts.serif, fontSize: 18, color: colors.cream, fontStyle: "italic",
                }}>
                  {item}
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.25}>
            <p style={{ fontFamily: fonts.sans, fontSize: 15, color: "rgba(245,240,232,0.5)", lineHeight: 1.85, marginTop: 32, maxWidth: 720 }}>
              Products and formats will develop according to market demand, supplier availability and the requirements of the markets we serve.
            </p>
          </FadeIn>
        </div>
      </section>

      <CTABand
        heading="Interested in stocking Sahya?"
        copy="Talk to us about wholesale, distribution and retail opportunities."
        label="Send an Enquiry"
        onClick={() => navigate("/contact")}
      />
    </div>
  );
}
