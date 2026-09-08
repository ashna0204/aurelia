import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import FadeIn from "../components/FadeIn";
import SectionTag from "../components/SectionTag";
import { submitQuote } from "../api/client";
import { validateQuoteForm } from "../utils/validation";
import { useFormSubmit } from "../hooks/useFormSubmit";
import {
  SECTORS,
  LIMITS,
  MIN_FILL_MS,
  HONEYPOT_FIELD,
  composeMessage,
} from "../constants/quoteForm";
import { colors, fonts } from "../theme";

const EMAIL = "enquiries@aurelialogistics.co.uk";

const EMPTY_FORM = {
  name: "", company: "", email: "", phone: "", country: "",
  sector: "", specification: "", quantity: "", targetMarket: "",
  packaging: "", destination: "", deliveryDate: "", notes: "",
  [HONEYPOT_FIELD]: "",
};

const labelStyle = {
  fontFamily: fonts.sans, fontSize: 10, color: "rgba(245,240,232,0.35)",
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 8,
};

const legendStyle = {
  fontFamily: fonts.sans, fontSize: 10, color: "rgba(200,150,62,0.7)",
  letterSpacing: "0.24em", textTransform: "uppercase", padding: 0, marginBottom: 22,
};

const errorTextStyle = {
  fontFamily: fonts.sans, fontSize: 12, color: colors.error,
  margin: "6px 0 0", lineHeight: 1.4,
};

