/**
 * Form-level status line.
 *
 * `role="alert"` with `aria-live="assertive"`, and always present in the DOM
 * rather than conditionally mounted — a live region that appears at the same
 * moment as its content is unreliable across screen readers, whereas one that
 * is already there and then fills reliably announces.
 *
 * @param {object}   props
 * @param {string}   [props.error]       message from a failed request
 * @param {number}   [props.errorCount]  number of invalid fields
 * @param {string}   [props.notice]      any other one-off message
 */
export default function FormAlert({ error, errorCount = 0, notice }) {
  let message = null;
  if (error) {
    message = error;
  } else if (notice) {
    message = notice;
  } else if (errorCount > 0) {
    message = `Please correct the ${
      errorCount === 1 ? "highlighted field" : `${errorCount} highlighted fields`
    } above.`;
  }

  return (
    <div role="alert" aria-live="assertive">
      {message ? (
        <p className="rounded-2xl border border-error/25 bg-error/6 px-4 py-3 text-[14px] leading-snug text-error">
          {message}
        </p>
      ) : null}
    </div>
  );
}
