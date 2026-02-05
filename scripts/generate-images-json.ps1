# Generates images.json from the img folder.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\generate-images-json.ps1
$root = Split-Path -Parent $PSScriptRoot
$imgPath = Join-Path $root "img-webp"
$outPath = Join-Path $root "images.json"

if (-not (Test-Path $imgPath)) {
  throw "img-webp folder not found: $imgPath"
}

$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
  throw "ImageMagick is required. Install it and make sure 'magick' is in PATH."
}

$files = Get-ChildItem -Path $imgPath -File |
  Where-Object { $_.Extension -match '\.(webp|avif)$' } |
  Sort-Object Name

$entries = foreach ($file in $files) {
  $dims = & magick identify -format "%w %h" $file.FullName 2>$null
  $parts = $dims -split "\s+"
  $width = if ($parts.Length -ge 1) { [int]$parts[0] } else { 0 }
  $height = if ($parts.Length -ge 2) { [int]$parts[1] } else { 0 }

  [PSCustomObject]@{
    src = "img-webp/$($file.Name)"
    width = $width
    height = $height
  }
}

$entries | ConvertTo-Json -Depth 2 | Set-Content -Encoding UTF8 $outPath
Write-Host "Wrote $($entries.Count) entries to $outPath"
