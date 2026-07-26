import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { submitQuote } from "../api/client";
import { validateQuoteForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import {
  SECTORS,
  VOLUMES,
  FREQUENCIES,
  LIMITS,
  MIN_FILL_MS,
  HONEYPOT_FIELD,
  composeMessage,
} from "../constants/quoteForm";

const EMPTY_FORM = {
  name: "", email: "", company: "", phone: "",
  sector: "", description: "", volume: "", frequency: "", destination: "", notes: "",
  [HONEYPOT_FIELD]: "",
};

const labelStyle = {
  fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.35)",
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8,
};

const errorTextStyle = {
  fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#e07060",
  margin: "6px 0 0", lineHeight: 1.4,
};

const counterStyle = (over) => ({
  fontFamily: "'DM Sans', sans-serif", fontSize: 11, margin: "6px 0 0", textAlign: "right",
  color: over ? "#e07060" : "rgba(245,240,232,0.3)",
});

// Off-screen rather than display:none — a bot filling every input it can find
// will fill this one, but it is unreachable by pointer, keyboard and screen
// reader alike. Any value here makes the server discard the submission.
const honeypotStyle = {
  position: "absolute", left: "-9999px", top: 0,
  width: 1, height: 1, opacity: 0, overflow: "hidden", pointerEvents: "none",
};

const visuallyHiddenRadio = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

/** Inline error beneath a field, referenced by that field's aria-describedby. */
function FieldError({ field, errors }) {
  if (!errors[field]) return null;
  return <p id={`${field}-error`} style={errorTextStyle}>{errors[field]}</p>;
}

