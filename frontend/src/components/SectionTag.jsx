export default function SectionTag({ label, light }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 20,
      padding: "7px 18px",
      border: light ? "1px solid rgba(7,30,18,0.15)" : "1px solid rgba(200,150,62,0.25)",
      borderRadius: 40,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: light ? "#0A2E1C" : "#C8963E", flexShrink: 0 }} />
      <span style={{
        fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 500,
        color: light ? "rgba(7,30,18,0.5)" : "rgba(245,240,232,0.55)",
        letterSpacing: "0.2em", textTransform: "uppercase",
      }}>
        {label}
      </span>
    </div>
  );
}
