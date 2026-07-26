import { useState } from "react";

/**
 * Encapsulates the submit lifecycle shared by every form on the site:
 * validate → set loading → call the API → surface success or an error message.
 *
 * Keeps components focused on rendering; they own only their field state.
 *
 * Two kinds of error are surfaced separately, because they belong in different
 * places on screen: `fieldErrors` renders inline next to the offending input,
 * while `error` is the form-level banner for a failed request.
 *
 * @param {object}   options
 * @param {function} options.validate - (values) => ({ field: message }), empty when valid
 * @param {function} options.submit   - async (values) => void  (throws on failure)
 * @param {function} [options.onValidationError] - (firstInvalidField) => void, for focus
 */
export function useFormSubmit({ validate, submit, onValidationError }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  // Whether the user has tried to submit at least once. Until they have, we
  // don't flag fields they simply haven't reached yet.
  const [attempted, setAttempted] = useState(false);

  /**
   * Re-check every field. Call from onBlur: it is a no-op until the first
   * submit attempt, so a user filling the form top to bottom is never
   * interrupted, but once they've seen errors the messages clear as they fix
   * each one.
   */
  const revalidate = (values) => {
    if (!attempted) return;
    setFieldErrors(validate(values));
  };

  const handleSubmit = async (values) => {
    setAttempted(true);

    const errors = validate(values);
    setFieldErrors(errors);

    // Validators insert keys in on-screen order, so the first is the topmost.
    const [firstInvalid] = Object.keys(errors);
    if (firstInvalid) {
      setError(null);
      onValidationError?.(firstInvalid);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await submit(values);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { loading, submitted, error, fieldErrors, attempted, handleSubmit, revalidate };
}
