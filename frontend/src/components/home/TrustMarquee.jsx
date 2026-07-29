/**
 * Trust strip under the hero — an endless, evenly-paced band of the marks
 * Aurelia trades under and against.
 *
 * The loop is pure CSS: the track holds the list twice and translates exactly
 * -50%, so the seam lands on an identical frame and the repeat is invisible.
 * That keeps it off the main thread entirely, and `prefers-reduced-motion`
 * stops it in index.css without any JavaScript needing to know.
 */

const MARKS = [
  "UNIFAREX",
  "SAHYA",
  "WHO-GMP",
  "USFDA",
  "ISO 9001",
  "PORT OF KOCHI",
  "JEBEL ALI",
  "FELIXSTOWE",
  "ISO/TS 16949",
  "AYUSH GMP",
  "NHAVA SHEVA",
  "EU-GMP",
];

export default function TrustMarquee() {
  return (
    <section aria-label="Partners and standards" className="border-y border-ink/6 bg-bg py-6">
      {/* `marquee-fade` masks both ends into the page rather than cutting the
          marks off against a hard edge — see index.css. */}
      <div className="group marquee-fade relative overflow-hidden">
        <ul className="marquee-track flex w-max items-center gap-14 group-hover:[animation-play-state:paused]">
          {/* Two passes of the same list; the second is hidden from assistive
              tech so the marks are not announced twice. */}
          {[0, 1].map((pass) =>
            MARKS.map((mark) => (
              <li
                key={`${pass}-${mark}`}
                aria-hidden={pass === 1 ? "true" : undefined}
                className="pre-header shrink-0 whitespace-nowrap text-ink-soft"
              >
                {mark}
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
