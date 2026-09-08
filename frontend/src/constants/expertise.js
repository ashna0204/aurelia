/**
 * The four sourcing areas, in the order they are presented everywhere.
 *
 * Shared by the home page preview, the Areas of Expertise index, the footer
 * and the quote form's category list, so the four areas and their wording
 * cannot drift apart across the site. `sector` is the value the quote API
 * accepts — it must match the `Sector` literal in backend/app/schemas.py.
 */

export const EXPERTISE = [
  {
    slug: "food-grocery",
    label: "Food & Grocery",
    sector: "Food & Grocery",
    accent: "#C8963E",
    background: "#071E12",
    home: "South Asian food products sourced for wholesalers, retailers, hospitality businesses and specialty food operators.",
    index: "South Asian food products for international markets. We source from established manufacturers and processors, with a particular focus on South India and Kerala within this category.",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=900&q=75",
  },
  {
    slug: "automotive",
    label: "Automotive Components",
    sector: "Automotive Components",
    accent: "#8BA4C8",
    background: "#0B1A28",
    home: "Indian-made vehicle components and aftermarket parts sourced against the buyer's specification.",
    index: "Vehicle components and aftermarket parts from established manufacturers and suppliers worldwide. We help buyers identify suitable suppliers against a specific product or vehicle requirement.",
    image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=900&q=75",
  },
  {
    slug: "healthcare",
    label: "Healthcare & Pharmaceuticals",
    sector: "Healthcare & Pharmaceuticals",
    accent: "#7FC4A0",
    background: "#071810",
    home: "Selected healthcare and pharmaceutical sourcing where product, supplier and destination-market requirements can be assessed.",
    index: "Selected healthcare and pharmaceutical sourcing where supplier credentials, product classification and destination-market requirements can be assessed before a transaction proceeds.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=75",
  },
  {
    slug: "perfume",
    label: "Perfume Ingredients & Essential Oils",
    sector: "Perfume Ingredients & Essential Oils",
    accent: "#B9A0C8",
    background: "#151024",
    home: "Natural essential oils, aromatic ingredients and selected raw materials sourced through established suppliers.",
    index: "Essential oils, aromatic ingredients and selected raw materials for fragrance, personal care and related applications. We work from the buyer's required specification, origin, quantity and intended use.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=900&q=75",
  },
];

/** Path to an area's page. */
export const expertisePath = (slug) => `/expertise/${slug}`;

/** Look up one area by slug. */
export const areaBySlug = (slug) => EXPERTISE.find((a) => a.slug === slug);
