/**
 * Client-side form validation.
 *
 * Each validator returns an error message string, or `null` when the input is
 * valid — so callers can do: `const error = validateContactForm(form)`.
 * The backend (Pydantic) remains the source of truth; this is UX-first
 * feedback that mirrors the server rules.
 */

export const isValidEmail = (email) => email.includes("@") && email.includes(".");

const isFilled = (value, min) => value.trim().length >= min;

/** Returns an error message, or null if the quote form is valid. */
export function validateQuoteForm(form) {
  if (!isFilled(form.name, 2)) return "Please enter your full name.";
  if (!isValidEmail(form.email)) return "Please enter a valid email address.";
  if (!form.sector) return "Please select a sector.";
  if (!isFilled(form.description, 10)) return "Please describe what you need (min 10 characters).";
  return null;
}

/** Returns an error message, or null if the contact form is valid. */
export function validateContactForm(form) {
  if (!isFilled(form.name, 2)) return "Please enter your name.";
  if (!isValidEmail(form.email)) return "Please enter a valid email.";
  if (!isFilled(form.message, 10)) return "Message must be at least 10 characters.";
  return null;
}
