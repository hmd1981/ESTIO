import Image from "next/image";
import Link from "next/link";
import { PremiumMediaFrame } from "@/components/cms/premium-media-frame";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getPortfolioContent,
  resolvePortfolioImage,
  type PortfolioCategory,
  type PortfolioProject,
} from "@/lib/content/portfolio-index";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

type Props = {
  locale: AppLocale;
};

const categoryOrder: PortfolioCategory[] = [
  "platform",
  "fintech",
  "commerce",
  "media",
  "services",
  "competition",
];

function groupProjects(projects: PortfolioProject[]) {
  const groups = new Map<PortfolioCategory, PortfolioProject[]>();
  for (const cat of categoryOrder) groups.set(cat, []);
  for (const p of projects) {
    const list = groups.get(p.category) ?? [];
    list.push(p);
    groups.set(p.category, list);
  }
  return categoryOrder
    .map((cat) => ({ category: cat, projects: groups.get(cat) ?? [] }))
    .filter((g) => g.projects.length > 0);
}

function ProjectCard({
  project,
  locale,
}: {
  project: PortfolioProject;
  locale: AppLocale;
}) {
  const imageSrc = resolvePortfolioImage(project);
  return (
    <article
      id={project.slug}
      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] scroll-mt-28"
    >
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--canvas)] sm:aspect-[16/9] lg:aspect-[16/8]">
          <Image
            src={imageSrc}
            alt={project.imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className={`transition-transform duration-500 group-hover:scale-[1.02] ${
              project.imageFit === "contain"
                ? "object-contain p-6 sm:p-8"
                : "object-cover object-top"
            }`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/75">
              {project.domain} · {project.year}
            </p>
            <h3 className="font-display mt-2 text-xl font-semibold text-white sm:text-2xl">
              {project.title}
            </h3>
          </div>
        </div>
      </a>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <p className="text-base leading-[1.75] text-[var(--text-body)]">
            {project.description}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[0.6875rem] font-medium text-[var(--muted)]"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {locale === "ar" ? "ما سُلِّم" : "Delivered"}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--text-body)]">
            {project.deliverables.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              {locale === "ar"
                ? `زيارة ${project.domain} ↗`
                : `Visit ${project.domain} ↗`}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export function PortfolioShowcase({ locale }: Props) {
  const { index, projects } = getPortfolioContent(locale);
  const groups = groupProjects(projects);

  return (
    <>
      <section className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                {index.kicker}
              </p>
              <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem]">
                {index.h1}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
                {index.lead}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href={withLocale("/contact", locale)}>
                  {locale === "ar" ? "ناقش مشروعاً مشابهاً" : "Discuss a similar project"}
                </ButtonLink>
                <ButtonLink
                  href={withLocale("/services/web-design-development", locale)}
                  variant="secondary"
                >
                  {locale === "ar" ? "خدمات الويب" : "Web design services"}
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-5">
              <PremiumMediaFrame
                aspect="16/10"
                overlay="readability"
                className="!rounded-lg"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                slot={
                  <Image
                    src="/portfolio/work-hero.png"
                    alt={
                      locale === "ar"
                        ? "معرض أعمال Estio — منصات ومواقع live في عُمان والخليج"
                        : "Estio portfolio — live platforms and websites across Oman and the GCC"
                    }
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    priority
                  />
                }
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-[var(--border)] bg-[var(--canvas)] py-10 sm:py-12">
        <Container as="div">
          <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-body)]">
            {index.competitionLead}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {locale === "ar" ? "منصات live" : "Live platforms"}
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-[var(--text)]">
                {projects.length}
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {locale === "ar" ? "أسواق" : "Markets"}
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-[var(--text)]">
                {locale === "ar" ? "عُمان + إقليمي" : "Oman + regional"}
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {locale === "ar" ? "فئات" : "Categories"}
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-[var(--text)]">
                {groups.length}
              </dd>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                {locale === "ar" ? "من" : "Since"}
              </dt>
              <dd className="font-display mt-1 text-2xl font-semibold text-[var(--text)]">
                2022
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      <section className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
        <Container as="div" className="space-y-16 lg:space-y-20">
          {groups.map(({ category, projects: catProjects }) => (
            <div key={category}>
              <div className="mb-8 flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
                <h2 className="font-display text-2xl font-semibold text-[var(--text)] sm:text-3xl">
                  {index.categoryLabels[category]}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  {catProjects.length}{" "}
                  {locale === "ar"
                    ? catProjects.length === 1
                      ? "مشروع"
                      : "مشاريع"
                    : catProjects.length === 1
                      ? "project"
                      : "projects"}
                </p>
              </div>
              <ul className="space-y-10 lg:space-y-12">
                {catProjects.map((project) => (
                  <li key={project.slug}>
                    <ProjectCard project={project} locale={locale} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] py-14 sm:py-16">
        <Container as="div" className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-[var(--text)]">
            {locale === "ar" ? "أضف مشروع مسابقة أو showcase" : "Add competition or showcase work"}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--text-body)]">
            {locale === "ar"
              ? "إذا كان لديكم لقطات مسابقات سابقة أو مشاريع إضافية تريدون إظهارها هنا، أرسلوا الملفات والوصف — نوسّع هذا القسم مع كل دورة جديدة."
              : "If you have competition entries or additional projects to feature, send screenshots and notes — we expand this section as new work ships."}
          </p>
          <div className="mt-6">
            <Link
              href={withLocale("/contact?interest=WEB_DESIGN_DEVELOPMENT", locale)}
              className="text-sm font-semibold text-[var(--accent)] hover:underline"
            >
              {locale === "ar" ? "تواصل لإضافة عمل →" : "Contact us to add work →"}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
