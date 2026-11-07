# 3D performance and compatibility evidence

Last implementation review: 2026-11-07.

## Implemented controls

Dynamic imports keep Three.js out of server rendering. Scenes render on demand and dispose geometry/material resources. Default DPR is at most 1.5; low quality uses 1 and high quality at most 2. Geometry segment counts are bounded and molecular input is limited to 256 atoms/512 bonds. Laboratory scenes use shared low-complexity primitives. Adaptive monitoring lowers quality after declining performance.

## Measurements

- Production compile/typecheck/build: **PASS** locally with Next.js 16.4.4; `/molecules` generated as a static route.
- Shared molecular unit tests: **PASS**, 28/28.
- Production route chunk measurement: **PASS (artifact size only)**. The `/molecules` client-reference manifest identifies four unique initial JS chunks totalling 203,832 bytes / **60.7 KiB gzip**; its lazy 3D files total 954,917 bytes / **248.7 KiB gzip**. Combined referenced JS is approximately **309.4 KiB gzip**, excluding HTML/CSS and network overhead. Measured with Node gzip on the production build, not a browser transfer trace.
- Desktop browser frame rate, memory after repeated mount/unmount and interaction latency: **UNVERIFIED** locally. Playwright Chromium could not be downloaded from the blocked CDN.
- Representative Android/iOS devices: **UNVERIFIED / native 3D NOT IMPLEMENTED**. Expo config/typecheck validates only the existing scaffold, not WebGL or native 3D.

No FPS, memory, mobile parity or broad device-support claim is made. CI browser runs and physical-device profiling are acceptance-gate evidence still required. A future profile should record cold/warm route bytes, time to first rendered canvas, sustained interaction FPS, heap/GPU-resource trends across 20 scene switches, and low-end mobile thermal behavior.
