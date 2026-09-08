import { PageHero } from "../components/PageLayout";
import { LegalBody, LegalClause } from "../components/LegalPage";
import { colors } from "../theme";

export default function Privacy() {
  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <PageHero
        tag="Privacy Policy"
        title={<>How we handle your <span style={{ color: colors.gold, fontStyle: "italic" }}>information.</span></>}
        intro="This page explains what we collect when you contact us through this website, why we hold it, and what you can ask us to do with it."
      />

      <LegalBody>
        <LegalClause heading="Personal data we collect">
          <p>When you submit the enquiry or quote form we collect the details you enter: your name, work email address, and — where you provide them — your company, phone number, country, delivery location and the description of your requirement.</p>
          <p>Our servers also process your IP address for the limited technical purpose of rate-limiting abusive traffic. We do not build a profile from it.</p>
        </LegalClause>

        <LegalClause heading="Why we hold it, and our legal basis">
          <p>We use enquiry details solely to respond to your enquiry, to discuss a possible supply arrangement, and to keep a record of the correspondence. The legal basis is our legitimate interest in responding to a business enquiry you chose to send us, and — where a commercial discussion follows — taking steps at your request prior to entering into a contract.</p>
          <p>We do not sell, rent or share enquiry data with third parties for marketing purposes, and we do not use it for automated decision-making.</p>
        </LegalClause>

        <LegalClause heading="Cookies and analytics">
          <p>This website does not set advertising or analytics cookies, and does not run third-party analytics or tracking scripts.</p>
        </LegalClause>

        <LegalClause heading="Third parties that process data for us">
          <p>Enquiries are stored on our own hosting infrastructure and forwarded to us by email through our email provider. Web fonts on this site are loaded from Google Fonts, which means your browser makes a request to Google's servers when a page loads.</p>
        </LegalClause>

        <LegalClause heading="Retention">
          <p>Enquiry records are kept for as long as they remain commercially relevant to the discussion they relate to, and no longer than necessary for the purpose they were collected for. You can ask us to delete yours sooner.</p>
        </LegalClause>

        <LegalClause heading="International transfers">
          <p>Aurelia works with suppliers and buyers outside the UK. Where responding to your enquiry requires us to share your requirement with a supplier in another country, we share only what is needed to obtain a quotation, and we will tell you if that involves your contact details rather than the requirement alone.</p>
        </LegalClause>

        <LegalClause heading="Your rights">
          <p>Under UK data protection law you can ask us for a copy of the personal data we hold about you, ask us to correct it or delete it, ask us to restrict how we use it, or object to our use of it. You can also complain to the Information Commissioner's Office.</p>
        </LegalClause>

        <LegalClause heading="Contact">
          <p>For any request relating to your data, or any question about this policy, email <a href="mailto:enquiries@aurelialogistics.co.uk" style={{ color: colors.gold }}>enquiries@aurelialogistics.co.uk</a>.</p>
        </LegalClause>
      </LegalBody>
    </div>
  );
}
