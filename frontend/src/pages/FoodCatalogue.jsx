import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import { PageHero, CTABand, BackLink } from "../components/PageLayout";
import { FOOD_CATEGORIES, CATALOGUE_FIELDS } from "../data";
import { colors, fonts } from "../theme";

export default function FoodCatalogue() {
  const navigate = useNavigate();
  const [openCat, setOpenCat] = useState(FOOD_CATEGORIES[0].key);
  const active = FOOD_CATEGORIES.find((c) => c.key === openCat);

  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <PageHero
        tag="Food Catalogue"
        title={<>Our current <span style={{ color: colors.gold, fontStyle: "italic" }}>food range.</span></>}
        intro="A selection of products currently available through our supplier network. Availability, pack sizes, minimum order quantities and pricing are confirmed against each enquiry."
      >
        <BackLink label="Food & Grocery" onClick={() => navigate("/expertise/food-grocery")} />
      </PageHero>

      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          {/* Category tabs. No counts: a product line can be added or dropped
              by a supplier at any time, and a published number would go stale. */}
          <FadeIn>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 40 }}>
              {FOOD_CATEGORIES.map((cat) => (
                <button key={cat.key} onClick={() => setOpenCat(cat.key)} style={{
                  fontFamily: fonts.sans, fontSize: 12, fontWeight: 500,
                  padding: "9px 20px", borderRadius: 40, cursor: "pointer", transition: "all 0.3s",
                  background: openCat === cat.key ? "rgba(200,150,62,0.15)" : "rgba(245,240,232,0.04)",
                  border: openCat === cat.key ? `1px solid ${colors.gold}` : "1px solid rgba(245,240,232,0.1)",
                  color: openCat === cat.key ? colors.gold : "rgba(245,240,232,0.5)",
                  letterSpacing: "0.06em",
                }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </FadeIn>

          <p style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(245,240,232,0.42)", lineHeight: 1.75, marginBottom: 32, maxWidth: 640 }}>
            {active.description}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {active.products.map((product) => (
              <div key={product.name} style={{
                background: "rgba(245,240,232,0.02)",
                border: "1px solid rgba(245,240,232,0.07)",
                borderRadius: 8, padding: "22px 24px",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ fontFamily: fonts.serif, fontSize: 17, color: colors.cream, fontWeight: 600, marginBottom: 16 }}>
                  {product.name}
                </div>
                <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "auto 1fr", gap: "7px 14px", flexGrow: 1 }}>
                  {CATALOGUE_FIELDS.map((field) => (
                    <div key={field.key} style={{ display: "contents" }}>
                      <dt style={{ fontFamily: fonts.sans, fontSize: 10, color: "rgba(245,240,232,0.28)", letterSpacing: "0.14em", textTransform: "uppercase", alignSelf: "center" }}>
                        {field.label}
                      </dt>
                      <dd style={{ fontFamily: fonts.sans, fontSize: 12.5, color: "rgba(245,240,232,0.6)", margin: 0, textAlign: "right" }}>
                        {product[field.key] ?? field.fallback}
                      </dd>
                    </div>
                  ))}
                </dl>
                <div style={{
                  marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(245,240,232,0.06)",
                  fontFamily: fonts.sans, fontSize: 11, color: colors.gold,
                  letterSpacing: "0.16em", textTransform: "uppercase",
                }}>
                  Price on request
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(245,240,232,0.3)", lineHeight: 1.8, marginTop: 28, maxWidth: 720 }}>
            The catalogue is indicative. Products, pack formats, suppliers and prices may change. Please contact us for current availability and commercial terms.
          </p>
        </div>
      </section>

      <CTABand
        heading="Need a different specification?"
        copy="Tell us the product, pack size, target market and approximate order volume. We can check what is available through our supplier network."
        label="Request a Quote"
        onClick={() => navigate("/quote")}
      />
    </div>
  );
}
