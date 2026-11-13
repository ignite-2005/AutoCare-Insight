# AutoCare Insight - simple project explanation and viva guide

## Read this first

This is a vehicle workshop management application. It helps staff register customers and vehicles, book service appointments, assign mechanics, record repairs, track spare parts, create invoices and record payments.

If you have only one hour: read sections 1, 3, 4, 6, 8 and 10, then practise the demo in section 9.

## 1. A 60-second introduction you can say

"Our project is AutoCare Insight, a vehicle service management system. It covers the workflow from customer registration and appointment booking to service jobs, inspection reports, spare parts and billing. We use Next.js and React for the interface and Next.js API routes for the backend. MySQL stores structured transactional information, such as customers, invoices and inventory. MongoDB stores flexible inspection reports with different findings for different vehicles. The project demonstrates relationships, constraints, joins, views, stored procedures, functions, triggers and transactions. It also includes predefined SQL and MongoDB analytics and a custom diagnostic similarity search."

Be honest about your own contribution. Explain the system you have studied; do not claim you personally implemented features you did not write.

## 2. Running it on this PC

Open PowerShell in this project folder. You need the MySQL80 and MongoDB Windows services running.

```powershell
npm run doctor
npm run setup:db
npm run dev
```

Open http://localhost:3000. If port 3000 is occupied, read the URL printed by Next.js. To choose another port: `npm run dev -- -p 3001`.

- `.env.local` holds your MySQL host, port, username and password, MongoDB connection and JWT signing secret. Do not share this file.
- Set `MYSQL_PASSWORD` to YOUR installed MySQL account password. This is different from the website login password. Changing the file does not change MySQL's own password.
- The supported bundled SQL database is `autocare_insight`; MongoDB defaults to `autocare_db`.
- `npm run setup:db` creates a missing/empty database, seeds examples, imports the included CSV files, prepares MongoDB and connects report IDs to jobs. It preserves existing tables and reports. If an existing schema is incomplete it stops for inspection; it does not erase it.
- Run setup once; on later days normally just use `npm run doctor`, then `npm run dev`.
- `npm run typecheck` checks TypeScript; `npm test` runs the existing test suite; `npm run build` builds the app. After a successful build, `npm start` serves it.
- Stop the app with Ctrl+C. Do not run development and production builds against the same `.next` directory at the same time.

Website demo accounts (after setup upgrades seed placeholder hashes):

| Role            | Email               | Password    |
| --------------- | ------------------- | ----------- |
| Admin           | admin@autocare.com  | password123 |
| Service advisor | rajesh@autocare.com | password123 |
| Mechanic        | suresh@autocare.com | password123 |

Other seeded users are Priya (advisor), Anjali and Vikram (mechanics). To switch roles in the visible interface, click Log Out and sign in with another seeded account. The auth context also retains a demo-role switching helper. These seeded accounts are intended for an academic demonstration.

Troubleshooting:

| Symptom                    | What to check                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| ER_ACCESS_DENIED_ERROR     | MYSQL_USER and MYSQL_PASSWORD in .env.local; verify the same account in Workbench           |
| ECONNREFUSED               | Start the corresponding Windows database service; check host/port                           |
| Unknown database or table  | Run setup; if it reports a partial database, inspect/back up it before repairing            |
| Website cannot log in      | Run setup to replace invalid seed password placeholders; restart Next.js after changing env |
| MongoDB timeout            | Check MongoDB service and MONGODB_URI; 127.0.0.1 avoids localhost IPv6 ambiguity            |
| Port already in use        | Use the port printed in the terminal or choose -p 3001                                      |
| Browser shows stale errors | Restart server, refresh page, log in again                                                  |

Do not run `database/01_create_database.sql` on data you want to keep: it contains DROP DATABASE. Do not blindly run the old README's manual setup commands; use the setup command above. `database/06_mongodb_schema.js` is a MongoDB shell script, not a standalone Node script. The new setup command executes its schema and seed content using the MongoDB Node driver.

## 3. Architecture and request flow

```text
Browser: React page and forms
    -> HTTP request using fetch('/api/...')
    -> Next.js route handler under src/app/api
    -> verify JWT session and check role permissions
    -> validate input
    -> mysql2 parameterized SQL / MongoDB driver
    -> JSON response
    -> React updates the page
```

This is one full-stack Next.js application, not a separate Express server. The frontend should not connect directly to either database. Database passwords stay in server environment variables. Variables starting NEXT_PUBLIC_ can reach the browser, so never use that prefix for a secret.

