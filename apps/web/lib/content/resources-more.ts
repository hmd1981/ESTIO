import type { ResourceArticle, ResourceSlug } from "./resources-types";

export const resourceArticlesMoreEn: Record<
  | "brand-ai-reference-pack"
  | "gcc-whatsapp-campaign-assets"
  | "briefing-ai-creative-vendor"
  | "arabic-rtl-website-failures"
  | "estio-delivery-scoping"
  | "editorial-standards",
  ResourceArticle
> = {
  "brand-ai-reference-pack": {
    slug: "brand-ai-reference-pack",
    title: "How to build a brand reference pack for AI image production",
    description:
      "A working specification Estio uses before generating campaign imagery: palette, lighting, lens feel, banned motifs, Arabic overlay zones, and how reviewers actually use the pack.",
    kicker: "AI Studio",
    publishedAt: "2026-06-20",
    updatedAt: "2026-08-18",
    readMinutes: 12,
    tags: ["AI Studio", "Brand", "Production"],
    relatedServiceHref: "/ai-studio/brand-ai-packs",
    relatedServiceLabel: "Brand AI packs",
    sections: [
      {
        heading: "A prompt is not a brand system",
        paragraphs: [
          "Teams that start AI image work with a paragraph of adjectives get inconsistent output and then blame the model. The model is doing what it was asked: improvising. A brand reference pack is the written and visual constraint set that makes improvisation expensive and repetition cheap.",
          "At Estio we refuse to open an unscoped generation lane for a multi-property or multi-SKU client until a pack exists — even a short one. The pack is not a moodboard for inspiration. It is an operating document a reviewer can use to accept or reject an image in under two minutes.",
        ],
      },
      {
        heading: "What belongs in the pack (and what does not)",
        paragraphs: [
          "Include: hex or PMS palette with usage notes (hero vs. accent vs. forbidden combinations), two to four lighting recipes (e.g. late-afternoon side light, cool interior ambient), lens and depth-of-field language, surface materials that appear in your real venues or products, and a deny-list of motifs you never want — tourist clichés, unlicensed landmarks, alcohol where policy forbids it, identifiable staff or guests.",
          "Exclude: every campaign you have ever run, 200 screenshots from Pinterest, and competitor ads. Excess references dilute the constraint. If a designer cannot hold the pack in working memory, the generator will not either.",
        ],
        bullets: [
          "8–20 approved stills, not 200 — each captioned with why it is approved",
          "Typography specimens for Arabic and English display and body",
          "Safe-zone overlays for 16:9, 1:1, and 9:16 where headlines will sit",
          "Named owners: who may add a reference, who may retire one",
        ],
      },
      {
        heading: "Arabic and English as layout constraints, not afterthoughts",
        paragraphs: [
          "Gulf campaigns fail in production when an English-first composition leaves no room for a longer Arabic headline or when RTL mirroring throws a logo into the optical centre. The pack should include paired headline lengths — the longest realistic Arabic line and the shortest English lockup — so generators and designers share the same negative-space budget.",
          "We photograph or generate masters with a documented safe column. Overlay is a separate step: type is not baked into the model output unless the client has accepted the risk of uneditable text. Most hospitality and retail clients should keep type in the design tool.",
        ],
      },
      {
        heading: "How reviewers use the pack in a live campaign week",
        paragraphs: [
          "The reviewer does not re-prompt. They score against a short rubric: lighting match, palette match, motif deny-list, people policy, text-safe composition, and channel crop. A fail on deny-list or people policy is a hard stop. A fail on lighting is a revision. Vanity (“I just don’t like it”) is recorded as taste so it does not silently become brand law.",
          "We keep a rejection log with the rubric codes. After two campaigns the log is more valuable than the original pack — it shows where prompts drift and where the pack itself is ambiguous.",
        ],
      },
      {
        heading: "Versioning when the brand is a group, not a single property",
        paragraphs: [
          "Hotel groups and retail franchises need a chain-wide core pack and property or region overlays. The overlay may add a waterfront backdrop or a local material; it may not redefine the palette or the people policy. Write that sentence in the pack. Otherwise every general manager becomes an art director the week before National Day.",
          "Store the pack where editors already work — the same CMS or DAM you will export into — with a date and a checksum or simple version number on the cover sheet. Email attachments of “final_v7_REAL.pptx” are how packs die.",
        ],
      },
      {
        heading: "When Estio builds the pack for you",
        paragraphs: [
          "Brand AI Packs at Estio are this document plus a governed generation lane: allow-listed scene types, export naming, and a human sign-off before anything is customer-facing. If you already have a designer who can maintain the pack, self-serve credits can sit on top. If you do not, buying credits first only accelerates off-brand output.",
          "Ask for a redacted sample pack cover sheet before you buy a volume of generations. If a vendor cannot show the constraint document, they are selling a gallery, not a production system.",
        ],
      },
    ],
  },
  "gcc-whatsapp-campaign-assets": {
    slug: "gcc-whatsapp-campaign-assets",
    title: "WhatsApp campaign assets for Oman and UAE retail teams",
    description:
      "How we spec, write, and approve WhatsApp Business campaign kits: image sizes, Arabic copy length, offer legality, promoter scripts, and why this channel breaks more launches than Instagram.",
    kicker: "Retail",
    publishedAt: "2026-07-08",
    updatedAt: "2026-08-12",
    readMinutes: 11,
    tags: ["Content", "Retail", "Campaigns"],
    relatedServiceHref: "/services/content-campaigns",
    relatedServiceLabel: "Content & campaign execution",
    sections: [
      {
        heading: "WhatsApp is an operations channel wearing a marketing hat",
        paragraphs: [
          "In Oman and the UAE, a large share of retail and hospitality conversion still happens in WhatsApp: promoter forwards, broadcast lists, and customer replies that turn into reservations or store visits. Teams treat it as “just another social crop.” It is not. Compression, forward-of-forwards, and tiny screens punish weak type and busy photography.",
          "Estio treats WhatsApp as its own workstream in a campaign SOW: a kit with stills, a short video or none, a script for promoters, and a legal block that survives being copied into a chat. If that kit is missing, store staff invent copy at 9 p.m. — that is how wrong prices and expired offers spread.",
        ],
      },
      {
        heading: "Image and video specs that survive forwarding",
        paragraphs: [
          "Prefer a 4:5 or 1:1 still with a large offer numeral, a single product or venue cue, and a quiet background. Fine print that is readable on a 27-inch monitor is invisible on a mid-range Android after two compressions. Put exclusions in the message text, not only in the image.",
          "Video under 20 seconds, no auto-tiny captions that collide with WhatsApp’s own UI chrome, and a first frame that works as a still if autoplay fails. We export a still poster even when the hero is video.",
        ],
        bullets: [
          "One offer per card — do not stack three SKUs and a QR",
          "Arabic headline tested at the longest real line, not lorem",
          "Contrast that holds in night mode and bright mall lighting",
          "File weight budget agreed with the client’s broadcast tool",
        ],
      },
      {
        heading: "Copy: MSA, Gulf spoken Arabic, or bilingual in one bubble",
        paragraphs: [
          "Decide the register before design. A bank or healthcare offer usually needs Modern Standard Arabic. A casual F&B drop may use Gulf conversational phrasing — but then English cannot be a literal translation of a colloquial hook. Write both languages as originals that carry the same legal meaning.",
          "Message length: the first two lines must contain the offer and the end date. Everything after is optional because many readers never expand. Include the store or property name; forwarded cards lose the chat header context.",
        ],
      },
      {
        heading: "Legal and pricing: the silent campaign killer",
        paragraphs: [
          "VAT display, “from” pricing, gift-with-purchase conditions, and alcohol rules differ by market and by mall landlord. The WhatsApp card is still an advertisement. If your Instagram has a compliant caption and WhatsApp has a cropped graphic without the exclusion, you have two legal versions of the same campaign.",
          "We keep a disclaimer block in both languages as plain text the promoter can paste. Images get a short “T&Cs apply” only when the full block is in the message. That rule is written in the offer matrix, not left to memory.",
        ],
      },
      {
        heading: "Promoter scripts and reply handling",
        paragraphs: [
          "A kit without a script trains staff to negotiate. Give them: opening line, what they may promise, what they must escalate, and a closing that points to a booking link or store hours. If you use WhatsApp Business catalogs or quick replies, those need the same legal review as the broadcast.",
          "Measure: tap-through if you use a tracked link, store-reported redemptions, and — qualitatively — how often customers arrive with a screenshot of an expired card. That last number tells you whether your date typography is failing.",
        ],
      },
      {
        heading: "How this sits next to paid social and mall screens",
        paragraphs: [
          "The offer matrix should have a WhatsApp column with its own crop and copy, not “use the Instagram story.” Mall portrait screens can share art direction; they cannot share file weight or safe margins. Estio’s campaign execution work is mostly this packaging, not a new concept every week.",
          "If you only have budget for one extra asset class beyond paid social, make it WhatsApp. In our Muscat and UAE retail work it is the kit store teams actually send.",
        ],
      },
    ],
  },
  "briefing-ai-creative-vendor": {
    slug: "briefing-ai-creative-vendor",
    title: "How to brief an AI creative vendor without wasting a sprint",
    description:
      "A RACI, shot-list, and rejection rubric you can attach to an RFQ — written from how Estio scopes AI imagery and video so brand, legal, and marketing stop arguing in the comment thread.",
    kicker: "Production",
    publishedAt: "2026-07-22",
    updatedAt: "2026-08-15",
    readMinutes: 13,
    tags: ["AI Studio", "Production", "Campaigns"],
    relatedServiceHref: "/services/ai-creative",
    relatedServiceLabel: "AI creative services",
    sections: [
      {
        heading: "Most AI creative projects fail at the brief, not the model",
        paragraphs: [
          "A request that says “make us modern Ramadan visuals, lots of options” produces a folder of almost-right images and a political argument about taste. The vendor cannot tell a hard constraint from a preference. Your legal team cannot tell what was promised to a media owner.",
          "Estio asks for a one-page brief that names asset classes, channels, languages, truth requirements (literal vs. atmospheric), and a single approver. If that page does not exist, we write it in discovery and refuse to start generation until it is signed. That saves more time than any new model version.",
        ],
      },
      {
        heading: "RACI that matches how Gulf organisations actually decide",
        paragraphs: [
          "Responsible: the production lead who runs the generation and export (Estio or your in-house designer). Accountable: one named marketing owner who can say ship. Consulted: legal or compliance on claims and people; operations if pricing or room types appear. Informed: agency-of-record or media buyer so live dates are real.",
          "Do not put “the board” or “everyone on the WhatsApp group” in Accountable. If two people can reject with equal force and no tie-break, you do not have an accountable role — you have a committee.",
        ],
        bullets: [
          "Accountable person named with email, not a department",
          "Consulted legal has a 48-hour SLA or the calendar slips in writing",
          "Informed media buyer receives finals in the file names they already use",
          "Vendor (us) does not accept taste vetoes from unofficial reviewers",
        ],
      },
      {
        heading: "Shot list by asset class, not by inspiration",
        paragraphs: [
          "List each deliverable as a row: channel, aspect ratio, language overlays, whether the scene must be a real property, and whether people may appear. Atmospheric terrace-at-dusk for a social teaser is a different row from “Deluxe King, city view” for an OTA. Mixing them in one prompt batch is how misleading inventory happens.",
          "For video, list duration, first-frame poster, caption language, and whether music is licensed. “A cinematic 30-second brand film” is not a shot list.",
        ],
      },
      {
        heading: "Rejection rubric: make ‘no’ cheap and specific",
        paragraphs: [
          "We use coded reasons: DENY_MOTIF, PEOPLE_POLICY, LITERAL_MISMATCH, PALETTE, LIGHTING, TEXT_SAFE, CULTURAL_CUE, FILE_SPEC. A reviewer picks a code and one sentence. “Make it pop” is not a code. After ten rejects you can see whether the brief, the pack, or the generator is the problem.",
          "Hard stops (policy and literal mismatch) do not go to a second art-direction round. They go back to the brief. Soft stops (lighting, palette) get one revision cycle in the same sprint.",
        ],
      },
      {
        heading: "What to put in the RFQ so vendors cannot hide",
        paragraphs: [
          "Ask: who owns prompts and seeds; retention of intermediates; whether type is generated or overlaid; Arabic overlay method; commercial-use terms; what happens when brand rejects after hours; and whether they will work from your reference pack or invent one. Vague answers mean you will own the risk when a platform takes a listing down.",
          "Ask for a redacted workflow, not only a gallery. Estio’s AI creative service is scoped as production with review gates. If you want unlimited exploration, say so — that is a different commercial shape and a different calendar.",
        ],
      },
      {
        heading: "A one-week sprint shape that we will actually staff",
        paragraphs: [
          "Day 1: brief and pack lock. Days 2–3: generation against allow-listed scenes. Day 4: internal shortlist and rubric. Day 5: client review. Buffer is not optional if your live date is a public holiday week in the GCC — those weeks have fewer reviewer hours, not more.",
          "If your organisation cannot return comments in 24 hours, do not book a five-day sprint. Book a two-week cycle. Optimism is not a staffing plan.",
        ],
      },
    ],
  },
  "arabic-rtl-website-failures": {
    slug: "arabic-rtl-website-failures",
    title: "Arabic and RTL website failures we still see on GCC hospitality sites",
    description:
      "Concrete layout, typography, form, and SEO mistakes that survive “we launched Arabic” — and the checks Estio runs before a bilingual hotel or group site goes live.",
    kicker: "Web delivery",
    publishedAt: "2026-06-28",
    updatedAt: "2026-08-10",
    readMinutes: 12,
    tags: ["Web design", "Arabic", "SEO"],
    relatedServiceHref: "/services/web-design-development",
    relatedServiceLabel: "Website design & development",
    sections: [
      {
        heading: "Arabic is not a stylesheet flip",
        paragraphs: [
          "Many hospitality sites in the Gulf ship an English experience and then enable a locale switch. The CSS mirrors padding. The content does not. You get English error strings, English booking widgets, leftover LTR chevrons, and Arabic headlines wrapping into the logo. Guests notice. Procurement notices when a board member opens the site on a phone.",
          "Estio’s bilingual launches treat Arabic as a first-class information architecture problem: navigation labels, form validation, email templates, and PDF downloads have owners and test accounts in both languages before we call the site done.",
        ],
      },
      {
        heading: "Typography: the failures that look “designed” in Figma",
        paragraphs: [
          "Display fonts chosen for English often lack Arabic coverage, so the browser falls back to a system face that does not match weight or contrast. The page looks accidentally bilingual in a bad way. Specify a pairing with overlapping weights and test the longest real Arabic H1 from your offer copy — not “عنوان تجريبي”.",
          "Line length and justification: full justification on Arabic body copy without hyphenation control creates rivers and isolated words. We prefer rag-left (which is rag-end in RTL) with a measured measure, and we ban mid-word breaks in headings.",
        ],
        bullets: [
          "Mixed numerals: decide Arabic-Indic vs. European digits per locale and stick to it in prices",
          "Telephone links must remain tap-to-call after RTL mirroring",
          "Icons that imply direction (arrows, timeline) need logical, not physical, properties",
          "Do not mirror photographs of interiors; do mirror chrome and chevrons",
        ],
      },
      {
        heading: "Forms, booking engines, and third-party widgets",
        paragraphs: [
          "The marketing pages can be perfect while the booking iframe is English-only or LTR. That is still the product. Either localise the widget, wrap it with honest language about what is English, or do not claim a bilingual launch. Hidden English checkout after an Arabic funnel is a conversion and trust problem.",
          "Validation messages, date pickers, and required-field markers must be translated and must not overlap Arabic input. We test with real names that include spaces and family-name particles common in the region.",
        ],
      },
      {
        heading: "SEO: hreflang is not a substitute for parity",
        paragraphs: [
          "hreflang and locale prefixes (/en, /ar) help crawlers. They do not fix thin Arabic pages that are machine-translated stubs. If Arabic is thinner than English, you have a content project, not a metadata project. Google’s quality systems treat thin or auto-translated pages as low value — the same class of problem as an empty marketing site.",
          "Each public URL needs a canonical, paired alternates, and a language attribute that matches the visible text. Mixing Arabic body with an html lang of en is a quality defect we correct in go-live checklists.",
        ],
      },
      {
        heading: "A pre-launch checklist we actually run",
        paragraphs: [
          "We walk every template in Arabic on a mid-range phone: nav wrap, footer legal links, 404, cookie notice, form submit, and the email that arrives after submit. We check Open Graph previews for an Arabic URL. We confirm the CMS editor can change an Arabic headline without breaking RTL by pasting from Word.",
          "If any of those fail, launch is not a design debate. It is a defect list. Estio’s website work includes a written parity rule in the scope so this argument does not start on go-live morning.",
        ],
      },
      {
        heading: "When to fix the current site versus rebuild",
        paragraphs: [
          "If the design system already uses logical CSS properties and the CMS has bilingual fields, a focused remediation sprint can clear the worst defects. If Arabic is a plugin afterthought and the booking engine cannot localise, be honest in the SOW: you are funding a platform change, not a translation pass.",
          "We will say that in the first reply if the evidence is on the public site. That is cheaper than a month of CSS patches that cannot fix a third-party checkout.",
        ],
      },
    ],
  },
  "estio-delivery-scoping": {
    slug: "estio-delivery-scoping",
    title: "How Estio scopes work: quotes, review gates, and file handoff",
    description:
      "The operating model behind our proposals — what a scoped quote contains, how reviews work, what we refuse to leave implicit, and how files leave our studio in Muscat.",
    kicker: "Delivery",
    publishedAt: "2026-05-28",
    updatedAt: "2026-08-08",
    readMinutes: 10,
    tags: ["Delivery", "Web design", "Campaigns"],
    relatedServiceHref: "/about",
    relatedServiceLabel: "About Estio",
    sections: [
      {
        heading: "A quote is a delivery contract, not a price teaser",
        paragraphs: [
          "Estio’s proposals list deliverables, formats, languages, review rounds, and what happens when inputs arrive late. We do this because Gulf marketing calendars move and informal scope is how relationships burn. If a line is not in the quote, it is a change request — not a disappointment we absorb silently.",
          "You will see phases when the work is uncertain (enterprise automation, private AI). You will see a fixed list when the work is a known asset class (a bilingual marketing site, a seasonal visual kit). We do not hide enterprise uncertainty behind a single number.",
        ],
      },
      {
        heading: "What we need before we can price honestly",
        paragraphs: [
          "For websites: a page list or sitemap draft, languages, CMS training yes/no, and whether third-party booking or chat is in scope. For campaigns: offer matrix, channels, and who approves claims. For AI Studio: asset classes and whether you have a reference pack. For enterprise: named systems, data classes, and one pilot workflow.",
          "If you cannot provide those yet, we can still reply — with a discovery or assessment phase, not a fake build price. That is not upselling. It is how we avoid writing a number that only works if every assumption is true.",
        ],
      },
      {
        heading: "Review gates: who speaks, and when silence means slip",
        paragraphs: [
          "Each engagement has a named client owner. Comments come through that owner or a documented deputy. Open Slack channels where anyone can reject a homepage at midnight are not a review process. We will still be polite. We will also move the date.",
          "Rounds are counted. A new strategic direction after visual lock is a new phase. We write that in the quote so it is not a surprise. Hospitality and retail clients who have lived through last-minute rate changes already understand this; we are making it contractual.",
        ],
        bullets: [
          "Written acceptance per phase, not a thumbs-up emoji",
          "Legal/compliance time included in the calendar or called out as client-owned",
          "Arabic and English reviewed as a pair when both will go live",
          "File names and colour profiles stated for handoff, not “high-res please”",
        ],
      },
      {
        heading: "Handoff: files your team can find in six months",
        paragraphs: [
          "We deliver to the folder structure and naming the quote specified — often the client CMS, a DAM, or a simple dated package. Editors get a short guide: what they may change, what breaks RTL, who to call. Source files are included when the SOW says so.",
          "Enterprise automation and private AI include runbooks and an owner map. If your IT team cannot operate day-two, the project is not handed over — it is hosted in limbo. We will not call that done.",
        ],
      },
      {
        heading: "What we will decline",
        paragraphs: [
          "Unlimited exploration with no approver. AI imagery that must legally represent a named room or SKU without photography. Automation without a named system owner. Websites that claim bilingual launch with English-only checkout and no plan to fix it. Work we cannot staff to our own review standard in the week you want.",
          "A decline is a complete answer. It is better than a cheap yes that becomes a quality problem on your domain — including the kind of thin or misleading pages that damage how both customers and platforms see you.",
        ],
      },
      {
        heading: "Talk to the studio",
        paragraphs: [
          "Office hours are Sunday to Thursday, Gulf time, from Qurum, Muscat. Write to info@estio.org or use the contact form with the outcome, languages, and deadline. We reply within one business day with fit, a scoped next step, or a clear no.",
          "The same standard applies to the guides we publish: if a recommendation is how we actually work, we say so. If it is a general industry pattern, we label it. That is the editorial rule behind this article.",
        ],
      },
    ],
  },
  "editorial-standards": {
    slug: "editorial-standards",
    title: "Editorial standards for Estio resources",
    description:
      "Who writes these guides, what we will not publish, how we handle AI assistance, and how to request a correction — the rules behind estio.org/resources.",
    kicker: "Editorial",
    publishedAt: "2026-08-01",
    updatedAt: "2026-08-24",
    readMinutes: 8,
    tags: ["Editorial", "Delivery"],
    relatedServiceHref: "/about",
    relatedServiceLabel: "About Estio",
    sections: [
      {
        heading: "Why this page exists",
        paragraphs: [
          "estio.org is a working studio site, not a content farm. The Resources section exists so marketing, IT, and operations teams in the Gulf can see how we actually scope and deliver — bilingual sites, campaign kits, governed AI visuals, and enterprise programmes. These pages are written by Estio’s delivery team in Muscat. They are not scraped, not spun from other agencies’ blogs, and not published to manufacture page count.",
          "If a guide reads like a sales page with no method, it has failed our own bar. We would rather publish fewer notes with checklists and failure modes than a stream of generic “AI will transform marketing” essays.",
        ],
      },
      {
        heading: "Who writes, who reviews",
        paragraphs: [
          "Drafts start with the people who run the work: web delivery, campaign production, AI Studio operations, or enterprise scoping. A second person at Estio reads for accuracy and for claims we cannot stand behind. We do not invent client names, metrics, or case results. When we describe a pattern from engagements, we keep it general enough to protect confidentiality unless a client has approved a named story.",
          "Byline on these pages: Estio editorial team, Qurum, Muscat, Oman. There is no anonymous “admin” author and no guest network. Contact for corrections: info@estio.org with the article URL and the factual issue.",
        ],
      },
      {
        heading: "Use of AI in our own writing",
        paragraphs: [
          "We may use drafting tools for structure or bilingual parity the same way we use them in client production: as a lane, not as a publisher. A human at Estio is responsible for every sentence that goes live. We do not publish unreviewed machine output. We do not generate dozens of near-duplicate articles to target keywords.",
          "That rule is the same one we recommend to clients. Scaled, unreviewed pages are low-value to readers and to the systems that evaluate site quality. We will not do that on our own domain.",
        ],
      },
      {
        heading: "What we will not publish",
        paragraphs: [
          "Medical, legal, or financial advice. Guaranteed ranking or advertising-revenue claims. Attacks on named competitors. Imagery or stories that identify a client’s staff or guests without permission. English-only stubs labelled as Arabic articles. Lorem ipsum or “coming soon” in the Resources section.",
          "Service pages stay service pages. Resources stay instructional. We cross-link when a method maps to a product, and we keep the instruction usable if you never buy from us.",
        ],
        bullets: [
          "No thin translations: Arabic guides must be full articles, not glosses",
          "No doorway pages built only to host advertisements",
          "No copied manufacturer or platform documentation presented as ours",
          "Updates get a visible last-updated date when the method changes",
        ],
      },
      {
        heading: "Advertising on this site",
        paragraphs: [
          "If Google ads appear, they are limited to pages that already have substantial publisher content — primarily these guides and related informational pages. We do not place ads on checkout, generation tools, or legal documents. Advertising does not change a recommendation in a guide.",
          "How we use cookies and how Google may use data on partner sites is described in our Privacy Policy and Cookie Policy, linked in the footer of every page.",
        ],
      },
      {
        heading: "Corrections and takedown",
        paragraphs: [
          "Factual errors are corrected in place with an updated date. If a client asks us to remove a detail that could identify them, we will generalise or remove it. These guides are not a newsroom; we do not run a public revisions log, but we will confirm by email when a correction is live.",
          "If you want this level of documentation inside your own marketing site, that is a website and content engagement — use the contact form. If you only needed the checklist, take it. That is the point of publishing it.",
        ],
      },
    ],
  },
};

export function isMoreResourceSlug(
  slug: string,
): slug is Extract<
  ResourceSlug,
  | "brand-ai-reference-pack"
  | "gcc-whatsapp-campaign-assets"
  | "briefing-ai-creative-vendor"
  | "arabic-rtl-website-failures"
  | "estio-delivery-scoping"
  | "editorial-standards"
> {
  return slug in resourceArticlesMoreEn;
}
