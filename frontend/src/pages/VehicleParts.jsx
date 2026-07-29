import PageHero from "../components/PageHero";
import CategoryGrid from "../components/CategoryGrid";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import SectionTag from "../components/SectionTag";
import { VEHICLE_PARTS_CATEGORIES } from "../data";

const FIGURES = [
  { value: "25M+", label: "Vehicles / year" },
  { value: "3rd", label: "Largest globally" },
  { value: "ISO/TS", label: "16949 certified" },
  { value: "Direct", label: "Manufacturer access" },
];

export default function VehicleParts() {
  return (
    <>
      <PageHero
        eyebrow="Specialisation 02"
        title={
          <>
            Vehicle Parts
            <br />
            <span className="italic text-accent">&amp; Accessories</span>
          </>
        }
        intro="OEM-quality automotive components from India's world-class manufacturing base — connecting buyers in Africa, the Middle East and South-East Asia with certified Indian suppliers."
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
              The world&rsquo;s <span className="italic text-accent">third-largest</span> auto
              manufacturer.
            </h2>
            <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
              India produces over 25 million vehicles annually and is home to world-class Tier 1 and
              Tier 2 suppliers to Tata, Mahindra, Maruti, Hero and international OEMs.
            </p>
            <p className="mt-5 text-[17px] leading-relaxed text-ink-soft">
              Aurelia&rsquo;s sourcing team works directly with certified manufacturers and trading
              houses to bring competitive pricing, quality assurance and reliable logistics to
              import markets.
            </p>
          </Reveal>

          <Reveal stagger={0.09} className="grid grid-cols-2 gap-4">
            {FIGURES.map((figure) => (
              <div key={figure.label} className="card-soft card-soft-hover p-8">
                <p className="font-display text-[34px] leading-none font-bold text-ink">
                  {figure.value}
                </p>
                <p className="pre-header mt-3">{figure.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <CategoryGrid
        eyebrow="Product categories"
        heading={
          <>
            Six categories. <span className="italic text-accent">Full coverage.</span>
          </>
        }
        intro="From a single pallet of brake pads to a container of tyres — filter to the category you need, or browse the full range."
        categories={VEHICLE_PARTS_CATEGORIES}
      />

      <CtaBand
        heading="Sourcing automotive components?"
        body="Tell us what you need — part numbers, specifications, volumes — and we will source it against your specification."
      />
    </>
  );
}
