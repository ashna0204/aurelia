import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import Hero from "../components/home/Hero";
import TradeRouteSection from "../components/home/TradeRouteSection";
import ContainerJourney from "../components/ContainerJourney";
import { submitContact } from "../api/client";
import { validateContactForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import spicesImg from "../assets/spices.jpg";
import autopartImg from "../assets/autopart.jpg";
import pharmaImg from "../assets/pharma.jpg";
import { LIMITS } from "../constants/quoteForm";

/* ─── Contact form ─── */
const contactLabelStyle = {
  fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)",
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 7,
};

// Mirrors ContactCreate in backend/app/schemas.py.
const CONTACT_MAX = {
  name: LIMITS.NAME_MAX,
  email: LIMITS.EMAIL_MAX,
  company: LIMITS.COMPANY_MAX,
  message: LIMITS.MESSAGE_MAX,
};


/* ─── ABOUT ─── */
function About() {
  const navigate = useNavigate();
  return (
    <section id="about" style={{ background: "#F5F0E8", padding: "110px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "radial-gradient(#071E12 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="about-grid">
          <div>
            <FadeIn><SectionTag label="Who We Are" light /></FadeIn>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 700, color: "#0A2E1C", lineHeight: 1.15, margin: "0 0 28px" }}>
                A different kind<br />of <span style={{ color: "#C8963E", fontStyle: "italic" }}>logistics partner.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(7,30,18,0.65)", lineHeight: 1.85, margin: "0 0 20px" }}>
                We don't just move freight. We understand the goods we carry — the cultural significance of a Kerala pantry staple, the precision tolerance of an OEM engine component, the cold-chain requirements of a pharmaceutical shipment.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, color: "rgba(7,30,18,0.65)", lineHeight: 1.85, margin: 0 }}>
                That domain knowledge, built over years of sourcing directly from manufacturers and growers across South Asia, is what separates Aurelia from a freight broker.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <button onClick={() => navigate("/specialisations")} style={{
                marginTop: 36, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                padding: "13px 32px", background: "#0A2E1C", color: "#F5F0E8",
                border: "none", borderRadius: 3, cursor: "pointer",
                letterSpacing: "0.16em", textTransform: "uppercase", transition: "all 0.3s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#C8963E"; e.currentTarget.style.color = "#071E12"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#0A2E1C"; e.currentTarget.style.color = "#F5F0E8"; }}
              >
                Explore Specialisations
              </button>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="left">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { v: "3", l: "Trade Sectors" },
                { v: "40+", l: "Countries Served" },
                { v: "200+", l: "B2B Partners" },
                { v: "99%", l: "On-Time Delivery" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: i % 2 === 0 ? "#0A2E1C" : "white",
                  borderRadius: 8, padding: "32px 24px",
                  boxShadow: i % 2 !== 0 ? "0 2px 20px rgba(7,30,18,0.06)" : "none",
                  border: i % 2 !== 0 ? "1px solid rgba(7,30,18,0.07)" : "none",
                  transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 38, fontWeight: 700, color: i % 2 === 0 ? "#C8963E" : "#0A2E1C", marginBottom: 6 }}>{s.v}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: i % 2 === 0 ? "rgba(245,240,232,0.55)" : "rgba(7,30,18,0.45)", letterSpacing: "0.16em", textTransform: "uppercase" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── SPECIALISATIONS PREVIEW ─── */
function SpecialisationsPreview() {
  const navigate = useNavigate();
  const cards = [
    {
      slug: "ethnic-food",
      label: "Ethnic Food & Grocery",
      sub: "Kerala dry goods · Spices · Snacks · Condiments",
      desc: "38 authenticated product lines sourced directly from growers and manufacturers across Kerala, Tamil Nadu, and Rajasthan.",
      tag: "38 Products",
      bg: spicesImg,
    },
    {
      slug: "vehicle-parts",
      label: "Vehicle Parts",
      sub: "Tyres · Braking · Engine · Electrical",
      desc: "OEM-quality automotive components from India's leading manufacturers — for commercial, passenger, and two-wheeler fleets.",
      tag: "6 Categories",
      bg: autopartImg,
    },
    {
      slug: "pharmaceuticals",
      label: "Pharmaceuticals",
      sub: "Generics · Ayurvedic · APIs · Consumables",
      desc: "WHO-GMP and USFDA-certified pharmaceutical products — from finished formulations to active pharmaceutical ingredients.",
      tag: "6 Categories",
      bg: pharmaImg,
    },
  ];

  return (
    <section style={{ background: "#071E12", padding: "110px 24px", position: "relative" }}>
      <div style={{ position: "absolute", top: "-15%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(200,150,62,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        <FadeIn><SectionTag label="Areas of Specialisation" /></FadeIn>
        <FadeIn delay={0.1}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 50px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.15, margin: "0 0 56px" }}>
            Three sectors.<br /><span style={{ color: "#C8963E", fontStyle: "italic" }}>One trusted partner.</span>
          </h2>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {cards.map((c, i) => (
            <FadeIn key={c.slug} delay={0.08 + i * 0.1}>
              <div
                onClick={() => navigate(`/specialisations/${c.slug}`)}
                style={{
                  borderRadius: 10, overflow: "hidden", cursor: "pointer",
                  background: "rgba(245,240,232,0.03)",
                  border: "1px solid rgba(245,240,232,0.06)",
                  transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(200,150,62,0.28)";
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(245,240,232,0.06)";
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ height: 200, position: "relative", overflow: "hidden" }}>
                  <img src={c.bg} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1)" }}
                    onMouseEnter={(e) => e.target.style.transform = "scale(1.06)"}
                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(7,30,18,0.85) 0%, rgba(7,30,18,0.2) 60%)" }} />
                  <span style={{
                    position: "absolute", top: 14, right: 14,
                    fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.9)",
                    letterSpacing: "0.2em", textTransform: "uppercase",
                    background: "rgba(200,150,62,0.12)", backdropFilter: "blur(8px)",
                    padding: "5px 12px", borderRadius: 20, border: "1px solid rgba(200,150,62,0.2)",
                  }}>
                    {c.tag}
                  </span>
                </div>
                <div style={{ padding: "24px 28px 28px" }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.65)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{c.sub}</div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 600, color: "#F5F0E8", margin: "0 0 12px" }}>{c.label}</h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.42)", lineHeight: 1.7, margin: "0 0 20px" }}>{c.desc}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#C8963E", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    <span>View Products</span>
                    <span style={{ fontSize: 14 }}>→</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── QUOTE CTA BANNER ─── */
function QuoteCTA() {
  const navigate = useNavigate();
  return (
    <section style={{ background: "#0A2212", borderTop: "1px solid rgba(200,150,62,0.1)", borderBottom: "1px solid rgba(200,150,62,0.1)", padding: "80px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <FadeIn>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, letterSpacing: "0.28em", color: "rgba(200,150,62,0.6)", textTransform: "uppercase", marginBottom: 20 }}>Ready to Import?</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 20px" }}>
            Tell us what you need.<br />
            <span style={{ color: "#C8963E", fontStyle: "italic" }}>We'll handle the rest.</span>
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.45)", margin: "0 0 40px", lineHeight: 1.7 }}>
            From a single container to a recurring supply contract — request a quote and our trade team will respond within 24 hours.
          </p>
          <button onClick={() => navigate("/quote")} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            padding: "17px 44px", background: "linear-gradient(135deg, #C8963E, #A67B2E)",
            color: "#071E12", border: "none", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.15em", textTransform: "uppercase",
            boxShadow: "0 4px 24px rgba(200,150,62,0.22)", transition: "all 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,150,62,0.32)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,150,62,0.22)"; }}
          >
            Request a Quote
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/* ─── CONTACT ─── */
function HomeContact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const fieldRefs = useRef({});

  const { loading, submitted, error, fieldErrors, handleSubmit, revalidate } = useFormSubmit({
    validate: validateContactForm,
    submit: submitContact,
    onValidationError: (field) => {
      const el = fieldRefs.current[field];
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  });

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(form);
  };

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "white",
    background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 3, padding: "13px 16px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s",
  };

  // Same pattern as the quote form: an invalid field keeps a red border while
  // unfocused so the message and the input it refers to read as one unit.
  const styleFor = (field) => ({
    ...inputStyle,
    borderColor: fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)",
  });
  const contactField = (field) => ({
    id: `contact-${field}`,
    ref: (el) => { fieldRefs.current[field] = el; },
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    maxLength: CONTACT_MAX[field],
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `contact-${field}-error` : undefined,
    style: styleFor(field),
    onFocus: (e) => { e.target.style.borderColor = "#C8963E"; },
    onBlur: (e) => {
      e.target.style.borderColor = fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)";
      revalidate(form);
    },
  });
  const contactError = (field) =>
    fieldErrors[field] ? (
      <p id={`contact-${field}-error`} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#e07060", margin: "6px 0 0" }}>
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <section id="contact" style={{ background: "#071E12", padding: "100px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 80, alignItems: "start" }} className="contact-grid">
          <div>
            <FadeIn><SectionTag label="Contact Us" /></FadeIn>
            <FadeIn delay={0.1}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, color: "#F5F0E8", margin: "0 0 28px" }}>
                Get in <span style={{ color: "#C8963E", fontStyle: "italic" }}>touch.</span>
              </h2>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {[
                  { icon: "✉", label: "Email", value: "enquiries@aurelialogistics.co.uk", sub: "For trade enquiries and partnerships" },
                  { icon: "◉", label: "Headquarters", value: "Kochi, Kerala, India", sub: "Offices in Mumbai, Dubai & London" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(200,150,62,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "#C8963E", fontSize: 18 }}>{item.icon}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(200,150,62,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#F5F0E8", fontWeight: 500, marginBottom: 3 }}>{item.value}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.35)" }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.15} direction="left">
            {submitted ? (
              <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(200,150,62,0.2)", borderRadius: 10, padding: "56px 40px", textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #C8963E, #A67B2E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                  <span style={{ color: "#071E12", fontSize: 26, fontWeight: 700 }}>✓</span>
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F5F0E8", margin: "0 0 10px" }}>Message Sent</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,240,232,0.45)", margin: 0 }}>We'll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label htmlFor="contact-name" style={contactLabelStyle}>Name *</label>
                    <input {...contactField("name")} required autoComplete="name" placeholder="Your name" />
                    {contactError("name")}
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={contactLabelStyle}>Email *</label>
                    <input {...contactField("email")} type="email" required autoComplete="email" placeholder="you@company.com" />
                    {contactError("email")}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-company" style={contactLabelStyle}>Company</label>
                  <input {...contactField("company")} autoComplete="organization" placeholder="Company name" />
                  {contactError("company")}
                </div>
                <div>
                  <label htmlFor="contact-message" style={contactLabelStyle}>Message *</label>
                  <textarea {...contactField("message")} rows={4} required placeholder="How can we help?"
                    style={{ ...styleFor("message"), resize: "vertical" }} />
                  {contactError("message")}
                </div>
                {/* Announced on appearance — see the note in QuotePage. */}
                <div role="alert" aria-live="assertive">
                  {error ? (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e07060", margin: 0 }}>{error}</p>
                  ) : Object.keys(fieldErrors).length > 0 ? (
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e07060", margin: 0 }}>
                      Please correct the {Object.keys(fieldErrors).length === 1 ? "highlighted field" : "highlighted fields"} above.
                    </p>
                  ) : null}
                </div>
                <button type="submit" disabled={loading} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                  padding: "15px 36px", background: loading ? "rgba(200,150,62,0.4)" : "linear-gradient(135deg, #C8963E, #A67B2E)",
                  color: "#071E12", border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer",
                  letterSpacing: "0.15em", textTransform: "uppercase", alignSelf: "flex-start", transition: "all 0.3s",
                }}>
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/* ─── HOME PAGE ─── */
export default function Home() {
  return (
    <>
      <Hero />
      <ContainerJourney />
      <TradeRouteSection />
      <About />
      <SpecialisationsPreview />
      <QuoteCTA />
      <HomeContact />
    </>
  );
}
