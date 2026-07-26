// ─── Ethnic Food — Unifarex dry goods price sheet ───

export const ETHNIC_FOOD_CATEGORIES = [
  {
    key: "grains",
    label: "Grains & Flour",
    description: "Kerala's staple grains and milled flours — Matta rice, rice-based powders, and traditional batters.",
    products: [
      { name: "Matta Rice", pkg: "10 kg", price: "$8.10" },
      { name: "Rice Powder", pkg: "1 kg", price: "$1.35" },
      { name: "Puttu Podi", pkg: "1 kg", price: "$1.52" },
      { name: "Idiyappam Powder", pkg: "1 kg", price: "$1.36" },
      { name: "Palappam", pkg: "1 kg", price: "$2.44" },
      { name: "Maida", pkg: "1 kg", price: "$0.94" },
      { name: "Broken Matta", pkg: "1 kg", price: "$1.46" },
      { name: "Roasted Rava", pkg: "1 kg", price: "$1.06" },
      { name: "Urid Gota", pkg: "1 kg", price: "$2.99" },
      { name: "Ragi Whole", pkg: "1 kg", price: "$1.24" },
      { name: "Aval White", pkg: "1 kg", price: "$1.65" },
    ],
  },
  {
    key: "pulses",
    label: "Pulses & Legumes",
    description: "Dried legumes sourced from India's leading growing belts — the backbone of South Asian cooking.",
    products: [
      { name: "Red Cow Peas", pkg: "1 kg", price: "$2.15" },
      { name: "Toor Dall", pkg: "1 kg", price: "$3.18" },
      { name: "Black Gram", pkg: "1 kg", price: "$2.24" },
      { name: "Green Peas", pkg: "1 kg", price: "$2.46" },
      { name: "White Kadala", pkg: "1 kg", price: "$2.51" },
    ],
  },
  {
    key: "sweeteners",
    label: "Sweeteners & Specialties",
    description: "Traditional jaggery from Marayoor, dried tapioca, and artisan vermicelli — hard-to-source Kerala staples.",
    products: [
      { name: "Jaggery Marayoor", pkg: "1 kg", price: "$2.40" },
      { name: "Dried Tapioca", pkg: "1 kg", price: "$2.33" },
      { name: "Jaggery Powder", pkg: "500 g", price: "$2.11" },
      { name: "Roasted Vermicelli", pkg: "400 g", price: "$2.84" },
    ],
  },
  {
    key: "snacks",
    label: "Snacks & Confections",
    description: "Authentic Kerala snacks and traditional sweets — from banana chips to sesame balls.",
    products: [
      { name: "Pappadom", pkg: "200 g", price: "$0.92" },
      { name: "Kerala Mixture", pkg: "200 g", price: "$0.86" },
      { name: "Banana Chips", pkg: "200 g", price: "$0.98" },
      { name: "Pakkavada", pkg: "200 g", price: "$1.00" },
      { name: "Tomato Murukku", pkg: "150 g", price: "$1.00" },
      { name: "Rice Murukku", pkg: "150 g", price: "$1.00" },
      { name: "Garlic Murukku", pkg: "150 g", price: "$0.87" },
      { name: "Jackfruit Chips", pkg: "200 g", price: "$0.87" },
      { name: "Peanut Candy Bar", pkg: "150 g", price: "$1.20" },
      { name: "Sesame Ball", pkg: "150 g", price: "$1.16" },
      { name: "Peanut Candy Ball", pkg: "150 g", price: "$1.20" },
    ],
  },
  {
    key: "mixes",
    label: "Instant Mixes",
    description: "Ready-to-cook traditional payasam mixes — convenience without compromise.",
    products: [
      { name: "Instant Ada Pradhaman Payasam Mix", pkg: "200 g", price: "$0.85" },
      { name: "Instant Semiya Payasam Mix", pkg: "200 g", price: "$0.82" },
    ],
  },
  {
    key: "pickles",
    label: "Pickles & Condiments",
    description: "Sun-dried and stone-ground condiments — from fiery mango pickles to Coconut Chutney Powder.",
    products: [
      { name: "Cut Mango Pickle", pkg: "400 g", price: "$2.61" },
      { name: "Lime Pickle", pkg: "400 g", price: "$1.82" },
      { name: "Hot & Sweet Pickle", pkg: "400 g", price: "$2.24" },
      { name: "Tender Mango Pickle", pkg: "400 g", price: "$2.71" },
      { name: "Coconut Chutney Powder", pkg: "400 g", price: "$4.63" },
    ],
  },
];

