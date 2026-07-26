/**
 * Shared vocabulary and field limits for the Quote Request form.
 *
 * Every value here mirrors `backend/app/schemas.py`. The backend is the source
 * of truth — it re-validates all of it — but these must stay in step, because
 * a drift shows up as a 422 on a form the user had every reason to believe was
 * filled in correctly.
 *
 * The en dashes in VOLUMES are written as – escapes on purpose: they are
 * part of the value the API matches against, and an editor silently rewriting
 * one to a plain hyphen would reject every submission that used it.
 */

export const SECTORS = [
  "Ethnic Food & Grocery",
  "Vehicle Parts & Accessories",
  "Pharmaceuticals & Healthcare",
  "Multiple / Other",
];

export const VOLUMES = [
  "< 1 MT / small consignment",
  "1 – 5 MT",
  "5 – 20 MT",
  "20 – 100 MT",
  "100+ MT / contract supply",
];

export const FREQUENCIES = ["One-time", "Monthly", "Quarterly", "Ongoing contract"];

/**
 * Per-field length limits.
 *
 * DESCRIPTION_MAX and NOTES_MAX are deliberately chosen so their sum — plus the
 * "\n\nNotes: " separator the form inserts between them — cannot exceed the
 * backend's 4000-character ceiling on the combined `message` field:
 *
 *     3000 + 9 + 900 = 3909 < 4000
 *
 * That is what makes the two `maxLength` attributes sufficient on their own: a
 * user who fills both textareas to the brim still produces a valid request, so
 * there is no way to compose a submission the server will reject on length.
 */
export const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 150,
  EMAIL_MAX: 254, // RFC 5321 practical maximum for a full address
  COMPANY_MAX: 255,
  PHONE_MAX: 50,
  DESTINATION_MAX: 255,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 3000,
  NOTES_MAX: 900,
  MESSAGE_MAX: 4000, // backend ceiling on description + notes combined
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

/** Composes the two textareas into the single `message` field the API takes. */
export function composeMessage({ description, notes }) {
  return [description.trim(), notes.trim() ? `Notes: ${notes.trim()}` : ""]
    .filter(Boolean)
    .join("\n\n");
}
