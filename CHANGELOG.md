# Changelog

## 2026-11-14 - Public cloud demo

### Presentation

- Published the approved cinematic workshop artwork and real application screenshots.
- Added scroll-linked hero movement, a pinned service story, chapter navigation,
  shared interaction feedback and distinct blue, copper, violet and emerald accents.
- Unified the workshop pages and dark/light themes.
- Removed the footer's Reduce motion option at the owner's request. Device
  reduced-motion preferences continue to apply automatically.
- Updated the GitHub overview, demo walkthrough, documentation and feedback entry points.

### Hosting

- Released [autocare-insight.vercel.app](https://autocare-insight.vercel.app) on
  Vercel Hobby with Enzonic Free native MySQL and MongoDB Atlas M0.
- Migrated both databases after isolated backup recovery checks, preserving
  SQL routines/triggers/views and MongoDB report IDs/indexes/validators.
- Removed the application's dependency on a local PC or Cloudflare tunnel.
- Configured verified TLS, a fresh production session key and a 30-second
  connection timeout to allow more time for an idle database to wake.

### Correctness and access

- Upgraded Next.js to 15.5.29 and aligned dynamic route parameters with Next.js 15.
- Added fail-closed production signing-key validation and reusable database pools.
- Split photo selections into individual requests to fit hosted payload limits,
  while retaining validation, privacy, duplicate detection and workflow locking.
- Kept invoice procedure calls and OUT variables on the same MySQL connection.
- Preserved browser-selected booking/rescheduling instants across hosting regions.
- Restricted mechanic updates and inspection writes to assigned jobs and blocked
  mechanic reassignment through the job API.

### Verification

- 58 automated tests passed at the release checkpoint; TypeScript and production
  builds passed. Existing lint hook warnings remain documented.
- Verified the cloud booking-to-payment-record workflow, concurrent invoice
  creation, role boundaries, protected photo access and public sign-in.
- Removed test-owned records and verified the migrated sample-data baseline
  against the original databases after cleanup.

For check scope and limitations, see the [verification report](docs/TEST_VERIFICATION_REPORT.md).
