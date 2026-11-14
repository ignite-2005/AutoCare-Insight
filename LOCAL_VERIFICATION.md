# Local setup and verification

## Current setup - 14 November 2026

The current application uses Next.js 15.5.29, React 18 and TypeScript. Node.js 22
is the documented runtime and the cloud host uses Node 22. The earlier Windows
Node 24 checks below are retained as history.

The [public demo](https://autocare-insight.vercel.app) runs independently of this
computer. For local development, install Node.js 22, MySQL 8 and MongoDB 8, then:

```powershell
npm ci
Copy-Item .env.example .env.local
# Supply your own local database credentials and a random JWT_SECRET.
npm run setup:db
npm run doctor
npm run dev
```

Generate the signing key with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Keep it in `.env.local`. Local setup uses `autocare_insight` and MongoDB
`autocare_db`. The supported setup command preserves existing data; historical
`01_create_database.sql` drops the database. Do not point local setup at the
public demo or its separately configured hosted schema.

After initial setup, use `npm run doctor` and `npm run dev`. Verify with:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The release checkpoint passed 58 tests, TypeScript and the cloud production
build. Existing hook-dependency lint warnings remain. Tests expect the supplied
seed data. HTTP smoke/intake scripts mutate temporary fixtures; use a dedicated
local test installation for them.

See [demo accounts](README.md#try-the-workspace), the [viva guide](VIVA_GUIDE.md),
[verification report](docs/TEST_VERIFICATION_REPORT.md) and
[managed hosting](deploy/MANAGED_HOSTING.md). Role changes require sign-out and
another sign-in; the old demo role-switching helper has been removed.

## Historical local checks - 11-12 November 2026

Entries below describe earlier versions and repairs, not current deployment
status, runtime instructions or test counts.

## Configuration completed

- Project location: the owner's local development checkout.
- Node.js v24.18.0, npm 11.16.0; Next.js 14.2.35.
- MySQL80 and MongoDB Windows services are running.
- Updated .env.local to use the owner's supplied local MySQL password. The MySQL server account/password itself was not changed. This file is excluded from Git.
- Generated a new local JWT signing secret.
- MySQL autocare_insight: existing database preserved; 6 users, 3,312 catalogue entries, 20 tables/views.
- MongoDB autocare_db: 3 existing repair reports retained, schema/indexes installed, dates normalized and MySQL report links updated.

## Repairs

1. Standalone importer and tests now load the same .env.local as Next.js; removed the teammate's hard-coded database password.
2. Added npm run doctor and npm run setup:db; replaced the broken PowerShell migration launcher.
3. Setup creates an empty database in the correct order, preserves populated databases, and does not run destructive DROP/ALTER classroom demonstrations.
4. MongoDB shell schema/seed content can now be initialized through the Node driver without incorrectly running a shell script directly with Node.
5. Fixed repeat CSV import for nullable unique-key columns. Removed 776 exact duplicate rows created by the first verification import; retained distinct imported records. A second setup inserted zero records for all three datasets, leaving 3,312 entries.
6. Replaced invalid seed password placeholders with bcrypt hashes; upgraded existing placeholder hashes. Removed universal password bypasses from the login route and legacy auth helper.
7. Fixed local HTTP cookie settings for login/logout when running next start.
8. Repair reports now store BSON dates matching the MongoDB validator. MongoDB clients omit undefined optional fields instead of serializing them as null; a live report-creation check caught this additional issue and a direct strict-schema insertion passed after correction. Monthly analytics handle BSON dates and legacy strings.
9. Report creation verifies the MySQL job and vehicle match; attempts to remove its newly inserted report if the SQL link write fails. This is compensation, not a distributed transaction.
10. Validation rejects fractional report IDs/health scores and malformed dates.
11. Installed the missing ESLint dependencies matching Next.js 14. Removed a duplicate role guard accidentally placed inside the SQL query list iterator, which blocked lint/build.
12. Added VIVA_GUIDE.md and VIVA_QUICK_REVISION.md with actual architecture, relationships, DBMS examples, demo steps and honest limitations.

## Checks

- npm run doctor: PASS for both database connections and populated data.
- npm run setup:db: PASS on this PC's existing database; repeated setup adds no duplicate catalogue rows.
- npm test: PASS, 31/31 existing tests, including live MySQL queries, MongoDB pipelines and vector search tests.
- npm run typecheck: PASS after dependencies finished installing. One intermediate attempt during installation could not find a type package; rerun passed.
- npm run lint: PASS with existing React effect dependency warnings.
- npm run build: PASS on the final source, including lint and TypeScript checks (existing hook warnings remain).
- npm run test:smoke: PASS, 83 checks against the running production app: all main page responses, authenticated data endpoints, all registered SQL queries and MongoDB pipelines, invalid-password rejection, three demo accounts, advisor/mechanic restrictions, login/logout and real report creation. The report check verified its BSON date and MySQL link; temporary records were cleaned up.
- App left running in production mode at http://localhost:3000.

## Practical limits

The fresh/empty database setup path was implemented but this PC already had a database, so the existing-database path was used. Existing tests partly check copied example logic and seed assumptions; passing them does not prove every UI action or concurrent workflow. Existing React effect dependency warnings remain to review. The project still has a teaching-oriented role switcher and is intended for local demonstration.

Use npm run dev for development, or npm run build then npm start for production mode. Stop the running server before rebuilding. Read VIVA_QUICK_REVISION.md first, then VIVA_GUIDE.md.

A double-click launcher is available: START_PROJECT.cmd. It checks database connections before starting development mode.

Additional browser review found and repaired API response-field mismatches: inventory now supplies the parts field used by the dashboard/jobs picker; catalogue supplies vehicles for catalogue/vehicle registration; report analytics supplies the live fields used by dashboard/report statistics; booking responses expose appointment_id for the success message. The smoke test now checks those UI data contracts. Final rebuild PASS; expanded 83-check HTTP rerun PASS. Browser admin login and dashboard verified: low-stock alert shows Engine Oil Filter (2 remaining), live fleet average is 88%, and subsystem findings are visible.

Final status: app running at http://localhost:3000. All 31 existing tests and 83 live smoke checks passed; build/type checking passed; lint has warnings only. No claim is made that every UI action or concurrent workflow has been exhaustively tested.

Dark mode added (12 November): bottom-right theme toggle, saved browser preference, system preference on first visit, early theme initialization and shared dark colors for panels/tables/forms. TypeScript passed; browser checks verified both themes and persistence after reload. App currently running with npm run dev at http://localhost:3000.

## Vehicle intake photo feature - 12 November 2026

Implemented optional intake images in the appointment form and a retained-photo gallery on every appointment row. Added authenticated binary-image endpoints and an additive appointment_intake_photos table. Existing workflow remains valid without images. Photos record original bytes, uploader, server timestamp, condition note and SHA-256. App uploads are append-only and locked after work starts; retries deduplicate identical bytes.

Verification completed:

- npm test: 41/41 PASS (31 existing tests plus 10 real-image/request validation tests).
- npm run test:intake:integration: 55 checks PASS against both the development app and a production-mode server. Includes JPEG/PNG/WebP, invalid/oversized/mixed batches, original-byte retrieval, deduplication, staff permissions, status locking and job-dispatch integration.
- All pre-existing SQL table contents matched their before-test snapshots after both integration runs and after the browser fixture cleanup. Only test-owned temporary records were removed.
- npm run test:smoke: 83 existing application checks PASS.
- Browser: file selection and preview PASS; forced first-upload failure PASS; retry made one booking request, two photo attempts, one saved appointment and one saved photo. Gallery loaded the original image and condition note with checksum/timestamp controls. Dark mode was active during this check.
- TypeScript PASS. Targeted lint PASS with the pre-existing appointment effect dependency warning. Production build PASS with pre-existing hook dependency warnings.
- Production output was isolated in .next-intake-build using the optional NEXT_BUILD_DIR setting so the running development app was not interrupted by build output. No .env file was changed for this feature.

The one-time additive migration has been applied on this PC. Future fresh setup includes it, or run npm run db:intake-photos on another existing installation. New usage/security details are in docs/INTAKE_PHOTOS.md; the viva guide also explains the new table. Camera capture is exposed for supported phone browsers; physical phone hardware was not tested.
