import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { submitQuote } from "../api/client";
import { validateQuoteForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";

const SECTORS = ["Ethnic Food & Grocery", "Vehicle Parts & Accessories", "Pharmaceuticals & Healthcare", "Multiple / Other"];
const VOLUMES = ["< 1 MT / small consignment", "1 – 5 MT", "5 – 20 MT", "20 – 100 MT", "100+ MT / contract supply"];
const FREQUENCIES = ["One-time", "Monthly", "Quarterly", "Ongoing contract"];

export default function QuotePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "",
    sector: "", description: "", volume: "", frequency: "", destination: "", notes: "",
  });

  const { loading, submitted, error, handleSubmit } = useFormSubmit({
    validate: validateQuoteForm,
    submit: (values) => {
      const products = values.sector ? [values.sector] : ["General enquiry"];
      const message = [values.description, values.notes ? `Notes: ${values.notes}` : ""]
        .filter(Boolean)
        .join("\n\n");
      return submitQuote({
        name: values.name,
        email: values.email,
        company: values.company,
        phone: values.phone,
        products,
        volume: values.volume,
        frequency: values.frequency,
        destination: values.destination,
        message,
      });
    },
  });

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F5F0E8",
    background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 3, padding: "13px 16px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s",
  };
  const focus = (e) => e.target.style.borderColor = "#C8963E";
  const blur = (e) => e.target.style.borderColor = "rgba(245,240,232,0.1)";
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(form);
  };

  return (
    <div style={{ background: "#071E12", minHeight: "100vh", paddingTop: 72 }}>
      <section style={{ padding: "72px 24px 100px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <button type="button" onClick={() => navigate(-1)} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(200,150,62,0.65)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 32, padding: 0 }}>
            ← Back
          </button>

          <FadeIn><SectionTag label="Request a Quote" /></FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 700, color: "#F5F0E8", lineHeight: 1.1, margin: "0 0 16px" }}>
              Tell us what<br />you <span style={{ color: "#C8963E", fontStyle: "italic" }}>need.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.42)", lineHeight: 1.75, margin: "0 0 56px", maxWidth: 500 }}>
              Describe your requirement — sector, product, volume, destination. Our trade team responds within 24 hours.
            </p>
          </FadeIn>

          {submitted ? (
            <FadeIn>
              <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(200,150,62,0.2)", borderRadius: 10, padding: "72px 48px", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg, #C8963E, #A67B2E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                  <span style={{ color: "#071E12", fontSize: 32, fontWeight: 700 }}>✓</span>
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#F5F0E8", margin: "0 0 14px" }}>Quote Request Received</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,240,232,0.45)", margin: "0 0 8px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
                  Our trade team will review your requirements and respond with a detailed quotation within one business day.
                </p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(200,150,62,0.65)", marginTop: 12 }}>
                  Sector: {form.sector || "General enquiry"}
                </p>
                <button type="button" onClick={() => navigate("/")} style={{
                  marginTop: 32, fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600,
                  padding: "13px 32px", background: "transparent", color: "#C8963E",
                  border: "1px solid rgba(200,150,62,0.3)", borderRadius: 3, cursor: "pointer",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                }}>
                  Back to Home
                </button>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 24 }}>

                {/* Sector */}
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 12 }}>Sector *</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {SECTORS.map((s) => (
                      // type="button" — inside a <form>, buttons submit by default.
                      <button key={s} type="button" aria-pressed={form.sector === s} onClick={() => setForm({ ...form, sector: s })} style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                        padding: "10px 18px", borderRadius: 40, cursor: "pointer", transition: "all 0.25s",
                        background: form.sector === s ? "rgba(200,150,62,0.15)" : "rgba(245,240,232,0.04)",
                        border: form.sector === s ? "1px solid #C8963E" : "1px solid rgba(245,240,232,0.1)",
                        color: form.sector === s ? "#C8963E" : "rgba(245,240,232,0.52)",
                      }}>
                        {form.sector === s ? "✓ " : ""}{s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Requirement description */}
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                    What do you need? *
                  </label>
                  <textarea value={form.description} onChange={set("description")} rows={4} required
                    placeholder="e.g. 500kg Matta Rice + 200kg Toor Dall, FOB Kochi — or — 500 sets brake pads for Toyota Hilux — or — Paracetamol 500mg tablets, 1M units, WHO-GMP, for Kenya"
                    style={{ ...inputStyle, resize: "vertical" }} onFocus={focus} onBlur={blur} />
                </div>

                {/* Contact details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Full Name *</label>
                    <input value={form.name} onChange={set("name")} required autoComplete="name" placeholder="Your name" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email *</label>
                    <input value={form.email} onChange={set("email")} type="email" required autoComplete="email" placeholder="you@company.com" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Company</label>
                    <input value={form.company} onChange={set("company")} autoComplete="organization" placeholder="Company Ltd." style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Phone</label>
                    <input value={form.phone} onChange={set("phone")} type="tel" autoComplete="tel" placeholder="+44 7XXX XXXXXX" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>

                {/* Logistics details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Est. Volume</label>
                    <select value={form.volume} onChange={set("volume")} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} onFocus={focus} onBlur={blur}>
                      <option value="">Select…</option>
                      {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Frequency</label>
                    <select value={form.frequency} onChange={set("frequency")} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }} onFocus={focus} onBlur={blur}>
                      <option value="">Select…</option>
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Destination</label>
                    <input value={form.destination} onChange={set("destination")} placeholder="Country / Port" style={inputStyle} onFocus={focus} onBlur={blur} />
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Additional Notes</label>
                  <textarea value={form.notes} onChange={set("notes")} rows={3}
                    placeholder="Certifications required, Incoterms preference, special handling, packaging specs…"
                    style={{ ...inputStyle, resize: "vertical" }} onFocus={focus} onBlur={blur} />
                </div>

                {error && <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e07060", margin: 0 }}>{error}</p>}

                <button type="submit" disabled={loading} style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  padding: "18px 48px", alignSelf: "flex-start",
                  background: loading ? "rgba(200,150,62,0.4)" : "linear-gradient(135deg, #C8963E, #A67B2E)",
                  color: "#071E12", border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                  boxShadow: "0 4px 24px rgba(200,150,62,0.2)", transition: "all 0.3s",
                }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,150,62,0.3)"; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,150,62,0.2)"; }}
                >
                  {loading ? "Submitting…" : "Submit Quote Request"}
                </button>
              </form>
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  );
}
