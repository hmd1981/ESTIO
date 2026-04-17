import type { AppLocale } from "@/lib/i18n/config";
import type { ServiceDetailContent } from "./types";
import { aiStudioPagesAr, aiStudioLandingAr } from "./ai-studio-pages-ar";

/* ------------------------------------------------------------------ */
/*  AI Studio — Landing page content                                  */
/* ------------------------------------------------------------------ */

export type AiStudioOutputSample = {
  label: string;
  imageUrl: string;
  imageAlt: string;
};

export type AiStudioOfferCard = {
  title: string;
  description: string;
  whatYouGet: string[];
  bestFor: string[];
  typicalOutputs: string;
  href: string;
  cta: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Resolved via site bundle `mediaAssets` on the server when set in CMS. */
  imageMediaAssetId?: string;
  /**
   * When set (e.g. from CMS), shown as the card bullet list instead of
   * flattening whatYouGet / bestFor / typicalOutputs.
   */
  subOffers?: string[];
};

/** Bullets shown under each offer card on the landing page. */
export function aiStudioOfferCardBullets(card: AiStudioOfferCard): string[] {
  if (card.subOffers?.length) return card.subOffers;
  const lines = [
    ...card.whatYouGet,
    ...card.bestFor,
    ...(card.typicalOutputs.trim() ? [card.typicalOutputs] : []),
  ];
  return lines;
}

export type AiStudioFaqItem = {
  question: string;
  answer: string;
};

/** Full-page ambient loop (muted). Optional poster for first frame / reduced motion. */
export type AiStudioPageBackdrop = {
  videoUrl?: string;
  videoMediaAssetId?: string;
  posterUrl?: string;
  posterAlt?: string;
  posterMediaAssetId?: string;
};

