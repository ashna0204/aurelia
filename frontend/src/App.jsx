import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Specialisations from "./pages/Specialisations";
import EthnicFood from "./pages/EthnicFood";
import VehicleParts from "./pages/VehicleParts";
import Pharmaceuticals from "./pages/Pharmaceuticals";
import QuotePage from "./pages/QuotePage";
import NotFound from "./pages/NotFound";

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
        <Route path="/specialisations" element={<Specialisations />} />
        <Route path="/specialisations/ethnic-food" element={<EthnicFood />} />
        <Route path="/specialisations/vehicle-parts" element={<VehicleParts />} />
        <Route path="/specialisations/pharmaceuticals" element={<Pharmaceuticals />} />
        <Route path="/quote" element={<QuotePage />} />
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
