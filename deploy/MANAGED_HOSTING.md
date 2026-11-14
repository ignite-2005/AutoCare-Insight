# Managed cloud hosting

AutoCare needs an application host, native MySQL with stored routines/triggers,
and MongoDB. All three must run independently of the developer's PC.

## Deployment status

The Next.js 15.5.29 production build passed on Vercel Hobby / Node 22. Protected
cloud checks passed for the introduction, login, approved artwork and private
API authorization. A separate MongoDB Atlas M0 cluster has been provisioned.

**The complete public application is not released yet.** Cloud database access,
MySQL compatibility, migration and full workflow acceptance remain pending.
A successful web build does not establish database-backed functionality.

## Free service requirements

| Component | Route | Requirement |
| --- | --- | --- |
| Next.js + API | Vercel Hobby | Personal project; server-only production secrets |
| Relational data | Enzonic Free MySQL candidate | Verify actual Free plan, TLS, routines, views, transactions and triggers |
| Inspection documents | MongoDB Atlas M0 | Dedicated project and database-scoped runtime credentials |

References: [Vercel Hobby](https://vercel.com/docs/plans/hobby),
[Enzonic MySQL](https://enzonic.dev/databases/mysql/),
[Enzonic pricing](https://enzonic.dev/pricing/),
[Atlas Free](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/).
Do not enable paid tiers, payment-backed trials or automatic paid upgrades.
Free services can have idle startup delays and capacity limits.

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
session, preserving appointment and audit times across hosting regions.

## Deployment acceptance

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
