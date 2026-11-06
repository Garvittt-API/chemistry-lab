/**
 * @virtual-chemistry-lab/experiment-library
 *
 * Validated, version-controlled experiment content and a pure query API.
 * Independent of React and Next.js; see
 * docs/experiments/experiment-library-architecture.md for the architecture and
 * scaling path.
 */

export {
  CatalogValidationError,
  buildCatalog,
  catalog,
  loadBundledCatalog,
  type CatalogInput,
  type ExperimentCatalog,
} from "./catalog.js";
export {
  filterExperiments,
  getExperimentById,
  getExperimentByIdOrSlug,
  getExperimentBySlug,
  getPublicExperimentByIdOrSlug,
  isPubliclyVisible,
  queryExperiments,
  scoreMatch,
  searchExperiments,
  toExperimentSummary,
  type ExperimentQuery,
  type ExperimentQueryResult,
  type ExperimentSortKey,
  type ExperimentSummary,
  type SortDirection,
} from "./queries.js";
