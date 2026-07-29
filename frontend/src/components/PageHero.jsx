import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Reveal from "./Reveal";
import SectionTag from "./SectionTag";
import WorldMap from "./WorldMap";

/**
 * The opening block every inner page shares: the map wash, a pre-header, a
 * Playfair headline and one paragraph of intent.
 *
 * The back link is a real `<Link>` rather than a `navigate(-1)` button — it
 * names where it goes, works with a middle click, and behaves the same whether
 * the reader arrived from the index or from a bookmark. A history-based back
 * button does none of those things.
 *
 * @param {object} props
 * @param {string} props.eyebrow
 * @param {React.ReactNode} props.title  the `<h1>` content
 * @param {string} props.intro
 * @param {{ to: string, label: string }} [props.back]
 * @param {string[]} [props.highlightRegions]
 */
export default function PageHero({ eyebrow, title, intro, back, highlightRegions = [], children }) {
  return (
    <section className="relative overflow-hidden bg-bg px-6 pt-[calc(var(--spacing-header)+56px)] pb-20 md:px-8 md:pb-24">
      <WorldMap
        className="pointer-events-none absolute -top-16 right-0 w-[900px] max-w-none"
        highlightRegions={highlightRegions}
        dotOpacity={0.14}
        highlightOpacity={0.3}
      />

      <div className="relative mx-auto max-w-[1240px]">
        {back ? (
          <Link
            to={back.to}
            className="pre-header mb-10 inline-flex items-center gap-2 hover:text-ink"
          >
            <ArrowLeft size={14} strokeWidth={1.75} aria-hidden="true" />
            {back.label}
          </Link>
        ) : null}

        <Reveal stagger={0.1} className="max-w-[720px]">
          <SectionTag label={eyebrow} />
          <h1
            className="mt-5 font-display text-display font-bold leading-[1.04] tracking-[-0.02em] text-ink"
          >
            {title}
          </h1>
          <p className="mt-7 max-w-[600px] text-[17px] leading-relaxed text-ink-soft">{intro}</p>
        </Reveal>

        {children}
      </div>
    </section>
  );
}
