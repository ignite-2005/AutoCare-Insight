<p align="center">
  <img src="public/branding/autocare-cinematic.png" alt="AutoCare Insight — Service. Diagnose. Deliver." width="100%" />
</p>

<h1 align="center">AutoCare Insight</h1>
<p align="center"><strong>Vehicle service, connected.</strong><br />From the first handover to the final invoice.</p>
<p align="center"><a href="https://autocare-insight.vercel.app"><strong>Open live demo</strong></a> · <a href="#try-the-workspace">Try the workspace</a> · <a href="docs/README.md">Documentation</a> · <a href="https://github.com/ignite-2005/AutoCare-Insight/issues/new/choose">Share feedback</a></p>
<p align="center">
  <img alt="Next.js 15" src="https://img.shields.io/badge/Next.js-15-172524" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-376a55" />
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-8-376a55" />
</p>

AutoCare Insight brings appointments, workshop jobs, inspection findings, spare parts, and billing into a single role-based workspace. It is a working DBMS project built around a practical question: **how do you keep the whole service journey consistent when workshop data comes in different shapes?**

MySQL handles the transactional core. MongoDB stores variable inspection reports. The application connects the two through service jobs.

[Live website](https://autocare-insight.vercel.app) · [Application preview](#application-preview) · [Run locally](#run-locally) · [Free deployment](docs/DEPLOYMENT.md) · [Architecture](#architecture) · [Roadmap](#roadmap)

**Public cloud demo:** the application, MySQL and MongoDB run independently of the developer's PC. The current release includes the approved cinematic design and footer cleanup. It uses free hosting without student credits or a card-backed trial. The database may need time to wake after inactivity.

## Try the workspace

Open [autocare-insight.vercel.app/login](https://autocare-insight.vercel.app/login) and use a sample account:

| Role | Email | Password | Explore |
| --- | --- | --- | --- |
| Service advisor | `rajesh@autocare.com` | `password123` | Customers, vehicles, bookings, job assignment and billing |
| Mechanic | `suresh@autocare.com` | `password123` | Assigned job progress, inspection reports and stock visibility |
| Administrator | `admin@autocare.com` | `password123` | Full workspace and inventory management |

These are intentionally shared educational accounts. Use sample data; changes are visible to other visitors. To change roles, sign out and sign in with another account.

For a quick tour, open the dashboard, follow an appointment into a service job, inspect its report and invoice, then try **SQL Runner** and **MongoDB Aggregations**. Each account sees the actions allowed by its role. Payments are recorded in the application; no external payment processor is connected.

[Report a problem or suggest an improvement](https://github.com/ignite-2005/AutoCare-Insight/issues/new/choose). Include the page, account role, steps and expected result. Keep passwords, tokens and private customer information out of reports.

## Application preview

The approved interface combines a cinematic workshop introduction, a service journey that advances as you scroll, and a consistent workspace with distinct module accents. Stage buttons, dialogs and navigation provide motion feedback and respect the device's reduced-motion setting.

![Cinematic introduction with workshop artwork and workflow navigation](public/images/landing.jpg)

<table>
  <tr>
    <td width="50%"><img src="public/images/dashboard.jpg" alt="Workshop dashboard in dark mode" /><br /><strong>Workshop overview · dark</strong></td>
    <td width="50%"><img src="public/images/dashboard-light.jpg" alt="Workshop dashboard in light mode" /><br /><strong>Workshop overview · light</strong></td>
  </tr>
</table>

![Scroll-linked service journey with chapter controls and image transitions](public/images/service-journey.jpg)

These are captures of the working interface. The public release has passed cloud sign-in, role checks, booking/rescheduling, photo upload, job assignment, inspection reports, stock deductions, concurrent invoice creation and recorded payments. [Deployment details](deploy/MANAGED_HOSTING.md).

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

Mechanics update jobs assigned to them and author the corresponding inspection reports. Administrators and advisors handle assignment; inventory changes require administrator access. Intake photos lock once workshop work starts, and repeated uploads skip identical image bytes.

## Architecture

```mermaid
flowchart TD
    Visitor[Public product introduction] --> Login[Authenticated workspace]
    subgraph Vercel[Vercel Hobby]
      Login --> API[Next.js route handlers + role authorization]
    end
    API --> SQL[(Enzonic MySQL: bookings, jobs, photos, parts, invoices)]
    API --> Docs[(MongoDB Atlas: inspection reports)]
    SQL <-->|Service job / report reference| Docs
```

- **Next.js 15 / React 18 / TypeScript:** public introduction, operations workspace, and API routes.
- **MySQL 8:** relational integrity, transactions, stored procedures, views, and stock triggers.
- **MongoDB:** validated repair documents and aggregation pipelines.
- **Diagnostic search:** an in-process 64-dimensional encoder and cosine ranking. This is a lightweight similarity feature, not a trained predictive maintenance model.
- **Intake photos:** authenticated access, image decoding validation, and database storage. [Details](docs/INTAKE_PHOTOS.md).

## Run locally

Requirements: Node.js 22, MySQL 8, and MongoDB 8 running locally. MySQL needs stored routines, triggers and views; local setup needs permission to initialize its own database.

```powershell
git clone https://github.com/ignite-2005/AutoCare-Insight.git
cd AutoCare-Insight
npm ci
Copy-Item .env.example .env.local
# Edit .env.local with your local database credentials and a random JWT_SECRET.
npm run doctor
npm run setup:db
npm run dev
```

Open **http://localhost:3000**. The introduction is public; the workspace requires a seeded or existing account. Evaluation credentials and the walkthrough are in [VIVA_GUIDE.md](VIVA_GUIDE.md). The shared hosted demo intentionally uses sample accounts; use separate credentials and databases before handling private workshop records.

`setup:db` preserves existing tables and records. Do not run the historical `01_create_database.sql` against an existing database: it drops the database.

## Verification

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The complete test runner includes live MySQL and MongoDB checks. Start both services and configure `.env.local` first. The release checkpoint passed **58 tests**, TypeScript and the Vercel production build. Lint completes with existing hook-dependency warnings. Seed-dependent tests expect the bundled sample data.

Cloud acceptance covered three role logins and the booking → photos → job → inspection → parts → invoice → payment-record workflow, including concurrent invoices. Temporary test records were removed. See the [verification report](docs/TEST_VERIFICATION_REPORT.md), [local verification](LOCAL_VERIFICATION.md) and [presentation review](docs/presentation/REVIEW.md) for scope and limitations.

## Free deployment

The live application uses **Vercel Hobby**, **Enzonic Free native MySQL**, and **MongoDB Atlas M0**. Both databases are hosted independently of the developer's PC. MySQL stored routines and triggers remain intact. No paid plan, student credit or card-backed trial was used.

The tested production build is public at [autocare-insight.vercel.app](https://autocare-insight.vercel.app). Backup recovery, database migration, the cloud workshop workflow and anonymous public access were verified before release. Free tiers have capacity limits and can pause idle databases. [Managed hosting guide](deploy/MANAGED_HOSTING.md) · [Deployment and Docker guide](docs/DEPLOYMENT.md).

The existing Vercel project is connected to this GitHub repository. `master` is
the production branch; other branches are disabled in `vercel.json`. Git pushes
use the hosting project's existing secrets and domain. No deploy hook or paid
GitHub Actions deployment service is required.

## Roadmap

These are proposed improvements, not completed features:

- [ ] A staff-facing maintenance reminder queue with configurable rules and delivery preferences; the database already has a basic interval-reminder trigger.
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

[Documentation index](docs/README.md) · [Project report](docs/PROJECT_REPORT.md) · [PDF report](docs/AutoCare_Insight_Project_Report.pdf) · [Data dictionary](database/DATA_DICTIONARY.md) · [ER model](database/ER_DIAGRAM.md) · [Advanced SQL](database/advanced/README.md) · [Viva guide](VIVA_GUIDE.md) · [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md)

Developed for the DBMS Experiential Learning Level 3 project at PES University. Presentation structure inspired by [SakuraMind](https://github.com/ignite-2005/SakuraMind): branded introduction, actual application previews, clear architecture, and honest deployment limitations.
