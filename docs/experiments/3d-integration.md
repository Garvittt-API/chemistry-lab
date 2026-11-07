# Experiment integration for 3D views

`solution-dilution` and `ph-and-indicators` retain their Phase 05 2D components and procedure/scientific state. A view switcher adds a separate 3D equipment-layout scene using the same `experimentId` and `laboratory-core` equipment IDs. Switching back preserves the mounted 2D workspace. The 3D scene does not run procedures, mix liquids or produce observations.

`vsepr-molecular-geometry` now opens a molecular workspace with water, carbon dioxide, methane and ammonia examples. It uses the existing experiment record and shared molecular catalog; no duplicate experiment definition was added.

Other experiments retain the honest unavailable workspace. A 3D view is not required. Three.js is not imported into the scientific engine, experiment schema, library or mobile scaffold.
