import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";

const CHANNELS = ["Specialty grocers", "Cafés & HoReCa", "Direct-to-consumer", "Diaspora retail"];

/**
 * Sahya, Aurelia's B2C label — the one warm block on an otherwise cool page.
 *
 * Gold is the whole point of the section: it is the only surface where the
 * micro-accent becomes the dominant tone, which is what marks Sahya out as a
 * sibling brand rather than another Aurelia service.
 */
export default function SahyaTeaser() {
  return (
    <section className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <Reveal className="mx-auto max-w-[1240px]">
        <div className="card-soft overflow-hidden rounded-card-lg bg-emerald/60 border border-gold/25 p-10 md:p-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
            <div>
              <SectionTag label="Aurelia · sister label" />
              <p className="mt-6 font-display text-[clamp(3rem,6vw,4.5rem)] leading-[0.95] font-bold italic text-ink">
                Sahya.
              </p>
              <p className="mt-3 font-display text-lg italic text-ink-soft">
                A label from the mountains.
              </p>
              <p className="mt-7 max-w-[520px] text-[17px] leading-relaxed text-ink-soft">
                Same Kerala supply chain, same quality standard, a deliberately different visual
                language — kraft paper instead of polished cream, stoneware instead of amber glass.
                Sahya is how Aurelia reaches the specialty grocer and the direct-to-consumer
                shelf.
              </p>
              <Link to="/specialisations/ethnic-food#sahya" className="btn-primary mt-9">
                Meet Sahya
                <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
              </Link>
            </div>

            <div className="rounded-card bg-forestDeep border border-gold/15 p-8 shadow-soft">
              <h3 className="pre-header">Where Sahya fits</h3>
              <ul className="mt-6 divide-y divide-ink/6">
                {CHANNELS.map((channel) => (
                  <li key={channel} className="flex items-center gap-3 py-4">
                    <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    <span className="text-[15px] text-ink">{channel}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
