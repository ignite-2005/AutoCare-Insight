# Deployment without a paid service

## Cloud hosting independent of your PC

**Live website: [autocare-insight.vercel.app](https://autocare-insight.vercel.app).** AutoCare runs on Vercel Hobby, Enzonic Free native MySQL and MongoDB Atlas M0. Both databases have been migrated and verified; cloud workflow and anonymous public access checks passed. The application works with the developer's PC switched off. No student credits, paid upgrade or card-backed trial was used. See the [managed hosting guide](../deploy/MANAGED_HOSTING.md) for the verified scope and free-tier limits.

MySQL routines, triggers, views and transactions are preserved, along with MongoDB report IDs, indexes and validators. The old PC-hosted tunnel remains stopped. The application uses patched Next.js 15.5.29; do not restart an old Next.js 14 build.

## No account, no card: public demo from your PC

This route runs the **whole application**, with the existing MySQL and MongoDB services on this computer. Cloudflare supplies a temporary HTTPS URL. It does not move your databases into a cloud service.

1. Install dependencies, configure `.env.local`, and run `npm run doctor`.
2. Build the production application with `npm run build`.
3. Start it with `npm run start -- --port 3002`.
4. Download the official Windows client from [Cloudflare's releases](https://github.com/cloudflare/cloudflared/releases/latest).
5. In another terminal, run:

```powershell
.\.tools\cloudflared.exe tunnel --url http://127.0.0.1:3002 --protocol http2
```

Use the printed `https://…trycloudflare.com` URL. The introduction is public; existing login and role authorization still protect workspace APIs. Do not share private workshop records in a public demonstration. Before public use, replace seeded evaluation passwords and use a unique random JWT secret.

A Quick Tunnel lasts only while the tunnel process is running. The computer must stay awake with internet access and both databases running. Restarting the tunnel creates a new URL. Cloudflare provides no uptime guarantee and limits concurrent requests; it is intended for testing and demonstrations. [Official Quick Tunnel documentation](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

For a repeatable local launch after building, run `scripts/start-public-demo.ps1`. It checks dependencies, starts the application and tunnel in hidden windows, and writes logs/process IDs into ignored `.demo-logs/`. The script requires the official client at `.tools/cloudflared.exe`. `scripts/stop-public-demo.ps1` stops only the processes recorded by that launcher.

## Complete portable stack

The repository includes a Dockerfile, MySQL 8, MongoDB 8, durable named volumes, and a Caddy reverse proxy. Container images and software are free; a remote machine is still needed for permanent hosting.

```powershell
Copy-Item deploy/.env.deploy.example .env.deploy
# Fill all four secrets with independent random hex strings (at least 32 bytes).
docker compose --env-file .env.deploy build
docker compose --env-file .env.deploy up -d mysql mongo
docker compose --env-file .env.deploy --profile setup run --rm setup
docker compose --env-file .env.deploy up -d web proxy
```

The setup step initializes a fresh database and preserves an existing one. Database ports are not published. The app binds to loopback; the proxy publishes ports 80/443. `SITE_ADDRESS=:80` is suitable for local HTTP testing. Set a DNS hostname pointing at the server for Caddy's automatic HTTPS. Named volumes preserve data across container recreation; deleting volumes deletes that data. Back up both databases before changes.

The Docker package has a separate initialization step because database migration and seeding should not happen on every application start. The MongoDB initialization script uses collection validation operations; the bundled Mongo user is administrative for this educational installation. Narrow permissions and separate a migration user before using private production data.

## Why not simply copy SakuraMind's hosting?

SakuraMind's inference backend and browser storage have different persistence requirements. AutoCare needs MySQL stored procedures, functions, triggers, transactions, and a MongoDB document store. A host that only renders Next.js, or a MySQL-compatible database missing routines/triggers, cannot support the existing workflow unchanged.

Hosting research on 13 November 2026:

- [Aiven retired free MySQL creation](https://aiven.io/free-mysql-database-retired), so it is not a no-cost route for a new installation.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby) can host a personal Next.js project, but does not provision the required MySQL and MongoDB servers.
- [MongoDB Atlas Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/) covers a document store only.
- [Oracle Always Free](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm) can provide a suitable VM when available, but account verification conflicts with the user's no-card requirement.

The original immediate route was a **temporary public demo hosted on the developer's PC**. The verified managed release above replaces that dependency. The local tunnel and Docker instructions remain available as alternative development/deployment routes.
