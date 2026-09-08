/**
 * Catalogue and category data for the four sourcing areas.
 *
 * Nothing here states a price, a certification, a supplier name or a volume.
 * Those are commercial facts that change per enquiry and per destination
 * market, so the pages ask for them rather than publishing them — see the
 * catalogue note on the Food Catalogue page.
 */

// ─── Food & Grocery catalogue ───
//
// Pack sizes are the one commercial detail carried here, because they describe
// the product rather than the deal. Origin, minimum order, packaging and
// availability are confirmed against each enquiry, so they render as
// "On request" rather than being invented per line.

export const FOOD_CATEGORIES = [
  {
    key: "grains",
    label: "Grains & Flour",
    description: "Staple grains and milled flours, including Matta rice, rice-based powders and traditional batter mixes.",
    products: [
      { name: "Matta Rice", pack: "10 kg" },
      { name: "Rice Powder", pack: "1 kg" },
      { name: "Puttu Podi", pack: "1 kg" },
      { name: "Idiyappam Powder", pack: "1 kg" },
      { name: "Palappam", pack: "1 kg" },
      { name: "Maida", pack: "1 kg" },
      { name: "Broken Matta", pack: "1 kg" },
      { name: "Roasted Rava", pack: "1 kg" },
      { name: "Urid Gota", pack: "1 kg" },
      { name: "Ragi Whole", pack: "1 kg" },
      { name: "Aval White", pack: "1 kg" },
    ],
  },
  {
    key: "pulses",
    label: "Pulses & Legumes",
    description: "Dried legumes sourced through our supplier network across India's growing belts.",
    products: [
      { name: "Red Cow Peas", pack: "1 kg" },
      { name: "Toor Dall", pack: "1 kg" },
      { name: "Black Gram", pack: "1 kg" },
      { name: "Green Peas", pack: "1 kg" },
      { name: "White Kadala", pack: "1 kg" },
    ],
  },
  {
    key: "sweeteners",
    label: "Sweeteners & Specialties",
    description: "Jaggery, dried tapioca and vermicelli — regional staples that are harder to source at wholesale.",
    products: [
      { name: "Jaggery Marayoor", pack: "1 kg" },
      { name: "Dried Tapioca", pack: "1 kg" },
      { name: "Jaggery Powder", pack: "500 g" },
      { name: "Roasted Vermicelli", pack: "400 g" },
    ],
  },
  {
    key: "snacks",
    label: "Snacks & Confections",
    description: "South Indian snacks and traditional sweets, from banana chips to sesame balls.",
    products: [
      { name: "Pappadom", pack: "200 g" },
      { name: "Kerala Mixture", pack: "200 g" },
      { name: "Banana Chips", pack: "200 g" },
      { name: "Pakkavada", pack: "200 g" },
      { name: "Tomato Murukku", pack: "150 g" },
      { name: "Rice Murukku", pack: "150 g" },
      { name: "Garlic Murukku", pack: "150 g" },
      { name: "Jackfruit Chips", pack: "200 g" },
      { name: "Peanut Candy Bar", pack: "150 g" },
      { name: "Sesame Ball", pack: "150 g" },
      { name: "Peanut Candy Ball", pack: "150 g" },
    ],
  },
  {
    key: "mixes",
    label: "Instant Mixes",
    description: "Ready-to-cook payasam mixes for retail and foodservice formats.",
    products: [
      { name: "Instant Ada Pradhaman Payasam Mix", pack: "200 g" },
      { name: "Instant Semiya Payasam Mix", pack: "200 g" },
    ],
  },
  {
    key: "pickles",
    label: "Pickles & Condiments",
    description: "Pickles, chutney powders and other regional condiments.",
    products: [
      { name: "Cut Mango Pickle", pack: "400 g" },
      { name: "Lime Pickle", pack: "400 g" },
      { name: "Hot & Sweet Pickle", pack: "400 g" },
      { name: "Tender Mango Pickle", pack: "400 g" },
      { name: "Coconut Chutney Powder", pack: "400 g" },
    ],
  },
];

/**
 * The fields shown on every catalogue card, in order.
 *
 * `key` is looked up on the product first; anything the product does not carry
 * falls back to the placeholder, which is the honest answer for a commercial
 * term that is only settled against a specific enquiry.
 */
