/**
 * The three trade verticals, in one place.
 *
 * The hero dock, the verticals grid and the Specialisations index all present
 * the same three things; keeping the copy and the routes here is what stops
 * the tag lists drifting apart between them.
 */
export const VERTICALS = [
  {
    key: "ethnic-food",
    slug: "/specialisations/ethnic-food",
    label: "Ethnic Food & Grocery",
    short: "Food & Grocery",
    tagline: "Kerala dry goods, sourced direct.",
    description:
      "38 authenticated product lines from growers and processors across Kerala, Tamil Nadu and Rajasthan — plus Sahya, our B2C label for specialty grocers.",
    tags: ["Spices", "Grains", "Pickles", "Snacks"],
    stat: "38 products",
  },
  {
    key: "vehicle-parts",
    slug: "/specialisations/vehicle-parts",
    label: "Vehicle Parts",
    short: "Vehicle Parts",
    tagline: "OEM-quality components.",
    description:
      "Automotive components from India's Tier 1 and Tier 2 manufacturing base, for commercial, passenger and two-wheeler fleets across Africa, the Gulf and South-East Asia.",
    tags: ["Tyres", "Braking", "Engine", "Filtration"],
    stat: "6 categories",
  },
  {
    key: "pharmaceuticals",
    slug: "/specialisations/pharmaceuticals",
    label: "Pharmaceuticals",
    short: "Pharmaceuticals",
    tagline: "Compliance-first, cold-chain capable.",
    description:
      "WHO-GMP and USFDA-certified sources — finished formulations, Ayurvedic preparations, nutraceuticals, APIs and medical consumables, with documentation handled end-to-end.",
    tags: ["Generics", "Ayurvedic", "APIs", "Consumables"],
    stat: "6 categories",
  },
];
