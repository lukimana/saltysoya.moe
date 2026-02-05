# Generates images.json from the img folder.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\generate-images-json.ps1
$root = Split-Path -Parent $PSScriptRoot
$imgPath = Join-Path $root "img-webp"
$outPath = Join-Path $root "images.json"

if (-not (Test-Path $imgPath)) {
  throw "img-webp folder not found: $imgPath"
}

$files = Get-ChildItem -Path $imgPath -File |
  Where-Object { $_.Extension -match '\.(webp|avif)$' } |
  Sort-Object Name |
  ForEach-Object { "img-webp/$($_.Name)" }

$files | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $outPath
Write-Host "Wrote $($files.Count) entries to $outPath"
