import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, ShieldAlert } from "lucide-react";

import { ContentStatusBadge, EmptyState, FutureLabPanel } from "../../../components/ui";
import { DILUTION_EXPERIMENT_ID, PH_EXPERIMENT_ID } from "@virtual-chemistry-lab/laboratory-core";
import {
  getCurriculumLabel,
  getCurriculumTopicLabel,
  getDisciplineLabel,
  getExperimentRecord,
  getLevelLabel,
  getTopicLabel,
} from "../../../lib/content";
import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";

type ExperimentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ExperimentPageProps): Promise<Metadata> {
  const { id } = await params;
  const record = getExperimentRecord(id);
  return {
    title: record ? record.identity.title : "Experiment detail",
    description: record?.identity.shortDescription,
  };
}

const hazardLabels: Record<string, string> = {
  corrosive: "Corrosive",
  irritant: "Irritant",
  flammable: "Flammable",
  oxidizing: "Oxidizing",
  acutely_toxic: "Acutely toxic",
  chronic_health_hazard: "Chronic health hazard",
  environmental_hazard: "Environmental hazard",
  physical_hazard: "Physical hazard",
  asphyxiant_or_inert_gas: "Asphyxiant / inert gas",
  hot_surface_or_flame: "Hot surface or flame",
  glassware_cuts: "Glassware cuts",
  biological: "Biological",
  other: "Other hazard",
};