Example: allocating a spare part sends a request to `/api/jobs/[id]/parts`. The backend verifies authorization and inputs and writes a part_usage record. A MySQL trigger deducts stock. The page then refreshes the displayed job/parts data. Read that route and the stock trigger together for a strong viva example.

Important files:

| File/folder                         | Purpose                                                              |
| ----------------------------------- | -------------------------------------------------------------------- |
| package.json                        | Commands and dependencies                                            |
| src/app/layout.tsx                  | Root layout and providers                                            |
| src/components/layout/AppLayout.tsx | Sidebar/navigation and role-aware layout                             |
| src/lib/context/AuthContext.tsx     | Browser login state and demo role switching                          |
| src/app/api/auth/login/route.ts     | Login, password verification, JWT cookie                             |
| src/lib/auth/session.ts             | JWT creation/verification and login rate limiter                     |
| src/lib/auth/rbac.ts                | Role permissions and authorization                                   |
| src/lib/db/mysql.ts                 | MySQL connection pool, queries and error mapping                     |
| src/lib/db/mongodb.ts               | Shared MongoDB client and report collection                          |
| src/lib/db/transaction.ts           | Transaction helper                                                   |
| src/lib/db/query-registry.ts        | Approved educational SQL queries                                     |
| src/lib/db/mongodb-aggregations.ts  | Approved MongoDB pipelines                                           |
| src/lib/vector-search.ts            | Custom 64-dimensional diagnostic search                              |
| src/lib/validation/repair-report.ts | Report input validation                                              |
| src/types/index.ts                  | TypeScript domain interfaces                                         |
| database/02_create_tables.sql       | Actual relational table definitions                                  |
| database/03_advanced_features.sql   | Core views, routines, triggers and indexes                           |
| database/05_sample_data.sql         | Example workshop data                                                |
| database/advanced                   | Additional views, procedures, audit trigger and transaction examples |
| vehicle_management                  | Original CSV datasets used by importer                               |
| scripts/setup-db.js                 | Local database preparation                                           |
| scripts/doctor.js                   | Live connection/data checks                                          |

There are older parallel helper files such as `src/lib/auth.ts`, `src/lib/db.ts` and `src/lib/mongodb.ts`. Follow imports from the actual API routes when explaining active behaviour; similar filenames do not mean all helpers are used.

## 4. MySQL tables: what each stores

The core schema contains 13 tables. The advanced trigger demo adds `spare_parts_audit`.

| Table                 | Meaning                                       | Main key / relationship                                  |
| --------------------- | --------------------------------------------- | -------------------------------------------------------- |
| users                 | Workshop staff and login hashes               | user_id; roles admin/service_advisor/mechanic            |
| customers             | Customer contact details                      | customer_id                                              |
| vehicle_catalogue     | Model specifications from CSVs                | catalogue_id                                             |
| customer_vehicles     | Actual individual vehicles owned by customers | vehicle_id; customer_id and optional catalogue_id        |
| service_types         | Available services and base pricing           | service_type_id                                          |
| appointments          | Scheduled visits                              | appointment_id; customer, vehicle, advisor, service type |
| service_jobs          | Actual workshop work                          | job_id; vehicle, mechanic, optional appointment          |
| job_services          | Services performed on each job                | joins jobs to service types                              |
| spare_parts           | Stock and pricing                             | part_id                                                  |
| part_usage            | Which parts and quantities a job consumed     | joins job to part                                        |
| invoices              | Bill totals, tax, discounts and status        | invoice_id; job and customer                             |
| invoice_payments      | Payments received against bills               | payment_id; invoice and recording staff                  |
| maintenance_reminders | Future service reminders                      | vehicle, service type and creating staff                 |
| spare_parts_audit     | History of stock/cost changes                 | Additional audit table in advanced script                |

Relationships to remember:

- One customer -> many customer vehicles.
- One catalogue model -> many actual customer vehicles. Model specifications are not the same as an owned vehicle's registration/odometer.
- One vehicle -> many appointments and many service jobs.
- One mechanic -> many jobs.
- Jobs and service types form a many-to-many relationship resolved through job_services.
- Jobs and spare parts form a many-to-many relationship resolved through part_usage.
- One invoice -> many payments, allowing partial payments.
- A job can have a MongoDB report. MongoDB has a unique job_id index to prevent multiple reports for the same job.

Read `database/ER_DIAGRAM.md` and `database/DATA_DICTIONARY.md` for exact column definitions. Diagrams are also available in docs as JPEG/HTML files.

## 5. Why two databases?

