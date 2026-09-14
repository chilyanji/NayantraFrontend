# Sentinel React Console

A frontend-only replacement for the supplied PyQt6 Sentinel application. React, TypeScript, and Vite; no Python backend, database migrations, or business-logic changes are included.

## Start on Windows

Use Node.js 22 LTS or newer. Open a terminal in this folder:

```bat
npm ci
copy .env.example .env
```

Open `.env` and set **SENTINEL_BACKEND_URL** to the FastAPI address that your PyQt frontend already uses. For example:

```dotenv
SENTINEL_BACKEND_URL=http://127.0.0.1:8000
VITE_API_URL=/api
VITE_AUTO_START_AI=true
```

If your backend is on another computer, use that computer's current LAN address instead of `127.0.0.1`. The IP in your old frontend's `.env.example` is an example; use the address of your running server. Do not put database credentials or server secrets in Vite environment variables.

Keep your existing backend running, then start the frontend:

```bat
npm run dev
```

Open **http://127.0.0.1:5173**. Sign in with an existing account and select **Administrator** or **Member** to match its role. Self-registration creates member accounts through the existing `/register` endpoint.

The Vite development proxy forwards `/api/*` to your server and removes `/api` before forwarding. It also forwards the existing WebSocket. This lets the browser use one origin without changing your FastAPI CORS configuration. Restart Vite after editing `.env`.

The backend, PostgreSQL, Redis, models, cameras, and object storage remain your existing services. This frontend communicates only with HTTP/WebSocket APIs and signed image URLs.

## Included workflows

- Administrator/member sign-in, registration, username availability, profile, sign-out, and session expiry.
- Responsive overview, camera grid/focus selector, expanded camera dialog, pause/resume, reconnection, and real snapshot downloads.
- Backend camera assignments: admins list cameras with `/admin/cameras`; members use `/me/cameras`.
- Shared current-detection panels, correct pending/authorized/unknown/blacklisted handling, and recognition similarity.
- Admin subject records with all 17 existing editable fields, signed reference images, statistics, and sighting history. Cleared fields are submitted as JSON null; unchanged fields are omitted.
- The member dashboard retains the **limited public profile** from `/persons/{reference}`; it does not request full `/subjects` records.
- Entry register with all five time presets, status/name/roll/branch filtering, five summary counts, all ten existing table columns, current-camera markers, selection detail, profile opening, and authenticated Excel export.
- Account directory, account details, edit, delete/deactivate request, and member camera assignments. Administrator accounts retain the supplied desktop UI's edit/remove protection.
- Live `/ws/live` sightings/alerts, reconnect backoff, deduplication, event coalescing, and periodic fallback refresh.
- Local workspace theme and in-app notification settings. Connection testing does not silently save or replace the server address.

The browser does not provide new enrollment, role administration, audio, or camera-management APIs. The backend continues to enforce all permissions. A reference-only mute button was omitted because the supplied MJPEG stream has no audio channel.

## Backend contract and compatibility

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for every request and its source. See [docs/FEATURE_PARITY.md](docs/FEATURE_PARITY.md) for the mapping from PyQt windows and both React references.

The current upload contains only the frontend. Integration is implemented against its actual call sites; the current server implementation and production data were not available to inspect. The included tests exercise the corresponding contracts using controlled responses, not your live PostgreSQL/Redis/camera system.

Two historical helpers in `users_db.py`, `get_recent_activity` and `get_recent_events`, return empty lists without making any request. They cannot supply historical data in any frontend. Their views remain present and explicitly report that the historical feed is not connected. Live session events and the real `/entries` register work independently. If your server implements the optional routes from the React references, enable them in `.env`:

```dotenv
VITE_ACTIVITY_PATH=/admin/activity?limit=100
VITE_EVENTS_PATH=/admin/events?limit=100
```

Do this only if those routes exist. Blank is the default; the application never replaces missing history, cameras, or detections with demo data. Likewise, the local permission-grant simulations and extra security roles in reference 1 are not treated as real backend capabilities. The supplied main PyQt frontend implements `admin` and `member` accounts.

Account removal calls the existing `DELETE /admin/users/{id}` endpoint. Its server implementation determines deletion versus deactivation; the UI asks for confirmation and does not claim to guarantee a soft delete.

## Build and serve

```bat
npm run build
npm run preview
```

`dist/` is the production build. `npm run preview` is for checking the build locally, not production hosting. For a real deployment, serve `dist/` with SPA fallback to `index.html`, and forward `/api/` to FastAPI on the same origin. The WebSocket and MJPEG stream need proxy support; an example is included in [docs/nginx-frontend.conf](docs/nginx-frontend.conf). This is a hosting configuration example, not a backend modification or a deployment performed for you.

Alternatively, set `VITE_API_URL` to your direct API URL before building. Your backend must already permit your frontend's origin in CORS, and the browser must be able to reach the API and signed image URLs. HTTPS pages require HTTPS APIs and WSS WebSockets. JWTs are sent in Authorization headers for JSON, exports, and camera streams. `/ws/live` retains the supplied token-query contract because browser WebSockets cannot set an arbitrary Authorization header.

The admin's automatic `/ai/start` behavior is preserved. Set `VITE_AUTO_START_AI=false` for manual-only startup. Starting/stopping the AI service affects the shared backend runtime; stopping asks for confirmation.

## Tests

```bat
npm test
npx playwright install chromium
npm run test:e2e
```

The browser tests start their own isolated test stream server on port 8765 and a Vite server on port 5173. Stop your development server before running them. Their accounts, detections, JPEG, WebSocket messages, and export payload are **test fixtures only**, never part of the application runtime. The export test verifies transport/authorization/download behavior; the real Excel workbook is generated by your backend.

## Troubleshooting

- **No connection:** verify the FastAPI address in `.env`, restart Vite, and check Settings → Test connection. A saved browser server override takes priority over `VITE_API_URL`; set it back to `/api` in Settings to use the proxy.
- **Login succeeds but camera returns 503:** the API is reachable but the backend AI runtime/camera is unavailable. Check the backend terminal and the camera-status error; installing React packages cannot fix camera/model startup.
- **Camera or endpoint returns 403:** this account does not have server permission. Have the administrator verify access.
- **WebSocket disconnected:** the UI reports polling/reconnection. Entry rows still reload every 10 seconds; new live-event notifications require the socket to reconnect.
- **404 on an account, entry, or subject endpoint:** the frontend exposes the existing call site, but the current server does not provide that route. Verify the running server version.
- **Signed image unavailable:** reload the profile to obtain a fresh signed URL; verify object-storage reachability from the browser.
- **Changing servers:** saving a different address signs you out so an existing token cannot be sent to another server.

## Source layout

```text
src/
  App.tsx                  routes, role gates, responsive workspace shell
  state.tsx                authentication, polling, live socket and notifications
  lib/api.ts               API contract, errors, session and URL handling
  lib/domain.ts            identity classification and profile transformations
  lib/hooks.ts             cancellable polling and debouncing
  lib/mjpeg.ts             incremental JPEG frame parser
  components/              reusable UI, camera and subject-profile dialogs
  pages/                   auth, dashboards, entry log, subjects, users, settings
  styles.css               shared responsive light/dark visual system
```

No remote fonts are required: Inter is bundled with the build. There are no demo accounts, embedded credentials, direct database connections, or hidden login bypasses.
