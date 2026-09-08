import { useState, useRef } from "react";
import FadeIn from "../components/FadeIn";
import { PageHero } from "../components/PageLayout";
import { submitContact } from "../api/client";
import { validateContactForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import { LIMITS } from "../constants/quoteForm";
import { colors, fonts } from "../theme";

const EMAIL = "enquiries@aurelialogistics.co.uk";

// Mirrors ContactCreate in backend/app/schemas.py.
const CONTACT_MAX = {
  name: LIMITS.NAME_MAX,
  email: LIMITS.EMAIL_MAX,
  company: LIMITS.COMPANY_MAX,
  message: LIMITS.MESSAGE_MAX,
};

const labelStyle = {
  fontFamily: fonts.sans, fontSize: 10, color: "rgba(245,240,232,0.35)",
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 7,
};

const PROMPTS = [
  {
    title: "If you are buying",
    copy: "Tell us what you need, where you need it, approximate quantity, and any specifications you already have.",
  },
  {
    title: "If you are supplying",
    copy: "Tell us what you manufacture, your export markets, relevant certifications, minimum order quantities and product catalogue.",
  },
];

export default function Contact() {
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
    fontFamily: fonts.sans, fontSize: 14, color: colors.cream,
    background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 3, padding: "13px 16px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s",
  };

  // An invalid field keeps a red border while unfocused so the message and the
  // input it refers to read as one unit.
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
    onFocus: (e) => { e.target.style.borderColor = colors.gold; },
    onBlur: (e) => {
      e.target.style.borderColor = fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)";
      revalidate(form);
    },
  });
  const contactError = (field) =>
    fieldErrors[field] ? (
      <p id={`contact-${field}-error`} style={{ fontFamily: fonts.sans, fontSize: 12, color: colors.error, margin: "6px 0 0" }}>
        {fieldErrors[field]}
      </p>
    ) : null;

  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <PageHero
        tag="Contact"
        title={<>Let's talk about your <span style={{ color: colors.gold, fontStyle: "italic" }}>requirement.</span></>}
        intro="Whether you are looking for a supplier in South Asia or represent a manufacturer looking to reach international buyers, we'd like to understand what you are working on."
      />

      <section style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 72, alignItems: "start" }} className="contact-grid">
            <div>
              <FadeIn>
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {PROMPTS.map((prompt) => (
                    <div key={prompt.title}>
                      <div style={{ fontFamily: fonts.sans, fontSize: 10, color: "rgba(200,150,62,0.65)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                        {prompt.title}
                      </div>
                      <p style={{ fontFamily: fonts.sans, fontSize: 15, color: "rgba(245,240,232,0.6)", lineHeight: 1.8, margin: 0 }}>
                        {prompt.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </FadeIn>
              <FadeIn delay={0.15}>
                <div style={{ marginTop: 36, paddingTop: 28, borderTop: "1px solid rgba(245,240,232,0.08)" }}>
                  <div style={{ fontFamily: fonts.sans, fontSize: 10, color: "rgba(200,150,62,0.6)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>
                    Email
                  </div>
                  <a href={`mailto:${EMAIL}`} style={{ fontFamily: fonts.sans, fontSize: 15, color: colors.cream, fontWeight: 500, textDecoration: "none" }}>
                    {EMAIL}
                  </a>
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.15} direction="left">
              {submitted ? (
                <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(200,150,62,0.2)", borderRadius: 10, padding: "56px 40px", textAlign: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDeep})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                    <span style={{ color: colors.forest, fontSize: 26, fontWeight: 700 }}>✓</span>
                  </div>
                  <h2 style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.cream, margin: "0 0 10px" }}>Enquiry Sent</h2>
                  <p style={{ fontFamily: fonts.sans, fontSize: 14, color: "rgba(245,240,232,0.45)", margin: 0 }}>
                    We review each enquiry individually. If we can support the requirement, we will come back with the next steps.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label htmlFor="contact-name" style={labelStyle}>Name *</label>
                      <input {...contactField("name")} required autoComplete="name" placeholder="Your name" />
                      {contactError("name")}
                    </div>
                    <div>
                      <label htmlFor="contact-email" style={labelStyle}>Work email *</label>
                      <input {...contactField("email")} type="email" required autoComplete="email" placeholder="you@company.com" />
                      {contactError("email")}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="contact-company" style={labelStyle}>Company</label>
                    <input {...contactField("company")} autoComplete="organization" placeholder="Company name" />
                    {contactError("company")}
                  </div>
                  <div>
                    <label htmlFor="contact-message" style={labelStyle}>Message *</label>
                    <textarea {...contactField("message")} rows={5} required placeholder="What are you working on?"
                      style={{ ...styleFor("message"), resize: "vertical" }} />
                    {contactError("message")}
                  </div>
                  {/* Announced on appearance — see the note in QuotePage. */}
                  <div role="alert" aria-live="assertive">
                    {error ? (
                      <p style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.error, margin: 0 }}>{error}</p>
                    ) : Object.keys(fieldErrors).length > 0 ? (
                      <p style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.error, margin: 0 }}>
                        Please correct the {Object.keys(fieldErrors).length === 1 ? "highlighted field" : "highlighted fields"} above.
                      </p>
                    ) : null}
                  </div>
                  <button type="submit" disabled={loading} style={{
                    fontFamily: fonts.sans, fontSize: 12, fontWeight: 600,
                    padding: "15px 36px", background: loading ? "rgba(200,150,62,0.4)" : `linear-gradient(135deg, ${colors.gold}, ${colors.goldDeep})`,
                    color: colors.forest, border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer",
                    letterSpacing: "0.15em", textTransform: "uppercase", alignSelf: "flex-start", transition: "all 0.3s",
                  }}>
                    {loading ? "Sending…" : "Send an Enquiry"}
                  </button>
                </form>
              )}
            </FadeIn>
          </div>
        </div>
      </section>
    </div>
  );
}
