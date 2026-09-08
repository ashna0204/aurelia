import { useSmartNavigate } from "../hooks/useSmartNavigate";
import Logo from "./Logo";
import { EXPERTISE, expertisePath } from "../constants/expertise";

const EMAIL = "enquiries@aurelialogistics.co.uk";

export default function Footer() {
  // Footer uses an instant scroll-to-top (the navbar uses a smooth one).
  const go = useSmartNavigate({ smoothScrollTop: false });

  const cols = [
    {
      title: "Company",
      links: [
        { label: "About", action: () => go("/about") },
        { label: "Areas of Expertise", action: () => go("/expertise") },
        { label: "Contact", action: () => go("/contact") },
      ],
    },
    {
      title: "What We Source",
      links: [
        ...EXPERTISE.map((area) => ({
          label: area.label,
          action: () => go(expertisePath(area.slug)),
        })),
        { label: "Sahya", action: () => go("/sahya") },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", action: () => go("/privacy") },
        { label: "Terms of Service", action: () => go("/terms") },
      ],
    },
  ];

  return (
    <footer style={{ background: "#040F09", padding: "64px 24px 36px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 48, marginBottom: 56 }}>
          <div style={{ maxWidth: 300 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Logo size={36} style={{ flexShrink: 0 }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: "#E8C547" }}>AURELIA LOGISTICS</span>
            </div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.35)", lineHeight: 1.8 }}>
              A UK-based sourcing and trade partner, working between international buyers and manufacturers and suppliers worldwide.
            </p>
            <a href={`mailto:${EMAIL}`} style={{
              display: "inline-block", marginTop: 16, textDecoration: "none",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(200,150,62,0.75)",
            }}>
              {EMAIL}
            </a>
          </div>

          <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
            {cols.map((col) => (
              <div key={col.title}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(245,240,232,0.22)", letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: 18 }}>{col.title}</div>
                {col.links.map((link) => (
                  <div key={link.label} onClick={link.action} style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "rgba(245,240,232,0.45)",
                    marginBottom: 12, cursor: "pointer", transition: "color 0.25s", maxWidth: 240,
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
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "rgba(245,240,232,0.2)" }}>United Kingdom</span>
        </div>
      </div>
    </footer>
  );
}
