import type { ReactNode } from "react";
import "./SystemPage.css";

type SystemPageProps = {
  kind: "error" | "not-found" | "loading";
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
};

export default function SystemPage({ kind, eyebrow, title, description, actions }: SystemPageProps) {
  return (
    <section className={`system-page system-page--${kind}`} aria-live={kind === "loading" ? "polite" : "off"}>
      <div className="system-page__card" role={kind === "error" ? "alert" : undefined}>
        <div className="system-page__emblem" aria-hidden="true">
          <span className="system-page__emblem-mark">{kind === "loading" ? "S" : kind === "not-found" ? "?" : "!"}</span>
        </div>
        {eyebrow && <p className="system-page__eyebrow">{eyebrow}</p>}
        <h1 className="system-page__title">{title}</h1>
        <p className="system-page__description">{description}</p>
        {kind === "loading" && (
          <div className="system-page__progress" aria-hidden="true"><span /></div>
        )}
        {actions && <div className="system-page__actions">{actions}</div>}
      </div>
    </section>
  );
}