export const CATALOGUE_FIELDS = [
  { key: "pack", label: "Pack size", fallback: "On request" },
  { key: "origin", label: "Origin", fallback: "India" },
  { key: "moq", label: "Minimum order", fallback: "On request" },
  { key: "packaging", label: "Packaging", fallback: "On request" },
  { key: "availability", label: "Availability", fallback: "On enquiry" },
];

// ─── Automotive Components ───

export const AUTOMOTIVE_CATEGORIES = [
  {
    key: "braking",
    label: "Braking components",
    description: "Brake components sourced against the buyer's vehicle application and required specification.",
    items: ["Brake pads (disc & drum)", "Brake discs & rotors", "Brake drums", "Brake shoes", "Master cylinders", "ABS sensors"],
  },
  {
    key: "engine",
    label: "Engine components",
    description: "Engine internals and drivetrain parts for commercial, passenger and two-wheeler applications.",
    items: ["Clutch plates & pressure plates", "Timing belts & chains", "Gaskets & seals", "Pistons & rings", "Crankshafts & camshafts", "CV joints & axles"],
  },
  {
    key: "electrical",
    label: "Electrical parts",
    description: "Automotive electrical and electronic components, from batteries through to lighting assemblies.",
    items: ["Batteries", "Alternators & starters", "Spark plugs & glow plugs", "Engine management sensors", "Wiring harnesses", "Lighting assemblies"],
  },
  {
    key: "filtration",
    label: "Filtration",
    description: "Engine, cabin and hydraulic filtration, matched to the part number or application you supply.",
    items: ["Oil filters", "Air filters", "Fuel filters", "Cabin air filters", "Hydraulic filters", "Transmission filters"],
  },
  {
    key: "tyres",
    label: "Tyres",
    description: "Commercial, passenger, two-wheeler and agricultural tyres, sized to the buyer's requirement.",
    items: ["Truck tyres", "LCV & van tyres", "Passenger car tyres", "Two-wheeler tyres", "Agricultural tyres", "Alloy & steel wheels"],
  },
  {
    key: "body",
    label: "Body and exterior parts",
    description: "Replacement body panels, glass and exterior fittings for commercial and passenger vehicles.",
    items: ["Bumpers", "Door panels & skins", "Bonnet panels", "Windscreens & rear glass", "Side mirrors", "Grilles & headlamp housings"],
  },
  {
    key: "other",
    label: "Other vehicle-specific components",
    description: "Parts outside the categories above are assessed against the vehicle, market and specification you give us.",
    items: ["Suspension & steering", "Cooling & thermal", "Exhaust & emissions", "Transmission parts", "Cabin & interior fittings", "Accessories"],
  },
];

// ─── Healthcare & Pharmaceuticals ───
//
// Presented as *potential* categories: whether any of these can be supplied
// depends on the destination market, the product's classification there and the
// manufacturer's credentials for that transaction.

export const HEALTHCARE_CATEGORIES = [
  {
    key: "formulations",
    label: "Finished formulations",
    description: "Finished dosage products, subject to classification and approval in the destination market.",
  },
  {
    key: "apis",
    label: "APIs and pharmaceutical ingredients",
    description: "Active ingredients and intermediates for manufacturers, assessed against the required specification.",
  },
  {
    key: "nutraceuticals",
    label: "Nutraceuticals",
    description: "Supplements and wellness products, where the destination market permits the product and its claims.",
  },
  {
    key: "ayurvedic",
    label: "Ayurvedic products",
    description: "Traditional preparations, subject to how the destination market classifies and regulates them.",
  },
  {
    key: "supplies",
    label: "Medical and healthcare supplies",
    description: "Consumables and related supplies, where permitted and appropriately classified.",
  },
];

// ─── Perfume Ingredients & Essential Oils ───

export const PERFUME_CATEGORIES = [
  {
    key: "essential-oils",
    label: "Essential oils",
    description: "Steam-distilled and expressed oils, sourced against botanical source, origin and grade.",
  },
  {
    key: "extracts",
    label: "Botanical extracts",
    description: "Extracts and concretes for fragrance, cosmetic and personal care applications.",
  },
  {
    key: "aromatics",
    label: "Aromatic ingredients",
    description: "Aromatic raw materials matched to the specification and intended application you supply.",
  },
  {
    key: "fragrance-materials",
    label: "Natural fragrance materials",
    description: "Natural materials for perfumery, home fragrance and related uses.",
  },
  {
    key: "carriers",
    label: "Carrier and base materials",
    description: "Selected carrier and base materials, subject to specification and supplier availability.",
  },
];
