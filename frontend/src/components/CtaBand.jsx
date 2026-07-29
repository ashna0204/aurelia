import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import WorldMap from "./WorldMap";
import { ROUTES } from "../lib/worldMap";

/**
 * The closing ink block each inner page ends on — the same shape as the home
 * page's dark CTA, so a reader who lands mid-site meets the same full stop.
 *
 * @param {object} props
 * @param {React.ReactNode} props.heading
 * @param {string} props.body
 */
export default function CtaBand({ heading, body }) {
  return (
    <section className="bg-bg px-6 pb-24 md:px-8 md:pb-32">
      <Reveal className="mx-auto max-w-[1240px]">
        <div className="relative overflow-hidden rounded-card-lg bg-ink px-8 py-20 text-center md:px-16">
          <WorldMap
            className="pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
            dotColor="#FFFFFF"
            dotOpacity={0.07}
            routes={[ROUTES.corridor]}
            routeColor="#FFFFFF"
            routeOpacity={0.16}
          />
          <div className="relative mx-auto max-w-[620px]">
            <h2
              className="font-display text-cta font-bold leading-[1.08] tracking-[-0.015em] text-white"
            >
              {heading}
            </h2>
            <p className="mx-auto mt-5 max-w-[480px] text-[16px] leading-relaxed text-white/75">
              {body}
            </p>
            <Link to="/quote" className="btn-primary mt-9 bg-white text-ink">
              Request a Quote
              <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