export default function QuotePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [focusedSector, setFocusedSector] = useState(null);

  // Refs to the focusable element of each field, so a failed validation can put
  // the cursor on the first thing that needs fixing rather than leaving the
  // user to hunt for it on a form this tall.
  const fieldRefs = useRef({});
  // Set in an effect rather than at render time: reading the clock during
  // render is impure, and mount is the moment we actually want to measure from.
  const mountedAt = useRef(null);
  useEffect(() => { mountedAt.current = Date.now(); }, []);
  const [tooFast, setTooFast] = useState(false);

  const { loading, submitted, error, fieldErrors, attempted, handleSubmit, revalidate } = useFormSubmit({
    validate: validateQuoteForm,
    onValidationError: (field) => {
      const el = fieldRefs.current[field];
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    submit: (values) =>
      submitQuote({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        phone: values.phone.trim(),
        products: [values.sector],
        volume: values.volume,
        frequency: values.frequency,
        destination: values.destination.trim(),
        message: composeMessage(values),
        [HONEYPOT_FIELD]: values[HONEYPOT_FIELD],
      }),
  });

  const inputStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#F5F0E8",
    background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)",
    borderRadius: 3, padding: "13px 16px", width: "100%", boxSizing: "border-box",
    outline: "none", transition: "border-color 0.3s",
  };
  // An invalid field keeps its red border even when unfocused, so the error
  // message and the field it belongs to read as one thing.
  const styleFor = (field) => ({
    ...inputStyle,
    borderColor: fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)",
  });
  const focus = (e) => (e.target.style.borderColor = "#C8963E");
  const blurOf = (field) => (e) => {
    e.target.style.borderColor = fieldErrors[field] ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)";
    revalidate(form);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const bindRef = (field) => (el) => { fieldRefs.current[field] = el; };

  /** Wires a field to its label, its error message and its counter. */
  const describedBy = (field, extra) =>
    [fieldErrors[field] && `${field}-error`, extra].filter(Boolean).join(" ") || undefined;

  const fieldProps = (field, extra) => ({
    id: field,
    ref: bindRef(field),
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": describedBy(field, extra),
    style: styleFor(field),
    onFocus: focus,
    onBlur: blurOf(field),
  });

  const onSubmit = (e) => {
    e.preventDefault();

    // Bot speed bump, checked only once the form is otherwise valid — a bot
    // would trip the field rules first anyway, and a real user who somehow hits
    // this just submits again a moment later. `?? 0` makes a not-yet-run mount
    // effect read as "long ago", i.e. never a false positive.
    const valid = Object.keys(validateQuoteForm(form)).length === 0;
    const tooSoon = valid && Date.now() - (mountedAt.current ?? 0) < MIN_FILL_MS;
    setTooFast(tooSoon);
    if (tooSoon) return;

    handleSubmit(form);
  };

  const selectSector = (s) => {
    const next = { ...form, sector: s };
    setForm(next);
    // Selecting a sector should clear the "please select a sector" error
    // immediately rather than waiting for a blur that may never come.
    revalidate(next);
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
                  Sector: {form.sector}
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

                {/* Sector — real radios inside a fieldset, so the group is announced
                    as one required choice and arrow keys move between options. The
                    inputs are visually hidden; the styled label is the pill. */}
                <fieldset
                  style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}
                  aria-describedby={describedBy("sector")}
                >
                  <legend style={{ ...labelStyle, marginBottom: 12, padding: 0 }}>Sector *</legend>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {SECTORS.map((s, i) => {
                      const selected = form.sector === s;
                      return (
                        <label key={s} style={{
                          fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                          padding: "10px 18px", borderRadius: 40, cursor: "pointer", transition: "all 0.25s",
                          background: selected ? "rgba(200,150,62,0.15)" : "rgba(245,240,232,0.04)",
                          border: selected ? "1px solid #C8963E" : `1px solid ${fieldErrors.sector ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)"}`,
                          color: selected ? "#C8963E" : "rgba(245,240,232,0.52)",
                          outline: focusedSector === s ? "2px solid #C8963E" : "none",
                          outlineOffset: 2,
                        }}>
                          <input
                            type="radio"
                            name="sector"
                            value={s}
                            checked={selected}
                            required
                            // Only the first radio needs a ref: focusing it puts
                            // the user in the group, and arrow keys do the rest.
                            ref={i === 0 ? bindRef("sector") : undefined}
                            aria-invalid={fieldErrors.sector ? true : undefined}
                            onChange={() => selectSector(s)}
                            onFocus={() => setFocusedSector(s)}
                            onBlur={() => setFocusedSector(null)}
                            style={visuallyHiddenRadio}
                          />
                          {selected ? "✓ " : ""}{s}
                        </label>
                      );
                    })}
                  </div>
                  <FieldError field="sector" errors={fieldErrors} />
                </fieldset>

                {/* Requirement description */}
                <div>
                  <label htmlFor="description" style={labelStyle}>What do you need? *</label>
                  <textarea
                    {...fieldProps("description", "description-counter")}
                    value={form.description}
                    onChange={set("description")}
                    rows={4}
                    required
                    maxLength={LIMITS.DESCRIPTION_MAX}
                    placeholder="e.g. 500kg Matta Rice + 200kg Toor Dall, FOB Kochi — or — 500 sets brake pads for Toyota Hilux — or — Paracetamol 500mg tablets, 1M units, WHO-GMP, for Kenya"
                    style={{ ...styleFor("description"), resize: "vertical" }}
                  />
                  <FieldError field="description" errors={fieldErrors} />
                  <p id="description-counter" style={counterStyle(form.description.length >= LIMITS.DESCRIPTION_MAX)}>
                    {form.description.length.toLocaleString()} / {LIMITS.DESCRIPTION_MAX.toLocaleString()}
                  </p>
                </div>

                {/* Contact details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label htmlFor="name" style={labelStyle}>Full Name *</label>
                    <input
                      {...fieldProps("name")}
                      value={form.name}
                      onChange={set("name")}
                      required
                      maxLength={LIMITS.NAME_MAX}
                      autoComplete="name"
                      placeholder="Your name"
                    />
                    <FieldError field="name" errors={fieldErrors} />
                  </div>
                  <div>
                    <label htmlFor="email" style={labelStyle}>Email *</label>
                    <input
                      {...fieldProps("email")}
                      value={form.email}
                      onChange={set("email")}
                      type="email"
                      required
                      maxLength={LIMITS.EMAIL_MAX}
                      autoComplete="email"
                      placeholder="you@company.com"
                    />
                    <FieldError field="email" errors={fieldErrors} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label htmlFor="company" style={labelStyle}>Company</label>
                    <input
                      {...fieldProps("company")}
                      value={form.company}
                      onChange={set("company")}
                      maxLength={LIMITS.COMPANY_MAX}
                      autoComplete="organization"
                      placeholder="Company Ltd."
                    />
                    <FieldError field="company" errors={fieldErrors} />
                  </div>
                  <div>
                    <label htmlFor="phone" style={labelStyle}>Phone</label>
                    <input
                      {...fieldProps("phone")}
                      value={form.phone}
                      onChange={set("phone")}
                      type="tel"
                      maxLength={LIMITS.PHONE_MAX}
                      autoComplete="tel"
                      placeholder="+44 7XXX XXXXXX"
                    />
                    <FieldError field="phone" errors={fieldErrors} />
                  </div>
                </div>

                {/* Logistics details */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <label htmlFor="volume" style={labelStyle}>Est. Volume</label>
                    <select
                      {...fieldProps("volume")}
                      value={form.volume}
                      onChange={set("volume")}
                      style={{ ...styleFor("volume"), appearance: "none", cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      {VOLUMES.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="frequency" style={labelStyle}>Frequency</label>
                    <select
                      {...fieldProps("frequency")}
                      value={form.frequency}
                      onChange={set("frequency")}
                      style={{ ...styleFor("frequency"), appearance: "none", cursor: "pointer" }}
                    >
                      <option value="">Select…</option>
                      {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="destination" style={labelStyle}>Destination</label>
                    <input
                      {...fieldProps("destination")}
                      value={form.destination}
                      onChange={set("destination")}
                      maxLength={LIMITS.DESTINATION_MAX}
                      placeholder="Country / Port"
                    />
                    <FieldError field="destination" errors={fieldErrors} />
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" style={labelStyle}>Additional Notes</label>
                  <textarea
                    {...fieldProps("notes", "notes-counter")}
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    maxLength={LIMITS.NOTES_MAX}
                    placeholder="Certifications required, Incoterms preference, special handling, packaging specs…"
                    style={{ ...styleFor("notes"), resize: "vertical" }}
                  />
                  <FieldError field="notes" errors={fieldErrors} />
                  <p id="notes-counter" style={counterStyle(form.notes.length >= LIMITS.NOTES_MAX)}>
                    {form.notes.length.toLocaleString()} / {LIMITS.NOTES_MAX.toLocaleString()}
                  </p>
                </div>

                {/* Honeypot — see honeypotStyle. Not a real field. */}
                <div style={honeypotStyle} aria-hidden="true">
                  <label htmlFor={HONEYPOT_FIELD}>Website</label>
                  <input
                    id={HONEYPOT_FIELD}
                    name={HONEYPOT_FIELD}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form[HONEYPOT_FIELD]}
                    onChange={set(HONEYPOT_FIELD)}
                  />
                </div>

                {/* Form-level status. role="alert" so it is announced when it
                    appears — a silently-rendered error is invisible to a screen
                    reader user, who then has no idea why nothing happened. */}
                <div role="alert" aria-live="assertive">
                  {error ? (
                    <p style={{ ...errorTextStyle, fontSize: 13, margin: 0 }}>{error}</p>
                  ) : tooFast ? (
                    <p style={{ ...errorTextStyle, fontSize: 13, margin: 0 }}>
                      That was submitted unusually quickly. Please review your details and submit again.
                    </p>
                  ) : attempted && Object.keys(fieldErrors).length > 0 ? (
                    <p style={{ ...errorTextStyle, fontSize: 13, margin: 0 }}>
                      Please correct the {Object.keys(fieldErrors).length === 1 ? "highlighted field" : `${Object.keys(fieldErrors).length} highlighted fields`} above.
                    </p>
                  ) : null}
                </div>

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
