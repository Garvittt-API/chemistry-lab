# Release and Versioning Policy

## Versioning
Use semantic versioning for application releases once public APIs and release cadence are established. Version experiment content and schema separately from app releases.

## Release checklist
- [ ] Required CI checks pass.
- [ ] Known critical/high issues resolved or explicitly documented with mitigation.
- [ ] Scientific review status is accurate.
- [ ] Content/model/schema changes are versioned.
- [ ] Changelog updated.
- [ ] License and third-party notices verified.
- [ ] Build artifacts are reproducible and attributable to a commit.
- [ ] Rollback/recovery plan exists for deployed services.
- [ ] Release notes distinguish implemented features from planned work.

## Deployment
Select hosting only after the web app's runtime, asset size, data needs and operational constraints are known. Do not expose private preview environments or secrets publicly.