MySQL is used where relationships and consistency matter: ownership, job records, money and inventory. It provides foreign keys, joins, constraints and transactions.

MongoDB stores a repair report as a document with arrays of findings, replaced parts, complaints, recommendations and diagnostic codes. An electric vehicle and a petrol vehicle can have different inspection content without needing a new column for every possible observation.

Example report shape (simplified):

```javascript
{
  job_id: 1,
  vehicle_id: 1,
  mechanic_id: 4,
  created_at: new Date(),
  findings: [
    {system: 'Engine', condition: 'Fair', action_taken: 'Oil changed'}
  ],
  overall_health_score: 85
}
```

The link is MySQL `service_jobs.mongo_report_id` <-> MongoDB `_id`, with `job_id` in the document. MongoDB does NOT enforce a foreign key to MySQL. Application logic maintains the link. There is no single ACID transaction covering both database servers; a failure between writes can leave inconsistent links. This is a limitation and a future improvement area.

MongoDB schema validation and application input validation are separate protections. The original shell example used validationAction=warn; the new local setup installs it with error to reject invalid documents.

## 6. DBMS concepts with this project's examples

**Primary key:** uniquely identifies a row, e.g. customers.customer_id.

**Foreign key:** ensures referenced MySQL rows exist, e.g. customer_vehicles.customer_id references customers.customer_id.

**Candidate key / unique constraint:** a value or combination that must be unique, e.g. staff email. A primary key is the chosen main identifier.

**NOT NULL:** prevents missing required values. **CHECK:** rejects invalid ranges or relationships. **DEFAULT:** supplies a value when omitted. Read actual DDL before quoting a specific constraint.

**ON DELETE RESTRICT:** prevents deleting a parent still referenced by important records. **CASCADE:** deletes dependent rows with a parent where defined. **SET NULL:** retains a child while removing an optional reference.

**Normalization:** separate customers, vehicles, services, jobs, parts and payments to reduce duplication. 1NF means atomic relational values/no repeating column groups. 2NF removes partial dependence on a composite candidate key. 3NF removes non-key transitive dependencies. The design follows normalization principles, but do not claim a formal 3NF proof without identifying functional dependencies. Some historical prices and invoice totals are intentionally stored as snapshots.

**Why store charged price in part_usage when spare_parts has a selling price?** Today's price may change; old invoices must preserve what was actually charged.

**JOIN:** combines related records. INNER JOIN keeps matched records; LEFT JOIN also keeps left-side records with no match, such as a job without an invoice.

**View:** a saved SELECT used like a virtual table. Core examples: vw_service_summary, vw_inventory_low_stock and vw_pending_maintenance. A normal view stores a query definition, not a separate permanent copy of its results.

**Stored procedure:** callable database routine with multiple steps and IN/OUT parameters. `sp_book_appointment` validates booking conflicts; `sp_generate_invoice` checks job completion and calculates billing; `sp_get_customer_vehicle_history` returns past work for a vehicle. Additional educational procedures are in database/advanced.

**Stored function:** returns one value usable in a SELECT. Examples: fn_invoice_total_paid(invoice_id), fn_days_since_last_service(vehicle_id).

**Trigger:** runs automatically on a database event. Core triggers deduct stock on part usage, restore stock when usage is deleted, create a maintenance reminder on job completion and mark invoices paid after payments. The advanced audit trigger records stock changes. A procedure needs an explicit CALL; a trigger responds to INSERT/UPDATE/DELETE.

**Transaction:** a group of operations committed together or rolled back. The helper is in src/lib/db/transaction.ts; procedure examples and educational scripts also show transactions.

**ACID:** Atomicity = all or nothing; Consistency = obey constraints/business rules; Isolation = control concurrent operations; Durability = committed changes survive failures. InnoDB supplies transactional storage. An application still needs appropriate locking and transaction boundaries; using MySQL alone does not eliminate every race.

**COMMIT:** make changes permanent. **ROLLBACK:** undo uncommitted work. **SAVEPOINT:** mark a point for partial rollback within a transaction. The advanced transactions file is an educational demonstration, not an app startup requirement.

**Index:** speeds lookups/sorts but costs storage and slows writes. Examples: foreign key/lookup indexes, composite appointment status/date indexes and catalogue full-text index. MongoDB indexes job_id, vehicle_id and created_at plus text fields. A unique index enforces uniqueness as well as supporting lookup.

**Parameterized query:** SQL uses `?` with values passed separately. It reduces SQL injection risk because user values are not concatenated as SQL code. This does not automatically validate business rules.

