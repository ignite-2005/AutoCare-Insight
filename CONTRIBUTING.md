# Contributing to AutoCare Insight

Start with the [README](README.md), [project report](docs/PROJECT_REPORT.md) and
[local setup guide](LOCAL_VERIFICATION.md).

## Report feedback

Use [GitHub Issues](https://github.com/ignite-2005/AutoCare-Insight/issues/new/choose)
for a reproducible bug or a concrete improvement. Include the page, account role,
steps, expected behaviour and actual behaviour. The hosted site is a shared
educational demo; sample records can change between visits.

Keep account passwords, tokens, connection strings, backup files and private
customer information out of issues, screenshots and pull requests. Use local
sample records when reproducing a problem.

## Develop locally

1. Use Node.js 22 with local MySQL 8 and MongoDB 8.
2. Run `npm ci`, copy `.env.example` to `.env.local`, and supply your own local
   database credentials and a random signing key.
3. Run `npm run setup:db` for initial setup, then `npm run doctor` and `npm run dev`.
4. Keep changes focused and explain the resulting user behaviour in your pull request.

Use the supported setup command. `database/01_create_database.sql` drops the
database, and the ALTER/DROP classroom demonstrations are not application migrations.
Preserve existing records and use isolated fixtures for mutation checks.

## Verify a change

Run checks relevant to the change:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

The full test runner uses live local databases and assumes the supplied seed
data. The HTTP smoke/intake integration scripts create and remove temporary
records; run them only against a dedicated local test installation.
For documentation-only changes, check links, commands and factual consistency.

Server routes must enforce permissions and parameterize SQL. Keep SQL stored
procedure OUT variables on their leased connection. Use the existing motion
tokens and device reduced-motion handling for UI work.

New project artwork needs the project owner's approval before integration.
Reuse approved imagery until that review is complete. Keep credentials, cloud
tokens, private backups and raw test artifacts out of Git.
