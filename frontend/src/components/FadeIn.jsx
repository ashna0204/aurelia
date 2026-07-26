import { useState, useEffect, useRef } from "react";

export function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

export default function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, visible] = useInView(0.08);
  const dirs = {
    up: "translateY(40px)", down: "translateY(-40px)",
    left: "translateX(40px)", right: "translateX(-40px)", none: "none",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : dirs[direction],
      transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
}