**Connection pool:** reuses a bounded set of database connections rather than opening one for every query.

**MongoDB aggregation:** a pipeline transforms documents stage by stage. `$match` filters, `$unwind` expands findings arrays, `$group` calculates totals/averages, `$sort` orders results, `$project` selects/computes fields. MongoDB uses BSON, not simply plain JSON on disk.

## 7. Features and pages

| Page          | What to explain/show                                    |
| ------------- | ------------------------------------------------------- |
| /dashboard    | Workshop summary and health/defect statistics           |
| /customers    | Customer directory and management                       |
| /vehicles     | Customer-owned vehicles and history                     |
| /catalogue    | Imported vehicle specifications and comparison          |
| /appointments | Booking, status changes and dispatch to jobs            |
| /jobs         | Work progress, mechanic assignment and part usage       |
| /reports      | Flexible MongoDB inspections                            |
| /inventory    | Stock, costs/prices and low-stock alerts                |
| /invoices     | Generated bills and payments                            |
| /sql-runner   | Execute approved example SQL queries                    |
| /aggregations | Run approved MongoDB analytics                          |
| /search       | Search diagnostic examples and saved reports by symptom |

The SQL runner uses a server-side query registry, not unrestricted SQL typed by a browser user. The MongoDB runner similarly uses approved pipelines.

## 8. Authentication, roles and search: important viva traps

Login uses email and password. Passwords should be checked against bcrypt hashes. A successful login creates a signed JWT in an HTTP-only cookie. The server verifies the session and role on protected API requests. HTTP-only prevents JavaScript from reading the cookie; it does not mean the cookie can never be stolen. JWT signing protects integrity, not confidentiality: do not put passwords in a JWT.

Admin has broad access; advisors handle intake and billing; mechanics work on jobs and inspections. Hiding a button is not authorization: the backend must enforce permissions too. Use Log Out and another seeded login to demonstrate the roles. A demo-role helper also remains in the auth context.

The original code included universal demo-password fallbacks and seed placeholder hashes. These are academic shortcuts, not a security design to defend in a production review. Seed SQL now contains real bcrypt hashes, the local setup upgrades old placeholder hashes, and universal password fallbacks have been removed. See the final verification notes for any further fixes.

Diagnostic search tokenizes text, assigns weights using an automotive vocabulary and hashes other words into 64 dimensions. It normalizes vectors and ranks by cosine similarity (dot product for normalized vectors). It searches curated examples plus MongoDB report content.

It is a custom heuristic retrieval system. It is not a trained neural embedding model, not an LLM, and not a statistically validated prediction of future breakdowns. A similarity percentage is not a probability that a diagnosis is correct. Maintenance reminders and inspection analysis support preventive maintenance; the project title overstates predictive modelling if interpreted as trained ML.

## 9. A practical 7-minute demo

1. Run doctor and start the app before the examiner arrives. Keep MySQL Workbench ready.
2. Log in as admin. Show the dashboard and explain the workshop problem.
3. Show a customer and their vehicles. Explain customer vs catalogue vs owned vehicle.
4. Show an appointment and dispatch/job workflow. For a new booking choose a future date; existing seed dates are historical.
5. Show a job, allocate a part and compare stock before/after. Explain the trigger. Use a job and part suitable for changes, not a settled historical invoice.
6. Show an inspection report with multiple findings. Explain why MongoDB fits nested variable content and how job_id connects it to MySQL.
7. Complete an appropriate job, generate its invoice and record payment if time permits. Explain service + parts - discount, then tax, and partial payments.
8. Show the SQL runner's JOIN/view/aggregate example and one MongoDB aggregation.
9. Search for "brake grinding noise". Explain similarity honestly.
10. Log out, sign in as mechanic and show restricted navigation/actions. Return to admin if needed.

Demo changes persist. Do not run reset/drop scripts to get back to the initial state. The bundled tests include expectations about seeded counts and invoice values; intentional demo changes can invalidate those expectations.

## 10. Likely viva questions and short answers