const difficultyLabels: Record<string, string> = {
  introductory: "Introductory",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const provenanceLabels: Record<string, string> = {
  theoretical: "Theoretical",
  reference_expected: "Reference-expected",
  measured: "Measured",
  simulated: "Simulated",
  user_entered: "User-entered",
  requires_review: "Requires review",
};

const evidenceBasisLabels: Record<string, string> = {
  official_database: "Official database",
  common_laboratory_practice: "Common laboratory practice",
  authoritative_textbook: "Authoritative textbook",
  institutional_sds: "Institutional safety data sheet",
  requires_review: "Requires review",
};

const supervisionLabels: Record<string, string> = {
  self_directed_with_written_guidance: "Self-directed with written guidance",
  adult_supervision_required: "Adult supervision required",
  qualified_educator_supervision_required: "Qualified educator supervision required",
  requires_review: "Requires review",
};

function shortReviewStatus(status: string): string {
  return status.replace(/_/g, " ");
}

export default async function ExperimentDetailPage({ params }: ExperimentPageProps) {
  const { id } = await params;
  const record = getExperimentRecord(id);
  if (!record) notFound();

  return <ExperimentDetail record={record} />;
}

function ExperimentDetail({ record }: { record: ExperimentRecord }) {
  const { identity, classification, educational, materials, safety, procedure } = record;
  const { observations, calculations, references, simulation, review } = record;

  return (
    <div className="page page-grid">
      <header className="container detail-header">
        <div>
          <ContentStatusBadge
            scientificReviewStatus={review.scientificReviewStatus}
            integrityLabel={review.integrityLabel}
          />
          <p className="eyebrow detail-eyebrow">
            {getDisciplineLabel(classification.disciplineId)}
          </p>
          <h1>{identity.title}</h1>
          <p className="detail-summary">{identity.fullDescription}</p>
        </div>
        <dl className="detail-meta">
          <div>
            <dt>Level</dt>
            <dd>{classification.educationalLevels.map(getLevelLabel).join(", ")}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{difficultyLabels[classification.difficulty] ?? classification.difficulty}</dd>
          </div>
          <div>
            <dt>Estimated time</dt>
            <dd>About {classification.estimatedDurationMinutes} minutes</dd>
          </div>
          <div>
            <dt>Content version</dt>
            <dd>
              {identity.contentVersion} (schema {identity.schemaVersion})
            </dd>
          </div>
          <div>
            <dt>Publication status</dt>
            <dd>{shortReviewStatus(identity.publicationStatus)}</dd>
          </div>
        </dl>
      </header>

      <div className="container detail-layout">
        <nav className="detail-nav" aria-label="Experiment sections">
          <a href="#overview">Overview</a>
          <a href="#theory">Theory</a>
          <a href="#materials">Materials</a>
          <a href="#safety">Safety</a>
          <a href="#procedure">Procedure</a>
          <a href="#observations">Observations</a>
          <a href="#calculations">Calculations</a>
          <a href="#simulation">Simulation</a>
          <a href="#references">References</a>
          <a href="#review">Review &amp; provenance</a>
        </nav>

        <div className="detail-content">
          <section className="detail-section" id="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">Overview</h2>
            <p>{identity.shortDescription}</p>

            <h3>Learning objectives</h3>
            <ul className="objective-list">
              {educational.learningObjectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>

            {educational.expectedCompetencies.length > 0 ? (
              <>
                <h3>Expected competencies</h3>
                <ul className="objective-list">
                  {educational.expectedCompetencies.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <h3>Learning outcomes</h3>
            <ul className="objective-list">
              {educational.learningOutcomes.map((outcome) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>

            {classification.prerequisites.length > 0 ? (
              <>
                <h3>Prerequisites</h3>
                <ul className="objective-list">
                  {classification.prerequisites.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <h3>Classification</h3>
            <p className="card-meta">
              Topics: {classification.topicIds.map(getTopicLabel).join(" · ")}
            </p>

            {classification.curriculumMappings.length > 0 ? (
              <>
                <h3>Curriculum mapping</h3>
                <div className="content-table-wrap">
                  <table className="content-table">
                    <caption className="sr-only">Proposed curriculum mappings</caption>
                    <thead>
                      <tr>
                        <th scope="col">Curriculum</th>
                        <th scope="col">Topic</th>
                        <th scope="col">Confidence</th>
                        <th scope="col">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classification.curriculumMappings.map((mapping) => (
                        <tr key={`${mapping.curriculumId}-${mapping.curriculumTopicId}`}>
                          <td>{getCurriculumLabel(mapping.curriculumId)}</td>
                          <td>
                            {mapping.curriculumTopicId
                              ? getCurriculumTopicLabel(
                                  mapping.curriculumId,
                                  mapping.curriculumTopicId,
                                )
                              : "General mapping"}
                          </td>
                          <td>
                            <span className="badge badge-muted">
                              {mapping.confidence === "verified_against_official_document"
                                ? "Verified"
                                : "Proposed — pending verification"}
                            </span>
                          </td>
                          <td>{mapping.syllabusNote ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </section>

          <section className="detail-section" id="theory" aria-labelledby="theory-title">
            <h2 id="theory-title">Theory and equations</h2>
            <p>{educational.theory.overview}</p>
            {educational.theory.sections.map((section) => (
              <div key={section.heading}>
                <h3>{section.heading}</h3>
                <p>{section.body}</p>
              </div>
            ))}
            {educational.theory.scientificBackground ? (
              <>
                <h3>Scientific background</h3>
                <p>{educational.theory.scientificBackground}</p>
              </>
            ) : null}

            {educational.theory.concepts.length > 0 ? (
              <p className="card-meta">Key concepts: {educational.theory.concepts.join(" · ")}</p>
            ) : null}

            {educational.theory.equations.length > 0 ? (
              <>
                <h3>Equations</h3>
                {educational.theory.equations.map((equation) => (
                  <div key={equation.id} className="safety-panel">
                    <div>
                      <h3>{equation.displayForm ?? equation.expression}</h3>
                      <p>{equation.description}</p>
                      <div className="content-table-wrap">
                        <table className="content-table">
                          <caption className="sr-only">
                            Symbols used in {equation.displayForm ?? equation.expression}
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">Symbol</th>
                              <th scope="col">Meaning</th>
                              <th scope="col">Unit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {equation.variables.map((variable) => (
                              <tr key={`${equation.id}-${variable.symbol}`}>
                                <td>{variable.symbol}</td>
                                <td>{variable.meaning}</td>
                                <td>{variable.unit ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {equation.applicableConditions.length > 0 ? (
                        <p className="card-meta">
                          Conditions: {equation.applicableConditions.join(" ")}
                        </p>
                      ) : null}
                      {equation.assumptions.length > 0 ? (
                        <p className="card-meta">Assumptions: {equation.assumptions.join(" ")}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </>
            ) : null}

            {educational.theory.definitions.length > 0 ? (
              <>
                <h3>Definitions</h3>
                <dl>
                  {educational.theory.definitions.map((definition) => (
                    <div key={definition.id}>
                      <dt>
                        <strong>{definition.term}</strong>
                      </dt>
                      <dd>{definition.definition}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
          </section>

          <section className="detail-section" id="materials" aria-labelledby="materials-title">
            <h2 id="materials-title">Equipment, chemicals and materials</h2>
            {typeof materials.metadataStatus === "object" ? (
              <EmptyState
                title="Materials metadata requires review"
                description={materials.metadataStatus.rationale}
              />
            ) : null}

            {materials.equipment.length > 0 ? (
              <>
                <h3>Equipment</h3>
                <div className="content-table-wrap">
                  <table className="content-table">
                    <caption className="sr-only">Equipment list</caption>
                    <thead>
                      <tr>
                        <th scope="col">Item</th>
                        <th scope="col">Specification</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.equipment.map((item) => (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.specification ?? "—"}</td>
                          <td>{item.quantity ?? "—"}</td>
                          <td>{item.purpose ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}

            {materials.chemicals.length > 0 ? (
              <>
                <h3>Chemicals</h3>
                <div className="content-table-wrap">
                  <table className="content-table">
                    <caption className="sr-only">Chemical list with hazard kinds</caption>
                    <thead>
                      <tr>
                        <th scope="col">Substance</th>
                        <th scope="col">Formula / description</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Hazards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.chemicals.map((chemical) => (
                        <tr key={chemical.id}>
                          <td>{chemical.name}</td>
                          <td>{chemical.formulaOrDescription ?? "—"}</td>
                          <td>
                            {typeof chemical.amount === "object" && chemical.amount !== null
                              ? `${chemical.amount.value} ${chemical.amount.unit}`
                              : (chemical.amount ?? "—")}
                          </td>
                          <td>
                            {chemical.hazardKinds.length === 0
                              ? "None recorded"
                              : chemical.hazardKinds
                                  .map((kind) => hazardLabels[kind] ?? kind)
                                  .join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
            {materials.notes ? <p>{materials.notes}</p> : null}
          </section>

          <section className="detail-section" id="safety" aria-labelledby="safety-title">
            <h2 id="safety-title">Safety information</h2>
            <div className="safety-panel">
              <ShieldAlert size={23} aria-hidden="true" />
              <div>
                <h3>
                  Risk classification:{" "}
                  {safety.riskClassification === "requires_review"
                    ? "Requires review"
                    : safety.riskClassification}
                </h3>
                <p>{safety.riskRationale}</p>
              </div>
            </div>

            {safety.hazards.length > 0 ? (
              <>
                <h3>Hazard statements</h3>
                <ul className="objective-list">
                  {safety.hazards.map((hazard) => (
                    <li key={hazard.statement}>
                      <strong>{hazardLabels[hazard.kind] ?? hazard.kind}:</strong>{" "}
                      {hazard.statement}{" "}
                      <span className="card-meta">
                        (Evidence basis:{" "}
                        {evidenceBasisLabels[hazard.evidence.basis] ?? hazard.evidence.basis}
                        {hazard.evidence.notes ? ` — ${hazard.evidence.notes}` : ""})
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            <h3>Protective equipment</h3>
            <ul className="objective-list">
              {safety.protectiveEquipment.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3>Disposal</h3>
            <ul className="objective-list">
              {safety.disposal.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="card-meta">
              Supervision: {supervisionLabels[safety.supervision] ?? safety.supervision}
            </p>

            {safety.restrictedOperations.length > 0 ? (
              <>
                <h3>Restricted operations</h3>
                <ul className="objective-list">
                  {safety.restrictedOperations.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {safety.emergencyGuidance.length > 0 ? (
              <>
                <h3>Emergency guidance</h3>
                <ul className="objective-list">
                  {safety.emergencyGuidance.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
            {typeof safety.metadataStatus === "object" ? (
              <EmptyState
                icon="alert"
                title="Safety metadata requires review"
                description={safety.metadataStatus.rationale}
              />
            ) : null}
          </section>

          <section className="detail-section" id="procedure" aria-labelledby="procedure-title">
            <h2 id="procedure-title">Procedure</h2>
            <p>{procedure.overview}</p>
            <ol className="procedure-list">
              {procedure.steps.map((step) => (
                <li key={step.stepId}>
                  <h3>{step.title}</h3>
                  <p>{step.instructions}</p>
                  {step.precautions.length > 0 ? (
                    <p className="card-meta">Precautions: {step.precautions.join(" ")}</p>
                  ) : null}
                  {step.expectedObservations.length > 0 ? (
                    <p className="card-meta">
                      Expected observations: {step.expectedObservations.join(" ")}
                    </p>
                  ) : null}
                  {step.explanatoryNotes.length > 0 ? (
                    <p className="card-meta">Why: {step.explanatoryNotes.join(" ")}</p>
                  ) : null}
                </li>
              ))}
            </ol>
            {procedure.troubleshooting.length > 0 ? (
              <>
                <h3>Troubleshooting</h3>
                <ul className="objective-list">
                  {procedure.troubleshooting.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          <section
            className="detail-section"
            id="observations"
            aria-labelledby="observations-title"
          >
            <h2 id="observations-title">Observations</h2>
            {observations.mode === "provided" ? (
              <>
                <p>
                  Expected observations below are reference expectations for the activity — they are
                  not measurements produced by this website.
                </p>
                {observations.content.measurements.map((measurement) => (
                  <div key={measurement.id} className="measurement-empty measurement-empty-spaced">
                    <h3>{measurement.label}</h3>
                    <p>
                      {measurement.method}
                      {measurement.unit ? ` (unit: ${measurement.unit})` : ""}
                    </p>
                    {measurement.expectedRange ? (
                      <p className="card-meta">
                        Expected range: {measurement.expectedRange.min ?? "—"} to{" "}
                        {measurement.expectedRange.max ?? "—"}{" "}
                        {measurement.expectedRange.unit ?? ""}
                      </p>
                    ) : null}
                    {measurement.expectedQualitative.length > 0 ? (
                      <p className="card-meta">
                        Expected behaviour: {measurement.expectedQualitative.join(" ")}
                      </p>
                    ) : null}
                    <p className="card-meta">
                      Provenance:{" "}
                      {provenanceLabels[measurement.provenance] ?? measurement.provenance}
                      {measurement.displayPrecision ? ` · ${measurement.displayPrecision}` : ""}
                    </p>
                  </div>
                ))}
                {observations.content.qualitativePrompts.length > 0 ? (
                  <>
                    <h3>Questions to answer</h3>
                    <ul className="objective-list">
                      {observations.content.qualitativePrompts.map((prompt) => (
                        <li key={prompt}>{prompt}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {observations.content.errorSources.length > 0 ? (
                  <>
                    <h3>Sources of error</h3>
                    <ul className="objective-list">
                      {observations.content.errorSources.map((source) => (
                        <li key={source}>{source}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
                {observations.content.interpretationGuidance.length > 0 ? (
                  <>
                    <h3>Interpretation guidance</h3>
                    <ul className="objective-list">
                      {observations.content.interpretationGuidance.map((guide) => (
                        <li key={guide}>{guide}</li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </>
            ) : (
              <EmptyState
                title={
                  observations.mode === "not_applicable"
                    ? "No observation data applies to this experiment"
                    : "Observation data requires review"
                }
                description={observations.rationale}
              />
            )}
          </section>

          <section
            className="detail-section"
            id="calculations"
            aria-labelledby="calculations-title"
          >
            <h2 id="calculations-title">Calculations</h2>
            {calculations.mode === "provided" ? (
              <>
                {calculations.notes ? <p>{calculations.notes}</p> : null}
                {calculations.calculations.map((calculation) => (
                  <div key={calculation.id}>
                    <h3>{calculation.title}</h3>
                    <p>{calculation.purpose}</p>
                    {calculation.assumptions.length > 0 ? (
                      <p className="card-meta">Assumptions: {calculation.assumptions.join(" ")}</p>
                    ) : null}
                    {calculation.significantFigureConvention ? (
                      <p className="card-meta">
                        Significant figures: {calculation.significantFigureConvention}
                      </p>
                    ) : null}
                    {calculation.workedExamples.map((example) => (
                      <div key={example.id} className="safety-panel">
                        <div>
                          <h3>{example.title}</h3>
                          <p>
                            <strong>Given:</strong> {example.given.join(" · ")}
                          </p>
                          <ol className="procedure-list">
                            {example.steps.map((step) => (
                              <li key={step}>{step}</li>
                            ))}
                          </ol>
                          <p>
                            <strong>Result:</strong> {example.result}
                          </p>
                          {example.significantFiguresNote ? (
                            <p className="card-meta">{example.significantFiguresNote}</p>
                          ) : null}
                          <p className="card-meta">
                            {example.isIllustrative
                              ? "Illustrative worked example — not a measured result."
                              : "Derived from recorded measurements."}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <EmptyState
                title={
                  calculations.mode === "not_applicable"
                    ? "No calculation applies to this experiment"
                    : "Calculations require review"
                }
                description={calculations.rationale}
              />
            )}
          </section>

          <section className="detail-section" id="simulation" aria-labelledby="simulation-title">
            <h2 id="simulation-title">Simulation status</h2>
            <p className="card-meta">Status: {shortReviewStatus(simulation.status)}</p>
            {"model" in simulation && simulation.model ? (
              <>
                <h3>{simulation.model.summary}</h3>
                <p className="card-meta">
                  Model contract version {simulation.model.contractVersion}. Model output is
                  theoretical — it is never presented as a measured reading.
                </p>
                <h3>Model assumptions</h3>
                <ul className="objective-list">
                  {simulation.model.assumptions.map((assumption) => (
                    <li key={assumption}>{assumption}</li>
                  ))}
                </ul>
                <h3>Model limitations</h3>
                <ul className="objective-list">
                  {simulation.model.limitations.map((limitation) => (
                    <li key={limitation}>{limitation}</li>
                  ))}
                </ul>
              </>
            ) : (
              <EmptyState
                title="No simulation model is attached"
                description={
                  "rationale" in simulation
                    ? simulation.rationale
                    : "Simulation planning is deferred for this experiment."
                }
              />
            )}
            {[DILUTION_EXPERIMENT_ID, PH_EXPERIMENT_ID].includes(identity.id) ? (
              <div className="lab-callout" role="note">
                <div className="lab-callout-icon" aria-hidden="true">
                  <FlaskConical size={22} />
                </div>
                <div>
                  <p className="eyebrow">Interactive 2D lab available</p>
                  <h3>This experiment is wired to the simulation engine.</h3>
                  <p>
                    Open the 2D laboratory to work through the procedure, manipulate glassware, run
                    model-backed calculations, and record observations. Liquid levels and indicator
                    colours are illustrative visual cues — every numeric reading is tagged with its
                    source (model-calculated vs. user-entered).
                  </p>
                  <p className="lab-callout-safety">
                    <ShieldAlert size={16} aria-hidden={true} /> The virtual lab supplements — it
                    does not replace — supervised physical laboratory training.
                  </p>
                  <Link className="button" href={`/experiments/${identity.slug}/lab`}>
                    <FlaskConical size={16} aria-hidden={true} /> Open laboratory workspace
                  </Link>
                </div>
              </div>
            ) : (
              <FutureLabPanel />
            )}
          </section>

          <section className="detail-section" id="references" aria-labelledby="references-title">
            <h2 id="references-title">References</h2>
            <ul className="objective-list">
              {references.items.map((reference) => (
                <li key={reference.id}>
                  <strong>{reference.citation}</strong>
                  {reference.url ? (
                    <>
                      {" "}
                      <a href={reference.url} rel="noreferrer noopener" target="_blank">
                        {reference.url}
                      </a>
                    </>
                  ) : null}
                  <br />
                  <span className="card-meta">
                    {shortReviewStatus(reference.type)} · Verification:{" "}
                    {reference.verificationStatus}
                    {reference.accessedOn ? ` · Accessed ${reference.accessedOn}` : ""}
                    {reference.supportsClaims.length > 0
                      ? ` · Supports: ${reference.supportsClaims.join(", ")}`
                      : " · Supports no specific claims"}
                  </span>
                  {reference.notes ? <p className="card-meta">{reference.notes}</p> : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="detail-section" id="review" aria-labelledby="review-title">
            <h2 id="review-title">Review and provenance</h2>
            <dl className="detail-meta">
              <div>
                <dt>Scientific review</dt>
                <dd>{shortReviewStatus(review.scientificReviewStatus)}</dd>
              </div>
              <div>
                <dt>Safety review</dt>
                <dd>{shortReviewStatus(review.safetyReviewStatus)}</dd>
              </div>
              <div>
                <dt>Integrity label</dt>
                <dd>{shortReviewStatus(review.integrityLabel)}</dd>
              </div>
              <div>
                <dt>Authors</dt>
                <dd>{review.authors.map((author) => author.name).join(", ")}</dd>
              </div>
            </dl>

            <h3>Revision history</h3>
            <div className="content-table-wrap">
              <table className="content-table">
                <caption className="sr-only">Revision history</caption>
                <thead>
                  <tr>
                    <th scope="col">Version</th>
                    <th scope="col">Date</th>
                    <th scope="col">Summary</th>
                    <th scope="col">Changed by</th>
                  </tr>
                </thead>
                <tbody>
                  {review.revisionHistory.map((entry) => (
                    <tr key={`${entry.contentVersion}-${entry.date}`}>
                      <td>{entry.contentVersion}</td>
                      <td>{entry.date}</td>
                      <td>{entry.summary}</td>
                      <td>{entry.changedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {review.validationNotes.length > 0 ? (
              <>
                <h3>Validation notes</h3>
                <ul className="objective-list">
                  {review.validationNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {review.outstandingConcerns.length > 0 ? (
              <>
                <h3>Outstanding concerns</h3>
                <ul className="objective-list">
                  {review.outstandingConcerns.map((concern) => (
                    <li key={concern}>{concern}</li>
                  ))}
                </ul>
              </>
            ) : null}

            <h3>Licensing</h3>
            <p>
              {review.licensing.license} ({shortReviewStatus(review.licensing.licenseStatus)}).{" "}
              {review.licensing.notes ?? ""}
            </p>
          </section>

          <p className="card-meta">
            <Link className="text-link" href="/explore">
              Back to all experiments
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
