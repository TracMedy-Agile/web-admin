# Phase 01 - Web Admin Tasks

## Overview

Build the Tracmedy internal admin authentication experience from the available Phase 01 designs in `docs/design/authentication/`. The current `web-admin` app is still close to the default Next.js starter, so Phase 01 should replace starter UI with the designed admin auth flow.

Available Phase 01 design coverage is limited to authentication screens. Do not build admin dashboard modules yet unless matching designs are added in a later phase or the user explicitly approves planning from product requirements instead of visual designs.

## Available Designs

All current Phase 01 design images are `1440 x 1024`:

- `docs/design/authentication/AUTH-01 Login.png`
- `docs/design/authentication/AUTH-02 Login Error States.png`
- `docs/design/authentication/AUTH-03 Login Error States.png`
- `docs/design/authentication/AUTH-04 Forgot Password.png`
- `docs/design/authentication/AUTH-05 Forgot Password Error state.png`
- `docs/design/authentication/AUTH-06 Email Sent.png`
- `docs/design/authentication/AUTH-07 Reset Password.png`
- `docs/design/authentication/AUTH-08 Password updated.png`

## Task Board

### Authentication Foundation

- [x] **Task: Create admin auth layout**
  What: Replace the default starter presentation with an admin auth layout that matches the authentication design family. Include the Tracmedy Admin brand treatment, left/right visual structure if shown in the designs, responsive behavior, and shared form container styles.
  Where: `app/(auth)/layout.tsx`, shared auth components as needed.
  Designs: `AUTH-01 Login.png` through `AUTH-08 Password updated.png`.
  Done when: All auth screens can share the same layout without duplicating page chrome, and the default Next.js starter UI is no longer visible on auth routes.

- [x] **Task: Create admin auth API/session foundation**
  What: Add the client/server helpers needed for admin login, logout, password reset requests, and reset submission. Use cookie-backed session handling; do not store tokens in `localStorage`. Verify exact backend endpoints before wiring.
  Where: `lib/api/`, `app/api/auth/` if route handlers are needed.
  Designs: Applies to all auth screens.
  Done when: Auth forms have a typed API layer, unauthorized/error responses are handled consistently, and no token is written to browser storage.

### Login

- [x] **Task: Build login page**
  What: Build the admin login page from the main login design with email/password inputs, password visibility control if shown, remember/session option if shown, forgot-password link, submit state, and accessible labels.
  Where: `app/(auth)/login/page.tsx` or `app/login/page.tsx` depending on final route convention.
  Design: `docs/design/authentication/AUTH-01 Login.png`.
  Done when: `/login` renders the designed admin login screen and submits through the admin auth API helper.

- [x] **Task: Build login error states**
  What: Implement invalid credentials, validation, disabled/loading, and other login error states shown in the designs.
  Where: Login page and shared auth form components.
  Designs: `AUTH-02 Login Error States.png`, `AUTH-03 Login Error States.png`.
  Done when: Login errors match the design states and are announced accessibly without layout shift.

### Forgot Password

- [x] **Task: Build forgot password page**
  What: Build the forgot-password request screen with email input, submit state, back-to-login path, and designed copy/layout.
  Where: `app/(auth)/forgot-password/page.tsx` or `app/forgot-password/page.tsx`.
  Design: `docs/design/authentication/AUTH-04 Forgot Password.png`.
  Done when: `/forgot-password` matches the design and calls the verified password-reset request endpoint.

- [x] **Task: Build forgot password error state**
  What: Implement the designed error/validation state for forgot password.
  Where: Forgot password page and shared auth form components.
  Design: `docs/design/authentication/AUTH-05 Forgot Password Error state.png`.
  Done when: API and validation errors render exactly as designed and remain keyboard/screen-reader accessible.

- [x] **Task: Build email sent page**
  What: Build the confirmation state after requesting password reset.
  Where: `app/(auth)/forgot-password/confirmation/page.tsx` or a matching route.
  Design: `docs/design/authentication/AUTH-06 Email Sent.png`.
  Done when: Successful forgot-password submission routes to the email-sent screen and the screen matches the design.

### Reset Password

- [x] **Task: Build reset password page**
  What: Build the reset-password screen with new password and confirm password fields, password visibility controls if shown, validation, token handling from the URL, and submit state.
  Where: `app/(auth)/reset-password/page.tsx` or `app/reset-password/page.tsx`.
  Design: `docs/design/authentication/AUTH-07 Reset Password.png`.
  Done when: `/reset-password` matches the design and submits the new password through the verified reset endpoint.

- [x] **Task: Build password updated success page**
  What: Build the success screen shown after a password reset completes.
  Where: `app/(auth)/reset-password/success/page.tsx` or a matching route.
  Design: `docs/design/authentication/AUTH-08 Password updated.png`.
  Done when: Successful reset routes to the password-updated screen and the screen matches the design.

### Route Protection

- [x] **Task: Redirect root route to the correct admin entry**
  What: Replace the default `app/page.tsx` content with the correct redirect or entry behavior for the admin app. If unauthenticated, send users to login; if authenticated, send admins to the future dashboard route.
  Where: `app/page.tsx`.
  Designs: Auth designs only; dashboard target may remain a placeholder route until dashboard designs exist.
  Done when: The default Next.js starter homepage is gone and `/` has admin-appropriate routing behavior.

- [x] **Task: Add protected admin route guard**
  What: Add the guard/middleware needed so future admin dashboard routes require an authenticated admin session.
  Where: `middleware.ts` or route-level guard utilities.
  Designs: No dashboard design available yet; keep UI minimal and auth-focused.
  Done when: Protected admin routes cannot be opened by unauthenticated users or non-admin roles.

### Documentation & Checks

- [x] **Task: Document missing admin designs**
  What: Record that no dashboard/facility/user/waitlist/audit/settings/admin analytics designs are currently available.
  Where: `docs/web-admin-known-gaps.md`.
  Done when: Future contributors can see which admin areas are blocked on design before building UI.

- [x] **Task: Run admin verification checks**
  What: Run the standard project checks after implementing auth work.
  Where: `web-admin/`.
  Done when: `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass.

## Not Yet Tasked Because Designs Are Missing

These should become later phases when you add the matching designs:

- Admin dashboard overview
- Hospital/facility management
- User and role administration
- Waitlist management and CSV export
- Platform configuration
- Audit log viewer
- System monitoring and analytics
- Billing/subscription administration

Create tasks for these only after design files are added or product explicitly approves implementation without designs.