import { useRef, useState } from "react";
import { Check, Mail, MapPin } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import Field from "../form/Field";
import FormAlert from "../form/FormAlert";
import { submitContact } from "../../api/client";
import { validateContactForm } from "../../utils/validation";
import { useFormSubmit } from "../../hooks/useFormSubmit";
import { LIMITS } from "../../constants/quoteForm";
import { SECTION_CONTACT } from "../../constants/sections";

// Mirrors ContactCreate in backend/app/schemas.py.
const CONTACT_MAX = {
  name: LIMITS.NAME_MAX,
  email: LIMITS.EMAIL_MAX,
  company: LIMITS.COMPANY_MAX,
  message: LIMITS.MESSAGE_MAX,
};

const DETAILS = [
  {
    icon: Mail,
    label: "Email",
    value: "enquiries@aurelialogistics.co.uk",
    note: "For trade enquiries and partnerships",
  },
  {
    icon: MapPin,
    label: "Headquarters",
    value: "Kochi, Kerala, India",
    note: "Offices in Mumbai, Dubai & London",
  },
];

export default function ContactSection() {
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

  /** Everything a control needs to be wired to its label and its error. */
  const control = (field) => ({
    id: `contact-${field}`,
    name: field,
    ref: (el) => {
      fieldRefs.current[field] = el;
    },
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    onBlur: () => revalidate(form),
    maxLength: CONTACT_MAX[field],
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `contact-${field}-error` : undefined,
    className: "field",
  });

  return (
    <section id={SECTION_CONTACT} className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto grid max-w-[1240px] items-start gap-14 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
        <Reveal stagger={0.1}>
          <SectionTag label="Contact us" />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            Get in <span className="italic text-accent">touch.</span>
          </h2>
          <p className="mt-6 max-w-[400px] text-[17px] leading-relaxed text-ink-soft">
            Tell us roughly what you are looking for and we will come back with the specifics —
            sourcing options, indicative pricing and a realistic lead time.
          </p>

          <ul className="mt-10 space-y-7">
            {DETAILS.map(({ icon: Icon, label, value, note }) => (
              <li key={label} className="flex items-start gap-4">
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/8"
                  aria-hidden="true"
                >
                  <Icon size={18} strokeWidth={1.5} className="text-accent" />
                </span>
                <div>
                  <p className="pre-header">{label}</p>
                  <p className="mt-1.5 text-[15px] font-medium text-ink">{value}</p>
                  <p className="mt-1 text-[13px] text-ink-soft">{note}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal>
          <div className="card-soft rounded-card-lg p-8 md:p-10">
            {submitted ? (
              <div className="py-10 text-center">
                <span
                  className="mx-auto grid size-14 place-items-center rounded-full bg-success/10"
                  aria-hidden="true"
                >
                  <Check size={24} strokeWidth={2} className="text-success" />
                </span>
                <h3 className="mt-6 font-display text-2xl font-semibold text-ink">Message Sent</h3>
                <p className="mt-2 text-[15px] text-ink-soft">We&rsquo;ll be in touch shortly.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="contact-name" label="Name *" error={fieldErrors.name}>
                    <input {...control("name")} required autoComplete="name" placeholder="Your name" />
                  </Field>
                  <Field id="contact-email" label="Email *" error={fieldErrors.email}>
                    <input
                      {...control("email")}
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                    />
                  </Field>
                </div>

                <Field id="contact-company" label="Company" error={fieldErrors.company}>
                  <input
                    {...control("company")}
                    autoComplete="organization"
                    placeholder="Company name"
                  />
                </Field>

                <Field id="contact-message" label="Message *" error={fieldErrors.message}>
                  <textarea
                    {...control("message")}
                    rows={5}
                    required
                    placeholder="How can we help?"
                    className="field resize-y"
                  />
                </Field>

                <FormAlert error={error} errorCount={Object.keys(fieldErrors).length} />

                <button type="submit" disabled={loading} className="btn-primary self-start">
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
