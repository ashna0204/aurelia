import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import { SECTION_ABOUT } from "../../constants/sections";

const STATS = [
  { value: "3", label: "Trade sectors" },
  { value: "40+", label: "Countries served" },
  { value: "200+", label: "B2B partners" },
  { value: "99%", label: "On-time delivery" },
];

export default function AboutSection() {
  return (
    <section id={SECTION_ABOUT} className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-[1240px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
        <Reveal stagger={0.1}>
          <SectionTag label="Who we are" />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            A different kind of{" "}
            <span className="italic text-accent">logistics partner.</span>
          </h2>
          <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
            We don&rsquo;t just move freight. We understand the goods we carry — the cultural
            significance of a Kerala pantry staple, the precision tolerance of an OEM engine
            component, the cold-chain requirements of a pharmaceutical shipment.
          </p>
          <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
            That domain knowledge, built over years of sourcing directly from manufacturers and
            growers across South Asia, is what separates Aurelia from a freight broker.
          </p>
          <Link to="/specialisations" className="btn-primary mt-9">
            Explore Specialisations
            <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </Reveal>

        <Reveal stagger={0.09} className="grid grid-cols-2 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="card-soft card-soft-hover p-8">
              <p className="font-display text-[42px] leading-none font-bold text-ink">
                {stat.value}
              </p>
              <p className="pre-header mt-3">{stat.label}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
