import type { ReactNode } from "react";

/**
 * Layout for the long-form trust pages (how it works, safety, privacy).
 *
 * These are public and crawlable: a stranger deciding whether to trust a
 * platform should be able to read the rules before creating an account, not
 * only after signing in.
 */
export function InfoPage({
  eyebrow,
  title,
  lede,
  children,
  updated,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  children: ReactNode;
  updated?: string;
}) {
  return (
    <div className="wellness-shell">
      <div className="info-page">
        <header className="info-header">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="info-lede">{lede}</p>
          {updated ? <p className="info-updated">Last reviewed {updated}</p> : null}
        </header>
        <div className="info-body">{children}</div>
      </div>
    </div>
  );
}

export function InfoSection({
  heading,
  children,
  tone = "default",
}: {
  heading: string;
  children: ReactNode;
  tone?: "default" | "callout" | "honest";
}) {
  return (
    <section className={`info-section info-${tone}`}>
      <h2>{heading}</h2>
      <div>{children}</div>
    </section>
  );
}

export function InfoList({ items }: { items: string[] }) {
  return (
    <ul className="info-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}