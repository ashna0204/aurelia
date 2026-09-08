import { useNavigate } from "react-router-dom";
import { PageHero, CopySection, CategoryCards, CTABand, BackLink } from "../components/PageLayout";
import { AUTOMOTIVE_CATEGORIES } from "../data";
import { areaBySlug } from "../constants/expertise";

const AREA = areaBySlug("automotive");

export default function Automotive() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      <PageHero
        tag="Automotive Components"
        image={AREA.image}
        background={AREA.background}
        accent={AREA.accent}
        title={<>Automotive components from <span style={{ color: AREA.accent, fontStyle: "italic" }}>Indian suppliers.</span></>}
        intro="Aurelia helps international buyers source vehicle components and aftermarket parts from established manufacturers and suppliers across South Asia. We start with the requirement, then identify suppliers that can meet it."
      >
        <BackLink label="Areas of Expertise" onClick={() => navigate("/expertise")} accent={AREA.accent} />
      </PageHero>

      <CategoryCards
        heading="What we source."
        categories={AUTOMOTIVE_CATEGORIES}
        accent={AREA.accent}
      />

      <CopySection tone="light" heading="Tell us what you need.">
        <p style={{ margin: 0 }}>
          The right supplier depends on the application, vehicle, market and required specification. Useful information includes the part number, vehicle make and model, quantity, target market, preferred brand or manufacturer, required certification and target price where available.
        </p>
      </CopySection>

      <CopySection
        background={AREA.background}
        heading={<>We help bridge the gap between <span style={{ color: AREA.accent, fontStyle: "italic" }}>buyer and supplier.</span></>}
      >
        <p style={{ margin: 0 }}>
          Our role may include identifying manufacturers, requesting quotations, comparing options, coordinating samples and helping with export arrangements. We do not replace the manufacturer's technical responsibility. Our job is to make the sourcing process easier to manage.
        </p>
      </CopySection>

      <CTABand
        heading="Sourcing automotive components?"
        copy="Send us the part, the vehicle and the market, and we will assess what is available."
        label="Send Your Requirement"
        onClick={() => navigate("/quote")}
        accent={AREA.accent}
        background="#0B1828"
      />
    </div>
  );
}
