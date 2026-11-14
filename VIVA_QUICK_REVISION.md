# AutoCare Insight - five-minute viva revision

**What it does:** manages a vehicle workshop, from appointments to repair jobs, stock and billing.

**Live:** [autocare-insight.vercel.app](https://autocare-insight.vercel.app). Next.js 15.5.29 on Vercel Hobby with Enzonic MySQL and Atlas MongoDB; the PC can be switched off.

**Say this:** "MySQL handles structured transactional data. MongoDB handles flexible inspection documents. Next.js provides both the React interface and backend API routes."

**Main flow:** customer -> owned vehicle -> appointment -> service job -> invoice -> payments.

**Junction tables:** job_services connects jobs to services; part_usage connects jobs to spare parts.

**Catalogue vs vehicle:** catalogue = manufacturer/model specifications; customer_vehicles = an individual customer's vehicle.

**MongoDB link:** repair_reports.job_id points to a MySQL job; service_jobs.mongo_report_id stores the MongoDB ID. There is no cross-database foreign key or shared transaction.

**Trigger:** inserting part_usage automatically deducts inventory stock. Payments can automatically mark an invoice paid.

**Procedure:** sp_generate_invoice checks the job and calculates a bill; sp_book_appointment handles booking rules.

**Function:** fn_invoice_total_paid returns the total paid against one invoice.

**View:** vw_inventory_low_stock exposes parts with qty_in_stock <= reorder_level.

**ACID:** all or nothing; valid data; controlled concurrent access; permanent committed changes.

**Normalization:** separate entities to avoid duplication and update anomalies; keep historical charged prices so old invoices do not change with today's prices.

**Security:** bcrypt password hashes, signed JWT session cookie, role checks on the server, parameterized SQL. Hiding a button alone is not authorization.

**Search:** custom 64-dimensional text vectors ranked using cosine similarity. It is not a trained predictive ML model. Similarity is not diagnostic certainty.

**Demo:** admin login -> dashboard -> customer/vehicle -> appointment/job -> parts/stock trigger -> inspection report -> invoice/payment -> SQL runner -> MongoDB aggregation -> mechanic role restrictions.

**Run:** `npm run doctor`, then `npm run dev`; open the URL printed by Next.js.

**Admin:** admin@autocare.com / password123. Website password differs from MySQL password.

**Configuration:** .env.local. Never disclose this file in the viva or publish it.

**Role changes:** sign out and sign in as another account. Mechanics work on assigned jobs and cannot reassign mechanics. The old demo role-switching helper has been removed.

**Verification:** 58 tests passed at the release checkpoint, with cloud workflow and public-access checks. See [verification](docs/TEST_VERIFICATION_REPORT.md).

**Limitations to admit:** shared sample accounts, no atomic writes across both databases, heuristic diagnostics, seed-dependent tests, incomplete concurrency coverage and free-hosting startup delays. Payments are recorded without an external processor.

For details, examples and troubleshooting, read VIVA_GUIDE.md. For verified local checks, read LOCAL_VERIFICATION.md.

**Easiest launch:** double-click START_PROJECT.cmd; keep its terminal window open.
