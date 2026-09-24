# ISHWARI Institute Portal (React/Vite)

A React + TypeScript + Vite rewrite of the original single-file
`ishwari_institute_portal.html`. Same Firebase backend, same data —
just properly componentized and typed. Public course catalog, student
self-registration/enrollment, admin course/result/certificate
management, all unchanged in behavior.

## Why this exists

The original was a single ~200KB HTML file with all logic inline —
fine for getting something working fast, hard to keep extending safely.
This version:

- Splits the app into typed components/pages instead of one big
  `render()` function
- Uses the Firebase **v9 modular SDK** instead of the old compat
  scripts
- Reads/writes the **same Firestore collection** (`ishwari_institute`,
  one document per data key — `courses`, `students`, `enrollments`,
  `results`, `certificates`, `settings`) — so none of the existing
  registrations, enrollments, results or certificates need to be
  migrated
- Pulls colors/fonts into `src/styles/tokens.css`, a small,
  dependency-free file you can copy into the main
  `ishwariyogainstitute.in` React site too, so both properties share
  one design system

## Known gap carried over from the original

Student/admin login on both the old and new version relies on
Firebase Authentication for the credential itself, but there's no
extra server-side check beyond "does a Firestore profile exist for
this uid/email" — that's adequate for a small institute portal but
worth knowing about if this ever needs to hold more sensitive data.
See the "Security rules" section below for the minimum you should
have in place.

## Project layout

```
src/
  types.ts                 Data shapes (Course, Student, Enrollment, Result, CertificateFile, EmailSettings)
  lib/
    firebase.ts             Firebase app/config (same project as the original)
    PortalContext.tsx       Replaces the old global `state` object — loads/persists Firestore, holds auth/role
    actions.ts               Course/enrollment/result/certificate mutations (admin + student)
    utils.ts, csv.ts, notifications.ts   Formatting, CSV parsing, EmailJS + Excel export
  components/                TopBar, badges, modal, pagination, flash message
  pages/
    Landing.tsx, Catalog.tsx, AdminLogin.tsx, StudentLogin.tsx, StudentRegister.tsx
    admin/                    AdminShell + Courses / Students / Enrollments / Reports / Results / CertificateUpload / Settings / Export
    student/                  StudentShell + Enroll / Enrollments / Results
  styles/
    tokens.css                Shared design tokens (colors, fonts) — reusable in other properties
    global.css                Component styles, ported from the original <style> block
```

## Local development

```bash
npm install
npm run dev
```

## Deploying — subpath of ishwariyogainstitute.in (`/portal/`)

`vite.config.ts` is already set to `base: '/portal/'`, so no changes
needed there.

GitHub Pages binds one repo to a custom domain, so since the main
`ishwariyogainstitute.in` site is already its own Vite repo deployed
that way, the simplest integration is the same pattern already used
for `ishwari_institute_portal.html`: build this app, then drop its
output into the main site's `public/` folder so it ships as part of
the main site's own build.

1. In this repo: `npm install && npm run build` -> produces `dist/`.
2. Copy the **contents** of `dist/` (not the folder itself) into the
   main site repo at `public/portal/`, e.g.:
   ```bash
   rm -rf /path/to/main-site-repo/public/portal
   mkdir -p /path/to/main-site-repo/public/portal
   cp -r dist/* /path/to/main-site-repo/public/portal/
   ```
3. Commit and push the main site repo as usual. Since Vite copies
   `public/` verbatim into its own build output, the portal ends up
   served at `ishwariyogainstitute.in/portal/` once the main site
   redeploys — no separate Pages site or DNS entry needed.
4. Update the "Enroll Now" link on the Teacher Training page
   (`yttc.html`/its React equivalent) and any admin-facing links from
   `/ishwari_institute_portal.html` to `/portal/`.
5. Re-run steps 1-3 any time you change this app; the main site
   doesn't need rebuilding unless its own code changed too.

`.github/workflows/deploy.yml` in this repo is included as a fallback
if you ever want this portal deployed completely independently (its
own Pages site/subdomain) instead — not needed for the subpath setup
above.

Routing uses `HashRouter` (URLs look like `/portal/#/catalog`,
`/portal/#/admin/courses`) specifically so it works with zero server
configuration once copied into `public/portal/` — no rewrite rules
needed for refreshing a deep link or sharing a URL.

## Firebase configuration

`src/lib/firebase.ts` contains the same project config the original
HTML file used. If you ever rotate keys or point this at a different
Firebase project, update it there.

- **Firestore**: collection `ishwari_institute`, documents `courses`,
  `students`, `enrollments`, `results`, `certificates`, `settings` --
  each holding `{ items: [...] }`.
- **Storage**: certificate files under `certificates/<courseId>/<enrollmentId>/...`.
- **Authentication**: Email/Password provider, plus a `users/<uid>`
  Firestore document with `{ role: 'admin', active: true }` for each
  admin account (create this manually in the Firebase console --
  there's no self-serve admin signup, by design).

### Security rules (minimum recommended)

If your existing Firestore/Storage security rules already lock things
down, no changes are needed -- this app talks to the exact same
paths as the original. If you haven't set explicit rules yet, at
minimum:

- Firestore: allow read of `ishwari_institute/*` to any signed-in
  user; restrict writes to signed-in users (student self-registration
  writes its own row; admin writes are broader -- tighten with a
  `role == 'admin'` check via the `users` collection if you want
  students unable to edit courses/results directly).
- Storage: restrict `certificates/**` writes to signed-in admin users;
  reads can stay open to signed-in users since download links aren't
  publicly guessable.

## EmailJS

Same as before -- configured from **Admin -> Email settings** inside
the app itself (Service ID / Template ID / Public Key), no rebuild
needed to change these since they're stored in Firestore
(`settings` document), not in code. The EmailJS browser SDK is loaded
via a `<script>` tag in `index.html`.

## What's intentionally unchanged from the original

- Data model and ID formats (`CRS0001`, `STU0001`, `REG0001`,
  `RES0001`, `CERTF0001`)
- CSV formats for bulk results and certificate mapping
- Validation rules on the registration form
- Certificate visual design and print/PDF behavior
