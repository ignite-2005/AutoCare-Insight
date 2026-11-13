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
- Main explanation and onboarding: VIVA_GUIDE.md. Local evidence: LOCAL_VERIFICATION.md.
