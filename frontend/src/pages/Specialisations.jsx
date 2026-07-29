import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageHero from "../components/PageHero";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import { VERTICALS } from "../constants/verticals";

/** Headline figures per vertical, shown alongside the description. */
const STATS = {
  "ethnic-food": [
    { value: "38", label: "Products" },
    { value: "6", label: "Categories" },
    { value: "Kerala", label: "Heartland" },
  ],
  "vehicle-parts": [
    { value: "6", label: "Categories" },
    { value: "OEM", label: "Quality standard" },
    { value: "Global", label: "Reach" },
  ],
  pharmaceuticals: [
    { value: "6", label: "Categories" },
    { value: "WHO-GMP", label: "Certified" },
    { value: "USFDA", label: "Approved sources" },
  ],
};

export default function Specialisations() {
  return (
    <>
      <PageHero
        eyebrow="Areas of specialisation"
        title={
          <>
            Three sectors.
            <br />
            <span className="italic text-accent">Deep expertise.</span>
          </>
        }
        intro="Aurelia Logistics operates across three distinct trade verticals — each backed by its own sourcing network, its own compliance knowledge, and years of on-the-ground relationships in South Asia."
        highlightRegions={["southAsia", "gulf", "uk"]}
      />

      <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6">
          {VERTICALS.map((vertical, index) => (
            <Reveal key={vertical.key}>
              <Link
                to={vertical.slug}
                className="card-soft card-soft-hover group grid min-w-0 gap-10 rounded-card-lg p-8 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:p-12"
              >
                <div>
                  <p className="pre-header">
                    Specialisation {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-5 font-display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-tight font-semibold text-ink">
                    {vertical.label}
                  </h2>
                  <p className="mt-2 font-display text-[17px] italic text-accent">
                    {vertical.tagline}
                  </p>
                  <p className="mt-6 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
                    {vertical.description}
                  </p>
                  <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ink">
                    Explore {vertical.label}
                    <ArrowRight
                      size={15}
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </span>
                </div>

                <div className="flex flex-col justify-between gap-8 border-ink/6 md:border-l md:pl-10">
                  <dl className="space-y-6">
                    {STATS[vertical.key].map((stat) => (
                      // Column-reverse so the figure reads above its label
                      // while `dt` still precedes `dd` in the DOM, which is
                      // what a definition list actually requires.
                      <div key={stat.label} className="flex flex-col-reverse">
                        <dt className="pre-header mt-1.5">{stat.label}</dt>
                        <dd className="font-display text-3xl leading-none font-bold text-ink">
                          {stat.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="flex flex-wrap gap-2">
                    {vertical.tags.map((tag) => (
                      <li key={tag} className="pill cursor-default px-3 py-1.5 text-[12px]">
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        heading="Not sure which vertical fits?"
        body="Describe what you are sourcing and we will route it to the right desk — or across more than one, in a single consolidated consignment."
      />
    </>
  );
}