1. **What problem does it solve?** It connects customer intake, workshop repairs, inventory and billing in one application.
2. **Why MySQL?** Related structured records need joins, keys, constraints and transactional updates.
3. **Why MongoDB too?** Inspections contain variable nested findings that fit documents naturally.
4. **Is MongoDB schema-less?** Flexible schema, but this project defines a validator and application checks.
5. **How do the databases connect?** Shared job_id plus a string MongoDB report ID in the MySQL job; no cross-server foreign key.
6. **What is the strongest trigger example?** Inserting part usage automatically deducts spare-part stock.
7. **Procedure vs function?** Procedures are called and may return result sets/OUT parameters; a function returns a scalar usable in expressions.
8. **Procedure vs trigger?** A procedure is explicitly invoked; a trigger runs because a table event occurs.
9. **Why job_services?** It resolves many-to-many jobs/services and stores historical service charges.
10. **Why separate payments and invoices?** One bill can receive several partial payments.
11. **What happens on insufficient stock?** Trace the parts API checks and stock trigger; the request should fail without accepting invalid usage. Discuss concurrency as a separate concern.
12. **How does billing work?** Sum service charges and quantity times charged part price, subtract discount, calculate tax and total. Seed billing uses 18% tax; it is a demo rule, not a tax-compliance claim.
13. **How is SQL injection limited?** Parameterized mysql2 statements and an approved query registry.
14. **How are passwords stored?** bcrypt hashes, never reversible encryption; the old seed placeholders require the setup upgrade.
15. **How is role access enforced?** JWT session verification and server-side role permissions; navigation also adjusts for usability.
16. **Does the search train on data?** No. It is hand-built text vectorization with cosine similarity over examples/reports.
17. **What is a low-stock query?** SELECT from spare_parts where qty_in_stock <= reorder_level, also exposed as a view.
18. **What are the limitations?** Academic demo credentials/role switching, no cross-database atomic transaction, basic diagnostic retrieval, concurrency risks to review, and tests partly tied to sample data.
19. **What would you improve?** Production account provisioning, remove demo switching, stronger concurrent stock/billing controls, compensating cross-database writes, broader API/UI tests, and validated diagnostic models if needed.
20. **What did you personally do?** Describe your actual study, setup, verification or implementation work accurately.

## 11. SQL examples to practise in MySQL Workbench

```sql
USE autocare_insight;

-- Customer -> owned vehicles (JOIN)
SELECT c.full_name, cv.vehicle_id
FROM customers c
JOIN customer_vehicles cv ON cv.customer_id = c.customer_id;

-- Stock warning (view)
SELECT * FROM vw_inventory_low_stock;

-- Grouping and aggregate
SELECT role, COUNT(*) AS staff_count
FROM users GROUP BY role;

-- Stored function and procedure
SELECT fn_invoice_total_paid(1) AS amount_paid;
CALL sp_get_customer_vehicle_history(1);

-- Find vehicles with no job (LEFT JOIN + NULL)
SELECT cv.vehicle_id
FROM customer_vehicles cv
LEFT JOIN service_jobs sj ON sj.vehicle_id = cv.vehicle_id
WHERE sj.job_id IS NULL;

-- Inspect actual database objects
SHOW TABLES;
SHOW TRIGGERS;
SHOW CREATE TABLE part_usage;
SHOW CREATE PROCEDURE sp_generate_invoice;
```

Try to explain each result rather than memorizing SQL. `WHERE` filters rows before grouping; `HAVING` filters grouped results. `COUNT(*)` counts rows; `COUNT(column)` excludes NULL values. NULL means missing/unknown; use IS NULL, not = NULL.

## 12. Last-minute revision checklist

- Say the introduction without reading.
- Draw customer -> vehicle -> appointment -> job -> invoice -> payment.
- Add job_services and part_usage as junction tables.
- Explain MongoDB's report link and the absence of cross-database foreign keys.
- Explain one trigger, procedure, function, view, join, aggregation and transaction.
- Know where database credentials live and the difference from demo website credentials.
- Keep the app, Workbench and this file ready; avoid last-minute dependency upgrades.
- Refer to LOCAL_VERIFICATION.md for what was actually checked on this PC, rather than old claims in the README.

## 13. Double-click startup

You can double-click START_PROJECT.cmd in the project folder. It checks both databases and launches the development server. Open the Local URL printed in its window and keep that window open. Stop with Ctrl+C.

## 14. Vehicle intake photographs

Appointments now support optional photos documenting the vehicle's condition before work. The new appointment_intake_photos table stores original image bytes, a condition note, uploader, server timestamp and SHA-256 checksum, with foreign keys to appointments and users. Staff can inspect the photographs later, but the app cannot replace/delete saved photos and blocks additional intake images once work starts. Uploads require authenticated staff, validate real image contents, and use a transaction for each batch. Photo saving can be retried without duplicating the appointment. A checksum is an integrity tool, not independent proof of when a photo was taken. See docs/INTAKE_PHOTOS.md for the workflow and limits.
