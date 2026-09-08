import { Link } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";

export default function NotFound() {
  return (
    <div style={{ background: "#071E12", minHeight: "100vh", paddingTop: 72, display: "flex", alignItems: "center" }}>
      <section style={{ padding: "80px 24px 120px", width: "100%" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <FadeIn><SectionTag label="Error 404" /></FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 16px" }}>
              This page has<br />gone <span style={{ color: "#C8963E", fontStyle: "italic" }}>astray.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.42)", lineHeight: 1.75, margin: "0 0 40px", maxWidth: 480 }}>
              The page you're looking for doesn't exist or has been moved. Let's get you back on route.
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, textDecoration: "none",
                padding: "15px 36px", background: "linear-gradient(135deg, #C8963E, #A67B2E)",
                color: "#071E12", borderRadius: 3, letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
                Back to Home
              </Link>
              <Link to="/expertise" style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, textDecoration: "none",
                padding: "15px 36px", background: "transparent", color: "#C8963E",
                border: "1px solid rgba(200,150,62,0.3)", borderRadius: 3,
                letterSpacing: "0.15em", textTransform: "uppercase",
              }}>
                Areas of Expertise
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
