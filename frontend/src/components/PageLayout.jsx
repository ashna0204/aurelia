/**
 * Shared building blocks for the content pages.
 *
 * The rewrite gives every sourcing area the same shape — hero, a run of
 * heading/copy sections, a closing CTA — so those live here once rather than
 * being re-typed as inline styles on each page. Pages still set their own
 * accent colour and background, which is the only thing that varies between
 * them.
 */

import FadeIn from "./FadeIn";
import SectionTag from "./SectionTag";
import { colors, fonts } from "../theme";

const GOLD = colors.gold;
const CREAM = colors.cream;

/** Page hero: eyebrow tag, headline, and an intro paragraph. */
export function PageHero({ tag, title, accent = GOLD, background = colors.forest, image, intro, children }) {
  return (
    <section style={{ background, padding: "80px 24px 70px", position: "relative", overflow: "hidden" }}>
      {image && (
        <>
          <div style={{ position: "absolute", inset: 0, background: `url('${image}') center/cover no-repeat`, opacity: 0.12 }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, ${background}bb, ${background}f7)` }} />
        </>
      )}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 25% 55%, ${accent}12 0%, transparent 60%)` }} />
      <div style={{ maxWidth: 1120, margin: "0 auto", position: "relative" }}>
        {children}
        <FadeIn>
          {tag && <SectionTag label={tag} />}
          <h1 style={{
            fontFamily: fonts.serif, fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 700,
            color: CREAM, lineHeight: 1.12, margin: "0 0 20px", maxWidth: 900,
          }}>
            {title}
          </h1>
          {intro && (
            <p style={{ fontFamily: fonts.sans, fontSize: 17, color: "rgba(245,240,232,0.55)", maxWidth: 620, lineHeight: 1.8 }}>
              {intro}
            </p>
          )}
        </FadeIn>
      </div>
    </section>
  );
}

/**
 * A heading-and-copy band. `tone` picks the ground: "dark" and "deep" keep the
 * page on its own background, "light" is the cream break used to stop a page
 * of dark sections reading as one block.
 */
export function CopySection({ heading, tone = "dark", background, children, align = "split" }) {
  const light = tone === "light";
  const bg = background ?? (light ? CREAM : tone === "deep" ? colors.emerald : colors.forest);
  const headingColor = light ? colors.emerald : CREAM;
  const bodyColor = light ? "rgba(7,30,18,0.65)" : "rgba(245,240,232,0.6)";

  const body = (
    <div style={{ fontFamily: fonts.sans, fontSize: "clamp(15px, 1.7vw, 17px)", color: bodyColor, lineHeight: 1.85 }}>
      {children}
    </div>
  );

  return (
    <section style={{ background: bg, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {align === "split" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }} className="about-grid">
            <FadeIn>
              <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 700, color: headingColor, lineHeight: 1.2, margin: 0 }}>
                {heading}
              </h2>
            </FadeIn>
            <FadeIn delay={0.12} direction="left">{body}</FadeIn>
          </div>
        ) : (
          <div style={{ maxWidth: 780 }}>
            <FadeIn>
              <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 700, color: headingColor, lineHeight: 1.2, margin: "0 0 26px" }}>
                {heading}
              </h2>
            </FadeIn>
            <FadeIn delay={0.12}>{body}</FadeIn>
          </div>
        )}
      </div>
    </section>
  );
}

/** A list of category names rendered as pills — no counts, no claims. */
export function PillList({ items, accent = GOLD }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {items.map((item) => (
        <span key={item} style={{
          fontFamily: fonts.sans, fontSize: 13, color: "rgba(245,240,232,0.65)",
          padding: "9px 18px", borderRadius: 40,
          background: `${accent}14`, border: `1px solid ${accent}33`,
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}

/** Cards for a set of sourcing categories. */
export function CategoryCards({ categories, accent = GOLD, background = colors.forest, heading, note }) {
  return (
    <section style={{ background, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {heading && (
          <FadeIn>
            <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: 700, color: CREAM, margin: "0 0 40px", lineHeight: 1.2 }}>
              {heading}
            </h2>
          </FadeIn>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 18 }}>
          {categories.map((cat, i) => (
            <FadeIn key={cat.key} delay={0.05 + i * 0.06}>
              <div style={{
                background: "rgba(245,240,232,0.03)",
                border: "1px solid rgba(245,240,232,0.07)",
                borderRadius: 9, padding: "28px 28px", height: "100%",
              }}>
                <h3 style={{ fontFamily: fonts.serif, fontSize: 20, color: CREAM, margin: "0 0 12px", fontWeight: 600 }}>
                  {cat.label}
                </h3>
                <p style={{ fontFamily: fonts.sans, fontSize: 13.5, color: "rgba(245,240,232,0.42)", lineHeight: 1.75, margin: 0 }}>
                  {cat.description}
                </p>
                {cat.items && (
                  <div style={{ borderTop: "1px solid rgba(245,240,232,0.07)", marginTop: 20, paddingTop: 18, display: "flex", flexWrap: "wrap", gap: "8px 10px" }}>
                    {cat.items.map((item) => (
                      <span key={item} style={{
                        fontFamily: fonts.sans, fontSize: 12, color: "rgba(245,240,232,0.5)",
                        padding: "4px 11px", background: `${accent}10`, borderRadius: 20, border: `1px solid ${accent}22`,
                      }}>
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
        {note && (
          <FadeIn delay={0.2}>
            <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "rgba(245,240,232,0.3)", lineHeight: 1.75, marginTop: 28, maxWidth: 720 }}>
              {note}
            </p>
          </FadeIn>
        )}
      </div>
    </section>
  );
}

/** Closing band: a heading, a line of copy, and a single action. */
export function CTABand({ heading, copy, label, onClick, accent = GOLD, background = colors.forestDeep }) {
  return (
    <section style={{ background, padding: "80px 24px", textAlign: "center", borderTop: `1px solid ${accent}1a` }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <FadeIn>
          <h2 style={{ fontFamily: fonts.serif, fontSize: "clamp(24px, 3.4vw, 38px)", fontWeight: 700, color: CREAM, margin: "0 0 18px", lineHeight: 1.25 }}>
            {heading}
          </h2>
          {copy && (
            <p style={{ fontFamily: fonts.sans, fontSize: 16, color: "rgba(245,240,232,0.5)", lineHeight: 1.8, margin: "0 0 36px" }}>
              {copy}
            </p>
          )}
          <button onClick={onClick} style={{
            fontFamily: fonts.sans, fontSize: 12, fontWeight: 600,
            padding: "16px 40px", background: accent, color: colors.forest,
            border: "none", borderRadius: 3, cursor: "pointer",
            letterSpacing: "0.15em", textTransform: "uppercase", transition: "opacity 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {label}
          </button>
        </FadeIn>
      </div>
    </section>
  );
}

/** "← Areas of Expertise" crumb, shown above a sub-page hero. */
export function BackLink({ label, onClick, accent = GOLD }) {
  return (
    <button type="button" onClick={onClick} style={{
      fontFamily: fonts.sans, fontSize: 11, color: `${accent}b3`,
      background: "none", border: "none", cursor: "pointer",
      letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24, padding: 0,
    }}>
      ← {label}
    </button>
  );
}
