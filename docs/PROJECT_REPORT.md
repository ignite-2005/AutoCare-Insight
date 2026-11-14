# AutoCare Insight: Vehicle Service Management and Diagnostic Search

## DBMS Experiential Learning - Level 3 Project Report

**Department:** Computer Science and Engineering, PES University, Bengaluru<br />
**Course:** Database Management Systems<br />
**Academic year:** 2025-2026<br />
**Updated:** 14 November 2026<br />
**Live demonstration:** [autocare-insight.vercel.app](https://autocare-insight.vercel.app)

## 1. Overview

AutoCare Insight is an educational workshop management application. It connects
customer registration, vehicle records, appointments, intake photographs,
mechanic assignments, inspection reports, spare parts, invoices and payment
records. The same service job connects the transactional and inspection sides
of the system.

The application demonstrates a practical use of two database models. MySQL
stores related business entities and enforces relational constraints. MongoDB
stores inspection documents whose nested findings can differ between vehicles.
Next.js provides the React interface and server-side route handlers.

The public release is a shared sample-data demonstration, hosted independently
of the developer's PC. It is not a private installation for real customer data.

## 2. Goals and delivered workflows

| Area | Implemented behaviour |
| --- | --- |
| Customer and vehicle records | Register customers, connect individual vehicles to catalogue specifications, and inspect service history |
| Intake | Book, confirm, reschedule and cancel appointments; attach validated condition photos |
| Workshop | Create jobs, assign mechanics, update job status, and allocate parts |
| Inspection | Create and view MongoDB reports linked to the corresponding MySQL job |
| Inventory | View stock, identify low-stock items, and administer parts |
| Billing | Generate invoices from completed work and record payments against their balances |
| Database lab | Execute 20 registered SQL queries and seven MongoDB aggregation pipelines |
| Diagnostic retrieval | Rank knowledge-base entries and repair reports using custom text vectors |

Payment records demonstrate billing state changes. No bank, card or UPI payment
processor is connected. Diagnostic similarity is a heuristic retrieval feature;
its score is not a measured probability of a diagnosis or a future breakdown.

## 3. Architecture and technology

The public introduction leads to sign-in and the workshop workspace. Browser
requests reach Next.js route handlers. Each protected handler verifies a signed
session, checks the account's permissions, validates input and accesses the
appropriate database.

| Layer | Implementation |
| --- | --- |
| Application host | Vercel Hobby, Node.js 22 |
| Web framework | Next.js 15.5.29 App Router |
| Interface | React 18, TypeScript, Tailwind CSS and Motion |
| Relational store | Native MySQL 8.4 on Enzonic Free; local setup supports MySQL 8 |
| Document store | MongoDB 8 on Atlas M0; native MongoDB driver |
| Authentication | bcrypt password verification and signed JWT sessions in HTTP-only cookies |
| Database access | mysql2/promise pools, parameterized SQL and MongoDB native operations |

Both hosted databases use authenticated, verified TLS connections. Runtime
secrets are stored in the hosting provider's environment configuration and are
excluded from source control. Details are in [Managed hosting](../deploy/MANAGED_HOSTING.md).

## 4. Relational design

The verified release contains 15 MySQL base tables. The original 13 business
tables are extended by an inventory audit table and appointment photo storage.

| Group | Tables |
| --- | --- |
| Staff and customers | users, customers |
| Vehicles | vehicle_catalogue, customer_vehicles |
| Service operations | service_types, appointments, service_jobs, job_services |
| Parts and stock | spare_parts, part_usage, spare_parts_audit |
| Billing | invoices, invoice_payments |
| Preventive maintenance | maintenance_reminders |
| Intake media | appointment_intake_photos |

A customer owns vehicles; a vehicle can have multiple appointments and service
jobs. A job can contain several services and parts. The job_services and
part_usage junction tables express these relationships and preserve charged
prices. An invoice can receive several partial payment records.

Primary and foreign keys establish relational identity and references. Views
support summaries and stock visibility. The verified cloud schema includes six
views, seven routines (five procedures and two functions), and five triggers.
See the [data dictionary](../database/DATA_DICTIONARY.md) and
[ER model](../database/ER_DIAGRAM.md) for detailed fields and relationships.

## 5. Routines, triggers and transaction boundaries

- sp_book_appointment checks booking rules and returns an appointment identifier.
- sp_generate_invoice calculates service and part charges, discount, tax and
  total inside its own transaction. The application leases one connection for
  the procedure, its OUT variables and the resulting invoice read.
- sp_get_customer_vehicle_history exposes the history of a customer's vehicles.
- fn_invoice_total_paid supports balance calculations.
- fn_days_since_last_service exposes a date-based service interval.
- Stock triggers deduct quantities on part usage and restore them when usage is
  removed. An additional trigger records inventory changes in spare_parts_audit.
- A job-completion trigger can create a basic oil-change reminder at 90 days and
  3,000 km when no matching active unsent reminder exists. This is an explicit
  database rule, not a learned prediction or a reminder-delivery service.
- Payment insertion can mark an invoice paid when the recorded total reaches
  the invoice amount.

SQL transactions protect operations within MySQL. MySQL and MongoDB do not
share an atomic transaction or cross-server foreign key. Report creation checks
the job/vehicle relationship, inserts the document and updates the MySQL report
reference. If the SQL update fails, the handler attempts to remove its inserted
document as compensation.

## 6. MongoDB inspection documents

The repair_reports collection contains job, vehicle and mechanic identifiers,
a creation date, inspection/repair summaries, findings, parts information and an
optional overall health score. Nested findings can differ between inspections.
Collection validation constrains supported types and values.

The application uses job_id to find related documents. The service_jobs row
stores the report's MongoDB identifier in mongo_report_id. MongoDB indexes
support job/vehicle lookups, dates and text search. Migration retained the
original identifiers, five indexes and collection validation options.

Seven registered aggregation pipelines demonstrate document analytics. The
server executes registered definitions with validated inputs; the interface
does not expose arbitrary user-supplied database code.

## 7. Authentication and permissions

Passwords are checked against bcrypt hashes. The server signs a session using a
configured secret and sends an HTTP-only cookie. Production rejects missing,
short or known example signing keys. Cookie-authenticated requests and bearer
sessions are verified before permission checks.

| Role | Main permissions |
| --- | --- |
| Administrator | Full application operations, including inventory administration |
| Service advisor | Customer/vehicle management, booking, job assignment, invoices and payment records; report and stock viewing |
| Mechanic | View operational information, update assigned jobs and author reports for those jobs; inventory viewing |

Mechanics cannot claim unassigned jobs or reassign mechanics. Changing roles
requires signing out and signing in to another account. A visible control or a
client-provided role does not grant server permissions.

The public demo intentionally uses the sample accounts documented in the
[README](../README.md). These accounts and the sample records are shared.

## 8. Intake photographs and presentation

Intake photos are optional. Users can select up to six images, with a 3 MB
per-file limit and 12 MB selection limit. The client sends one image per request
to fit the hosting platform's request-size limit. A partial upload can be retried
without creating another appointment; identical bytes are deduplicated.

The server checks image type, filename, actual decoding and decoded pixel limits.
Original bytes, SHA-256, uploader, timestamp and a condition note are stored in
MySQL. Authenticated image endpoints serve the gallery. Uploads lock after work
starts or the appointment closes. See [Intake photos](INTAKE_PHOTOS.md).

The approved interface uses a cinematic workshop hero, scroll-linked framing,
a pinned four-stage service story, chapter buttons and shared interaction
feedback. The workspace supports dark/light themes and distinct module accents.
Device reduced-motion settings apply automatically; the footer no longer has a
manual Reduce motion control. Approved screenshots are in the [overview](../README.md).

## 9. Diagnostic retrieval

The diagnostic helper builds custom normalized 64-dimensional text vectors and
ranks them by cosine similarity. It combines curated knowledge-base entries
with records extracted from MongoDB reports. It runs in process and does not
require a paid model API or a separate inference server.

The implementation has no trained neural model, measured diagnostic-accuracy
claim or failure-prediction guarantee. Evaluation with a labelled dataset is a
future improvement.

## 10. Deployment and migration

The live application uses Vercel Hobby, Enzonic Free MySQL and MongoDB Atlas M0.
It remains reachable when the developer's PC is switched off. No paid plan,
student credit or card-backed trial was used for this release.

Before migration, private exports were checksum-checked and restored into
isolated containers. The verified MySQL baseline contained 3,383 rows, including
3,312 catalogue entries; MongoDB contained three reports. These are migration
checkpoint counts, not permanent counts for the shared mutable demo.

Cloud acceptance preserved routines, triggers, views, report IDs, indexes and
validators. Temporary migration privileges were removed from Atlas. Runtime
accounts are scoped to the application's database; the MySQL account does not
have global administration or user-management privileges. Backups and raw
acceptance evidence remain outside Git.

Free services have quotas and can introduce idle startup delays. The MySQL
connection timeout is bounded at 30 seconds to allow more time for startup.
Continuous uptime and recovery from every provider outage are not guaranteed.

## 11. Verification checkpoint

The 14 November 2026 checkpoint passed 58 automated tests, TypeScript and the
production build. Lint completes with existing hook-dependency warnings.

The cloud workshop acceptance covered three role logins, permissions, booking
and rescheduling time preservation, a 5.4 MB photo selection sent in separate
requests, image privacy/deduplication/locking, job assignment, parts and stock
triggers, a linked inspection report, concurrent invoices and payment records.
Temporary records and their audit rows were removed; the restored sample-data
baseline then matched the original source.

Fresh public checks verified the production URL without a Vercel bypass,
including assets, optimized artwork, sign-in and database reads. The footer
cleanup was separately checked in staged and public HTML. See the
[verification report](TEST_VERIFICATION_REPORT.md) for the scope and limitations.

## 12. Local setup and study

Use Node.js 22 with local MySQL 8 and MongoDB 8. Clone the repository, install
locked dependencies and configure a private local environment:

```powershell
git clone https://github.com/ignite-2005/AutoCare-Insight.git
cd AutoCare-Insight
npm ci
Copy-Item .env.example .env.local
# Set your local database credentials and generate a random JWT_SECRET.
npm run setup:db
npm run doctor
npm run dev
```

The supported setup command initializes the bundled schema and preserves
existing data. It stops on an incomplete existing installation for inspection.
Do not run database/01_create_database.sql against records to keep: it drops the
database. Classroom ALTER/DROP examples are separate demonstrations.

Read the [local guide](../LOCAL_VERIFICATION.md) and [viva guide](../VIVA_GUIDE.md)
for configuration, troubleshooting and a walkthrough.

## 13. Limitations and proposed work

The release is an educational shared demo. Sample passwords, seed-dependent
tests, cross-database compensation and incomplete concurrency coverage require
further work before handling private workshop records. Payment settlement is
record keeping; diagnostic retrieval has no validated diagnostic-accuracy claim.

Proposed work includes a configurable staff reminder queue and delivery,
a customer-facing service timeline, bay planning, stock reorder suggestions,
measured retrieval evaluation, and automated backup/restore schedules. These
items are tracked as proposals in the [README roadmap](../README.md#roadmap).
