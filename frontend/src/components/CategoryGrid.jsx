import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Reveal from "./Reveal";
import SectionTag from "./SectionTag";
import { gsap } from "../lib/gsap";
import { useReducedMotion } from "../hooks/useReducedMotion";

const ALL = "all";

/**
 * Pill-filtered grid of category cards, shared by the vehicle-parts and
 * pharmaceuticals pages.
 *
 * Every category's items are on screen from the start; the pills narrow the
 * grid rather than revealing content that was otherwise hidden. That is a
 * deliberate change from the accordion this replaces — an accordion made the
 * page look short and put six clicks between a buyer and the list they came
 * for, none of which a search engine ever saw either.
 *
 * @param {object}   props
 * @param {string}   props.eyebrow
 * @param {React.ReactNode} props.heading
 * @param {string}   [props.intro]
 * @param {Array<{key: string, label: string, description: string, items: string[]}>} props.categories
 */
export default function CategoryGrid({ eyebrow, heading, intro, categories }) {
  const [active, setActive] = useState(ALL);
  const gridRef = useRef(null);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => (active === ALL ? categories : categories.filter((c) => c.key === active)),
    [active, categories],
  );

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || reduced) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        grid.children,
        { opacity: 0, scale: 0.97, y: 12 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
          stagger: 0.05,
          clearProps: "transform,opacity",
        },
      );
    }, gridRef);

    return () => ctx.revert();
  }, [active, reduced]);

  return (
    <section className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal stagger={0.1} className="max-w-[620px]">
          <SectionTag label={eyebrow} />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            {heading}
          </h2>
          {intro ? (
            <p className="mt-6 text-[17px] leading-relaxed text-ink-soft">{intro}</p>
          ) : null}
        </Reveal>

        <Reveal className="mt-12">
          <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
            <button
              type="button"
              data-active={active === ALL}
              aria-pressed={active === ALL}
              onClick={() => setActive(ALL)}
              className="pill"
            >
              All categories
            </button>
            {categories.map((category) => (
              <button
                key={category.key}
                type="button"
                data-active={active === category.key}
                aria-pressed={active === category.key}
                onClick={() => setActive(category.key)}
                className="pill"
              >
                {category.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div ref={gridRef} className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((category, index) => (
            <article key={category.key} className="card-soft card-soft-hover min-w-0 p-8">
              <p className="pre-header">
                Category {String(categories.indexOf(category) + 1 || index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{category.label}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                {category.description}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2 border-t border-ink/6 pt-6">
                {category.items.map((item) => (
                  <li key={item} className="pill cursor-default px-3 py-1.5 text-[12px]">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
