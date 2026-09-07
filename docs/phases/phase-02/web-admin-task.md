# Phase 02 - Web Admin Users Tasks

## Overview

Build the Tracmedy admin Users screen from the available Users designs in docs/design/Users/. This phase covers the admin app shell shown in the Users designs, the Users overview state, the empty state, and the user profile drawer.

## Available Designs

- docs/design/Users/USER-01 User Profile.png
- docs/design/Users/USER-02 User View state.png
- docs/design/Users/USER-02 Users Empty state.png

## Endpoint Status

Current backend contract exposes admin users summary, list, export, detail, and status endpoints. Summary, list/export, detail, and status endpoints are now wired.

## Task Board

- [x] **Task: Create admin users shell**
  What: Build the sidebar/topbar shell shown in the Users designs and render Users as the active navigation item.
  Where: components/admin/, app/users/page.tsx.
  Done when: /users uses the designed admin shell and does not reuse the auth layout.

- [x] **Task: Build users overview state**
  What: Build summary cards, subscription overview, filters, table, pagination, and table actions from the populated Users design.
  Where: app/users/page.tsx and supporting components.
  Done when: The populated Users screen matches USER-02 User View state.png.

- [x] **Task: Build users empty state**
  What: Build the no-users table body and zero-value cards from the empty Users design.
  Where: app/users/page.tsx and supporting components.
  Done when: The empty state matches USER-02 Users Empty state.png.

- [x] **Task: Build user profile drawer**
  What: Build the right-side user profile details drawer with blurred backdrop, sections, status/plan pills, and edit/suspend actions.
  Where: app/users/page.tsx and supporting components.
  Done when: Selecting a user opens a drawer matching USER-01 User Profile.png.

- [x] **Task: Wire available users data**
  What: Use the verified admin dashboard overview endpoint for aggregate data and document missing dedicated user endpoints.
  Where: lib/server/, docs/phases/phase-02/web-admin-task.md.
  Done when: Existing backend data is wired without inventing unavailable endpoints.

- [x] **Task: Run users verification checks**
  What: Run TypeScript, lint, build, and route smoke checks.
  Where: web-admin/.
  Done when: npx tsc --noEmit, npm run lint, and npm run build pass.

- [x] **Task: Wire users list and export endpoints**
  What: Fetch GET /admin/users for the Users table and proxy GET /admin/users/export through a cookie-backed admin API route.
  Where: lib/server/admin-overview.ts, app/(admin)/users/page.tsx, app/api/admin/users/export/route.ts.
  Done when: Users table prefers backend rows with design fallback, export uses a secure local route, and checks pass.

- [x] **Task: Wire user detail and status endpoints**
  What: Fetch GET /admin/users/:id for the profile drawer and submit activate/suspend actions to PATCH /admin/users/:id/status.
  Where: lib/server/admin-overview.ts, app/(admin)/users/page.tsx.
  Done when: Opening a user hydrates drawer fields from the backend when available, activate/suspend buttons call the verified endpoint, and checks pass.
