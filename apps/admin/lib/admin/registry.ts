import type { AdminRouteDefinition, AdminSectionId } from "./types";

/**
 * Single source of truth for admin routes.
 * Add a row here → sidebar, dashboard index, and breadcrumbs stay aligned.
 */
export const ADMIN_ROUTES: AdminRouteDefinition[] = [
  {
    id: "dashboard",
    href: "/admin",
    label: "Dashboard",
    description:
      "Entry point and module index for Estio’s internal publishing and CRM tools.",
    primaryResponsibility:
      "Orient operators to each domain—no widgets until data is trustworthy.",
    section: "workspace",
    sort: 10,
    matchPrefix: false,
  },
  {
    id: "pages",
    href: "/admin/pages",
    label: "Pages",
    description:
      "Slugs, titles, publish state, JSON section payloads for marketing pages.",
    primaryResponsibility:
      "Create and publish structured page content for the public website.",
    section: "content",
    sort: 20,
    matchPrefix: true,
  },
  {
    id: "services",
    href: "/admin/services",
    label: "Services",
    description:
      "Offerings shown on the public site — categories, featured, long copy.",
    primaryResponsibility:
      "Maintain the service catalogue that powers services and enterprise pages.",
    section: "content",
    sort: 30,
    matchPrefix: true,
  },
  {
    id: "media",
    href: "/admin/media",
    label: "Media",
    description: "Binary metadata, alt text, mime, storage keys (blobs off-app).",
    primaryResponsibility:
      "Register uploads, alt text, and asset taxonomy for editors and SEO.",
    section: "content",
    sort: 40,
    matchPrefix: false,
  },
  {
    id: "media-locations",
    href: "/admin/media/locations",
    label: "Media map",
    description:
      "Catalogue of every admin screen and JSON path where images, videos, or library ids are used.",
    primaryResponsibility:
      "Let operators trace assets from library rows to homepage, pages, and enterprise sections.",
    section: "content",
    sort: 41,
    matchPrefix: false,
  },
  {
    id: "seo",
    href: "/admin/seo",
    label: "SEO",
    description: "Per-route meta, canonicals, Open Graph image references.",
    primaryResponsibility:
      "Control titles, descriptions, and canonical URLs per public route.",
    section: "content",
    sort: 50,
    matchPrefix: true,
  },
  {
    id: "crm-overview",
    href: "/admin/crm",
    label: "CRM overview",
    description:
      "Pipeline counts, follow-up debt, and task load across the funnel.",
    primaryResponsibility:
      "See daily operational metrics before diving into individual leads.",
    section: "crm",
    sort: 55,
    matchPrefix: false,
  },
  {
    id: "crm-users",
    href: "/admin/crm-users",
    label: "CRM users",
    description: "Assignee directory for lead ownership and task routing.",
    primaryResponsibility:
      "Maintain the internal assignee list used for ownership and assignment history.",
    section: "crm",
    sort: 56,
    matchPrefix: true,
  },
  {
    id: "leads",
    href: "/admin/leads",
    label: "Leads inbox",
    description:
      "Searchable table: service line, score, stage, source, owner, activity.",
    primaryResponsibility:
      "Triage inbound leads and open records for qualification.",
    section: "crm",
    sort: 60,
    matchPrefix: true,
  },
  {
    id: "pipeline",
    href: "/admin/pipeline",
    label: "Pipeline",
    description:
      "Kanban by pipeline stage — drag updates coming later; stage controls on cards.",
    primaryResponsibility:
      "Visualise deal flow from inbox through negotiation.",
    section: "crm",
    sort: 61,
    matchPrefix: false,
  },
  {
    id: "crm-tasks",
    href: "/admin/tasks",
    label: "Tasks",
    description:
      "Follow-ups and tasks across all leads, sorted by due date.",
    primaryResponsibility:
      "Work the next actions queue without losing context.",
    section: "crm",
    sort: 62,
    matchPrefix: false,
  },
  {
    id: "automation-log",
    href: "/admin/automation",
    label: "Automation log",
    description:
      "Acknowledgements, assignments, stale lead signals, and reminder runs.",
    primaryResponsibility:
      "Audit what the automation layer did and when.",
    section: "crm",
    sort: 63,
    matchPrefix: false,
  },
  {
    id: "message-templates",
    href: "/admin/templates",
    label: "Templates",
    description:
      "Reusable outreach copy by channel (email, WhatsApp, etc.).",
    primaryResponsibility:
      "Maintain consistent sales and nurture messaging.",
    section: "crm",
    sort: 64,
    matchPrefix: false,
  },
  {
    id: "sales-settings",
    href: "/admin/sales-settings",
    label: "Sales settings",
    description:
      "Scoring weights, stale thresholds, default owner, lost-reason rules.",
    primaryResponsibility:
      "Tune qualification scoring and automation guardrails.",
    section: "crm",
    sort: 65,
    matchPrefix: false,
  },
  {
    id: "inquiries",
    href: "/admin/inquiries",
    label: "Inquiries",
    description: "Inbound messages: general, enterprise, consultation types.",
    primaryResponsibility:
      "Triage inbound contact, enterprise, and consultation submissions.",
    section: "crm",
    sort: 80,
    matchPrefix: true,
  },
  {
    id: "navigation",
    href: "/admin/navigation",
    label: "Navigation",
    description: "Header/footer links, visibility, ordering by location enum.",
    primaryResponsibility:
      "Edit header and footer link sets, order, and on/off flags.",
    section: "site",
    sort: 80,
    matchPrefix: true,
  },
  {
    id: "settings",
    href: "/admin/settings",
    label: "Settings",
    description:
      "Singleton site profile: legal name, contacts, footer, social URLs.",
    primaryResponsibility:
      "Edit global business profile, contact points, footer, and social URLs.",
    section: "site",
    sort: 90,
    matchPrefix: true,
  },
];

