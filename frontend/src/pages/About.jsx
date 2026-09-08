import { useNavigate } from "react-router-dom";
import { PageHero, CopySection, CTABand } from "../components/PageLayout";
import FadeIn from "../components/FadeIn";
import { colors, fonts } from "../theme";

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      <PageHero
        tag="About Aurelia"
        title={<>Aurelia connects buyers with <span style={{ color: colors.gold, fontStyle: "italic" }}>manufacturers and suppliers worldwide.</span></>}
        intro="Aurelia was built around a simple problem: good manufacturers and suppliers can be difficult to reach from overseas markets. We help close that gap."
      />

      <section style={{ background: colors.emerald, padding: "96px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontFamily: fonts.sans, fontSize: "clamp(16px, 1.8vw, 18px)", color: "rgba(245,240,232,0.68)", lineHeight: 1.85, margin: "0 0 24px" }}>
              Based in the UK, Aurelia works with international buyers looking to source products from established manufacturers and suppliers worldwide, and with suppliers looking to reach new markets.
            </p>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p style={{ fontFamily: fonts.sans, fontSize: "clamp(16px, 1.8vw, 18px)", color: "rgba(245,240,232,0.6)", lineHeight: 1.85, margin: 0 }}>
              Our work can include supplier identification, product sourcing, commercial discussions, samples, specifications, documentation and export coordination. The exact role we play depends on the product, buyer and destination market.
            </p>
          </FadeIn>
        </div>
      </section>

      <CopySection
        tone="light"
        heading={<>We know the buyer side.<br />We know the <span style={{ color: colors.gold, fontStyle: "italic" }}>supplier side.</span></>}
      >
        <p style={{ margin: 0 }}>
          International sourcing can become complicated quickly. A buyer may know exactly what product they want but have no reliable route to the manufacturer. A supplier may have the right product but limited access to overseas customers. Aurelia works between the two.
        </p>
      </CopySection>

      <CopySection heading={<>Built around <span style={{ color: colors.gold, fontStyle: "italic" }}>relationships.</span></>}>
        <p style={{ margin: 0 }}>
          We would rather understand a buyer's actual requirement than send a long catalogue of products that do not fit. That means looking at the specification, order quantity, target market, pricing, supplier capability, lead time and export requirements before recommending a route forward.
        </p>
      </CopySection>

      <CTABand
        heading="See what we source."
        copy="Four sourcing areas, each built around suppliers we can actually reach."
        label="Explore Our Expertise"
        onClick={() => navigate("/expertise")}
      />
    </div>
  );
}
