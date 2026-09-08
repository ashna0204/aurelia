import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Expertise from "./pages/Expertise";
import FoodGrocery from "./pages/FoodGrocery";
import FoodCatalogue from "./pages/FoodCatalogue";
import Automotive from "./pages/Automotive";
import Healthcare from "./pages/Healthcare";
import Perfume from "./pages/Perfume";
import Sahya from "./pages/Sahya";
import QuotePage from "./pages/QuotePage";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

// The pre-rewrite URLs. Kept as redirects because they are the ones already
// shared, linked and indexed — dropping them would turn every existing link
// into a 404.
const LEGACY_REDIRECTS = [
  ["/specialisations", "/expertise"],
  ["/specialisations/ethnic-food", "/expertise/food-grocery"],
  ["/specialisations/vehicle-parts", "/expertise/automotive"],
  ["/specialisations/pharmaceuticals", "/expertise/healthcare"],
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/expertise" element={<Expertise />} />
        <Route path="/expertise/food-grocery" element={<FoodGrocery />} />
        <Route path="/expertise/food-grocery/catalogue" element={<FoodCatalogue />} />
        <Route path="/expertise/automotive" element={<Automotive />} />
        <Route path="/expertise/healthcare" element={<Healthcare />} />
        <Route path="/expertise/perfume" element={<Perfume />} />
        <Route path="/sahya" element={<Sahya />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {LEGACY_REDIRECTS.map(([from, to]) => (
          <Route key={from} path={from} element={<Navigate to={to} replace />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
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