export type AiStudioLandingContent = {
  hero: {
    kicker: string;
    headline: string;
    lead: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    /** Right column: still image (or assign a video file here to use as panel video). */
    imageUrl?: string;
    imageAlt?: string;
    imageMediaAssetId?: string;
    /** Right column: explicit looping video (takes precedence over video in image slot). */
    videoUrl?: string;
    videoMediaAssetId?: string;
  };
  /** Optional fixed full-page background video + scrim (see public page). */
  pageBackdrop?: AiStudioPageBackdrop;
  studioOutputs: {
    title: string;
    samples: AiStudioOutputSample[];
  };
  separator: {
    title: string;
    body: string;
  };
  valueProps: Array<{ title: string; body: string }>;
  offerCards: AiStudioOfferCard[];
  deliverablesSnapshot: {
    title: string;
    items: string[];
  };
  whoThisIsFor: {
    title: string;
    fit: { title: string; items: string[] };
    notFit: { title: string; items: string[] };
  };
  howDeliveryWorks: {
    title: string;
    steps: Array<{ step: string; description: string }>;
  };
  whyDifferent: {
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  cta: {
    headline: string;
    body: string;
    buttonLabel: string;
    href: string;
  };
  faq: {
    title: string;
    items: AiStudioFaqItem[];
  };
};

export const aiStudioLanding: AiStudioLandingContent = {
  hero: {
    kicker: "AI Studio",
    headline: "On-brand images and short video you can publish this week.",
    lead: "Tell us the output. We produce it, you approve it, we ship final files \u2014 no DIY tools.",
    primaryCta: {
      label: "Start a project",
      href: "/contact?interest=AI_STUDIO&streamlined=1",
    },
    secondaryCta: {
      label: "Get a quick quote",
      href: "/contact?interest=AI_STUDIO&streamlined=1",
    },
  },

  studioOutputs: {
    title: "Sample outputs",
    samples: [
      {
        label: "Campaign hero visual",
        imageUrl: "/ai-studio/image-production.svg",
        imageAlt: "AI-generated campaign hero visual sample",
      },
      {
        label: "Short promo video",
        imageUrl: "/ai-studio/video-production.svg",
        imageAlt: "AI-generated short promotional video sample",
      },
      {
        label: "Brand asset system",
        imageUrl: "/ai-studio/brand-ai-packs.svg",
        imageAlt: "AI-generated brand visual asset system sample",
      },
    ],
  },

  separator: {
    title: "Studio vs internal AI",
    body: "Here you get finished files. For AI inside your own workflows and tools, see AI Creative Services and Enterprise.",
  },

  valueProps: [
    {
      title: "Agreed before we build",
      body: "Specs and review steps are set up front \u2014 no surprise scope.",
    },
    {
      title: "Your brand rules win",
      body: "We produce to your direction; nothing ships without your OK.",
    },
    {
      title: "Files, not logins",
      body: "You receive assets ready to upload \u2014 we run the production side.",
    },
  ],

  offerCards: [
    {
      title: "AI stills & campaign images",
      description: "Product, lifestyle, and hero shots aligned to your brand.",
      whatYouGet: [],
      bestFor: [],
      typicalOutputs: "",
      subOffers: [
        "What: production-ready stills from your brief and references.",
        "Where: ads, social, site heroes, e-commerce grids.",
        "Benefit: test more creative without multiplying shoot days.",
      ],
      href: "/ai-studio/image-production",
      cta: "See image production",
      imageUrl: "/ai-studio/image-production.svg",
      imageAlt: "Scoped image production pipeline from brief to brand-reviewed delivery",
    },
    {
      title: "Short branded video",
      description: "Clips sized for feeds and paid placements.",
      whatYouGet: [],
      bestFor: [],
      typicalOutputs: "",
      subOffers: [
        "What: 15\u201360s spots, edited and on-brand.",
        "Where: Reels, TikTok, YouTube Shorts, paid social, landing pages.",
        "Benefit: vertical, square, and landscape from one production pass.",
      ],
      href: "/ai-studio/video-production",
      cta: "See video production",
      imageUrl: "/ai-studio/video-production.svg",
      imageAlt: "AI video production pipeline with multi-format delivery",
    },
    {
      title: "Brand visual system",
      description: "Presets and templates so every asset matches.",
      whatYouGet: [],
      bestFor: [],
      typicalOutputs: "",
      subOffers: [
        "What: reusable style kit and prompt structure for your look.",
        "Where: every channel your team publishes to.",
        "Benefit: faster rounds when you need volume \u2014 less visual drift.",
      ],
      href: "/ai-studio/brand-ai-packs",
      cta: "See brand packs",
      imageUrl: "/ai-studio/brand-ai-packs.svg",
      imageAlt: "Brand AI pack structure with visual system, prompt architecture, and asset library",
    },
  ],

  deliverablesSnapshot: {
    title: "What you receive",
    items: [
      "Production-ready files in formats specified in your scope",
      "Organised, named, and tagged asset libraries",
      "Brand usage guidelines for all AI-generated assets",
      "Style reference documentation for future production",
      "One structured revision round included in every engagement",
    ],
  },

  whoThisIsFor: {
    title: "Who this is for",
    fit: {
      title: "Good fit",
      items: [
        "Brands needing volume without sacrificing visual consistency",
        "Marketing teams with seasonal or campaign-driven production spikes",
        "Hospitality, real estate, retail, and premium service businesses",
        "Startups needing production-grade visuals without traditional agency cost",
      ],
    },
    notFit: {
      title: "Not a fit",
      items: [
        "Companies that want to run their own AI tools \u2014 we deliver output, not tooling",
        "Requests without defined brand direction or visual standards",
        "One-off experimental generations without a commercial objective",
      ],
    },
  },

  howDeliveryWorks: {
    title: "How delivery works",
    steps: [
      {
        step: "Brief and scope",
        description:
          "You define the output type, volume, brand constraints, and delivery timeline.",
      },
      {
        step: "Direction and samples",
        description:
          "We produce initial samples against your brief for review and approval.",
      },
      {
        step: "Production",
        description:
          "Approved direction scales to the full deliverable set with quality checkpoints.",
      },
      {
        step: "Delivery and revision",
        description:
          "Production-ready files delivered with one structured revision round included.",
      },
    ],
  },

  whyDifferent: {
    title: "Why this is different",
    items: [
      {
        title: "Not a marketplace",
        body: "No browsing stock. Every output is produced to your brief.",
      },
      {
        title: "Not a prompt tool",
        body: "You never see a prompt interface. We operate the production system.",
      },
      {
        title: "Not uncontrolled AI",
        body: "Every output passes brand review. Nothing ships without approval.",
      },
    ],
  },

  cta: {
    headline: "Tell us what you need",
    body: "We\u2019ll reply fast with a clear next step \u2014 usually within one business day.",
    buttonLabel: "Start a project",
    href: "/contact?interest=AI_STUDIO&streamlined=1",
  },

  faq: {
    title: "Common questions",
    items: [
      {
        question: "How is AI Studio different from AI Creative Services?",
        answer:
          "AI Studio delivers finished visual and video assets to your brief. AI Creative Services embeds governed AI into your internal workflows and production pipelines. Studio is for buyers who need output. Creative Services is for organisations building internal AI capability.",
      },
      {
        question: "What do I receive?",
        answer:
          "Production-ready files: PNG/JPEG/TIFF for images, MP4/MOV for video, organised asset libraries for brand packs. All named, tagged, and delivered in the formats specified in your scope.",
      },
      {
        question: "How is quality controlled?",
        answer:
          "Every output is reviewed against your brand direction before delivery. Nothing ships without explicit approval at the sample stage and final review checkpoint.",
      },
      {
        question: "What about revisions?",
        answer:
          "One structured revision round is included. Additional rounds are scoped separately with clear deliverable expectations.",
      },
      {
        question: "What formats and resolutions?",
        answer:
          "Specified in the scope document. Standard: 4K for hero visuals, social-optimised for channel assets, print-ready where required.",
      },
      {
        question: "Can I use these commercially?",
        answer:
          "Yes. All deliverables are produced for commercial use under terms defined in the engagement.",
      },
    ],
  },

  pageBackdrop: {},
};

/* ------------------------------------------------------------------ */
/*  AI Studio — Subpage content (ServiceDetailContent)                */
/* ------------------------------------------------------------------ */

const aiStudioPages: Record<string, ServiceDetailContent> = {
  "image-production": {
    slug: "image-production",
    title: "AI Image Production",
    summary:
      "Production-grade AI-generated imagery for campaigns, websites, social channels, and brand collateral \u2014 scoped to your visual direction and delivered as final assets.",
    seo: {
      title: "AI Image Production \u2014 Estio AI Studio",
      description:
        "AI-generated campaign visuals, hero imagery, social packs, and product photography \u2014 scoped, reviewed, and delivered as production-ready files. Estio, Muscat.",
    },
    breadcrumbParents: [{ href: "/ai-studio", label: "AI Studio" }],
    additionalSections: [
      {
        title: "Production categories",
        bullets: [
          "Website Hero Visuals \u2014 Full-width, high-resolution imagery for landing pages, hero sections, and campaign destinations.",
          "Campaign Visual Packs \u2014 Coordinated image sets for product launches, seasonal campaigns, and promotional sequences.",
          "Social Content Image Packs \u2014 Platform-optimised image sets for Instagram, LinkedIn, and social channels with consistent brand treatment.",
          "Product / Property / Hospitality Visuals \u2014 Category-specific imagery for e-commerce, real estate listings, hotel and restaurant marketing.",
          "Character and Persona Creation \u2014 Branded character systems, spokesperson visuals, and persona assets for sustained campaign use.",
        ],
      },
    ],
    capabilities: [
      "AI-generated photography-grade imagery",
      "Scene and environment composition",
      "Product visualisation and styling",
      "Consistent character and persona systems",
      "Multi-format output (social, web, print-ready)",
      "Brand direction enforcement and quality review",
    ],
    idealClients: [
      "E-commerce and retail brands",
      "Hospitality and tourism businesses",
      "Real estate and property marketing",
      "Campaign-driven marketing teams",
    ],
    deliverables: [
      "High-resolution image files (PNG/JPEG/TIFF)",
      "Organised asset library with naming convention",
      "Style reference documentation",
      "Brand usage guidelines for AI-generated assets",
    ],
    process: [
      {
        step: "Brief and scope",
        description:
          "You define the visual category, volume, brand constraints, and delivery timeline.",
      },
      {
        step: "Direction and samples",
        description:
          "We produce initial samples against your brief for review and approval.",
      },
      {
        step: "Production",
        description:
          "Approved direction scales to the full deliverable set with quality checkpoints.",
      },
      {
        step: "Delivery and revision",
        description:
          "Production-ready files delivered with one structured revision round included.",
      },
    ],
    cta: {
      headline: "Discuss your image production needs",
      body: "Tell us the visual category, volume, brand direction, and delivery timeline.",
      href: "/contact?interest=AI_STUDIO&streamlined=1",
      buttonLabel: "Request a studio scope",
    },
    secondaryCta: { href: "/ai-studio" },
    heroVisual: {
      imageUrl: "/ai-studio/image-production.svg",
      imageAlt: "AI image production — Estio AI Studio",
    },
  },

  "video-production": {
    slug: "video-production",
    title: "AI Video Production",
    summary:
      "AI-generated short-form video for promotion, social channels, and campaign content \u2014 produced to specification with review checkpoints before delivery.",
    seo: {
      title: "AI Video Production \u2014 Estio AI Studio",
      description:
        "Short promo videos, social reels, image-to-video ads, and motion creative loops \u2014 AI-produced, brand-reviewed, and delivered as final files. Estio, Muscat.",
    },
    breadcrumbParents: [{ href: "/ai-studio", label: "AI Studio" }],
    additionalSections: [
      {
        title: "Production categories",
        bullets: [
          "Short Promo Videos \u2014 15\u201360 second promotional videos for product launches, service announcements, and brand storytelling.",
          "Image-to-Video Ad Variants \u2014 Static campaign visuals animated into video ad formats for social and display channels.",
          "Social Reel Packs \u2014 Platform-optimised vertical video sets for Instagram Reels, TikTok, and YouTube Shorts.",
          "Motion Creative Loops \u2014 Seamless motion graphics for website backgrounds, digital signage, and presentation environments.",
        ],
      },
    ],
    capabilities: [
      "AI-generated short-form video production",
      "Static-to-motion ad conversion",
      "Platform-specific format optimisation",
      "Seamless loop and motion graphics creation",
      "Brand-consistent visual treatment across formats",
      "Review checkpoints before final delivery",
    ],
    idealClients: [
      "Brands running social-first campaigns",
      "Marketing teams needing rapid video iteration",
      "E-commerce businesses requiring product video at scale",
      "Companies expanding into short-form video channels",
    ],
    deliverables: [
      "Final video files (MP4/MOV) in specified resolutions",
      "Platform-optimised exports (vertical, square, landscape)",
      "Motion asset library with naming convention",
      "Style reference documentation for ongoing production",
    ],
    process: [
      {
        step: "Brief and scope",
        description:
          "You define the video type, duration, volume, brand constraints, and delivery timeline.",
      },
      {
        step: "Direction and samples",
        description:
          "We produce initial motion samples against your brief for review and approval.",
      },
      {
        step: "Production",
        description:
          "Approved direction scales to the full video set with quality checkpoints.",
      },
      {
        step: "Delivery and revision",
        description:
          "Final video files delivered with one structured revision round included.",
      },
    ],
    cta: {
      headline: "Discuss your video production needs",
      body: "Tell us the video type, format, volume, brand direction, and delivery timeline.",
      href: "/contact?interest=AI_STUDIO&streamlined=1",
      buttonLabel: "Request a studio scope",
    },
    secondaryCta: { href: "/ai-studio" },
    heroVisual: {
      imageUrl: "/ai-studio/video-production.svg",
      imageAlt: "AI video production — Estio AI Studio",
    },
  },

  "brand-ai-packs": {
    slug: "brand-ai-packs",
    title: "Brand AI Packs",
    summary:
      "Structured AI asset systems for brands that need consistent, repeatable visual output \u2014 style presets, prompt logic, and asset libraries scoped to your brand identity.",
    seo: {
      title: "Brand AI Packs \u2014 Estio AI Studio",
      description:
        "Brand visual systems, style presets, asset consistency packs, and visual direction documentation \u2014 structured AI production for brand identity. Estio, Muscat.",
    },
    breadcrumbParents: [{ href: "/ai-studio", label: "AI Studio" }],
    additionalSections: [
      {
        title: "Pack categories",
        bullets: [
          "Brand Visual System \u2014 Complete AI-generated visual identity extension: style presets, reference imagery, and production-ready brand assets.",
          "Prompt and Style Preset System \u2014 Documented prompt architectures and style configurations that produce consistent output matching your brand.",
          "Asset Consistency Pack \u2014 Coordinated asset libraries with defined visual rules for cross-channel consistency.",
          "Visual Direction Pack \u2014 Art direction documentation, mood boards, and reference systems for ongoing AI-assisted production.",
        ],
      },
    ],
    capabilities: [
      "Brand-aligned AI visual identity extension",
      "Documented prompt and style preset systems",
      "Cross-channel asset consistency frameworks",
      "Art direction and mood board documentation",
      "Reusable production templates and references",
      "Quality benchmarks for ongoing AI-assisted output",
    ],
    idealClients: [
      "Brands scaling AI-assisted content production",
      "Marketing teams requiring visual consistency across channels",
      "Organisations building internal AI creative capabilities",
      "Companies with multiple sub-brands or regional variations",
    ],
    deliverables: [
      "Brand-aligned style preset library",
      "Documented prompt architecture for consistent output",
      "Visual reference and mood board documentation",
      "Asset consistency guidelines and quality benchmarks",
    ],
    process: [
      {
        step: "Brand audit and direction",
        description:
          "We review your existing brand assets, guidelines, and visual identity to define the AI production framework.",
      },
      {
        step: "System design and samples",
        description:
          "We design the preset system and produce initial sample outputs for review against your brand standards.",
      },
      {
        step: "Production and documentation",
        description:
          "Approved systems are finalised with complete documentation, templates, and quality benchmarks.",
      },
      {
        step: "Delivery and handover",
        description:
          "Complete pack delivered with usage guidelines and one revision round included.",
      },
    ],
    cta: {
      headline: "Discuss your brand pack needs",
      body: "Tell us your brand identity requirements, target channels, and consistency objectives.",
      href: "/contact?interest=AI_STUDIO&streamlined=1",
      buttonLabel: "Request a studio scope",
    },
    secondaryCta: { href: "/ai-studio" },
    heroVisual: {
      imageUrl: "/ai-studio/brand-ai-packs.svg",
      imageAlt: "Brand AI packs — Estio AI Studio",
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Accessors                                                         */
/* ------------------------------------------------------------------ */

export function getAiStudioPage(
  slug: string,
  locale: AppLocale = "en",
): ServiceDetailContent | undefined {
  if (locale === "ar") {
    return aiStudioPagesAr[slug] ?? aiStudioPages[slug];
  }
  return aiStudioPages[slug];
}

export function getAiStudioLanding(locale: AppLocale = "en") {
  if (locale === "ar") {
    return aiStudioLandingAr ?? aiStudioLanding;
  }
  return aiStudioLanding;
}
