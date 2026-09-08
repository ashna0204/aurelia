/**
 * Layout for the two legal pages.
 *
 * Deliberately plain: these pages are read for their content, so they get a
 * single measured column and no ornament.
 */

import FadeIn from "./FadeIn";
import { colors, fonts } from "../theme";

export function LegalBody({ children }) {
  return (
    <section style={{ padding: "0 24px 110px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

export function LegalClause({ heading, children }) {
  return (
    <FadeIn>
      <div style={{ marginBottom: 44 }}>
        <h2 style={{
          fontFamily: fonts.serif, fontSize: 22, fontWeight: 600,
          color: colors.cream, margin: "0 0 14px", lineHeight: 1.3,
        }}>
          {heading}
        </h2>
        <div style={{
          fontFamily: fonts.sans, fontSize: 15, color: "rgba(245,240,232,0.6)",
          lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 14,
        }}>
          {children}
        </div>
      </div>
    </FadeIn>
  );
}
