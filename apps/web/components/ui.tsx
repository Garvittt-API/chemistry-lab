import { ArrowRight, Clock3, CircleAlert, Info, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { ExperimentCardModel, SubjectModel } from "../lib/content";
import { classNames } from "../lib/utils";

export function ContentStatusBadge({
  scientificReviewStatus,
  integrityLabel,
}: Readonly<{ scientificReviewStatus: string; integrityLabel: string }>) {
  return (
    <span className="badge badge-muted">
      {scientificReviewStatus === "draft"
        ? "Draft — pending scientific review"
        : scientificReviewStatus}
      {integrityLabel === "pending_scientific_review" ? " · Not yet scientifically validated" : ""}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  id,
  align = "left",
}: Readonly<{
  eyebrow?: string;
  title: string;
  description?: string;
  id?: string;
  align?: "left" | "center";
}>) {
  return (
    <div className={classNames("section-heading", align === "center" && "section-heading-center")}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}>) {
  return (
    <section className="container page-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-intro-copy">{description}</p>
      </div>
      {children ? <div className="page-intro-aside">{children}</div> : null}
    </section>
  );
}

export function ExperimentCard({
  experiment,
  index,
}: Readonly<{ experiment: ExperimentCardModel; index?: number }>) {
  return (
    <article className="experiment-card">
      <div className="card-topline">
        {typeof index === "number" ? (
          <span className="card-index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        ) : (
          <span />
        )}
        <ContentStatusBadge
          scientificReviewStatus={experiment.scientificReviewStatus}
          integrityLabel={experiment.integrityLabel}
        />
      </div>
      <div className="card-content">
        <p className="card-meta">
          {experiment.disciplineLabel} · {experiment.levelLabels.join(", ")}
        </p>
        <h3>{experiment.title}</h3>
        <p>{experiment.shortDescription}</p>
      </div>
      <div className="card-footer">
        <span className="card-meta card-duration">
          <Clock3 size={15} aria-hidden="true" />
          About {experiment.estimatedDurationMinutes} min
        </span>
        <Link className="text-link" href={`/experiments/${experiment.slug}`}>
          Read experiment <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function SubjectCard({ subject }: Readonly<{ subject: SubjectModel }>) {
  return (
    <article className={classNames("subject-card", `subject-card-${subject.accent}`)}>
      <div className="subject-card-mark" aria-hidden="true" />
      <p className="card-meta">Chemistry discipline</p>
      <h3>{subject.label}</h3>
      <p>{subject.description}</p>
      <p className="card-meta">
        {subject.publishedExperimentCount === 0
          ? "No published experiments yet"
          : `${subject.publishedExperimentCount} published ${subject.publishedExperimentCount === 1 ? "experiment" : "experiments"}`}
      </p>
      <Link className="text-link" href={`/explore?discipline=${encodeURIComponent(subject.id)}`}>
        Browse topic <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function EmptyState({
  title,
  description,
  icon = "info",
}: Readonly<{ title: string; description: string; icon?: "info" | "alert" }>) {
  const Icon = icon === "alert" ? CircleAlert : Info;

  return (
    <div className="empty-state" role="status">
      <Icon size={22} aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export function FutureLabPanel() {
  return (
    <section className="future-lab-panel" aria-labelledby="future-lab-title">
      <div className="future-lab-icon" aria-hidden="true">
        <ShieldCheck size={22} />
      </div>
      <div>
        <p className="eyebrow">Integration boundary</p>
        <h2 id="future-lab-title">The laboratory workspace will arrive with reviewed models</h2>
        <p>
          This area is reserved for apparatus views, permitted controls, readable measurements and
          explanations. No simulated values are presented as measurements: every model, when it
          arrives, will label its output as model output.
        </p>
      </div>
      <span className="badge badge-muted">Planned for later phase</span>
    </section>
  );
}
