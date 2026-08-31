import type {
  PortfolioContentBundle,
  PortfolioProject,
} from "./portfolio-types";

const index = {
  seoTitle: "Our work — platforms & websites we've built",
  seoDescription:
    "Portfolio of live platforms and websites delivered by Estio — fintech, marketplaces, media, hospitality discovery, and verified services across Oman, the GCC, and regional markets.",
  kicker: "Portfolio",
  h1: "What we've built",
  lead: "A living history of shipped products — not mockups. Each project below is a live platform or website Estio designed, built, or continues to operate. Screenshots show the real experience; follow the link to visit the production site.",
  competitionLead:
    "Estio also enters creative and technology competitions across the Gulf. Competition entries and award submissions are grouped with our platform work here as part of our delivery history — additional competition showcases can be added as new cycles complete.",
  categoryLabels: {
    platform: "Platform",
    commerce: "Commerce & listings",
    media: "Media & photography",
    fintech: "Fintech",
    services: "Verified services",
    competition: "Competition & showcase",
  },
};

export const portfolioProjectsEn: PortfolioProject[] = [
  {
    slug: "estio-tech",
    title: "Estio.tech — AI services & marketing hub",
    domain: "estio.tech",
    url: "https://www.estio.tech",
    category: "platform",
    year: "2024",
    description:
      "Brand and services hub for Estio's AI, marketing, and content creation practice in Oman — bilingual positioning, service lines, and lead paths for GCC clients.",
    deliverables: [
      "Marketing site architecture & visual system",
      "Service landing structure",
      "Hero imagery & campaign-ready sections",
      "Contact and enquiry funnels",
    ],
    tags: ["Web", "AI services", "Oman", "Marketing"],
    imageUrl: "https://estio.tech/images/hero/hero-gcc-business.jpg",
    imageAlt: "Estio.tech homepage — AI services and marketing for GCC businesses",
  },
  {
    slug: "estio-ir",
    title: "Estio.ir — AI content studio (Iran market)",
    domain: "estio.ir",
    url: "https://www.estio.ir",
    category: "platform",
    year: "2024",
    description:
      "Persian-language studio site for AI-assisted content production — localized offer structure, trust signals, and studio positioning for the Iranian market.",
    deliverables: [
      "RTL-first layout & typography",
      "Localized service pages",
      "Studio offer framing",
      "Production enquiry flow",
    ],
    tags: ["Web", "RTL", "AI Studio", "Persian"],
    imageUrl: "https://estio.ir/images/og-iran.jpg",
    imageAlt: "Estio.ir — AI content studio for Iranian businesses",
  },
  {
    slug: "omoney-online",
    title: "Omani — exchange & international remittance",
    domain: "omoney.online",
    url: "https://www.omoney.online",
    category: "fintech",
    year: "2023",
    description:
      "Fintech-facing web presence for Omani exchange and international transfer services — clear rate and service communication for Persian and Arabic-speaking users.",
    deliverables: [
      "Service explanation architecture",
      "Trust & compliance-oriented layout",
      "Mobile-first conversion paths",
      "Bilingual/RTL content structure",
    ],
    tags: ["Fintech", "Exchange", "RTL", "Web"],
    imageUrl: "/portfolio/omoney-online.png",
    imageAlt: "Omani omoney.online — exchange and remittance platform",
  },
  {
    slug: "mycafes-app",
    title: "MyCafe — Oman cafes & restaurants",
    domain: "mycafes.app",
    url: "https://www.mycafes.app",
    category: "commerce",
    year: "2023",
    description:
      "Discovery platform for Oman's cafe and restaurant scene — browse venues, categories, and locations with a consumer-friendly mobile web experience.",
    deliverables: [
      "Discovery UX & category browsing",
      "Venue listing templates",
      "Search-oriented information architecture",
      "Consumer mobile layout",
    ],
    tags: ["Marketplace", "Hospitality", "Oman", "Discovery"],
    imageUrl: "/portfolio/mycafes-app.png",
    imageAlt: "MyCafe — discover Oman's cafes and restaurants",
    imageFit: "contain",
  },
  {
    slug: "beenbo-app",
    title: "Beenbo — verified human engagement",
    domain: "beenbo.app",
    url: "https://www.beenbo.app",
    category: "platform",
    year: "2024",
    description:
      "Platform positioning for verified human engagement — product narrative, trust framing, and signup paths for a engagement-verification service.",
    deliverables: [
      "Product marketing site",
      "Verification value proposition",
      "Signup/onboarding CTAs",
      "Brand & UI shell",
    ],
    tags: ["Platform", "Verification", "SaaS", "Web"],
    imageUrl: "/portfolio/beenbo-app.png",
    imageAlt: "Beenbo — verified human engagement platform",
  },
  {
    slug: "omansale-online",
    title: "OmanSale — classifieds & listings",
    domain: "omansale.online",
    url: "https://www.omansale.online",
    category: "commerce",
    year: "2022",
    description:
      "Classifieds and listings platform for the Omani market — category-led browsing, seller/buyer flows, and listing presentation built for local commerce habits.",
    deliverables: [
      "Listing & category architecture",
      "Search/browse UX",
      "Ad presentation templates",
      "Mobile listing flows",
    ],
    tags: ["Classifieds", "Oman", "Marketplace", "Web"],
    imageUrl: "/portfolio/omansale-online.png",
    imageAlt: "OmanSale online classifieds platform",
  },
  {
    slug: "omanphoto-com",
    title: "Oman Photo — editorial photography & film",
    domain: "omanphoto.com",
    url: "https://www.omanphoto.com",
    category: "media",
    year: "2023",
    description:
      "Editorial photography and film portfolio site — gallery-led presentation, project storytelling, and enquiry paths for commercial and editorial clients in Oman.",
    deliverables: [
      "Gallery & portfolio layout",
      "Editorial project pages",
      "Media-rich visual system",
      "Client enquiry integration",
    ],
    tags: ["Photography", "Media", "Portfolio", "Oman"],
    imageUrl:
      "https://omanphoto.com/api/media/file/1951d3aa-e901-4afd-b495-be10eabe781e.jpg",
    imageAlt: "Oman Photo — editorial photography and film portfolio",
  },
  {
    slug: "otofix-services",
    title: "Otofix — verified vehicle history",
    domain: "otofix.services",
    url: "https://www.otofix.services",
    category: "services",
    year: "2024",
    description:
      "Automotive services platform for verified vehicle history — trust-first product copy, service explanation, and conversion for car buyers and sellers.",
    deliverables: [
      "Service product site",
      "Verification narrative & trust UI",
      "Lead capture structure",
      "Automotive category positioning",
    ],
    tags: ["Automotive", "Verification", "Services", "Web"],
    imageUrl: "/portfolio/otofix-services.png",
    imageAlt:
      "Otofix promotional graphic — luxury car and mobile app against the Muscat coastline",
  },
  {
    slug: "omanlaw-om",
    title: "Oman Legal Assistant — legal information & lawyer review",
    domain: "omanlaw.om",
    url: "https://www.omanlaw.om",
    category: "services",
    year: "2025",
    description:
      "Bilingual legal information platform for Oman — structured guidance, lawyer review paths, and trust-first presentation for residents and businesses navigating Omani law.",
    deliverables: [
      "Bilingual EN/AR legal information site",
      "Lawyer review & enquiry flows",
      "Trust-oriented legal UI & branding",
      "Oman-specific content architecture",
    ],
    tags: ["Legal", "Oman", "Bilingual", "Web"],
    imageUrl: "/portfolio/omanlaw-om.png",
    imageAlt: "Oman Legal Assistant — scales of justice with Omani national emblem",
    imageFit: "contain",
  },
];

export function getPortfolioContentEn(): PortfolioContentBundle {
  return { index, projects: portfolioProjectsEn };
}
