/**
 * The label / control / error unit both forms are built from.
 *
 * Having one component own the wiring is what guarantees the three parts stay
 * connected: the `<label>`'s `htmlFor`, the control's `aria-describedby`, and
 * the error's `id` all derive from the same `id`, so a field can never end up
 * with a visible message that assistive technology cannot reach.
 *
 * The control itself is passed in as a child so the caller keeps ownership of
 * its type, value and validation attributes.
 *
 * @param {object}  props
 * @param {string}  props.id      matches the control's own id
 * @param {string}  props.label
 * @param {string}  [props.error] inline message; also flips the control red
 * @param {string}  [props.hint]  counter or help text, rendered under the field
 */
export default function Field({ id, label, error, hint, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="pre-header mb-2.5 block">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[13px] leading-snug text-error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-right text-[12px] text-ink-soft">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
