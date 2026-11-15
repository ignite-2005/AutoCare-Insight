# Managed cloud hosting

AutoCare needs an application host, native MySQL with stored routines/triggers,
and MongoDB. All three must run independently of the developer's PC.

## Deployment status

**Live:** [autocare-insight.vercel.app](https://autocare-insight.vercel.app).
Released on 14 November 2026 from application commit `7dff13d` using Next.js
15.5.29 / Node 22. The tested production build was promoted without rebuilding.

Follow-up `ec441d5` raises the MySQL connection timeout from the driver's
10-second default to a bounded 30 seconds. A later availability check observed
one connection timeout after a long idle period, followed by successful sign-in.
The longer wait gives the hosted database more time to wake without replaying
SQL statements or changing credentials, TLS requirements or database records.
The follow-up passed all 58 tests and TypeScript, then fresh staged and public
checks for sign-in, the workspace pages and all main module read APIs. The
check included an idle interval; provider status remained active, so it does
not establish recovery from every possible suspended-provider condition.

The interface follow-up `00f2025` removes the footer's manual motion option.
TypeScript, the production build and staged/public footer checks passed. Device
reduced-motion settings continue to apply automatically.

The application and both databases run in cloud services. No PC tunnel, paid
plan, student credit or card-backed trial is required for this deployment.
This is a shared educational demo with sample accounts and mutable sample data.

Release checks passed for three demo roles, server-side permission boundaries,
all workspace pages, SQL/MongoDB analytics and diagnostic search. A temporary
customer/vehicle completed booking and rescheduling, a 5.4 MB photo selection
sent as separate uploads, protected image retrieval, job assignment, stock
deduction, MongoDB inspection, concurrent invoices and recorded payments.
Mechanics cannot claim unassigned jobs or reassign mechanics.

Test records, images, reports and their inventory audit rows were removed.
Post-test verification matched all 3,383 MySQL rows and all three MongoDB reports
to the unchanged local source. Backup recovery had passed before migration.
The final public URL was checked without Vercel authentication or an automation
bypass: homepage, login, 12 JavaScript/CSS assets, optimized hero image, demo
sign-in and database-backed reads passed. Anonymous private APIs returned 401.

## Free service requirements

| Component | Route | Requirement |
| --- | --- | --- |
| Next.js + API | Vercel Hobby | Personal project; server-only production secrets |
| Relational data | Enzonic Free native MySQL 8.4 | Free plan, verified TLS, routines, views, transactions and triggers |
| Inspection documents | MongoDB Atlas M0 | Dedicated project and database-scoped runtime credentials |

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby),
[Enzonic MySQL](https://enzonic.dev/databases/mysql/),
[Enzonic pricing](https://enzonic.dev/pricing/),
[Atlas Free](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).
Do not enable paid tiers, payment-backed trials or automatic paid upgrades.
Free services can have idle startup delays and capacity limits. Enzonic can
pause an idle database; the next connection wakes it. These free plans do not
provide an unlimited-capacity or continuous-uptime guarantee.

## Database migration

1. Export both source databases privately, record checksums, and preserve SQL
   routines/triggers/views plus MongoDB validators and complete index metadata.
2. Verify recovery on an isolated copy. Keep source records, credentials and
   volumes intact.
3. Confirm the cloud resource's identity, free plan and empty destination.
   Check MySQL version, certificate/hostname verification and required privileges.
4. If the provider assigns a schema such as main, adapt only the destination
   import and application configuration. The local setup tool intentionally
   supports autocare_insight; do not use it against another existing database.
5. Preserve MongoDB document IDs so relational report references remain valid.
   Restore full text-index options, including fields, weights and language.
6. Grant runtime access only to AutoCare's database and remove temporary
   provisioning access after acceptance. Atlas uses a separate readWrite runtime
   account; its temporary provisioning account has been removed. Enzonic's extra
   user endpoint did not assign usable grants, so its server-side application
   credential is the provider's account restricted to the main schema. That
   account has no global administration, user management or grant-option rights.

Atlas's network policy must permit the application host. Vercel Hobby uses
changing outbound addresses. Review that policy for the new application project;
do not alter unrelated projects or disable certificate verification.

For this shared demo, the dedicated AutoCare Atlas project permits 0.0.0.0/0
to accommodate that changing egress. Its login endpoint is internet-accessible;
data access still requires TLS and the database-scoped credentials. This rule
does not apply to the owner's other Atlas projects.

## Production configuration

Set these in the hosting provider's secret manager, never in source:

- MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE.
- MYSQL_SSL=true; optional MYSQL_SSL_CA and MYSQL_CONNECTION_LIMIT.
- MYSQL_TIMEZONE=+05:30 for the Indian workshop; local preserves a local install.
- MONGODB_URI and MONGODB_DB_NAME.
- A new random JWT_SECRET.

The shared MySQL TLS helper checks the certificate chain and hostname and
requires TLS 1.2 or later. It accepts PEM CA text with real or escaped newlines.
There is no insecure-certificate bypass or automatic plaintext fallback.
Keep database secrets out of preview environments and all NEXT_PUBLIC variables.
MongoDB connects lazily, shares in-flight connections and recovers after failure.
The configured MySQL clock applies to both driver date decoding and every pool
session. Browser appointment inputs send explicit instants, and SQL parameters
use Date objects, preserving booking, rescheduling and audit times across
hosting regions.

## Deployment acceptance

### Git deployment configuration

The repository includes `vercel.json` with automatic deployments enabled for
`master` and disabled for other branches. Vercel bot comments are silenced.
Production database secrets remain in the existing Vercel project; they are not
copied to GitHub or preview environments.

The existing `autocare-insight` Vercel project is connected to
`ignite-2005/AutoCare-Insight`, with `master` as its production branch. Pushes
to that branch are configured to create production deployments using the
project's existing environment variables and domain.

The Git settings for pull-request/commit comments, `deployment_status` events
and `repository_dispatch` events control GitHub reporting and integrations;
they do not need to be enabled to deploy pushes. In particular, the API field
`gitProviderOptions.createDeployments` controls GitHub deployment events, not
Vercel build creation. See the
[Vercel provider reference](https://github.com/vercel/terraform-provider-vercel/blob/main/docs/resources/project.md#nested-schema-for-git_provider_options).

No deploy hook is needed for ordinary Git pushes. After a push, verify that
Vercel creates a deployment with source `git`, branch `master` and the expected
commit SHA, then confirm its production build succeeds and the public URL works.
The whitelist source packager below remains available for manual CLI releases.

### Build and release checks

The source packager at scripts/prepare-vercel-source.ps1 creates a fresh ignored
upload directory from an explicit app/config/public whitelist and records a
SHA-256 manifest separately. Env files, databases, tools, backups and private
review evidence are excluded.

Verify the hosting account, project, environment and reviewed source. Build a
staged production deployment without assigning its domain, then verify:

- Introduction, approved artwork, responsive layout and reduced motion.
- Successful sign-in and server-enforced role permissions.
- Customer/vehicle history, bookings, jobs, reports and the catalogue.
- Inventory, invoice generation and payments using isolated test data.
- MongoDB aggregation and diagnostic search with restored indexes.
- Image validation, authorized photo access and private API rejection.

Promote after the complete workflow passes using cloud databases. Test the final
URL anonymously and confirm it has no dependency on localhost or a PC tunnel.
Keep private backup/restore evidence out of Git.

## Runtime maintenance

Next.js is pinned to 15.5.29, with PostCSS 8.5.32 overridden for Next.js.
The production-only dependency audit reported zero findings at the verification
checkpoint. Existing development-tool findings and hook warnings are separate;
this is not a claim of a complete security audit. Do not restart superseded
Windows builds affected by [CVE-2026-75604](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).
