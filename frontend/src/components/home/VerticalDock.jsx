import { Apple, Pill, Wrench } from "lucide-react";
import { VERTICALS } from "../../constants/verticals";
import { PRODUCTS_ID, VERTICALS_ID } from "../../constants/sections";
import { scrollTo } from "../../lib/scroll";

const ICONS = {
  "ethnic-food": Apple,
  "vehicle-parts": Wrench,
  pharmaceuticals: Pill,
};

/**
 * The floating dock at the foot of the hero fold.
 *
 * Buttons rather than links: they move the reader down the same page, they do
 * not navigate. Rendering them as anchors would promise a destination the
 * browser's own affordances (open in new tab, copy link) could not deliver.
 *
 * On narrow screens the row becomes a horizontally scrollable strip rather
 * than wrapping, so the dock keeps its single-bar shape.
 */
export default function VerticalDock() {
  const onSelect = (key) => {
    // The food vertical has a real product grid further down; the other two
    // are represented by their card in the verticals section.
    scrollTo(document.getElementById(key === "ethnic-food" ? PRODUCTS_ID : VERTICALS_ID), {
      offset: -80,
    });
  };

  return (
    <div className="max-w-full overflow-x-auto no-scrollbar">
      <div
        className="mx-auto flex w-max items-center gap-1.5 rounded-full bg-surface/85 p-1.5 shadow-dock backdrop-blur-xl"
        role="group"
        aria-label="Jump to a trade vertical"
      >
        {VERTICALS.map((vertical) => {
          const Icon = ICONS[vertical.key];
          return (
            <button
              key={vertical.key}
              type="button"
              onClick={() => onSelect(vertical.key)}
              className="pill border-transparent px-5 py-3 whitespace-nowrap text-ink transition-transform hover:scale-105 hover:bg-ink/4 hover:shadow-soft"
            >
              <Icon size={16} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
              {vertical.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}
