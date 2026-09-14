# Validation record

Validated on 13 September 2026 with Node.js 24.19.0 and Chromium 140 through Playwright. This is a frontend contract/UI validation, not a live server acceptance test.

| Check | Result |
| --- | --- |
| TypeScript production build | Passed |
| Vite production bundle | Passed; approximately 307 KB JavaScript before gzip, bundled local fonts |
| Vitest core tests | 16 passed |
| Playwright browser workflows | 12 passed |
| Desktop screenshot review | Overview and entry register inspected |
| Mobile screenshot review | 390 px viewport inspected; no page-level horizontal overflow |

Core tests cover identity classification, deduplication, confidence semantics, human references, field clearing, normalization, array/envelope contracts, filters, WebSocket URLs, server URL validation, token isolation, stale 401 handling, malformed/validation responses, encoded references, login completeness, HTTP 204, and split/oversized camera frames.

Browser workflows cover authenticated MJPEG streaming through the Vite proxy, focus/selection/pause/resume, expanded view/Escape, actual frame downloads, subject edits and sighting history, entry filters and selection, WebSocket-triggered entry refresh, Excel transport/authorization, account edit/remove, camera permissions, member isolation/public profile, offline states without fake data, mobile navigation/theme, connection testing without implicit save, logout/route protection, registration, session expiry, and live-event deduplication/reconnection state.

The test-only JPEG is deliberately labelled as a fixture. REST and WebSocket responses use controlled test data. The Excel download test checks request/filter/header handling and browser download behavior, not the contents of a real workbook. PostgreSQL, Redis publication, cloud signing, real camera availability, model execution, server-side permissions, and production network/CORS/proxy behavior require acceptance testing with the user's running backend.

The complete current backend archive was unavailable; no claim is made to have inspected or changed it. Integration contracts are taken from the provided frontend source and are documented in API_CONTRACT.md.
