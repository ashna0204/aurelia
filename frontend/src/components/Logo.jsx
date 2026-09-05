/**
 * Aurelia's laurel-sprig brand mark (Concept E from the logo prototypes): a
 * tapered central stem with seven leaf pairs fanning out, in the house gold.
 *
 * Decorative by default — the "AURELIA" wordmark beside it carries the name, so
 * this is `aria-hidden` and adds nothing to a link's accessible name. `size` is
 * the rendered height in px; width follows the 140×170 source ratio.
 *
 * The gradient ids are static because the mark appears once per view; if it ever
 * needs to be duplicated in one DOM, switch these to `useId`.
 */
export default function Logo({ size = 40, ...rest }) {
  return (
    <svg
      width={(size * 140) / 170}
      height={size}
      viewBox="0 -4 140 174"
      xmlns="http://www.w3.org/2000/svg"
      focusable="false"
      aria-hidden="true"
      {...rest}
    >
      <defs>
        <linearGradient id="logoGold1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F0D060" />
          <stop offset="35%" stopColor="#D4AD2B" />
          <stop offset="70%" stopColor="#C5A028" />
          <stop offset="100%" stopColor="#A88520" />
        </linearGradient>
        <linearGradient id="logoGold2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F0D060" />
          <stop offset="35%" stopColor="#D4AD2B" />
          <stop offset="70%" stopColor="#C5A028" />
          <stop offset="100%" stopColor="#A88520" />
        </linearGradient>
        <linearGradient id="logoStem" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C5A028" />
          <stop offset="100%" stopColor="#9B7D1E" />
        </linearGradient>
      </defs>

      {/* Central stem with slight taper */}
      <line x1="70" y1="15" x2="70" y2="155" stroke="url(#logoStem)" strokeWidth="2" strokeLinecap="round" />

      {/* Top pinnacle leaf */}
      <path d="M70 15 Q76 6 70 -2 Q64 6 70 15Z" fill="url(#logoGold1)" />

      {/* Pair 1 — small, tight */}
      <path d="M70 28 Q82 18 88 24 Q78 32 70 28Z" fill="url(#logoGold1)" />
      <path d="M70 28 Q58 18 52 24 Q62 32 70 28Z" fill="url(#logoGold2)" />

      {/* Pair 2 */}
      <path d="M70 44 Q86 32 94 40 Q82 48 70 44Z" fill="url(#logoGold1)" />
      <path d="M70 44 Q54 32 46 40 Q58 48 70 44Z" fill="url(#logoGold2)" />

      {/* Pair 3 */}
      <path d="M70 62 Q90 48 100 58 Q86 66 70 62Z" fill="url(#logoGold1)" />
      <path d="M70 62 Q50 48 40 58 Q54 66 70 62Z" fill="url(#logoGold2)" />

      {/* Pair 4 — widest */}
      <path d="M70 82 Q94 66 106 78 Q90 86 70 82Z" fill="url(#logoGold1)" opacity="0.95" />
      <path d="M70 82 Q46 66 34 78 Q50 86 70 82Z" fill="url(#logoGold2)" opacity="0.95" />

      {/* Pair 5 */}
      <path d="M70 102 Q96 86 108 98 Q92 106 70 102Z" fill="url(#logoGold1)" opacity="0.9" />
      <path d="M70 102 Q44 86 32 98 Q48 106 70 102Z" fill="url(#logoGold2)" opacity="0.9" />

      {/* Pair 6 — lower, slightly smaller */}
      <path d="M70 122 Q94 108 104 118 Q88 126 70 122Z" fill="url(#logoGold1)" opacity="0.85" />
      <path d="M70 122 Q46 108 36 118 Q52 126 70 122Z" fill="url(#logoGold2)" opacity="0.85" />

      {/* Bottom pair — curving down */}
      <path d="M70 140 Q90 130 98 138 Q84 146 70 145Z" fill="url(#logoGold1)" opacity="0.8" />
      <path d="M70 140 Q50 130 42 138 Q56 146 70 145Z" fill="url(#logoGold2)" opacity="0.8" />

      {/* Subtle node dots at stem junctions */}
      <circle cx="70" cy="28" r="1.5" fill="#E8C547" opacity="0.6" />
      <circle cx="70" cy="44" r="1.5" fill="#E8C547" opacity="0.6" />
      <circle cx="70" cy="62" r="1.5" fill="#E8C547" opacity="0.6" />
      <circle cx="70" cy="82" r="1.5" fill="#E8C547" opacity="0.6" />
      <circle cx="70" cy="102" r="1.5" fill="#E8C547" opacity="0.5" />
      <circle cx="70" cy="122" r="1.5" fill="#E8C547" opacity="0.4" />
      <circle cx="70" cy="140" r="1.5" fill="#E8C547" opacity="0.35" />
    </svg>
  );
}
