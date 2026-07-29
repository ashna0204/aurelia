import { useLayoutEffect, useRef, useState } from "react";
import PageHero from "../components/PageHero";
import CtaBand from "../components/CtaBand";
import Reveal from "../components/Reveal";
import SectionTag from "../components/SectionTag";
import { ETHNIC_FOOD_CATEGORIES } from "../data";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

/* ─── Sahya ─── */

const IDENTITY = [
  { label: "Etymology", value: "From Sahyadri, the indigenous name for the Western Ghats" },
  { label: "Visual tone", value: "Editorial, earthen, small-batch" },
  { label: "Display type", value: "Fraunces — warm variable serif" },
  { label: "Substrate", value: "Kraft paper pouches · Stoneware ceramic" },
  { label: "Hero format", value: "The Harvest Crate — straw-lined kraft board" },
  { label: "Audience", value: "Specialty grocers · Cafés · DTC · Diaspora" },
];

const BRANDS = [
  {
    name: "Aurelia",
    kicker: "The elder · established line",
    rows: [
      ["Audience", "Embassies, luxury HoReCa, premium gifting"],
      ["Format", "Cream pouches, amber glass, foil-stamped board"],
      ["Frequency", "Low repeat, high ticket"],
      ["Hero", "The Heritage Box — phthalo hamper"],
    ],
  },
  {
    name: "Sahya",
    kicker: "The younger · new volume driver",
    rows: [
      ["Audience", "Specialty grocers, cafés, DTC, diaspora"],
      ["Format", "Kraft pouches, stoneware ceramic, board crates"],
      ["Frequency", "High repeat, mid ticket"],
      ["Hero", "The Harvest Crate — straw-lined kraft"],
    ],
  },
];

const CHANNELS = [
  { label: "Grocer", sub: "Specialty & independent — Whole Foods, Eataly, Selfridges Food Hall" },
  { label: "HoReCa", sub: "Independent cafés & small restaurants. Buyers want sourcing stories." },
  { label: "DTC", sub: "The Harvest Crate via Sahya's site & partner subscription boxes." },
  {
    label: "Diaspora",
    sub: "Second-generation South Asian — the products without the dated packaging.",
  },
];

