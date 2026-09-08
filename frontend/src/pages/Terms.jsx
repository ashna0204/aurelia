import { PageHero } from "../components/PageLayout";
import { LegalBody, LegalClause } from "../components/LegalPage";
import { colors } from "../theme";

export default function Terms() {
  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <PageHero
        tag="Terms of Service"
        title={<>Terms of <span style={{ color: colors.gold, fontStyle: "italic" }}>service.</span></>}
        intro="This site is provided for informational and enquiry purposes only. No binding contracts are formed through the website."
      />

      <LegalBody>
        <LegalClause heading="What this website is">
          <p>The website provides information about Aurelia's sourcing and trade services. Product availability, specifications, pricing, supplier information and delivery arrangements are subject to confirmation in writing.</p>
        </LegalClause>

        <LegalClause heading="Enquiries">
          <p>An enquiry does not constitute an order.</p>
        </LegalClause>

        <LegalClause heading="Quotations">
          <p>A quotation is subject to the terms and validity period stated in the quotation.</p>
        </LegalClause>

        <LegalClause heading="Orders">
          <p>An order becomes binding only once accepted in writing.</p>
        </LegalClause>

        <LegalClause heading="Product information">
          <p>Final specifications, packaging, availability and documentation must be confirmed for each order. Anything shown on this website, including the food catalogue, is indicative rather than an offer to supply.</p>
        </LegalClause>

        <LegalClause heading="Third-party suppliers">
          <p>Where Aurelia introduces or sources products from third-party manufacturers, the relevant contractual and product responsibilities are defined in the written agreement covering that transaction. Aurelia does not assume the manufacturer's technical or product responsibility except where expressly agreed in writing.</p>
        </LegalClause>

        <LegalClause heading="Governing law">
          <p>England and Wales. Any disputes are subject to the exclusive jurisdiction of the English courts.</p>
        </LegalClause>

        <LegalClause heading="Contact">
          <p>For any question about these terms, email <a href="mailto:enquiries@aurelialogistics.co.uk" style={{ color: colors.gold }}>enquiries@aurelialogistics.co.uk</a>.</p>
        </LegalClause>
      </LegalBody>
    </div>
  );
}
