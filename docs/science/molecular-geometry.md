# Molecular data and geometry conventions

## Contract

Molecule schema `1.0.0` records stable molecule/atom/bond IDs, case-sensitive elements, formal charge, Cartesian positions in ångström, single/double/triple/aromatic connectivity, structure version, source model/version, citations, assumptions, limitations and review status. The renderer must not infer scientific validity from a successful parse.

All catalog records are `pending_scientific_review`. Automated checks establish internal consistency, not independent chemical validation. Source URLs were recorded from established NIST CCCBDB, PubChem and NCERT references; this sandbox could not retrieve those external hosts during Phase 06, so a qualified reviewer must directly inspect the sources and coordinates.

## Geometry classes

- **Experimental reference geometry:** coordinates reconstructed from stated literature bond lengths/angles. These are static reference structures, not time-resolved measurements or conformational ensembles.
- **Idealized geometry model:** deterministic educational construction using tetrahedral/trigonal directions and explicitly listed model lengths. Ideal 109.47° values are never labelled experimental.
- **Computed geometry:** reserved for a future validated computational method; no current record uses it.
- **Illustrative geometry:** reserved for non-quantitative teaching diagrams.

The UI reports bond lengths and angles as coordinate-derived. It does not silently optimize, normalize, repair or replace coordinates. VSEPR domain counts distinguish electron-domain geometry from atoms-only molecular shape. Multiple bonds count as one domain. Aromatic benzene bonds are equivalent aromatic connections, not alternating localized bond orders.

## Initial collection

| Molecule | Geometry provenance | Quantitative convention |
|---|---|---|
| Water | Experimental reference | O–H 0.958 Å; H–O–H 104.5° |
| Carbon dioxide | Experimental reference | C=O 1.160 Å; linear |
| Methane | Idealized | Tetrahedral 109.47°; C–H 1.09 Å model length |
| Ammonia | Experimental reference | N–H 1.012 Å; H–N–H 106.7° |
| Oxygen | Experimental reference | O=O 1.2075 Å |
| Nitrogen | Experimental reference | N≡N 1.0977 Å |
| Hydrogen | Experimental reference | H–H 0.7414 Å |
| Methanol | Idealized | Tetrahedral centers; model lengths listed in record |
| Ethanol | Idealized | One arbitrary conformer; no energy claim |
| Benzene | Idealized | Planar regular ring; C–C 1.397 Å, C–H 1.09 Å |

Glucose is **NOT IMPLEMENTED**. A correct stereochemical conformer and directly reviewed coordinate source are required before inclusion. Partial charges, dipoles, electron density, orbitals and hydrogen-bond visualizations are also **NOT IMPLEMENTED** because no validated property datasets/models are integrated.

## Visual scale

Ball-and-stick atom radii are schematic and selected for legibility. Bond distances derive from the source coordinates. Space-filling mode uses conventional display radii scaled for the scene; spheres are not physical electron-cloud boundaries. The orthographic 2D view is a projection and may hide depth; full connectivity is always available in text and lists.

## Molar mass integration

`getMoleculeSummary` calls Phase 04 `molarMass(formula)` and returns the engine/model provenance. No molar-mass calculation is duplicated in the visualization package. Phase 04 remains reference-verified, not independently reviewed.
