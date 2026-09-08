import { useNavigate } from "react-router-dom";
import { PageHero, CopySection, CategoryCards, CTABand, BackLink } from "../components/PageLayout";
import { PERFUME_CATEGORIES } from "../data";
import { areaBySlug } from "../constants/expertise";

const AREA = areaBySlug("perfume");

export default function Perfume() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      <PageHero
        tag="Perfume Ingredients & Essential Oils"
        image={AREA.image}
        background={AREA.background}
        accent={AREA.accent}
        title={<>Perfume ingredients and essential oils from <span style={{ color: AREA.accent, fontStyle: "italic" }}>global suppliers.</span></>}
        intro="Aurelia connects buyers with producers and suppliers of essential oils, aromatic ingredients and selected raw materials across South Asia."
      >
        <BackLink label="Areas of Expertise" onClick={() => navigate("/expertise")} accent={AREA.accent} />
      </PageHero>

      <CopySection
        background={AREA.background}
        heading={<>For fragrance, personal care and <span style={{ color: AREA.accent, fontStyle: "italic" }}>related applications.</span></>}
      >
        <p style={{ margin: 0 }}>
          We can support sourcing requirements for perfumery, cosmetics, personal care, home fragrance and other applications where natural oils and aromatic ingredients are used.
        </p>
      </CopySection>

      <CategoryCards
        heading="Potential sourcing areas."
        categories={PERFUME_CATEGORIES}
        accent={AREA.accent}
        note="Subject to specification and supplier availability."
      />

      <CopySection tone="light" heading="Specification comes first.">
        <p style={{ margin: 0 }}>
          The same ingredient can vary by botanical source, extraction method, origin, grade and intended application. When you enquire, we look at the material required, origin, technical specification, quantity, application and destination market.
        </p>
      </CopySection>

      <CopySection background={AREA.background} heading="From source to commercial enquiry.">
        <p style={{ margin: 0 }}>
          Aurelia can help identify suitable suppliers, request technical and commercial information, coordinate samples and documentation, and support the process towards export.
        </p>
      </CopySection>

      <CTABand
        heading="Looking for a particular oil or fragrance ingredient?"
        copy="Send us the specification and intended application."
        label="Discuss Your Requirement"
        onClick={() => navigate("/quote")}
        accent={AREA.accent}
        background="#100C1B"
      />
    </div>
  );
}
