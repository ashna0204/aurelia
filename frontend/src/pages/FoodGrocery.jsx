import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { PageHero, CopySection, CTABand, BackLink } from "../components/PageLayout";
import { areaBySlug } from "../constants/expertise";
import { colors, fonts } from "../theme";

const AREA = areaBySlug("food-grocery");

export default function FoodGrocery() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 72 }}>
      <PageHero
        tag="Food & Grocery"
        image={AREA.image}
        background={AREA.background}
        accent={AREA.accent}
        title={<>South Asian food, sourced for <span style={{ color: colors.gold, fontStyle: "italic" }}>international buyers.</span></>}
        intro="Aurelia works with food manufacturers and processors in India to supply products for wholesalers, retailers, hospitality businesses and specialty food operators."
      >
        <BackLink label="Areas of Expertise" onClick={() => navigate("/expertise")} />
      </PageHero>

      <CopySection heading={<>From supplier to <span style={{ color: colors.gold, fontStyle: "italic" }}>shipment.</span></>}>
        <p style={{ margin: 0 }}>
          We can help with product sourcing, supplier identification, specifications, samples, packaging requirements, pricing and order quantities, export documentation and shipment coordination. The exact process depends on the product and destination.
        </p>
      </CopySection>

      <CopySection tone="light" heading={<>A particular connection to <span style={{ color: colors.gold, fontStyle: "italic" }}>Kerala.</span></>}>
        <p style={{ margin: 0 }}>
          Kerala has a strong food culture and an established network of food processors and manufacturers. Aurelia's food sourcing includes products such as matta rice, rice powders, puttu podi, idiyappam powder, rava, pulses, snacks, mixes and traditional condiments.
        </p>
      </CopySection>

      <CopySection tone="deep" heading={<>Built for wholesale and <span style={{ color: colors.gold, fontStyle: "italic" }}>specialty markets.</span></>}>
        <p style={{ margin: 0 }}>
          We work with buyers who need reliable supply, clear product information and a practical route from supplier to export. Where appropriate, we can also discuss packaging and private-label requirements.
        </p>
      </CopySection>

      {/* Pointers to the two pages that sit under this one. */}
      <section style={{ background: colors.forest, padding: "80px 24px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="about-grid">
          {[
            {
              title: "Our current food range",
              copy: "A selection of products currently available through our supplier network.",
              action: "View the catalogue",
              to: "/expertise/food-grocery/catalogue",
            },
            {
              title: "Sahya",
              copy: "Aurelia's food brand, developed around the products, flavours and ingredients of South India.",
              action: "About Sahya",
              to: "/sahya",
            },
          ].map((card) => (
            <FadeIn key={card.to}>
              <div
                onClick={() => navigate(card.to)}
                style={{
                  background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.07)",
                  borderRadius: 10, padding: "36px 34px", cursor: "pointer", height: "100%",
                  transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(200,150,62,0.3)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(245,240,232,0.07)"; e.currentTarget.style.transform = "none"; }}
              >
                <h3 style={{ fontFamily: fonts.serif, fontSize: 24, color: colors.cream, margin: "0 0 12px", fontWeight: 600 }}>{card.title}</h3>
                <p style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(245,240,232,0.45)", lineHeight: 1.8, margin: "0 0 22px" }}>{card.copy}</p>
                <span style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.gold, letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  {card.action} →
                </span>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <CTABand
        heading="Have a food requirement?"
        copy="Tell us the product, pack size, target market and approximate order volume, and we will come back with the next steps."
        label="Request a Quote"
        onClick={() => navigate("/quote")}
      />
    </div>
  );
}
