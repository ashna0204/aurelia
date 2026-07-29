import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SmoothScroll from "./components/SmoothScroll";
import Home from "./pages/Home";
import Specialisations from "./pages/Specialisations";
import EthnicFood from "./pages/EthnicFood";
import VehicleParts from "./pages/VehicleParts";
import Pharmaceuticals from "./pages/Pharmaceuticals";
import QuotePage from "./pages/QuotePage";
import NotFound from "./pages/NotFound";
import { scrollToTop } from "./lib/scroll";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Instant, and routed through lib/scroll so Lenis is told about it rather
    // than being yanked to the top behind its own back.
    scrollToTop({ immediate: true });
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <SmoothScroll />
      <ScrollToTop />
      <Navbar />
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/specialisations" element={<Specialisations />} />
          <Route path="/specialisations/ethnic-food" element={<EthnicFood />} />
          <Route path="/specialisations/vehicle-parts" element={<VehicleParts />} />
          <Route path="/specialisations/pharmaceuticals" element={<Pharmaceuticals />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
