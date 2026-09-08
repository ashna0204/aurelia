/**
 * Client-side form validation.
 *
 * Each validator returns an object mapping field name → error message. An empty
 * object means valid, so callers can do:
 *
 *     const errors = validateQuoteForm(form);
 *     if (Object.keys(errors).length) { ... }
 *
 * Keys are inserted in the order the fields appear on screen, so the first key
 * is the topmost problem — that is the one to focus.
 *
 * The backend (Pydantic) remains the source of truth and re-validates all of
 * this; these rules exist to give feedback without a round trip, and they are
 * deliberately kept identical to the server's so the two cannot disagree.
 */

import { LIMITS, PHONE_DIGITS, REQUIREMENT_FIELDS, composeMessage } from "../constants/quoteForm";

// Deliberately permissive — the point is to catch obvious typos before a round
// trip, not to police RFC 5322. Pydantic's EmailStr is the real gate.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

// Mirrors _PHONE_ALLOWED in backend/app/schemas.py.
const PHONE_RE = /^[+(0-9][0-9\s().\-/]*$/;

export const isValidEmail = (email) => EMAIL_RE.test(email.trim());

const trimmed = (value) => (value ?? "").trim();

/**
 * Shape-only phone check, matching the server's. Returns an error message or
 * null. Empty is valid — the field is optional.
 */
export function validatePhone(value) {
  const phone = trimmed(value);
  if (!phone) return null;
  if (phone.length > LIMITS.PHONE_MAX) {
    return `Phone number must be ${LIMITS.PHONE_MAX} characters or fewer.`;
  }
  if (!PHONE_RE.test(phone)) {
    return "Enter a phone number using digits, and optionally + ( ) - or spaces.";
  }
  const digits = (phone.match(/\d/g) || []).length;
  if (digits < PHONE_DIGITS.MIN || digits > PHONE_DIGITS.MAX) {
    return `Phone number must contain ${PHONE_DIGITS.MIN}–${PHONE_DIGITS.MAX} digits.`;
  }
  return null;
}

/** Per-field caps for the optional single-line requirement fields. */
const SINGLE_LINE_CAPS = [
  ["country", LIMITS.COUNTRY_MAX, "Country"],
  ["quantity", LIMITS.QUANTITY_MAX, "Quantity"],
  ["targetMarket", LIMITS.TARGET_MARKET_MAX, "Target market"],
  ["packaging", LIMITS.PACKAGING_MAX, "Packaging requirements"],
  ["destination", LIMITS.DESTINATION_MAX, "Target delivery location"],
  ["deliveryDate", LIMITS.DELIVERY_DATE_MAX, "Target delivery date"],
];

/** Returns { field: message } for the enquiry form; empty object when valid. */
export function validateQuoteForm(form) {
  const errors = {};

  // Insertion order below follows the on-screen field order, so the first key
  // is the topmost problem — that is the one to focus.
  const name = trimmed(form.name);
  if (name.length < LIMITS.NAME_MIN) {
    errors.name = "Please enter your full name.";
  } else if (name.length > LIMITS.NAME_MAX) {
    errors.name = `Name must be ${LIMITS.NAME_MAX} characters or fewer.`;
  }

  if (trimmed(form.company).length > LIMITS.COMPANY_MAX) {
    errors.company = `Company must be ${LIMITS.COMPANY_MAX} characters or fewer.`;
  }

  const email = trimmed(form.email);
  if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (email.length > LIMITS.EMAIL_MAX) {
    errors.email = `Email must be ${LIMITS.EMAIL_MAX} characters or fewer.`;
  }

  const phoneError = validatePhone(form.phone);
  if (phoneError) errors.phone = phoneError;

  if (!form.sector) {
    errors.sector = "Please select a product or category.";
  }

  const specification = trimmed(form.specification);
  if (specification.length < LIMITS.SPECIFICATION_MIN) {
    errors.specification = `Please describe what you need (at least ${LIMITS.SPECIFICATION_MIN} characters).`;
  } else if (specification.length > LIMITS.SPECIFICATION_MAX) {
    errors.specification = `Please keep this under ${LIMITS.SPECIFICATION_MAX.toLocaleString()} characters.`;
  }

  for (const [field, cap, label] of SINGLE_LINE_CAPS) {
    if (trimmed(form[field]).length > cap) {
      errors[field] = `${label} must be ${cap} characters or fewer.`;
    }
  }

  if (trimmed(form.notes).length > LIMITS.NOTES_MAX) {
    errors.notes = `Please keep additional information under ${LIMITS.NOTES_MAX} characters.`;
  }

  // Defensive: the requirement fields are concatenated into one `message`, and
  // their caps are chosen so even a fully-filled form stays under the server's
  // ceiling (asserted in constants.test.js). This catches the case where those
  // constants are later raised without that property being rechecked —
  // otherwise the failure surfaces as an unexplained 422.
  const alreadyFlagged = REQUIREMENT_FIELDS.some(({ key }) => errors[key]);
  if (!alreadyFlagged && composeMessage(form).length > LIMITS.MESSAGE_MAX) {
    errors.specification = "Your requirement details are too long together. Please shorten them.";
  }

  return errors;
}

/** Returns { field: message } for the contact form; empty object when valid. */
export function validateContactForm(form) {
  const errors = {};

  const name = trimmed(form.name);
  if (name.length < LIMITS.NAME_MIN) {
    errors.name = "Please enter your name.";
  } else if (name.length > LIMITS.NAME_MAX) {
    errors.name = `Name must be ${LIMITS.NAME_MAX} characters or fewer.`;
  }

  const email = trimmed(form.email);
  if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email.";
  } else if (email.length > LIMITS.EMAIL_MAX) {
    errors.email = `Email must be ${LIMITS.EMAIL_MAX} characters or fewer.`;
  }

  const message = trimmed(form.message);
  if (message.length < LIMITS.MESSAGE_MIN) {
    errors.message = `Message must be at least ${LIMITS.MESSAGE_MIN} characters.`;
  } else if (message.length > LIMITS.MESSAGE_MAX) {
    errors.message = `Please keep your message under ${LIMITS.MESSAGE_MAX.toLocaleString()} characters.`;
  }

  return errors;
}
