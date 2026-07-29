import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import WorldMap from "../WorldMap";
import { ROUTES } from "../../lib/worldMap";

/**
 * The visual full stop before the footer: an inset ink block carrying the
 * route linework at low opacity.
 *
 * Inset from the page edges rather than full-bleed, so it reads as the last
 * card in the stack rather than as the footer starting early.
 */
export default function DarkCTA() {
  return (
    <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
      <Reveal className="mx-auto max-w-[1240px]">
        <div className="relative overflow-hidden rounded-card-lg bg-forestDeep border border-gold/20 px-8 py-20 text-center md:px-16 md:py-28">
          <WorldMap
            className="pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
            dotColor="#F5F0E8"
            dotOpacity={0.07}
            routes={[ROUTES.corridor]}
            routeColor="var(--color-gold)"
            routeOpacity={0.25}
          />

          <div className="relative mx-auto max-w-[680px]">
            <SectionTag label="Ready to import?" onDark className="justify-center" />
            <h2
              className="mt-6 font-display text-cta font-bold leading-[1.06] tracking-[-0.015em] text-cream"
            >
              Trade with Aurelia today.
            </h2>
            <p className="mx-auto mt-6 max-w-[520px] text-[17px] leading-relaxed text-cream/75">
              From a single container to a recurring supply contract — tell us what you need and our
              trade team will respond within one business day.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/quote"
                className="btn-primary"
              >
                Request a Quote
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
              <Link
                to="/specialisations"
                className="btn-ghost"
              >
                Browse Specialisations
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
