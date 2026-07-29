import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import Reveal from "../components/Reveal";
import SectionTag from "../components/SectionTag";
import Field from "../components/form/Field";
import FormAlert from "../components/form/FormAlert";
import WorldMap from "../components/WorldMap";
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
  name: "",
  email: "",
  company: "",
  phone: "",
  sector: "",
  description: "",
  volume: "",
  frequency: "",
  destination: "",
  notes: "",
  [HONEYPOT_FIELD]: "",
};

export default function QuotePage() {
  const [form, setForm] = useState(EMPTY_FORM);

  // Refs to the focusable element of each field, so a failed validation can put
  // the cursor on the first thing that needs fixing rather than leaving the
  // user to hunt for it on a form this tall.
  const fieldRefs = useRef({});
  // Set in an effect rather than at render time: reading the clock during
  // render is impure, and mount is the moment we actually want to measure from.
  const mountedAt = useRef(null);
  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);
  const [tooFast, setTooFast] = useState(false);

  const { loading, submitted, error, fieldErrors, attempted, handleSubmit, revalidate } =
    useFormSubmit({
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

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const bindRef = (field) => (el) => {
    fieldRefs.current[field] = el;
  };

  /** Wires a field to its label, its error message and its counter. */
  const describedBy = (field, extra) =>
    [fieldErrors[field] && `${field}-error`, extra].filter(Boolean).join(" ") || undefined;

  const control = (field, extra) => ({
    id: field,
    name: field,
    ref: bindRef(field),
    value: form[field],
    onChange: set(field),
    onBlur: () => revalidate(form),
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": describedBy(field, extra),
    className: "field",
  });

  const counter = (field, max) =>
    `${form[field].length.toLocaleString()} / ${max.toLocaleString()}`;

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

  const selectSector = (sector) => {
    const next = { ...form, sector };
    setForm(next);
    // Selecting a sector should clear the "please select a sector" error
    // immediately rather than waiting for a blur that may never come.
    revalidate(next);
  };

  return (
    <div className="relative overflow-hidden bg-bg px-6 pt-[calc(var(--spacing-header)+56px)] pb-24 md:px-8 md:pb-32">
      <WorldMap
        className="pointer-events-none absolute -top-24 right-0 w-[900px] max-w-none"
        highlightRegions={["southAsia", "gulf", "uk"]}
        dotOpacity={0.06}
      />

      <div className="relative mx-auto max-w-[820px]">
        {/* Reads "Home", matching the back link on the vertical pages — and
            keeping it distinct from the success screen's "Back to Home", so
            the page never offers two links with the same name. */}
        <Link to="/" className="pre-header mb-10 inline-flex items-center gap-2 hover:text-ink">
          <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
          Home
        </Link>

        <Reveal stagger={0.1}>
          <SectionTag label="Request a quote" />
          <h1
            className="mt-5 font-display text-display font-bold leading-[1.04] tracking-[-0.02em] text-ink"
          >
            Tell us what you <span className="italic text-accent">need.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-ink-soft">
            Sector, product, volume, destination — as much or as little as you have. Our trade team
            responds within one business day.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div className="card-soft rounded-card-lg p-8 md:p-12">
            {submitted ? (
              <div className="py-8 text-center">
                <span
                  className="mx-auto grid size-16 place-items-center rounded-full bg-success/10"
                  aria-hidden="true"
                >
                  <Check size={28} strokeWidth={2} className="text-success" />
                </span>
                <h2 className="mt-7 font-display text-3xl font-semibold text-ink">
                  Quote Request Received
                </h2>
                <p className="mx-auto mt-4 max-w-[440px] text-[16px] leading-relaxed text-ink-soft">
                  Our trade team will review your requirements and respond with a detailed quotation
                  within one business day.
                </p>
                <p className="mt-4 text-[14px] text-accent">Sector: {form.sector}</p>
                <Link to="/" className="btn-ghost mt-9">
                  Back to Home
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-7">
                {/* Sector — real radios inside a fieldset, so the group is
                    announced as one required choice and arrow keys move between
                    options. The inputs are visually hidden; the styled label is
                    the pill, and `peer-focus-visible` puts the focus ring back
                    on that pill where a sighted keyboard user can see it. */}
                <fieldset className="min-w-0 border-0 p-0" aria-describedby={describedBy("sector")}>
                  <legend className="pre-header mb-3">Sector *</legend>
                  <div className="flex flex-wrap gap-2">
                    {SECTORS.map((sector, index) => {
                      const selected = form.sector === sector;
                      return (
                        <label
                          key={sector}
                          data-active={selected}
                          className={`pill has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent ${
                            fieldErrors.sector && !selected ? "border-error/60" : ""
                          }`}
                        >
                          <input
                            type="radio"
                            name="sector"
                            value={sector}
                            checked={selected}
                            required
                            // Only the first radio needs a ref: focusing it puts
                            // the user in the group, and arrow keys do the rest.
                            ref={index === 0 ? bindRef("sector") : undefined}
                            aria-invalid={fieldErrors.sector ? true : undefined}
                            onChange={() => selectSector(sector)}
                            className="sr-only"
                          />
                          {selected ? (
                            <Check size={14} strokeWidth={2.5} aria-hidden="true" />
                          ) : null}
                          {sector}
                        </label>
                      );
                    })}
                  </div>
                  {fieldErrors.sector ? (
                    <p id="sector-error" className="mt-2 text-[13px] text-error">
                      {fieldErrors.sector}
                    </p>
                  ) : null}
                </fieldset>

                <Field
                  id="description"
                  label="What do you need? *"
                  error={fieldErrors.description}
                  hint={counter("description", LIMITS.DESCRIPTION_MAX)}
                >
                  <textarea
                    {...control("description", "description-hint")}
                    rows={4}
                    required
                    maxLength={LIMITS.DESCRIPTION_MAX}
                    placeholder="e.g. 500kg Matta Rice + 200kg Toor Dall, FOB Kochi — or — 500 sets brake pads for Toyota Hilux — or — Paracetamol 500mg tablets, 1M units, WHO-GMP, for Kenya"
                    className="field resize-y"
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="name" label="Full Name *" error={fieldErrors.name}>
                    <input
                      {...control("name")}
                      required
                      maxLength={LIMITS.NAME_MAX}
                      autoComplete="name"
                      placeholder="Your name"
                    />
                  </Field>
                  <Field id="email" label="Email *" error={fieldErrors.email}>
                    <input
                      {...control("email")}
                      type="email"
                      required
                      maxLength={LIMITS.EMAIL_MAX}
                      autoComplete="email"
                      placeholder="you@company.com"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="company" label="Company" error={fieldErrors.company}>
                    <input
                      {...control("company")}
                      maxLength={LIMITS.COMPANY_MAX}
                      autoComplete="organization"
                      placeholder="Company Ltd."
                    />
                  </Field>
                  <Field id="phone" label="Phone" error={fieldErrors.phone}>
                    <input
                      {...control("phone")}
                      type="tel"
                      maxLength={LIMITS.PHONE_MAX}
                      autoComplete="tel"
                      placeholder="+44 7XXX XXXXXX"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 sm:grid-cols-3">
                  <Field id="volume" label="Est. Volume">
                    <select {...control("volume")} className="field cursor-pointer">
                      <option value="">Select…</option>
                      {VOLUMES.map((volume) => (
                        <option key={volume} value={volume}>
                          {volume}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="frequency" label="Frequency">
                    <select {...control("frequency")} className="field cursor-pointer">
                      <option value="">Select…</option>
                      {FREQUENCIES.map((frequency) => (
                        <option key={frequency} value={frequency}>
                          {frequency}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="destination" label="Destination" error={fieldErrors.destination}>
                    <input
                      {...control("destination")}
                      maxLength={LIMITS.DESTINATION_MAX}
                      placeholder="Country / Port"
                    />
                  </Field>
                </div>

                <Field
                  id="notes"
                  label="Additional Notes"
                  error={fieldErrors.notes}
                  hint={counter("notes", LIMITS.NOTES_MAX)}
                >
                  <textarea
                    {...control("notes", "notes-hint")}
                    rows={3}
                    maxLength={LIMITS.NOTES_MAX}
                    placeholder="Certifications required, Incoterms preference, special handling, packaging specs…"
                    className="field resize-y"
                  />
                </Field>

                {/* Honeypot — see the .honeypot rule in index.css. Not a real
                    field: no human ever sees it, and any value makes the
                    server discard the submission. */}
                <div className="honeypot" aria-hidden="true">
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

                <FormAlert
                  error={error}
                  errorCount={attempted ? Object.keys(fieldErrors).length : 0}
                  notice={
                    tooFast
                      ? "That was submitted unusually quickly. Please review your details and submit again."
                      : undefined
                  }
                />

                <button type="submit" disabled={loading} className="btn-primary self-start px-10">
                  {loading ? "Submitting…" : "Submit Quote Request"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
