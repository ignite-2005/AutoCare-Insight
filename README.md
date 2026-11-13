<p align="center">
  <img src="public/branding/autocare-banner.png" alt="AutoCare Insight — Service. Diagnose. Deliver." width="100%" />
</p>

<h1 align="center">AutoCare Insight</h1>
<p align="center"><strong>Vehicle service, connected.</strong><br />From the first handover to the final invoice.</p>
<p align="center">
  <img alt="Next.js 14" src="https://img.shields.io/badge/Next.js-14-172524" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-376a55" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-8-376a55" />
</p>

AutoCare Insight brings appointments, workshop jobs, inspection findings, spare parts, and billing into a single role-based workspace. It is a working DBMS project built around a practical question: **how do you keep the whole service journey consistent when workshop data comes in different shapes?**

MySQL handles the transactional core. MongoDB stores variable inspection reports. The application connects the two through service jobs.

[Application preview](#application-preview) · [Run locally](#run-locally) · [Free deployment](docs/DEPLOYMENT.md) · [Architecture](#architecture) · [Roadmap](#roadmap)

## Application preview

### A first impression with a purpose

![Public introduction](public/images/landing.jpg)

A public introduction explains the service journey and offers a clear entry into the authenticated workspace.

### Workshop operations at a glance

![Operations dashboard](public/images/dashboard.jpg)

See service activity, upcoming appointments, parts below reorder level, and aggregated inspection health. Screenshots show the running application using local sample records; values are snapshots, not production activity.

### Keep the work moving

![Workshop jobs](public/images/jobs.jpg)

Track assigned work, follow job progress, and allocate parts. Database triggers keep inventory deductions connected to recorded usage.

### Findings that keep their context

![Repair reports](public/images/reports.jpg)

Store inspection findings, diagnostic trouble codes, and health scores without forcing every vehicle's report into identical columns.

## The service journey

| Stage | What you can do |
| --- | --- |
| Intake | Book appointments, record complaints, attach validated intake photos |
| Workshop | Assign mechanics, update job status, allocate replacement parts |
| Inspection | Record findings and DTCs, inspect fleet health, search diagnostic history |
| Settlement | Generate service invoices and record payments |
| Oversight | Manage customers, registered vehicles, stock and vehicle catalogue comparisons |
| Database lab | Explore a curated SQL query registry and MongoDB aggregation pipelines |

Accounts use server-verified passwords and HTTP-only session cookies. Administrators, service advisors, and mechanics receive different permissions. Roles are tied to the authenticated session; there is no public role-switching shortcut.

## Architecture

```mermaid
flowchart TD
    Visitor[Public product introduction] --> Login[Authenticated workspace]
    Login --> API[Next.js route handlers + role authorization]
    API --> SQL[(MySQL: bookings, jobs, parts, invoices)]
    API --> Docs[(MongoDB: inspection reports)]
    SQL <-->|Service job / report reference| Docs
```

- **Next.js 14 / React 18 / TypeScript:** public introduction, operations workspace, and API routes.
- **MySQL 8:** relational integrity, transactions, stored procedures, views, and stock triggers.
- **MongoDB:** validated repair documents and aggregation pipelines.
- **Diagnostic search:** an in-process 64-dimensional encoder and cosine ranking. This is a lightweight similarity feature, not a trained predictive maintenance model.
- **Intake photos:** authenticated access, image decoding validation, and database storage. [Details](docs/INTAKE_PHOTOS.md).

## Run locally

Requirements: Node.js 22, MySQL 8, and MongoDB 8 running locally.

```powershell
npm ci
Copy-Item .env.example .env.local
# Edit .env.local with your local database credentials and a random JWT_SECRET.
npm run doctor
npm run setup:db
npm run dev
```

Open **http://localhost:3000**. The introduction is public; the workspace requires a seeded or existing account. Local evaluation credentials and the walkthrough are in [VIVA_GUIDE.md](VIVA_GUIDE.md). Do not reuse evaluation passwords on an unrestricted public installation.

`setup:db` preserves existing tables and records. Do not run the historical `01_create_database.sql` against an existing database: it drops the database.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The complete test runner includes live MySQL and MongoDB checks. Start both services and configure `.env.local` first. See [local verification](LOCAL_VERIFICATION.md) and [presentation evidence](docs/presentation/REVIEW.md) for the scope and limitations of the checks.

## Free deployment

**No paid services or card verification are required for the local public demo route.** A production Next.js process runs on your computer and Cloudflare Quick Tunnel provides a temporary HTTPS address. Your PC, databases, application and tunnel must remain running. This is a shareable demonstration, not permanent cloud hosting.

[Deployment guide](docs/DEPLOYMENT.md) includes this route and a Docker Compose package for moving the complete stack to a server later. No live URL is claimed until external verification succeeds.

## Roadmap

These are proposed improvements, not completed features:

- [ ] Maintenance reminders derived from service dates and mileage, with explicit rules.
- [ ] Customer-facing service timeline with permission-scoped photo access.
- [ ] Per-bay workload planning and technician availability.
- [ ] Inventory reorder suggestions based on recorded usage.
- [ ] Measured diagnostic retrieval quality using a labelled evaluation set.
- [ ] Automated backups and restore drills before persistent public operation.

## Project map

| Location | Purpose |
| --- | --- |
| `src/app` | Pages and API routes |
| `src/components` | Layout, theme, forms, and intake photo UI |
| `src/lib/db` | Database access, query registry, and transactions |
| `database` | Relational schema, sample records, and advanced SQL |
| `scripts` | Local diagnostics, setup, and checks |
| `public/branding`, `public/images` | Original banner and real application screenshots |
| `compose.yaml`, `deploy` | Full-stack container deployment |
| `tests` | Authentication, validation, integration, and database checks |

[Project report](docs/PROJECT_REPORT.md) · [Data dictionary](database/DATA_DICTIONARY.md) · [ER model](database/ER_DIAGRAM.md) · [Advanced SQL](database/advanced/README.md) · [Viva guide](VIVA_GUIDE.md)

Developed for the DBMS Experiential Learning Level 3 project at PES University. Presentation structure inspired by [SakuraMind](https://github.com/ignite-2005/SakuraMind): branded introduction, actual application previews, clear architecture, and honest deployment limitations.
