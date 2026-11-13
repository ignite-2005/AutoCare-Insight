$ErrorActionPreference = 'Stop'
$statePath = Join-Path (Split-Path $PSScriptRoot -Parent) '.demo-logs/processes.json'
if (!(Test-Path -LiteralPath $statePath)) { Write-Host 'No demo process record found.'; exit }
$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
foreach ($entry in @($state.tunnel, $state.app)) {
  $process = Get-Process -Id $entry.id -ErrorAction SilentlyContinue
  if ($process -and $process.StartTime.ToUniversalTime().ToString('o') -eq $entry.started) { Stop-Process -Id $entry.id }
}
Remove-Item -LiteralPath $statePath
Write-Host 'Recorded demo processes stopped. Databases are unchanged.'
