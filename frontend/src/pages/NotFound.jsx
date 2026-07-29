import { Link } from "react-router-dom";
import Reveal from "../components/Reveal";
import SectionTag from "../components/SectionTag";
import WorldMap from "../components/WorldMap";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh items-center overflow-hidden bg-bg px-6 pt-header pb-24 md:px-8">
      <WorldMap
        className="pointer-events-none absolute inset-x-0 top-1/2 w-full -translate-y-1/2"
        dotOpacity={0.06}
      />

      <div className="relative mx-auto w-full max-w-[820px]">
        <Reveal stagger={0.1}>
          <SectionTag label="Error 404" />
          <h1
            className="mt-5 font-display text-display font-bold leading-[1.04] tracking-[-0.02em] text-ink"
          >
            This page has gone <span className="italic text-accent">astray.</span>
          </h1>
          <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-ink-soft">
            The page you&rsquo;re looking for doesn&rsquo;t exist or has been moved. Let&rsquo;s get
            you back on route.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
            <Link to="/specialisations" className="btn-ghost">
              Our Specialisations
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
