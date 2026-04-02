export type AdminSectionId = "workspace" | "content" | "crm" | "site";

/** One routable area in the admin IA — sidebar order derived from `sort`. */
export type AdminRouteDefinition = {
  id: string;
  href: string;
  label: string;
  description: string;
  /** Single line for staff: what this screen is for (dashboard index, docs). */
  primaryResponsibility: string;
  section: AdminSectionId;
  /** Sort order within the sidebar section. */
  sort: number;
  /**
   * When you add `/admin/pages/[id]`, nested paths still highlight the parent
   * if their pathname starts with this href.
   */
  matchPrefix?: boolean;
};

export type AdminListViewConfig = {
  pageTitle: string;
  pageDescription: string;
  /** Documents intended HTTP surface — wire when API auth exists. */
  apiReference: string;
  columns: readonly string[];
  emptyState: { title: string; body: string };
  primaryAction?: { label: string; hint: string; href?: string };
};

export type AdminFormViewConfig = {
  pageTitle: string;
  pageDescription: string;
  apiReference: string;
};
