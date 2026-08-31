import type {
  ResourceArticle,
  ResourcesIndexContent,
  ResourceSlug,
} from "./resources-types";

export const resourcesIndexEn: ResourcesIndexContent = {
  seoTitle: "Resources & guides",
  seoDescription:
    "Practical guides on AI visual production, bilingual web launches, enterprise AI governance, and GCC campaign execution — from the Estio team in Muscat.",
  kicker: "Resources",
  h1: "Guides for GCC marketing and operations teams",
  lead: "Long-form notes from how we scope, produce, and deliver work for hospitality, retail, and enterprise clients across the Gulf. Written for decision-makers who need specifics — not generic AI hype.",
};

export const resourceArticlesEn: Partial<Record<ResourceSlug, ResourceArticle>> &
  Record<
    | "gcc-hospitality-ai-visuals"
    | "bilingual-website-launch-gcc"
    | "ai-imagery-vs-photography"
    | "enterprise-private-ai-governance"
    | "gcc-retail-content-campaigns",
    ResourceArticle
  > = {
  "gcc-hospitality-ai-visuals": {
    slug: "gcc-hospitality-ai-visuals",
    title: "How GCC hospitality brands use AI visuals for seasonal campaigns",
    description:
      "A practical framework for hotels and F&B groups: when AI imagery fits seasonal promos, how to keep brand consistency, and what to review before publishing in Oman and the wider GCC.",
    kicker: "Hospitality",
    publishedAt: "2026-03-10",
    updatedAt: "2026-06-01",
    readMinutes: 9,
    tags: ["AI Studio", "Hospitality", "Campaigns"],
    relatedServiceHref: "/services/ai-creative",
    relatedServiceLabel: "AI creative services",
    sections: [
      {
        heading: "Why seasonal campaigns pressure creative teams",
        paragraphs: [
          "Hospitality groups in Muscat, Dubai, and Riyadh run overlapping peaks: Ramadan iftar packages, National Day offers, summer staycations, and year-end corporate events. Each window needs fresh visuals — hero banners, social crops, menu overlays, and lobby screen loops — often before photography crews can be scheduled across multiple properties.",
          "The bottleneck is rarely the idea. It is throughput: brand review, Arabic and English variants, aspect-ratio exports, and last-minute rate or date changes. Teams that treat AI as a replacement for brand strategy fail. Teams that treat it as a controlled production lane for defined asset types can ship on calendar without lowering standards.",
        ],
      },
      {
        heading: "Where AI visuals work well in hospitality",
        paragraphs: [
          "In our engagements, AI image production earns its place when the brief is narrow and the approval path is clear. Strong fits include atmospheric scene-setting (terrace at dusk, spa mood, plated dessert styling), campaign backgrounds with typography-safe negative space, and variant exploration before a final photoshoot.",
          "Weak fits include exact room inventory you must legally represent, staff portraits, identifiable guests, and any image that implies a specific view from a named room category without photographic proof. Regulators and OTAs are not forgiving about misleading room imagery; your production policy should say so explicitly.",
        ],
        bullets: [
          "Seasonal promo banners with text-safe composition",
          "Social crops for offers where mood matters more than exact SKU",
          "Concept boards before committing to location photography",
          "Localized variants (Arabic typography overlays on approved masters)",
        ],
      },
      {
        heading: "A governance model that survives brand review",
        paragraphs: [
          "We scope hospitality AI work with three written controls: an allow-list of scene types, a deny-list of elements (logos you do not own, identifiable people, unapproved alcohol placement where policy restricts it), and a human sign-off role before anything goes live.",
          "Brand consistency comes from reference packs — palette, lighting direction, lens feel, and prop vocabulary — not from prompting alone. When a group manages ten properties, we document which elements are chain-wide and which property may localize (for example, a specific waterfront backdrop vs. a generic Omani architectural texture).",
          "Arabic and English are not afterthoughts. Layouts that work in English often fail in Arabic when headlines gain length or RTL mirroring breaks composition. We produce paired masters or design safe zones so localization does not require re-generation.",
        ],
      },
      {
        heading: "Production calendar: a six-week seasonal pattern",
        paragraphs: [
          "Week 1: lock offer matrix (properties, dates, rate bands, channels). Week 2: generate controlled variants against approved references; internal shortlist. Week 3: brand and legal review; reject and revise with logged prompts and seeds where applicable. Week 4: export package — web hero, 1:1 social, 9:16 stories, print if needed — with naming conventions the client CMS expects.",
          "Weeks 5–6: buffer for OTA updates, WhatsApp broadcast assets, and on-property screen refreshes. If you routinely skip the buffer, you will eventually publish an unreviewed asset under pressure — that is when AI programs get shut down internally.",
        ],
      },
      {
        heading: "Measuring quality without fake metrics",
        paragraphs: [
          "Useful signals: time from brief to approved master, revision rounds per asset class, channel rejection rate (brand/legal), and post-campaign retrospective on which visuals required replacement photography. Vanity counts of images generated are irrelevant.",
          "If you are evaluating a partner, ask for a redacted workflow description and a sample export spec — file names, sizes, color profile, and caption metadata — not a glossy gallery alone.",
        ],
      },
      {
        heading: "When to escalate to Estio AI Studio vs. full service",
        paragraphs: [
          "Self-serve credits in AI Studio suit teams that already have brand references and a reviewer on their side. Full-service AI creative suits groups that want Estio to own shot lists, generation, retouching policy, and formatted handoff into your CMS or agency-of-record.",
          "Either path works if governance is written first. Neither path works if marketing expects unlimited exploration with no approver — that is how off-brand imagery reaches Instagram at 11 p.m. before a holiday weekend.",
        ],
      },
    ],
  },
  "bilingual-website-launch-gcc": {
    slug: "bilingual-website-launch-gcc",
    title: "Bilingual website launch checklist for Oman and UAE teams",
    description:
      "A step-by-step checklist for EN/AR launches: content parity, RTL layout, SEO hreflang, CMS handoff, legal pages, and go-live verification — written for marketing and IT stakeholders.",
    kicker: "Web delivery",
    publishedAt: "2026-02-18",
    updatedAt: "2026-05-20",
    readMinutes: 11,
    tags: ["Web design", "Arabic", "SEO"],
    relatedServiceHref: "/services/web-design-development",
    relatedServiceLabel: "Website design & development",
    sections: [
      {
        heading: "Why bilingual launches fail in the last mile",
        paragraphs: [
          "Most GCC website projects do not fail on design. They fail on parity: English goes live while Arabic is placeholder, forms post to the wrong CRM field, or RTL CSS breaks on real copy instead of lorem ipsum. Stakeholders see a beautiful homepage and assume launch-ready; IT discovers missing hreflang, mixed numerals, and untranslated error strings three days before a board demo.",
          "This checklist reflects how Estio ships bilingual marketing sites — scoped quotes, formatted deliverables, and CMS handoff documentation. Use it internally or as a vendor scorecard.",
        ],
      },
      {
        heading: "Phase 1 — Content and IA before pixels",
        paragraphs: [
          "Lock information architecture in both languages before high-fidelity design. Navigation labels, footer legal links, service names, and CTA verbs should be final enough to test length in Arabic. If your Arabic nav wraps to two lines while English sits on one, fix IA or typography now — not during UAT.",
          "Decide parity rules: full parity (every EN page has AR equivalent), selective parity (corporate EN-only PDFs with AR summaries), or phased parity (document the backlog). Write this in the scope of work so launch is not debated emotionally.",
        ],
        bullets: [
          "Sitemap EN and AR with explicit pairing",
          "Glossary: product names, transliteration choices, banned terms",
          "Legal: privacy, terms, cookie notice — source of truth owner",
          "Form field labels, validation, and thank-you messages in both languages",
        ],
      },
      {
        heading: "Phase 2 — RTL and typography that survives real copy",
        paragraphs: [
          "RTL is not mirror-mode. Icons that imply direction, charts with time axes, phone numbers, and mixed Latin/Arabic strings need component-level rules. Test with longest realistic headlines from hospitality, banking, and government-adjacent clients — sectors common in Oman and the UAE.",
          "Choose fonts with Arabic coverage and weights that match English display type rhythm. Subtle size adjustments per script are normal; hiding them creates uneven hierarchy on mobile.",
        ],
      },
      {
        heading: "Phase 3 — SEO, hreflang, and structured data",
        paragraphs: [
          "Each public URL should have a canonical, paired alternates, and consistent locale prefixes (/en/... and /ar/...). Avoid duplicate content on bare paths unless you 301 to a default locale deliberately.",
          "Submit sitemap.xml after launch and verify Search Console properties per hostname. Organization schema, FAQ schema where applicable, and correct lang attributes on html elements help crawlers — they do not replace substantive page copy.",
        ],
      },
      {
        heading: "Phase 4 — CMS handoff and editor documentation",
        paragraphs: [
          "Editors will change copy on day two. Deliver short Loom-style or written guides: how to swap hero media, how bilingual fields map, what breaks RTL if they paste Word formatting, and who approves Arabic updates.",
          "Role separation matters: marketing editor vs. developer vs. translator. If everyone edits JSON, someone will ship broken Arabic quotes within a month.",
        ],
      },
      {
        heading: "Phase 5 — Go-live verification (48-hour window)",
        paragraphs: [
          "Run this list in production, not staging: form submissions in both locales, email notifications, analytics events, cookie banner behavior, 404 pages localized, PDF downloads tracked, and performance on mobile networks typical in the GCC (not only office Wi-Fi in Muscat).",
          "Keep a rollback plan: DNS TTL lowered pre-cutover, database backup timestamp, and a named decision-maker for revert. Launches without rollback plans rely on optimism.",
        ],
        bullets: [
          "All CTAs resolve to live funnels",
          "WhatsApp and tel: links correct on mobile",
          "Open Graph previews for EN and AR sample URLs",
          "Accessibility: focus order and contrast on forms",
        ],
      },
      {
        heading: "After launch: what to measure in the first 90 days",
        paragraphs: [
          "Track locale split in analytics, form completion by language, search impressions per hreflang cluster, and editor ticket volume (sign of unclear CMS). High Arabic traffic with low conversion often means awkward CTA copy or untranslated trust signals — not “Arabs don’t convert.”",
          "Estio typically includes a stabilisation period in web SOWs: fixed hours for defect fixes vs. new features. Clarify that boundary before launch day adrenaline wears off.",
        ],
      },
    ],
  },
  "ai-imagery-vs-photography": {
    slug: "ai-imagery-vs-photography",
    title: "When to use AI image production vs traditional photography",
    description:
      "Decision criteria for marketing leaders: cost, speed, legal risk, brand fidelity, and channel requirements — with examples from retail, hospitality, and corporate comms in the Gulf.",
    kicker: "AI Studio",
    publishedAt: "2026-01-22",
    updatedAt: "2026-05-08",
    readMinutes: 8,
    tags: ["AI Studio", "Production"],
    relatedServiceHref: "/ai-studio/image-production",
    relatedServiceLabel: "AI image production",
    sections: [
      {
        heading: "The question is not “AI or photo” — it is asset class",
        paragraphs: [
          "Marketing teams ask binary questions under deadline pressure. Production teams need asset-class decisions. A hero banner, a product SKU shot, an executive portrait, and a regulatory disclosure graphic have different truth requirements. AI compresses time for some; photography remains non-negotiable for others.",
          "Estio runs both lanes: governed AI generation in AI Studio and full-service creative where human photographers, stylists, and retouchers lead. The expensive mistake is using the wrong lane and discovering it after media spend is committed.",
        ],
      },
      {
        heading: "Prefer photography when truth is contractual",
        paragraphs: [
          "Real estate listings, hotel room categories, packaged goods with regulated labels, medical contexts, and executive board photos are photography-first. Misrepresentation creates legal exposure and channel takedowns. If a customer could reasonably claim “that is not what I received,” AI is the wrong tool unless it is clearly stylized and non-literal.",
        ],
        bullets: [
          "SKU-accurate product color and packaging",
          "Named individuals requiring consent",
          "Evidence-style documentation",
          "Press releases with identifiable facilities",
        ],
      },
      {
        heading: "Prefer AI when speed and exploration dominate",
        paragraphs: [
          "Campaign mood exploration, seasonal backgrounds, abstract textures, storyboard frames, and multilingual layout variants are strong AI cases — especially when you need ten directions before picking one for a shoot brief.",
          "Cost economics favor AI when revision count is high and per-image marginal cost matters. A photoshoot day in the Gulf is fixed cost; ten AI variants before locking art direction can reduce wasted shoot time.",
        ],
      },
      {
        heading: "Hybrid workflows we see work in practice",
        paragraphs: [
          "Pattern A: AI concepts → client approval → photography matching approved mood. Pattern B: photography master → AI-assisted localization and crop variants. Pattern C: AI backgrounds + photographed product composited with retouching standards documented.",
          "Each pattern needs a compositing and disclosure policy. Some brands hide hybrid process; others require “styled imagery” notes in footer microcopy. Decide consciously.",
        ],
      },
      {
        heading: "Brand risk: the uncanny valley is not the main issue",
        paragraphs: [
          "Off-brand lighting and wrong cultural cues lose Gulf campaigns more often than slightly weird hands. Reference packs, banned motifs, and reviewer checklists address that. Legal risk from implied claims beats aesthetic nitpicking.",
          "Maintain a rejection log: why assets failed review. Patterns emerge — usually prompt drift or missing reference anchors, not model incapability.",
        ],
      },
      {
        heading: "Procurement questions to ask any vendor",
        paragraphs: [
          "Who owns prompts and seeds? What is the retention policy for generated intermediates? How are Arabic headlines overlaid without breaking RTL layout? What file formats and color profiles ship? What happens when brand rejects after hours — SLA and credit policy?",
          "If answers are vague, assume risk sits with your marketing team alone.",
        ],
      },
    ],
  },
  "enterprise-private-ai-governance": {
    slug: "enterprise-private-ai-governance",
    title: "Enterprise private AI: governance patterns for regulated teams",
    description:
      "How to scope retrieval-augmented assistants with role-based access, audit logging, and IT-operable runbooks — without boiling the ocean on pilot one.",
    kicker: "Enterprise",
    publishedAt: "2026-04-02",
    updatedAt: "2026-06-10",
    readMinutes: 10,
    tags: ["Enterprise", "Private AI", "Governance"],
    relatedServiceHref: "/enterprise/private-ai",
    relatedServiceLabel: "Private AI programmes",
    sections: [
      {
        heading: "Why “private ChatGPT” projects stall",
        paragraphs: [
          "Enterprise teams buy GPUs or API credits, upload PDFs, demo impressive answers in a workshop, then stall at IT security review. Missing pieces: corpus ownership, role-based access aligned to existing identity systems, logging sufficient for audit, data residency commitments, and a defined answer policy when retrieval confidence is low.",
          "Estio’s private AI track treats governance as deliverable one — not a phase-three afterthought.",
        ],
      },
      {
        heading: "Corpus design beats model selection",
        paragraphs: [
          "Start with one department and one question class: HR policy for managers, sales battlecards for approved SKUs, or engineering runbooks for tier-two support. Ingestion pipelines must record source, version, and expiry. Stale corpus equals confident wrong answers — worse than no assistant.",
          "Chunking and metadata matter for Arabic and English mixed corpora common in GCC enterprises. Search that ignores language tag or document authority tier will surface contradictions.",
        ],
        bullets: [
          "Source-of-truth owner per document class",
          "Versioning tied to HR/legal release dates",
          "Explicit “do not answer” topics",
          "Escalation path to human ticket queues",
        ],
      },
      {
        heading: "Access control must mirror real authority",
        paragraphs: [
          "If an intern can ask the same question as a finance director and receive identical compensation policy detail, your RBAC is broken. Map assistant scopes to groups you already maintain — Azure AD, Google Workspace, or on-prem LDAP — rather than inventing parallel user lists that drift.",
        ],
      },
      {
        heading: "Logging and audit: practical minimum",
        paragraphs: [
          "Log who asked, when, which corpus version matched, and whether the answer included citations. Retention should match your industry norm; deletion requests must propagate. Demonstrate redaction for pasted secrets or national ID numbers if users can paste free text.",
          "Auditors care less about model architecture than evidence you can produce in a review meeting within 24 hours.",
        ],
      },
      {
        heading: "Pilot scope that actually converts to production",
        paragraphs: [
          "Phase 1 — two-week assessment: inventory systems, pick one workflow, define success as time-to-answer or ticket deflection for that workflow only. Phase 2 — six-week pilot: single corpus, ≤200 users, weekly error review. Phase 3 — production hardening: HA, monitoring, runbooks, on-call rotation on client IT side.",
          "Skip phase 1 and you will rebuild later at higher political cost.",
        ],
      },
      {
        heading: "Commercial and vendor boundaries",
        paragraphs: [
          "Contract for data processing, subprocessors, model change notification, and exit assistance (export corpus embeddings/config where applicable). Clarify whether training occurs on client data — Estio’s default posture is no training on confidential client corpora without explicit addendum.",
          "Managed service vs. handover to internal platform team should be decided before pilot funding; both are valid, mixing them ambiguously creates orphan systems.",
        ],
      },
    ],
  },
  "gcc-retail-content-campaigns": {
    slug: "gcc-retail-content-campaigns",
    title: "Content campaign execution for GCC retail brands",
    description:
      "How to plan omnichannel retail campaigns — offer calendars, channel specs, Arabic/English variants, and approval workflows — when launches must hit WhatsApp, mall screens, and paid social the same week.",
    kicker: "Retail",
    publishedAt: "2026-05-05",
    updatedAt: "2026-06-15",
    readMinutes: 9,
    tags: ["Content", "Retail", "Campaigns"],
    relatedServiceHref: "/services/content-campaigns",
    relatedServiceLabel: "Content & campaign execution",
    sections: [
      {
        heading: "Retail campaigns are logistics problems dressed as creative",
        paragraphs: [
          "A mall launch in Muscat or a white-goods promo in Jeddah requires synchronized assets: in-store screens, promoter WhatsApp scripts, influencer kits, paid social, and e-commerce banners — often with different aspect ratios and file size caps per channel. Creative concept is 30% of the work; packaging and approval are 70%.",
          "Estio’s content and campaign execution service exists because internal teams drown in export variants, not because they lack designers.",
        ],
      },
      {
        heading: "Build an offer calendar before design starts",
        paragraphs: [
          "Document SKUs, discount mechanics, gift-with-purchase rules, start/end timestamps with timezone (Gulf markets span multiple zones), and channels per offer. Ambiguous offer copy causes the most revision loops — especially when Arabic marketing text must mirror legal precision on exclusions.",
        ],
        bullets: [
          "Master offer matrix (CSV or sheet) with channel columns",
          "Legal-approved disclaimer blocks EN/AR",
          "Influencer do/don’t list (competitor mentions, unapproved claims)",
          "Photography vs. AI-generated asset flags per SKU",
        ],
      },
      {
        heading: "Channel specs that prevent launch-day re-exports",
        paragraphs: [
          "Maintain a living spec: Instagram feed, story, Snapchat, mall portrait screens, website hero, marketplace banners. Include max file weight, safe margins for mall crops, and video duration caps. Retail ops will not wait while you re-export a 12MB PNG at 9 p.m.",
        ],
      },
      {
        heading: "Approval workflow: three roles minimum",
        paragraphs: [
          "Marketing owner (message), legal/compliance (claims), and retail ops (store-readable pricing). Optional brand guardian for visual consistency. Slack/WhatsApp approvals need audit trail — screenshot threads are not sufficient for regulated categories.",
          "Set a cut-off time 48 hours before live unless emergency protocol documented.",
        ],
      },
      {
        heading: "Arabic/English parity in retail voice",
        paragraphs: [
          "Promotional Arabic in the Gulf often uses different warmth and formality than English taglines translated literally. Decide if brand voice allows colloquial hooks or requires MSA throughout. Mixed approaches confuse franchisees.",
          "Numerals, currency symbols, and VAT display rules should match each market — UAE and Oman differ in presentation expectations on social vs. print.",
        ],
      },
      {
        heading: "Post-campaign learning worth keeping",
        paragraphs: [
          "Archive not only finals but also rejected routes — they explain what brand will never approve. Track which channels drove redemptions if data is available; correlate with asset types (lifestyle vs. product-on-white).",
          "Quarterly, prune unused templates and update the offer matrix macros. Campaign debt accumulates silently until nobody trusts the shared drive.",
        ],
      },
    ],
  },
};

export function getResourcesIndex(locale: "en"): ResourcesIndexContent {
  return resourcesIndexEn;
}

export function getResourceArticle(
  slug: ResourceSlug,
  locale: "en",
): ResourceArticle | undefined {
  return resourceArticlesEn[slug];
}

export function listResourceArticles(locale: "en"): ResourceArticle[] {
  return Object.values(resourceArticlesEn).sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}