const counterStyle = (over) => ({
  fontFamily: fonts.sans, fontSize: 11, margin: "6px 0 0", textAlign: "right",
  color: over ? colors.error : "rgba(245,240,232,0.3)",
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

/** A labelled group of fields — "Your details", "Your requirement". */
function FieldSet({ legend, children }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 20 }}>
      <legend style={legendStyle}>{legend}</legend>
      {children}
    </fieldset>
  );
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
    // Everything the API has no column for is folded into `message` by
    // composeMessage, so the trade team still sees it on the notification.
    submit: (values) =>
      submitQuote({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        phone: values.phone.trim(),
        products: [values.sector],
        destination: values.destination.trim(),
        message: composeMessage(values),
        [HONEYPOT_FIELD]: values[HONEYPOT_FIELD],
      }),
  });

  const inputStyle = {
    fontFamily: fonts.sans, fontSize: 14, color: colors.cream,
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
  const focus = (e) => (e.target.style.borderColor = colors.gold);
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
    value: form[field],
    onChange: set(field),
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": describedBy(field, extra),
    style: styleFor(field),
    onFocus: focus,
    onBlur: blurOf(field),
  });

  /**
   * A labelled single-line input with its inline error.
   *
   * Called as a function, not rendered as `<TextField />`: a component defined
   * inside the render closure is a new type on every keystroke, which remounts
   * the input and drops the caret.
   */
  const textField = ({ field, label, required, maxLength, ...rest }) => (
    <div key={field}>
      <label htmlFor={field} style={labelStyle}>{label}{required ? " *" : ""}</label>
      <input {...fieldProps(field)} required={required} maxLength={maxLength} {...rest} />
      <FieldError field={field} errors={fieldErrors} />
    </div>
  );

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
    // Selecting a category should clear the "please select" error immediately
    // rather than waiting for a blur that may never come.
    revalidate(next);
  };

  return (
    <div style={{ background: colors.forest, minHeight: "100vh", paddingTop: 72 }}>
      <section style={{ padding: "72px 24px 100px" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <button type="button" onClick={() => navigate(-1)} style={{ fontFamily: fonts.sans, fontSize: 11, color: "rgba(200,150,62,0.65)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 32, padding: 0 }}>
            ← Back
          </button>

          <FadeIn><SectionTag label="Request a Quote" /></FadeIn>
          <FadeIn delay={0.1}>
            <h1 style={{ fontFamily: fonts.serif, fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 700, color: colors.cream, lineHeight: 1.1, margin: "0 0 16px" }}>
              Tell us what you are <span style={{ color: colors.gold, fontStyle: "italic" }}>looking for.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p style={{ fontFamily: fonts.sans, fontSize: 16, color: "rgba(245,240,232,0.45)", lineHeight: 1.8, margin: "0 0 56px", maxWidth: 520 }}>
              The more detail you can provide, the more useful our response can be.
            </p>
          </FadeIn>

          {submitted ? (
            <FadeIn>
              <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(200,150,62,0.2)", borderRadius: 10, padding: "72px 48px", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDeep})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px" }}>
                  <span style={{ color: colors.forest, fontSize: 32, fontWeight: 700 }}>✓</span>
                </div>
                <h2 style={{ fontFamily: fonts.serif, fontSize: 28, color: colors.cream, margin: "0 0 14px" }}>Enquiry Received</h2>
                <p style={{ fontFamily: fonts.sans, fontSize: 16, color: "rgba(245,240,232,0.45)", margin: "0 auto", maxWidth: 440, lineHeight: 1.8 }}>
                  We review each enquiry individually. If we can support the requirement, we will come back with the next steps.
                </p>
                <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(200,150,62,0.65)", marginTop: 14 }}>
                  Product or category: {form.sector}
                </p>
                <button type="button" onClick={() => navigate("/")} style={{
                  marginTop: 32, fontFamily: fonts.sans, fontSize: 12, fontWeight: 600,
                  padding: "13px 32px", background: "transparent", color: colors.gold,
                  border: "1px solid rgba(200,150,62,0.3)", borderRadius: 3, cursor: "pointer",
                  letterSpacing: "0.15em", textTransform: "uppercase",
                }}>
                  Back to Home
                </button>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 48 }}>

                <FieldSet legend="Your details">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {textField({ field: "name", label: "Name", required: true, maxLength: LIMITS.NAME_MAX, autoComplete: "name", placeholder: "Your name" })}
                    {textField({ field: "company", label: "Company", maxLength: LIMITS.COMPANY_MAX, autoComplete: "organization", placeholder: "Company Ltd." })}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {textField({ field: "email", label: "Work email", required: true, type: "email", maxLength: LIMITS.EMAIL_MAX, autoComplete: "email", placeholder: "you@company.com" })}
                    {textField({ field: "phone", label: "Phone", type: "tel", maxLength: LIMITS.PHONE_MAX, autoComplete: "tel", placeholder: "+44 7XXX XXXXXX" })}
                  </div>
                  {textField({ field: "country", label: "Country", maxLength: LIMITS.COUNTRY_MAX, autoComplete: "country-name", placeholder: "Where you are based" })}
                </FieldSet>

                <FieldSet legend="Your requirement">
                  {/* Product or category — real radios inside a fieldset, so the
                      group is announced as one required choice and arrow keys
                      move between options. The inputs are visually hidden; the
                      styled label is the pill. */}
                  <fieldset
                    style={{ border: "none", padding: 0, margin: 0, minWidth: 0 }}
                    aria-describedby={describedBy("sector")}
                  >
                    <legend style={{ ...labelStyle, marginBottom: 12, padding: 0 }}>Product or category *</legend>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {SECTORS.map((s, i) => {
                        const selected = form.sector === s;
                        return (
                          <label key={s} style={{
                            fontFamily: fonts.sans, fontSize: 13, fontWeight: 500,
                            padding: "10px 18px", borderRadius: 40, cursor: "pointer", transition: "all 0.25s",
                            background: selected ? "rgba(200,150,62,0.15)" : "rgba(245,240,232,0.04)",
                            border: selected ? `1px solid ${colors.gold}` : `1px solid ${fieldErrors.sector ? "rgba(224,112,96,0.6)" : "rgba(245,240,232,0.1)"}`,
                            color: selected ? colors.gold : "rgba(245,240,232,0.52)",
                            outline: focusedSector === s ? `2px solid ${colors.gold}` : "none",
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

                  <div>
                    <label htmlFor="specification" style={labelStyle}>Product specification *</label>
                    <textarea
                      {...fieldProps("specification", "specification-counter")}
                      rows={5}
                      required
                      maxLength={LIMITS.SPECIFICATION_MAX}
                      placeholder="What the product is, and any specification you already have — grade, part number, vehicle make and model, botanical source, intended use."
                      style={{ ...styleFor("specification"), resize: "vertical" }}
                    />
                    <FieldError field="specification" errors={fieldErrors} />
                    <p id="specification-counter" style={counterStyle(form.specification.length >= LIMITS.SPECIFICATION_MAX)}>
                      {form.specification.length.toLocaleString()} / {LIMITS.SPECIFICATION_MAX.toLocaleString()}
                    </p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {textField({ field: "quantity", label: "Quantity", maxLength: LIMITS.QUANTITY_MAX, placeholder: "e.g. 500 kg, 2 × 20ft container" })}
                    {textField({ field: "targetMarket", label: "Target market", maxLength: LIMITS.TARGET_MARKET_MAX, placeholder: "Where the product will be sold" })}
                  </div>

                  {textField({ field: "packaging", label: "Packaging requirements", maxLength: LIMITS.PACKAGING_MAX, placeholder: "Pack size, labelling, private label" })}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    {textField({ field: "destination", label: "Target delivery location", maxLength: LIMITS.DESTINATION_MAX, placeholder: "Country / port" })}
                    {textField({ field: "deliveryDate", label: "Target delivery date", maxLength: LIMITS.DELIVERY_DATE_MAX, placeholder: "e.g. Q3, or a date" })}
                  </div>

                  <div>
                    <label htmlFor="notes" style={labelStyle}>Additional information</label>
                    <textarea
                      {...fieldProps("notes", "notes-counter")}
                      rows={3}
                      maxLength={LIMITS.NOTES_MAX}
                      placeholder="Certifications required, Incoterms preference, special handling, anything else."
                      style={{ ...styleFor("notes"), resize: "vertical" }}
                    />
                    <FieldError field="notes" errors={fieldErrors} />
                    <p id="notes-counter" style={counterStyle(form.notes.length >= LIMITS.NOTES_MAX)}>
                      {form.notes.length.toLocaleString()} / {LIMITS.NOTES_MAX.toLocaleString()}
                    </p>
                  </div>

                  {/* The form does not accept uploads yet, so it says where to
                      send one rather than offering a control that does nothing. */}
                  <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(245,240,232,0.4)", lineHeight: 1.8, margin: 0 }}>
                    Have a product specification, catalogue, drawing or other supporting document? Email it to{" "}
                    <a href={`mailto:${EMAIL}`} style={{ color: colors.gold }}>{EMAIL}</a> and mention your name so we can match it to this enquiry.
                  </p>
                </FieldSet>

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

                <div>
                  <button type="submit" disabled={loading} style={{
                    fontFamily: fonts.sans, fontSize: 13, fontWeight: 600,
                    padding: "18px 48px",
                    background: loading ? "rgba(200,150,62,0.4)" : `linear-gradient(135deg, ${colors.gold}, ${colors.goldDeep})`,
                    color: colors.forest, border: "none", borderRadius: 3, cursor: loading ? "wait" : "pointer",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    boxShadow: "0 4px 24px rgba(200,150,62,0.2)", transition: "all 0.3s",
                  }}
                    onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(200,150,62,0.3)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(200,150,62,0.2)"; }}
                  >
                    {loading ? "Submitting…" : "Submit Enquiry"}
                  </button>
                  <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(245,240,232,0.35)", lineHeight: 1.8, marginTop: 20, maxWidth: 520 }}>
                    We review each enquiry individually. If we can support the requirement, we will come back with the next steps.
                  </p>
                </div>
              </form>
            </FadeIn>
          )}
        </div>
      </section>
    </div>
  );
}
