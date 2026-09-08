import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { PageHero, CopySection, CategoryCards, CTABand, BackLink } from "../components/PageLayout";
import { HEALTHCARE_CATEGORIES } from "../data";
import { areaBySlug } from "../constants/expertise";
import { fonts } from "../theme";

const AREA = areaBySlug("healthcare");

export default function Healthcare() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      <PageHero
        tag="Healthcare & Pharmaceuticals"
        image={AREA.image}
        background={AREA.background}
        accent={AREA.accent}
        title={<>Healthcare sourcing requires more than a <span style={{ color: AREA.accent, fontStyle: "italic" }}>supplier list.</span></>}
        intro="Aurelia supports sourcing enquiries for selected pharmaceutical, healthcare and related products from Indian manufacturers and suppliers."
      >
        <BackLink label="Areas of Expertise" onClick={() => navigate("/expertise")} accent={AREA.accent} />
      </PageHero>

      {/* The qualifier the rest of the page hangs off, so it is read before any
          product category rather than after. */}
      <section style={{ background: "#0C1E14", padding: "56px 24px", borderTop: `1px solid ${AREA.accent}22`, borderBottom: `1px solid ${AREA.accent}22` }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ fontFamily: fonts.serif, fontSize: "clamp(17px, 2.1vw, 22px)", color: "rgba(245,240,232,0.8)", lineHeight: 1.65, margin: 0 }}>
              The suitability of any product depends on the destination market, product classification, manufacturer credentials and applicable regulations.
            </p>
            <p style={{ fontFamily: fonts.sans, fontSize: 12, color: `${AREA.accent}cc`, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 22 }}>
              Temperature-controlled · Compliance-first
            </p>
          </FadeIn>
        </div>
      </section>

      <CopySection background={AREA.background} heading="We start with the market.">
        <p style={{ margin: 0 }}>
          A product that can be manufactured and sold in one country may require different approvals, documentation or packaging in another. We begin by understanding the product, intended use, destination country, required specification, regulatory requirements and expected order volume.
        </p>
      </CopySection>

      <CategoryCards
        heading="Potential categories."
        categories={HEALTHCARE_CATEGORIES}
        accent={AREA.accent}
        note="These are potential sourcing categories, not an offer to supply. Whether any product can be sourced for you depends on its classification and the requirements of your destination market."
      />

      <CopySection tone="light" heading="Supplier credentials matter.">
        <p style={{ margin: 0 }}>
          We assess supplier information and available documentation as part of the sourcing process. Any certification, approval or registration stated for a supplier or product should be verified for the specific transaction and destination market.
        </p>
      </CopySection>

      <CTABand
        heading="Discuss a healthcare sourcing requirement."
        copy="Tell us the product, its intended use and the destination country, and we will tell you whether we can help."
        label="Send Your Requirement"
        onClick={() => navigate("/quote")}
        accent={AREA.accent}
        background={AREA.background}
      />
    </div>
  );
}
