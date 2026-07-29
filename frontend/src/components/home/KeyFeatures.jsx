import { useLayoutEffect, useRef } from "react";
import { Boxes, FileCheck2, Headset, Ship, ShieldCheck, Search } from "lucide-react";
import Reveal from "../Reveal";
import SectionTag from "../SectionTag";
import { gsap } from "../../lib/gsap";
import { useReducedMotion } from "../../hooks/useReducedMotion";

const FEATURES = [
  {
    icon: Search,
    title: "Sourcing",
    body: "Direct relationships with growers, processors and Tier 1 manufacturers — not a broker's address book.",
  },
  {
    icon: ShieldCheck,
    title: "Quality control",
    body: "Pre-shipment inspection at origin against your specification, with photographic reports before anything is sealed.",
  },
  {
    icon: FileCheck2,
    title: "Documentation",
    body: "Certificates of origin, phytosanitary and GMP paperwork, and destination-market labelling prepared in advance.",
  },
  {
    icon: Ship,
    title: "Freight",
    body: "FCL and consolidated LCL out of Kochi, Nhava Sheva and Jebel Ali, with door delivery where you need it.",
  },
  {
    icon: Boxes,
    title: "Consolidation",
    body: "Mixed consignments across all three verticals in a single container, so a small order still ships economically.",
  },
  {
    icon: Headset,
    title: "Support",
    body: "One named contact for the life of the shipment, in a timezone that overlaps yours.",
  },
];

/**
 * "Taking care of every client" — the operational promise, as six cards.
 *
 * The icon badges lift and scale as each card enters, which is the one place
 * on the page where motion carries meaning rather than polish: it draws the
 * eye across the row in reading order.
 */
export default function KeyFeatures() {
  const rootRef = useRef(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return undefined;

    const ctx = gsap.context(() => {
      gsap.from("[data-feature-icon]", {
        scale: 0.5,
        y: 10,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.08,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
      });
    }, rootRef);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="bg-bg px-6 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <Reveal stagger={0.1} className="max-w-[620px]">
          <SectionTag label="How we work" />
          <h2
            className="mt-5 font-display text-section font-bold leading-[1.08] tracking-[-0.015em] text-ink"
          >
            Taking care of <span className="italic text-accent">every client.</span>
          </h2>
        </Reveal>

        <Reveal stagger={0.08} className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="card-soft card-soft-hover p-8">
              <span
                data-feature-icon
                className="grid size-12 place-items-center rounded-full bg-accent/8"
                aria-hidden="true"
              >
                <Icon size={20} strokeWidth={1.5} className="text-accent" />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-ink">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{body}</p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
