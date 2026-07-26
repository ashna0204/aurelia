import { useState } from "react";

/**
 * Encapsulates the submit lifecycle shared by every form on the site:
 * validate → set loading → call the API → surface success or an error message.
 *
 * Keeps components focused on rendering; they own only their field state.
 *
 * @param {object}   options
 * @param {function} options.validate - (values) => errorMessage | null
 * @param {function} options.submit   - async (values) => void  (throws on failure)
 */
export function useFormSubmit({ validate, submit }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (values) => {
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
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

  return { loading, submitted, error, handleSubmit };
}