const SECTION_LABELS: Record<AdminSectionId, string> = {
  workspace: "Workspace",
  content: "Content",
  crm: "CRM",
  site: "Site",
};

/** Sidebar groups with deterministic ordering. */
export function getAdminNavSections(): {
  title: string;
  section: AdminSectionId;
  items: AdminRouteDefinition[];
}[] {
  const bySection = new Map<AdminSectionId, AdminRouteDefinition[]>();
  for (const route of ADMIN_ROUTES) {
    const list = bySection.get(route.section) ?? [];
    list.push(route);
    bySection.set(route.section, list);
  }
  for (const list of bySection.values()) {
    list.sort((a, b) => a.sort - b.sort);
  }
  const order: AdminSectionId[] = ["workspace", "content", "crm", "site"];
  return order
    .filter((s) => bySection.has(s))
    .map((section) => ({
      title: SECTION_LABELS[section],
      section,
      items: bySection.get(section)!,
    }));
}

export function findRouteByHref(href: string): AdminRouteDefinition | undefined {
  return ADMIN_ROUTES.find((r) => r.href === href);
}

/** Breadcrumb trail for the top bar — shallow paths only until nested editors land. */
export function getAdminBreadcrumbs(pathname: string): { href: string; label: string }[] {
  const norm = pathname.replace(/\/$/, "") || "/admin";
  if (norm === "/admin") {
    return [{ href: "/admin", label: "Dashboard" }];
  }

  const exact = findRouteByHref(norm);
  if (exact && exact.id !== "dashboard") {
    return [
      { href: "/admin", label: "Admin" },
      { href: exact.href, label: exact.label },
    ];
  }

  const segments = norm.split("/").filter(Boolean);
  const crumbs: { href: string; label: string }[] = [
    { href: "/admin", label: "Admin" },
  ];
  let acc = "";
  for (let i = 1; i < segments.length; i++) {
    acc = `/${segments.slice(0, i + 1).join("/")}`;
    const route = findRouteByHref(acc);
    const raw = segments[i];
    const label = route?.label ??
      raw
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    crumbs.push({ href: acc, label });
  }
  return crumbs;
}

export function isRouteActive(
  pathname: string,
  route: AdminRouteDefinition,
): boolean {
  if (route.id === "dashboard") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  if (pathname === route.href) return true;
  if (route.matchPrefix && route.href !== "/admin") {
    return pathname.startsWith(`${route.href}/`);
  }
  return false;
}