// ─── Vehicle Parts ───

export const VEHICLE_PARTS_CATEGORIES = [
  {
    key: "tyres",
    label: "Tyres & Wheels",
    description: "Commercial and passenger tyres from India's leading manufacturers — truck, LCV, car, and two-wheeler.",
    items: ["Heavy-duty truck tyres", "LCV & van tyres", "Passenger car tyres", "Two-wheeler tyres", "Alloy & steel wheels", "Agricultural tyres"],
  },
  {
    key: "braking",
    label: "Braking Systems",
    description: "OEM-quality brake components for all vehicle categories — sourced from certified Indian manufacturers.",
    items: ["Brake pads (disc & drum)", "Brake discs & rotors", "Brake drums", "Brake shoes", "Brake master cylinders", "ABS sensors"],
  },
  {
    key: "engine",
    label: "Engine & Drivetrain",
    description: "Precision-machined engine internals and drivetrain components for commercial and passenger vehicles.",
    items: ["Clutch plates & pressure plates", "Timing belts & chains", "Engine gaskets & seals", "Pistons & rings", "Crankshafts & camshafts", "CV joints & axles"],
  },
  {
    key: "filtration",
    label: "Filtration",
    description: "Full range of engine and cabin filtration products meeting international OEM specifications.",
    items: ["Oil filters", "Air filters (panel & cylindrical)", "Fuel filters", "Cabin air filters", "Hydraulic filters", "Transmission filters"],
  },
  {
    key: "electrical",
    label: "Electrical & Electronics",
    description: "Automotive electrical components from batteries to ECU sensors — all major vehicle platforms covered.",
    items: ["Lead-acid & AGM batteries", "Alternators & starters", "Spark plugs & glow plugs", "Engine management sensors", "Wiring harnesses", "LED lighting assemblies"],
  },
  {
    key: "bodyparts",
    label: "Body Parts & Glass",
    description: "Replacement body panels and safety glass for commercial and passenger vehicles.",
    items: ["Bumpers (front & rear)", "Door panels & skins", "Bonnet panels", "Windscreens & rear glass", "Side mirrors", "Grilles & headlamp housings"],
  },
];

// ─── Pharmaceuticals ───

export const PHARMA_CATEGORIES = [
  {
    key: "generics",
    label: "Generic Medicines",
    description: "WHO-GMP certified generic formulations across key therapeutic areas — antibiotics, analgesics, cardiovascular, and more.",
    items: ["Antibiotics (oral & injectable)", "Analgesics & anti-inflammatories", "Anti-hypertensives", "Anti-diabetics", "Anti-malarials", "Antihistamines"],
  },
  {
    key: "ayurvedic",
    label: "Ayurvedic & Herbal",
    description: "Traditional Ayurvedic formulations and certified herbal preparations from Kerala's established manufacturers.",
    items: ["Classical Ayurvedic preparations", "Proprietary herbal formulations", "Medicated oils & ghee", "Herbal extracts & tinctures", "Ashwagandha & adaptogen blends", "Triphala & digestive preparations"],
  },
  {
    key: "nutraceuticals",
    label: "Nutraceuticals",
    description: "Health and wellness supplements manufactured to international quality standards.",
    items: ["Multivitamin & mineral complexes", "Omega-3 & fish oils", "Protein supplements", "Probiotics & prebiotics", "Iron & folate supplements", "Vitamin D & calcium combinations"],
  },
  {
    key: "consumables",
    label: "Medical Consumables",
    description: "Disposable medical supplies and personal protective equipment for healthcare providers and distributors.",
    items: ["Disposable gloves (latex & nitrile)", "Syringes & needles", "IV administration sets", "Wound care & bandages", "Surgical masks & PPE", "Diagnostic test kits"],
  },
  {
    key: "apis",
    label: "Active Pharmaceutical Ingredients",
    description: "High-purity APIs for drug manufacturers — sourced from USFDA and EU-GMP certified Indian facilities.",
    items: ["Analgesic APIs (Paracetamol, Ibuprofen)", "Antibiotic intermediates", "Cardiovascular APIs", "Anti-diabetic APIs (Metformin)", "Steroidal APIs", "Vitamin & amino acid APIs"],
  },
  {
    key: "otc",
    label: "Over-the-Counter Products",
    description: "Branded and white-label OTC products ready for retail distribution.",
    items: ["Cold & flu preparations", "Digestive health products", "Topical creams & ointments", "Eye & ear drops", "Antiseptic & disinfectants", "Oral care products"],
  },
];
