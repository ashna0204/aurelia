/**
 * Shared vocabulary and field limits for the enquiry form.
 *
 * Every value here mirrors `backend/app/schemas.py`. The backend is the source
 * of truth — it re-validates all of it — but these must stay in step, because
 * a drift shows up as a 422 on a form the user had every reason to believe was
 * filled in correctly.
 */

import { EXPERTISE } from "./expertise";

/**
 * Product categories offered on the form.
 *
 * Derived from the four sourcing areas so the form cannot drift from what the
 * site says it sources, plus a catch-all for a requirement that spans areas or
 * sits outside them. Mirrors the `Sector` literal in backend/app/schemas.py.
 */
export const SECTORS = [...EXPERTISE.map((area) => area.sector), "Multiple / Other"];

/**
 * Per-field length limits.
 *
 * The requirement fields are composed into the API's single `message` field
 * (see composeMessage), so their caps have to sum to less than the backend's
 * ceiling with the labels and separators the composer inserts. REQUIREMENT_MAX
 * is the budget shared by every free-text requirement field:
 *
 *     SPECIFICATION_MAX + NOTES_MAX + short fields + labels < MESSAGE_MAX
 *     2000 + 900 + (5 × 255) + ~300 = 4475
 *
 * which is over 4000, so `validateEnquiryForm` also checks the composed length
 * directly rather than relying on the per-field caps alone.
 */
export const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 150,
  EMAIL_MAX: 254, // RFC 5321 practical maximum for a full address
  COMPANY_MAX: 255,
  PHONE_MAX: 50,
  COUNTRY_MAX: 100,
  DESTINATION_MAX: 255,
  MESSAGE_MIN: 10, // backend floor on any free-text body
  SPECIFICATION_MIN: 10,
  SPECIFICATION_MAX: 2000,
  QUANTITY_MAX: 255,
  TARGET_MARKET_MAX: 255,
  PACKAGING_MAX: 255,
  DELIVERY_DATE_MAX: 100,
  NOTES_MAX: 900,
  MESSAGE_MAX: 4000, // backend ceiling on the composed requirement
};

/** Digit-count range accepted for a phone number — the E.164 range. */
export const PHONE_DIGITS = { MIN: 7, MAX: 15 };

/**
 * Minimum time on the form, in milliseconds, before a submission is plausible.
 *
 * A bot driving the real form fills and submits it instantly. No human can
 * supply a name, an email and a ten-character description in under three
 * seconds, so this costs a real user nothing — and when it does trip, it shows
 * an ordinary error the user can act on rather than silently dropping their
 * enquiry. It is only a speed bump: it lives in the client and is therefore
 * forgeable. The honeypot below is the server-enforced half.
 */
export const MIN_FILL_MS = 3000;

/**
 * Name of the honeypot field.
 *
 * Rendered off-screen and hidden from assistive tech, so no human ever fills
 * it; plausible enough that a bot filling every input it finds will. The server
 * discards any submission that carries a value here.
 */
export const HONEYPOT_FIELD = "website";

/**
 * The requirement fields, in the order they appear on the form and in the
 * composed message. `destination` is excluded: it maps to a real API field.
 */
export const REQUIREMENT_FIELDS = [
  { key: "specification", label: "Specification" },
  { key: "quantity", label: "Quantity" },
  { key: "targetMarket", label: "Target market" },
  { key: "packaging", label: "Packaging requirements" },
  { key: "deliveryDate", label: "Target delivery date" },
  { key: "country", label: "Buyer country" },
  { key: "notes", label: "Additional information" },
];

/**
 * Composes the requirement fields into the single `message` field the API
 * takes. The specification leads, unlabelled, because it is the body of the
 * enquiry; everything else is appended as a labelled line so the trade team
 * reading the notification can scan it.
 */
export function composeMessage(form) {
  const [spec, ...rest] = REQUIREMENT_FIELDS;
  const lines = rest
    .map(({ key, label }) => {
      const value = (form[key] ?? "").trim();
      return value ? `${label}: ${value}` : "";
    })
    .filter(Boolean);

  return [(form[spec.key] ?? "").trim(), ...lines].filter(Boolean).join("\n");
}
