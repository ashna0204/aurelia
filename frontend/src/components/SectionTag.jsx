/**
 * The small uppercase line that opens a section — "GLOBAL TRADE, HANDLED
 * END-TO-END".
 *
 * Rendered as a paragraph rather than a heading on purpose: it labels the
 * headline that follows, it is not a level in the document outline, and
 * promoting it to an `<h*>` would add a rung to that ladder in every section.
 *
 * The gold tick is one of the only two places gold appears outside the Sahya
 * material.
 *
 * @param {object}  props
 * @param {string}  props.label
 * @param {boolean} [props.onDark] invert for the ink-coloured sections
 */
export default function SectionTag({ label, onDark = false, className = "" }) {
  return (
    <p className={`pre-header flex items-center gap-3 ${onDark ? "text-white/75" : ""} ${className}`}>
      <span
        className={`inline-block h-px w-6 shrink-0 ${onDark ? "bg-white/35" : "bg-gold"}`}
        aria-hidden="true"
      />
      {label}
    </p>
  );
}
