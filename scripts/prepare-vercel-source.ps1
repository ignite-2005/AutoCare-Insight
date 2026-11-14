$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$releaseId = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
$releaseRoot = Join-Path $projectRoot ".tools/vercel-releases/$releaseId"

# Upload only the application. Local env files, databases, backups, tools and
# private review evidence never enter the deployment directory.
$files = @('package.json', 'package-lock.json', 'next.config.js', 'vercel.json',
  'postcss.config.js', 'tailwind.config.js', 'tsconfig.json', '.eslintrc.json')
$directories = @('src', 'public')
New-Item -ItemType Directory -Path $releaseRoot | Out-Null
foreach ($name in $files) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $releaseRoot
}
foreach ($name in $directories) {
  Copy-Item -LiteralPath (Join-Path $projectRoot $name) -Destination $releaseRoot -Recurse
}

$manifest = @(Get-ChildItem -LiteralPath $releaseRoot -File -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($releaseRoot.Length + 1).Replace('\', '/')
  if ($relative -match '(^|/)(\.env[^/]*|auth\.json|\.git|node_modules|\.tools|\.demo-logs)(/|$)') {
    throw "Unexpected private deployment input: $relative"
  }
  [ordered]@{ path = $relative; sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant(); bytes = $_.Length }
})
$evidenceDirectory = Join-Path $projectRoot '.demo-logs'
New-Item -ItemType Directory -Path $evidenceDirectory -Force | Out-Null
$manifestFile = Join-Path $evidenceDirectory "vercel-source-$releaseId.json"
[ordered]@{ releaseId = $releaseId; directory = $releaseRoot; files = $manifest } |
  ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestFile -Encoding UTF8
[ordered]@{ releaseId = $releaseId; directory = $releaseRoot; fileCount = $manifest.Count; manifest = $manifestFile } | ConvertTo-Json
