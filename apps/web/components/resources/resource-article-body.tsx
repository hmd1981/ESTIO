import Link from "next/link";
import { Container } from "@/components/layout/container";
import { ButtonLink } from "@/components/ui/button-link";
import type { ResourceArticle } from "@/lib/content/resources-types";
import { relatedResourceArticles } from "@/lib/content/resources-index";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

type Props = {
  article: ResourceArticle;
  locale: AppLocale;
};

function sectionId(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function ResourceArticleBody({ article, locale }: Props) {
  const related = relatedResourceArticles(article, locale, 3);
  const published = new Date(article.publishedAt).toLocaleDateString(
    locale === "ar" ? "ar-OM" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const updated = new Date(article.updatedAt).toLocaleDateString(
    locale === "ar" ? "ar-OM" : "en-GB",
    { year: "numeric", month: "long", day: "numeric" },
  );

  return (
    <article>
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <nav
            aria-label={locale === "ar" ? "مسار التنقل" : "Breadcrumb"}
            className="text-sm text-[var(--muted)]"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link
                  href={withLocale("/", locale)}
                  className="hover:text-[var(--text)]"
                >
                  {locale === "ar" ? "الرئيسية" : "Home"}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={withLocale("/resources", locale)}
                  className="hover:text-[var(--text)]"
                >
                  {locale === "ar" ? "المقالات" : "Resources"}
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-[var(--text-body)]">{article.kicker}</li>
            </ol>
          </nav>
          <p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {article.kicker}
          </p>
          <h1 className="font-display mt-6 max-w-4xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
            {article.title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-[1.7] text-[var(--text-body)] sm:text-lg">
            {article.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--muted)]">
            <span>
              {locale === "ar"
                ? "فريق تحرير إستيو · القرم، مسقط"
                : "Estio editorial team · Qurum, Muscat"}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt}>
              {locale === "ar" ? "نُشر " : "Published "}
              {published}
            </time>
            {article.updatedAt !== article.publishedAt ? (
              <>
                <span aria-hidden>·</span>
                <time dateTime={article.updatedAt}>
                  {locale === "ar" ? "حُدّث " : "Updated "}
                  {updated}
                </time>
              </>
            ) : null}
            <span aria-hidden>·</span>
            <span>
              {locale === "ar"
                ? `${article.readMinutes} د قراءة`
                : `${article.readMinutes} min read`}
            </span>
          </div>
        </Container>
      </header>

      <div className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
        <Container as="div" className="max-w-3xl">
          <nav
            aria-label={locale === "ar" ? "محتويات المقال" : "On this page"}
            className="mb-12 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <p className="text-sm font-semibold text-[var(--text)]">
              {locale === "ar" ? "في هذا الدليل" : "In this guide"}
            </p>
            <ol className="mt-3 space-y-2 text-sm">
              {article.sections.map((section) => (
                <li key={section.heading}>
                  <a
                    href={`#${sectionId(section.heading)}`}
                    className="text-[var(--text-body)] hover:text-[var(--accent)]"
                  >
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="prose-estio space-y-12">
            {article.sections.map((section) => (
              <section key={section.heading} id={sectionId(section.heading)}>
                <h2 className="font-display text-2xl font-semibold text-[var(--text)]">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4 text-base leading-[1.75] text-[var(--text-body)]">
                  {section.paragraphs.map((p) => (
                    <p key={p.slice(0, 48)}>{p}</p>
                  ))}
                </div>
                {section.bullets?.length ? (
                  <ul className="mt-4 list-disc space-y-2 ps-5 text-base leading-relaxed text-[var(--text-body)]">
                    {section.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>

          {article.relatedServiceHref ? (
            <aside className="mt-14 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="text-sm font-semibold text-[var(--text)]">
                {locale === "ar" ? "خدمة ذات صلة" : "Related service"}
              </p>
              <p className="mt-2 text-sm text-[var(--text-body)]">
                {locale === "ar"
                  ? "إذا كان هذا الدليل يطابق احتياجكم، يمكنكم مراجعة نطاق التسليم والخطوة التالية."
                  : "If this guide matches your brief, review delivery scope and next steps with Estio."}
              </p>
              <div className="mt-4">
                <ButtonLink href={withLocale(article.relatedServiceHref, locale)}>
                  {article.relatedServiceLabel ??
                    (locale === "ar" ? "عرض الخدمة" : "View service")}
                </ButtonLink>
              </div>
            </aside>
          ) : null}

          {related.length ? (
            <aside className="mt-10">
              <p className="text-sm font-semibold text-[var(--text)]">
                {locale === "ar" ? "أدلة ذات صلة" : "Related guides"}
              </p>
              <ul className="mt-4 space-y-3">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={withLocale(`/resources/${item.slug}`, locale)}
                      className="text-sm font-medium text-[var(--accent)] hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}

          <nav
            className="mt-10 flex flex-wrap gap-4 border-t border-[var(--border)] pt-8 text-sm"
            aria-label={locale === "ar" ? "تنقل المقالات" : "Resource navigation"}
          >
            <Link
              href={withLocale("/resources", locale)}
              className="font-medium text-[var(--accent)] hover:underline"
            >
              {locale === "ar" ? "← كل المقالات" : "← All resources"}
            </Link>
            <Link
              href={withLocale("/resources/editorial-standards", locale)}
              className="font-medium text-[var(--text-body)] hover:text-[var(--accent)]"
            >
              {locale === "ar" ? "معايير التحرير" : "Editorial standards"}
            </Link>
            <Link
              href={withLocale("/contact", locale)}
              className="font-medium text-[var(--text-body)] hover:text-[var(--accent)]"
            >
              {locale === "ar" ? "تواصل مع إستيو" : "Contact Estio"}
            </Link>
          </nav>
        </Container>
      </div>
    </article>
  );
}
