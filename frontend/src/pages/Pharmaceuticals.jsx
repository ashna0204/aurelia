import PageHero from "../components/PageHero";
import CategoryGrid from "../components/CategoryGrid";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import SectionTag from "../components/SectionTag";
import { PHARMA_CATEGORIES } from "../data";

const FIGURES = [
  { value: "20%+", label: "Global generic supply" },
  { value: "60%", label: "Global vaccines" },
  { value: "#1", label: "USFDA approved (ex-US)" },
  { value: "Cold chain", label: "Full capability" },
];

const CERTIFICATIONS = [
  { label: "WHO-GMP", desc: "World Health Organisation Good Manufacturing Practice" },
  { label: "USFDA", desc: "US Food & Drug Administration approved facilities" },
  { label: "EU-GMP", desc: "European Union manufacturing standards" },
  { label: "CDSCO", desc: "Central Drugs Standard Control Organisation (India)" },
  { label: "ISO 9001", desc: "Quality management systems certification" },
  { label: "Ayush GMP", desc: "Ministry of Ayush compliance for herbal products" },
];

export default function Pharmaceuticals() {
  return (
    <>
      <PageHero
        eyebrow="Specialisation 03"
        title={
          <>
            Pharmaceuticals
            <br />
            <span className="italic text-accent">&amp; Healthcare</span>
          </>
        }
        intro="Temperature-controlled, compliance-first pharmaceutical logistics — from WHO-GMP finished formulations and Ayurvedic preparations to APIs and medical consumables."
        back={{ to: "/specialisations", label: "Specialisations" }}
        highlightRegions={["southAsia"]}
      />

      <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto grid max-w-[1240px] items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <Reveal stagger={0.1}>
            <SectionTag label="Why India" />
            <h2
              className="mt-5 font-display text-subsection font-bold leading-[1.08] tracking-[-0.015em] text-ink"
            >
              The world&rsquo;s <span className="italic text-accent">pharmacy.</span>
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
              India supplies over 20% of the world&rsquo;s generic medicines and 60% of global
              vaccine demand, and is home to more USFDA-approved manufacturing sites outside the US
              than any other nation.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
              Aurelia sources exclusively from certified facilities — WHO-GMP, USFDA and EU-GMP
              approved — so every shipment meets the regulatory requirements of its destination
              market.
            </p>
          </Reveal>

          <Reveal stagger={0.09} className="grid grid-cols-2 gap-4">
            {FIGURES.map((figure) => (
              <div key={figure.label} className="card-soft card-soft-hover p-8">
                <p className="font-display text-[30px] leading-none font-bold text-ink">
                  {figure.value}
                </p>
                <p className="pre-header mt-3">{figure.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <SectionTag label="Compliance standards we work to" />
          </Reveal>
          <Reveal stagger={0.07} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CERTIFICATIONS.map((certification) => (
              <div key={certification.label} className="card-soft card-soft-hover p-7">
                <h3 className="font-display text-lg font-semibold text-accent">
                  {certification.label}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                  {certification.desc}
                </p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CategoryGrid
        eyebrow="Product categories"
        heading={
          <>
            Six categories. <span className="italic text-accent">End-to-end coverage.</span>
          </>
        }
        intro="Finished formulations through to active ingredients, with the documentation each destination market expects prepared before the consignment leaves."
        categories={PHARMA_CATEGORIES}
      />

      <CtaBand
        heading="Sourcing pharmaceuticals?"
        body="We will match your requirement to certified manufacturers and handle the compliance documentation end-to-end."
      />
    </>
  );
}
