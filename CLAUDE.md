# Project working conventions

- Stack: Next.js 15 App Router, React 18, TypeScript, Tailwind; mysql2 and MongoDB native drivers.
- Pages: src/app. Server endpoints: src/app/api. Active DB helpers: src/lib/db.
- Configuration: .env.local; standalone scripts/tests load scripts/env.js.
- Run: npm run doctor, npm run setup:db (initial setup), npm run dev.
- Verify: npm run typecheck, npm test (live databases), npm run build.
- SQL files contain MySQL DELIMITER commands; scripts/setup-db.js handles them.
- Preserve existing database data. Never automatically run 01_create_database.sql, which drops the database.
- Use parameterized SQL and server-side authorization.
- Tests contain assumptions about seeded data; demo edits may change results.
- Public app: https://autocare-insight.vercel.app. Hosting is independent of the developer's PC; use the existing free plans.
- Main overview: README.md. Documentation map: docs/README.md. Technical report: docs/PROJECT_REPORT.md. Study guide: VIVA_GUIDE.md.
- Current verification: docs/TEST_VERIFICATION_REPORT.md and docs/presentation/REVIEW.md. Older local checks in LOCAL_VERIFICATION.md are explicitly historical.
- Use the approved project imagery. New artwork needs owner approval before integration. Device reduced-motion preferences remain supported; the manual footer option was removed.
- Keep env files, provider tokens, private backups and raw cloud acceptance evidence out of Git. Publish sanitized verification summaries.
