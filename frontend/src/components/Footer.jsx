import { useState } from "react";
import { useSmartNavigate } from "../hooks/useSmartNavigate";
import Logo from "./Logo";

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 500, background: "rgba(7,30,18,0.88)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div style={{ background: "#F5F0E8", borderRadius: 12, padding: "44px 40px", maxWidth: 620, width: "100%", maxHeight: "80vh", overflowY: "auto", position: "relative" }} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#0A2E1C", opacity: 0.4 }}>✕</button>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#0A2E1C", margin: "0 0 18px" }}>{title}</h2>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(7,30,18,0.7)", lineHeight: 1.85 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Footer() {
  const [modal, setModal] = useState(null);
  // Footer uses an instant scroll-to-top (the navbar uses a smooth one).
  const go = useSmartNavigate({ smoothScrollTop: false });

  const cols = [
    {
      title: "Company",
      links: [
        { label: "About Us", action: () => go("/#about") },
        { label: "Our Story", action: () => go("/#about") },
        { label: "Careers", action: () => { window.location.href = "mailto:careers@aurelialogistics.co.uk"; } },
      ],
    },
    {
      title: "Specialisations",
      links: [
        { label: "Ethnic Food & Grocery", action: () => go("/specialisations/ethnic-food") },
        { label: "Vehicle Parts", action: () => go("/specialisations/vehicle-parts") },
        { label: "Pharmaceuticals", action: () => go("/specialisations/pharmaceuticals") },
        { label: "Sahya — Our B2C Label", action: () => go("/specialisations/ethnic-food#sahya") },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", action: () => setModal("privacy") },
        { label: "Terms of Service", action: () => setModal("terms") },
        { label: "Certifications", action: () => go("/specialisations") },
      ],
    },
  ];

  return (
    <>
      {modal === "privacy" && (
        <Modal title="Privacy Policy" onClose={() => setModal(null)}>
          <p><strong>Last updated: June 2026</strong></p>
          <p style={{ marginTop: 14 }}>Aurelia Logistics Ltd collects personal information (name, email, company, phone) solely to respond to trade enquiries and quote requests submitted through this website.</p>
          <p style={{ marginTop: 12 }}>We do not sell, rent, or share your data with third parties for marketing purposes. Your information is stored securely and retained for no longer than necessary to fulfil the purpose for which it was collected.</p>
          <p style={{ marginTop: 12 }}>You may request access to, correction of, or deletion of your personal data at any time by emailing <strong>enquiries@aurelialogistics.co.uk</strong>.</p>
          <p style={{ marginTop: 12 }}>For questions regarding this policy, contact us at <strong>enquiries@aurelialogistics.co.uk</strong>.</p>
        </Modal>
      )}
      {modal === "terms" && (
        <Modal title="Terms of Service" onClose={() => setModal(null)}>
          <p><strong>Last updated: June 2026</strong></p>
          <p style={{ marginTop: 14 }}>By using this website you agree to these terms. This site is provided for informational and enquiry purposes only. No binding contracts are formed through the website — all orders are subject to a separate signed agreement.</p>
          <p style={{ marginTop: 12 }}>All product specifications, pricing indications, and availability are subject to change without notice. Confirmed pricing is provided only in formal written quotations issued by Aurelia Logistics Ltd.</p>
          <p style={{ marginTop: 12 }}>Governing law: England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.</p>
          <p style={{ marginTop: 12 }}>For questions, contact <strong>enquiries@aurelialogistics.co.uk</strong>.</p>
        </Modal>
      )}

      <footer style={{ background: "#040F09", padding: "64px 24px 36px" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48, marginBottom: 56 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <Logo size={36} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: "#E8C547" }}>AURELIA</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.35)", lineHeight: 1.8 }}>
                UK-registered global trade facilitator. Ethnic food, vehicle parts, and pharmaceuticals — from South Asia to the world.
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(200,150,62,0.5)", marginTop: 16 }}>
                Parent of <em>Sahya</em> — a label from the mountains.
              </p>
            </div>

            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              {cols.map((col) => (
                <div key={col.title}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.22)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>{col.title}</div>
                  {col.links.map((link) => (
                    <div key={link.label} onClick={link.action} style={{
                      fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.45)",
                      marginBottom: 12, cursor: "pointer", transition: "color 0.25s",
                    }}
                      onMouseEnter={(e) => e.target.style.color = "#C8963E"}
                      onMouseLeave={(e) => e.target.style.color = "rgba(245,240,232,0.45)"}
                    >
                      {link.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(245,240,232,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.2)" }}>© 2026 Aurelia Logistics Ltd. All rights reserved.</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.2)" }}>Kochi · Mumbai · Dubai · London</span>
          </div>
        </div>
      </footer>
    </>
  );
}
