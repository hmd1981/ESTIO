import { Container } from "@/components/layout/container";
import type { LegalDocument } from "@/lib/content/legal";
import type { AppLocale } from "@/lib/i18n/config";

function isHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

type Props = {
  document: LegalDocument;
  locale: AppLocale;
};

export function LegalDocumentBody({ document, locale }: Props) {
  return (
    <article>
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <Container as="div" className="py-16 sm:py-20 lg:py-24">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
            {document.kicker}
          </p>
          <h1 className="font-display mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-[var(--text)] sm:text-4xl">
            {document.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-[1.7] text-[var(--text-body)]">
            {document.intro}
          </p>
          <p className="mt-4 text-sm text-[var(--muted)]">
            {locale === "ar" ? "آخر تحديث " : "Last updated "}
            <time dateTime={document.lastUpdated}>
              {new Date(document.lastUpdated).toLocaleDateString(
                locale === "ar" ? "ar-OM" : "en-GB",
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </time>
          </p>
        </Container>
      </header>
      <div className="bg-[var(--canvas)] py-14 sm:py-16 lg:py-20">
        <Container as="div" className="max-w-3xl space-y-12">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-2xl font-semibold text-[var(--text)]">
                {section.heading}
              </h2>
              <div className="mt-4 space-y-4 text-base leading-[1.75] text-[var(--text-body)]">
                {section.paragraphs.map((p) => (
                  <p key={p.slice(0, 64)}>{p}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-4 list-disc space-y-2 ps-5 text-base leading-relaxed text-[var(--text-body)]">
                  {section.bullets.map((b) => (
                    <li key={b}>
                      {isHttpUrl(b) ? (
                        <a
                          href={b}
                          className="text-[var(--accent)] underline-offset-4 hover:underline"
                          rel="noopener noreferrer"
                        >
                          {b}
                        </a>
                      ) : (
                        b
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </Container>
      </div>
    </article>
  );
}
