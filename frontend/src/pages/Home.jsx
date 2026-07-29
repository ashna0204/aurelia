import ContainerJourney from "../components/ContainerJourney";
import Hero from "../components/home/Hero";
import TrustMarquee from "../components/home/TrustMarquee";
import TradeRouteSection from "../components/home/TradeRouteSection";
import AboutSection from "../components/home/AboutSection";
import VerticalsGrid from "../components/home/VerticalsGrid";
import FeaturedProducts from "../components/home/FeaturedProducts";
import KeyFeatures from "../components/home/KeyFeatures";
import SahyaTeaser from "../components/home/SahyaTeaser";
import DarkCTA from "../components/home/DarkCTA";
import ContactSection from "../components/home/ContactSection";

/**
 * The home page reads as one scroll: the hero states the promise, the pinned
 * map shows the reach, and everything after it narrows from what we sell down
 * to a single form.
 *
 * The verticals grid follows the map directly because that is where the
 * travelling container fades out — putting a section between them would leave
 * it hanging over unrelated copy on its way off screen.
 *
 * `ContainerJourney` sits outside the flow — it is a fixed layer that the
 * sections below scroll underneath — which is what lets one container travel
 * from the hero all the way to the verticals grid without belonging to any of
 * them.
 */
export default function Home() {
  return (
    <>
      <ContainerJourney />
      <Hero />
      <TrustMarquee />
      <TradeRouteSection />
      <VerticalsGrid />
      <FeaturedProducts />
      <KeyFeatures />
      <AboutSection />
      <SahyaTeaser />
      <DarkCTA />
      <ContactSection />
    </>
  );
}