function SahyaFeature() {
  return (
    <section id="sahya" className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-[1240px]">
        <div className="card-soft rounded-card-lg bg-gold/8 p-8 md:p-14">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal stagger={0.1}>
              <SectionTag label="Aurelia Logistics · sister label" />
              <p className="mt-6 font-display text-[clamp(3rem,7vw,5rem)] leading-[0.95] font-bold italic text-ink">
                Sahya.
              </p>
              <p className="mt-3 font-display text-lg italic text-ink-soft">
                A label from the mountains.
              </p>
              <p className="mt-7 text-[17px] leading-relaxed text-ink-soft">
                Sahya is Aurelia&rsquo;s B2C label — built to capture the specialty-grocer and
                direct-to-consumer market our classical export brand cannot reach.
              </p>
              <p className="mt-5 text-[16px] leading-relaxed text-ink-soft">
                Same Kerala supply chain. Same quality standard. A deliberately different visual
                language: <strong className="font-medium text-ink">kraft paper</strong> instead of
                polished cream, stoneware ceramic instead of amber glass, laterite red and monsoon
                indigo instead of phthalo green and gilt gold.
              </p>
            </Reveal>

            <Reveal>
              <div className="rounded-card bg-surface p-8 shadow-soft">
                <h3 className="pre-header">Identity vitals</h3>
                <dl className="mt-6 divide-y divide-ink/6">
                  {IDENTITY.map((row) => (
                    <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[120px_1fr] sm:gap-4">
                      <dt className="pre-header">{row.label}</dt>
                      <dd className="font-display text-[15px] italic text-ink">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>

          <Reveal stagger={0.1} className="mt-14 grid gap-5 md:grid-cols-2">
            {BRANDS.map((brand) => (
              <div key={brand.name} className="rounded-card bg-surface p-8 shadow-soft">
                <p className="pre-header">{brand.kicker}</p>
                <p
                  className={`mt-4 font-display text-2xl font-bold ${
                    brand.name === "Sahya" ? "italic text-gold" : "tracking-[0.1em] text-ink"
                  }`}
                >
                  {brand.name === "Sahya" ? "Sahya" : "AURELIA"}
                </p>
                <dl className="mt-6 space-y-4">
                  {brand.rows.map(([label, value]) => (
                    <div key={label}>
                      <dt className="pre-header">{label}</dt>
                      <dd className="mt-1 text-[14px] text-ink-soft">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </Reveal>

          <Reveal stagger={0.08} className="mt-14">
            <h3 className="pre-header col-span-full">Where Sahya fits — four channels</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CHANNELS.map((channel) => (
                <div key={channel.label} className="rounded-card bg-surface p-6 shadow-soft">
                  <p className="font-display text-xl italic text-gold">{channel.label}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{channel.sub}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── Catalogue ─── */

function ProductCatalogue() {
  const [openCat, setOpenCat] = useState(ETHNIC_FOOD_CATEGORIES[0].key);
  const gridRef = useRef(null);
  const reduced = useReducedMotion();

  const category = ETHNIC_FOOD_CATEGORIES.find((c) => c.key === openCat);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        grid.children,
        { opacity: 0, scale: 0.97, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          stagger: 0.02,
          clearProps: "transform,opacity",
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [openCat, reduced]);

  return (
    <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal stagger={0.1} className="max-w-[620px]">
          <SectionTag label="Product catalogue" />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            38 product lines.
            <br />
            <span className="italic text-accent">All sourced direct.</span>
          </h2>
          <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">
            FOB pricing from Unifarex — Aurelia&rsquo;s primary Kerala supplier. All prices in USD
            per package. Contact us for bulk rates and custom specifications.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div role="group" aria-label="Filter catalogue by category" className="flex flex-wrap gap-2">
            {ETHNIC_FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                data-active={openCat === cat.key}
                aria-pressed={openCat === cat.key}
                onClick={() => setOpenCat(cat.key)}
                className="pill"
              >
                {cat.label}
                <span className="opacity-55">{cat.products.length}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <p className="mt-8 max-w-[620px] text-[15px] leading-relaxed text-ink-soft">
          {category.description}
        </p>

        <div ref={gridRef} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {category.products.map((product) => (
            <article
              key={product.name}
              // See FeaturedProducts: grid items need `min-w-0` or the
              // truncated name sets the track width.
              className="card-soft card-soft-hover flex min-w-0 items-center justify-between gap-4 p-5"
            >
              <div className="min-w-0">
                <h3 className="truncate text-[15px] font-medium text-ink">{product.name}</h3>
                <p className="mt-1 text-[13px] text-ink-soft">{product.pkg}</p>
              </div>
              <span className="shrink-0 rounded-full bg-accent/8 px-3 py-1.5 font-display text-[15px] font-semibold text-accent">
                {product.price}
              </span>
            </article>
          ))}
        </div>

        <p className="mt-6 text-[13px] text-ink-soft">
          All prices FOB Kochi, India. Prices subject to change without notice — contact us for bulk
          rates.
        </p>
      </div>
    </section>
  );
}

export default function EthnicFood() {
  return (
    <>
      <PageHero
        eyebrow="Specialisation 01"
        title={
          <>
            Ethnic Food
            <br />
            <span className="italic text-accent">&amp; Grocery</span>
          </>
        }
        intro="Authentic South Asian dry goods sourced directly from Kerala's growers and processors — supplying importers, ethnic grocery chains, foodservice distributors, and Aurelia's own Sahya label."
        back={{ to: "/specialisations", label: "Specialisations" }}
        highlightRegions={["southAsia"]}
      />

      <ProductCatalogue />
      <SahyaFeature />

      <CtaBand
        heading="Ready to source?"
        body="Request an FOB quote, or ask about the Sahya partnership programme for specialty retail."
      />
    </>
  );
}
