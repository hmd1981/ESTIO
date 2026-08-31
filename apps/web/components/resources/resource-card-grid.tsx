import Link from "next/link";
import type { ResourceArticle } from "@/lib/content/resources-types";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

type Props = {
  articles: ResourceArticle[];
  locale: AppLocale;
};

export function ResourceCardGrid({ articles, locale }: Props) {
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:gap-8">
      {articles.map((article) => (
        <li key={article.slug}>
          <article className="flex h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]/35">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              {article.kicker}
            </p>
            <h2 className="font-display mt-3 text-xl font-semibold leading-snug text-[var(--text)]">
              <Link
                href={withLocale(`/resources/${article.slug}`, locale)}
                className="hover:text-[var(--accent)]"
              >
                {article.title}
              </Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--text-body)]">
              {article.description}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
              <span>
                {locale === "ar" ? `${article.readMinutes} د قراءة` : `${article.readMinutes} min read`}
              </span>
              <span aria-hidden>·</span>
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString(
                  locale === "ar" ? "ar-OM" : "en-GB",
                  { year: "numeric", month: "short", day: "numeric" },
                )}
              </time>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[0.6875rem] font-medium text-[var(--muted)]"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ul>
  );
}
