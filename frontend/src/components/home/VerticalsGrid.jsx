import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import { VERTICALS } from "../../constants/verticals";
import { VERTICALS_ID } from "../../constants/sections";

/**
 * The three verticals as large soft-UI cards.
 *
 * The whole card is one link rather than a clickable `<div>` with a nested
 * "View products" anchor: it gives the reader the full card as a target and
 * still gives a keyboard user exactly one stop per card, instead of a div
 * that no assistive technology announces as actionable.
 */
export default function VerticalsGrid() {
  return (
    <section id={VERTICALS_ID} className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal stagger={0.1} className="max-w-[620px]">
          <SectionTag label="Areas of specialisation" />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            Three sectors.
            <br />
            <span className="italic text-accent">One trusted partner.</span>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            Each vertical has its own sourcing network, its own compliance requirements, and its own
            team. What they share is a single chain of custody from the factory gate to your port.
          </p>
        </Reveal>

        <Reveal stagger={0.12} className="mt-14 grid gap-6 md:grid-cols-3">
          {VERTICALS.map((vertical) => (
            <Link
              key={vertical.key}
              to={vertical.slug}
              // `min-w-0` on the grid item, and again on the heading: a grid
              // item defaults to `min-width: auto`, so the no-wrap stat pill
              // beside the heading would otherwise widen the whole track past
              // the viewport on a narrow screen.
              className="card-soft card-soft-hover group flex min-w-0 flex-col p-8"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Two lines' worth of height whatever the label's length, so
                    the taglines below line up across the three cards. */}
                <h3 className="min-w-0 font-display text-2xl leading-tight font-semibold text-ink md:min-h-[2.5em]">
                  {vertical.label}
                </h3>
                <span className="pill shrink-0 cursor-default border-ink/10 px-3 py-1.5 text-[11px] whitespace-nowrap">
                  {vertical.stat}
                </span>
              </div>

              <p className="mt-2 font-display text-[15px] italic text-accent">{vertical.tagline}</p>

              <p className="mt-5 grow text-[15px] leading-relaxed text-ink-soft">
                {vertical.description}
              </p>

              <ul className="mt-7 flex flex-wrap gap-2">
                {vertical.tags.map((tag) => (
                  <li key={tag} className="pill cursor-default px-3 py-1.5 text-[12px]">
                    {tag}
                  </li>
                ))}
              </ul>

              <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink">
                View products
                <ArrowRight
                  size={15}
                  strokeWidth={1.75}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
