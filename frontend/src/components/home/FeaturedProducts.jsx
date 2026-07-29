import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import { ETHNIC_FOOD_CATEGORIES } from "../../data";
import { PRODUCTS_ID } from "../../constants/sections";
import { gsap } from "../../lib/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const ALL = "all";

/** Every dry-goods line, tagged with the category it came from. */
const PRODUCTS = ETHNIC_FOOD_CATEGORIES.flatMap((category) =>
  category.products.map((product) => ({
    ...product,
    category: category.key,
    categoryLabel: category.label,
  })),
);

const FILTERS = [
  { key: ALL, label: "All", count: PRODUCTS.length },
  ...ETHNIC_FOOD_CATEGORIES.map((category) => ({
    key: category.key,
    label: category.label,
    count: category.products.length,
  })),
];

/**
 * Filterable grid over the food vertical's 38 lines.
 *
 * Filtering is client-side and instant — no route change, no refetch. The
 * swap is animated by re-running an entrance on whatever cards the new filter
 * produced, rather than choreographing an exit and then an entrance: React
 * owns which cards exist, GSAP only decorates their arrival, and the two can
 * never end up disagreeing about what is on screen.
 */
export default function FeaturedProducts() {
  const [active, setActive] = useState(ALL);
  const gridRef = useRef(null);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => (active === ALL ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)),
    [active],
  );

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
          stagger: 0.015,
          clearProps: "transform,opacity",
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [active, reduced]);

  return (
    <section id={PRODUCTS_ID} className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal stagger={0.1} className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-[560px]">
            <SectionTag label="Featured — food & grocery" />
            <h2
              className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
            >
              38 lines. <span className="italic text-accent">All sourced direct.</span>
            </h2>
          </div>
          <p className="max-w-[360px] text-[15px] leading-relaxed text-ink-soft">
            Indicative FOB Kochi pricing from Unifarex, Aurelia's primary Kerala supplier. Bulk
            rates and custom specifications on request.
          </p>
        </Reveal>

        <Reveal className="mt-12">
          <div role="group" aria-label="Filter products by category" className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                data-active={active === filter.key}
                aria-pressed={active === filter.key}
                onClick={() => setActive(filter.key)}
                className="pill"
              >
                {filter.label}
                <span className="opacity-55">{filter.count}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div
          ref={gridRef}
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {visible.map((product) => (
            <article
              key={`${product.category}-${product.name}`}
              // `min-w-0` matters: a grid item defaults to `min-width: auto`,
              // so without it the truncated product name's min-content width
              // pushes the whole track wider than the page.
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

        {/* Announced when the count changes, so a screen-reader user learns
            the filter did something. */}
        <p role="status" className="mt-6 text-[13px] text-ink-soft">
          Showing {visible.length} of {PRODUCTS.length} lines. All prices FOB Kochi, India, and
          subject to change without notice.
        </p>

        <Reveal className="mt-10">
          <Link to="/specialisations/ethnic-food" className="btn-ghost">
            See the full catalogue
            <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
