param([int]$Port = 3002, [string]$BuildDirectory = '.next')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$logDirectory = Join-Path $projectRoot '.demo-logs'
$client = Join-Path $projectRoot '.tools/cloudflared.exe'
if (!(Test-Path -LiteralPath $client)) { throw 'Download the official cloudflared client into .tools/cloudflared.exe first. See docs/DEPLOYMENT.md.' }
if (!(Test-Path -LiteralPath (Join-Path $BuildDirectory 'BUILD_ID'))) { throw 'Production build missing. Run npm run build first, or specify -BuildDirectory.' }
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) { throw "Port $Port is already occupied." }
New-Item -ItemType Directory -Force -Path $logDirectory | Out-Null
$statePath = Join-Path $logDirectory 'processes.json'
if (Test-Path -LiteralPath $statePath) { throw 'An existing demo process record exists. Run scripts/stop-public-demo.ps1 before restarting.' }
node scripts/doctor.js
if ($LASTEXITCODE -ne 0) { throw 'Database checks failed.' }
$env:NEXT_BUILD_DIR = $BuildDirectory
# A demo session secret lives only in the child processes; never use a bundled fallback.
$secretBytes = New-Object byte[] 32
$generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$generator.GetBytes($secretBytes)
$generator.Dispose()
$env:JWT_SECRET = [BitConverter]::ToString($secretBytes).Replace('-', '').ToLowerInvariant()
$app = Start-Process -FilePath (Get-Command node).Source -ArgumentList @('node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', $Port) -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'app.log') -RedirectStandardError (Join-Path $logDirectory 'app-error.log') -PassThru
try {
  $ready = $false
  for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try { $response = Invoke-WebRequest -Uri "http://127.0.0.1:$Port" -UseBasicParsing -TimeoutSec 2; if ($response.StatusCode -eq 200) { $ready = $true; break } } catch {}
    Start-Sleep -Milliseconds 500
  }
  if (!$ready) { throw 'Application did not become ready. Check .demo-logs/app-error.log.' }
  $tunnel = Start-Process -FilePath $client -ArgumentList @('tunnel','--url',"http://127.0.0.1:$Port",'--protocol','http2') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $logDirectory 'tunnel.log') -RedirectStandardError (Join-Path $logDirectory 'tunnel-error.log') -PassThru
  @{ app = @{ id = $app.Id; started = $app.StartTime.ToUniversalTime().ToString('o') }; tunnel = @{ id = $tunnel.Id; started = $tunnel.StartTime.ToUniversalTime().ToString('o') }; port = $Port } | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath $statePath
  Write-Host 'Demo started. Find the temporary HTTPS URL in .demo-logs/tunnel-error.log.'
} catch { Stop-Process -Id $app.Id -ErrorAction SilentlyContinue; throw }
