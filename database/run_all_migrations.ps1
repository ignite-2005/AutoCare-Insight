# Uses .env.local through the Node setup script; works with paths containing spaces.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    & node scripts/setup-db.js
    if ($LASTEXITCODE -ne 0) { throw 'Database setup failed. See the error above.' }
} finally { Pop-Location }
