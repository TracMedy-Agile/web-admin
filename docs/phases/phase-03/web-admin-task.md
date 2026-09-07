# Phase 03 - Web Admin Facilities Tasks

## Overview

Build the Tracmedy admin Facilities screen from the available Facilities designs in docs/design/Facilities/. This phase currently covers the populated facilities list and the empty facilities state. Later designs in the folder cover registration, details, suspension, and payment history.

## Available Designs

- docs/design/Facilities/FAC-01 Facilities.png
- docs/design/Facilities/FAC-02 Facilities Empty state.png
- docs/design/Facilities/FAC-03 Facilities Registration form.png
- docs/design/Facilities/FAC-04 Facilities Details.png
- docs/design/Facilities/FAC-05 Suspend Facility.png
- docs/design/Facilities/FAC-06 Payment History.png

## Endpoint Status

The current OpenAPI contract exposes admin facilities management endpoints. GET /admin/facilities/summary and GET /admin/facilities are wired into the Facilities overview; registration, export, detail, and status mutation endpoints remain separate checklist items in docs/web-admin-task.md.

## Task Board

- [x] **Task: Add protected Facilities route**
  What: Add /facilities under the shared protected admin layout and make Facilities active in the sidebar.
  Where: app/(admin)/facilities/page.tsx, components/admin/, proxy.ts.
  Done when: /facilities uses the centralized admin shell and unauthenticated access redirects to /login.

- [x] **Task: Build facilities overview state**
  What: Build the header actions, summary cards, filters, table, row statuses, view-profile action, and pagination from FAC-01.
  Where: app/(admin)/facilities/page.tsx.
  Done when: The populated /facilities screen matches FAC-01 Facilities.png.

- [x] **Task: Build facilities empty state**
  What: Build the zero-value summary cards and centered no-facilities state from FAC-02.
  Where: app/(admin)/facilities/page.tsx.
  Done when: /facilities?state=empty matches FAC-02 Facilities Empty state.png.

- [x] **Task: Document available facilities endpoints**
  What: Record that admin facilities endpoints are not yet exposed in the current OpenAPI contract.
  Where: docs/phases/phase-03/web-admin-task.md.
  Done when: The phase doc distinguishes verified OpenAPI endpoints from planned admin endpoints.

- [x] **Task: Build facilities registration modal**
  What: Build the Register Facility modal from FAC-03 with blurred backdrop, grouped form sections, service checkboxes, and footer actions.
  Where: app/(admin)/facilities/page.tsx.
  Done when: /facilities?register=1 matches FAC-03 Facilities Registration form.png.

- [x] **Task: Build facility details drawer**
  What: Build the right-side facility details drawer from FAC-04 with hospital information, contact person, subscription details, payment history preview, and edit/suspend actions.
  Where: app/(admin)/facilities/page.tsx.
  Done when: /facilities?facility=TRC-001 matches FAC-04 Facilities Details.png.

- [x] **Task: Build suspend facility confirmation**
  What: Build the suspend confirmation modal from FAC-05 over the blurred facility details context.
  Where: app/(admin)/facilities/page.tsx.
  Done when: /facilities?facility=TRC-001&suspend=1 matches FAC-05 Suspend Facility.png.

- [x] **Task: Build facility payment history**
  What: Build the full Payment History page from FAC-06 with breadcrumbs, summary cards, filters, table statuses, export action, and pagination.
  Where: app/(admin)/facilities/page.tsx.
  Done when: /facilities?payments=1 matches FAC-06 Payment History.png.
