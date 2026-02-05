# Generates full-size and resized WebP variants from the img folder.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\generate-responsive-webp.ps1
# Optional: set $Sizes and $Quality below.

$root = Split-Path -Parent $PSScriptRoot
$imgPath = Join-Path $root "img"
$quality = 80
$sizes = @(640, 1024)
$fullSizeFolder = "img-webp"

if (-not (Test-Path $imgPath)) {
  throw "img folder not found: $imgPath"
}

$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
  throw "ImageMagick is required. Install it and make sure 'magick' is in PATH."
}

$files = Get-ChildItem -Path $imgPath -File |
  Where-Object { $_.Extension -match '\.(png|jpe?g|gif|bmp|tiff|webp)$' }

if ($files.Count -eq 0) {
  Write-Host "No images found in $imgPath"
  exit 0
}

foreach ($size in $sizes) {
  $outPath = Join-Path $root ("img-webp-" + $size)
  if (-not (Test-Path $outPath)) {
    New-Item -ItemType Directory -Path $outPath | Out-Null
  }

  foreach ($file in $files) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $outputFile = Join-Path $outPath ("$baseName.webp")
    & magick $file.FullName -quality $quality -resize ($size.ToString() + "x") $outputFile
  }

  Write-Host "Generated WebP variants at width $size in $outPath"
}

$fullOutPath = Join-Path $root $fullSizeFolder
if (-not (Test-Path $fullOutPath)) {
  New-Item -ItemType Directory -Path $fullOutPath | Out-Null
}

foreach ($file in $files) {
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $outputFile = Join-Path $fullOutPath ("$baseName.webp")
  & magick $file.FullName -quality $quality $outputFile
}

Write-Host "Generated full-size WebP files in $fullOutPath"

Write-Host "Done."
