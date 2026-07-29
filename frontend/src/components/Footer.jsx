import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useSmartNavigate } from "../hooks/useSmartNavigate";
import WorldMap from "./WorldMap";

/** Aurelia's four offices, in the order they appear across the footer. */
const OFFICES = [
  {
    city: "Kochi",
    role: "Headquarters",
    lines: ["Kerala, India", "Sourcing, QC & consolidation"],
  },
  {
    city: "Mumbai",
    role: "Office",
    lines: ["Maharashtra, India", "Vehicle parts & pharma sourcing"],
  },
  {
    city: "Dubai",
    role: "Office",
    lines: ["United Arab Emirates", "Gulf distribution & re-export"],
  },
  {
    city: "London",
    role: "Registered Office",
    lines: ["United Kingdom", "Aurelia Logistics Ltd"],
  },
];

function Modal({ title, onClose, children }) {
  // Escape closes the dialog. Without it the only way out is the mouse, which
  // strands a keyboard user inside a modal that covers the whole page.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-500 flex items-center justify-center bg-ink/70 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[80vh] w-full max-w-[620px] overflow-y-auto rounded-card bg-surface p-10 shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-ink-soft hover:bg-ink/5"
        >
          <X size={18} strokeWidth={1.5} />
        </button>
        <h2 className="mb-5 font-display text-2xl font-semibold text-ink">{title}</h2>
        <div className="space-y-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
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
        {
          label: "Careers",
          // assign() rather than setting location.href — same effect, but it
          // is a method call rather than a write to a value React's rules
          // (rightly) treat as outside the component's control.
          action: () => window.location.assign("mailto:careers@aurelialogistics.co.uk"),
        },
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
          <p>
            <strong className="text-ink">Last updated: June 2026</strong>
          </p>
          <p>
            Aurelia Logistics Ltd collects personal information (name, email, company, phone) solely
            to respond to trade enquiries and quote requests submitted through this website.
          </p>
          <p>
            We do not sell, rent, or share your data with third parties for marketing purposes. Your
            information is stored securely and retained for no longer than necessary to fulfil the
            purpose for which it was collected.
          </p>
          <p>
            You may request access to, correction of, or deletion of your personal data at any time
            by emailing <strong className="text-ink">enquiries@aurelialogistics.co.uk</strong>.
          </p>
          <p>
            For questions regarding this policy, contact us at{" "}
            <strong className="text-ink">enquiries@aurelialogistics.co.uk</strong>.
          </p>
        </Modal>
      )}
      {modal === "terms" && (
        <Modal title="Terms of Service" onClose={() => setModal(null)}>
          <p>
            <strong className="text-ink">Last updated: June 2026</strong>
          </p>
          <p>
            By using this website you agree to these terms. This site is provided for informational
            and enquiry purposes only. No binding contracts are formed through the website — all
            orders are subject to a separate signed agreement.
          </p>
          <p>
            All product specifications, pricing indications, and availability are subject to change
            without notice. Confirmed pricing is provided only in formal written quotations issued
            by Aurelia Logistics Ltd.
          </p>
          <p>
            Governing law: England and Wales. Any disputes shall be subject to the exclusive
            jurisdiction of the English courts.
          </p>
          <p>
            For questions, contact{" "}
            <strong className="text-ink">enquiries@aurelialogistics.co.uk</strong>.
          </p>
        </Modal>
      )}

      <footer className="relative overflow-hidden bg-ink px-6 pt-20 pb-10 text-white/75">
        {/* The map motif again, at the faintest it appears anywhere on the
            site — enough to texture the block, not enough to compete. */}
        <WorldMap
          className="pointer-events-none absolute -top-8 right-0 w-[820px] max-w-none"
          dotColor="#FFFFFF"
          dotOpacity={0.08}
          highlightColor="#FFFFFF"
          highlightOpacity={0.2}
          highlightRegions={["southAsia", "gulf", "uk"]}
        />

        <div className="relative mx-auto max-w-[1240px]">
          <div className="flex flex-wrap items-start justify-between gap-x-16 gap-y-12">
            <div className="max-w-[320px]">
              <div className="mb-5 flex items-center gap-3">
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-white font-display text-[15px] font-bold text-ink"
                  aria-hidden="true"
                >
                  A
                </span>
                <span className="font-display text-[17px] font-semibold tracking-[0.08em] text-white">
                  AURELIA LOGISTICS
                </span>
              </div>
              <p className="text-sm leading-relaxed">
                UK-registered global trade facilitator. Ethnic food, vehicle parts, and
                pharmaceuticals — from South Asia to the world.
              </p>
              <p className="mt-4 text-[13px] text-gold">
                Parent of <em>Sahya</em> — a label from the mountains.
              </p>
            </div>

            <nav aria-label="Footer" className="flex flex-wrap gap-x-14 gap-y-10">
              {cols.map((col) => (
                <div key={col.title}>
                  <h2 className="pre-header mb-5 text-white/65">{col.title}</h2>
                  <ul className="space-y-3">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <button
                          type="button"
                          onClick={link.action}
                          className="text-left text-sm text-white/75 transition-colors duration-200 hover:text-white"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* ── Offices ── */}
          <div className="mt-16 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((office) => (
              <div key={office.city}>
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="size-1.5 shrink-0 rounded-full bg-teal" aria-hidden="true" />
                  <span className="font-display text-lg font-semibold text-white">
                    {office.city}
                  </span>
                </div>
                <p className="pre-header mb-2 text-white/65">{office.role}</p>
                {office.lines.map((line) => (
                  <p key={line} className="text-sm leading-relaxed text-white/70">
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-white/65">
            <span>© 2026 Aurelia Logistics Ltd. All rights reserved.</span>
            <a
              href="mailto:enquiries@aurelialogistics.co.uk"
              className="transition-colors duration-200 hover:text-white"
            >
              enquiries@aurelialogistics.co.uk
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
