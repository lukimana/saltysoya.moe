# Converts images in the img folder to WebP.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\convert-images-to-webp.ps1
# Optional: set $Quality (1-100) and $OutputFolderName.

$root = Split-Path -Parent $PSScriptRoot
$imgPath = Join-Path $root "img"
$outputFolderName = "img-webp"
$outPath = Join-Path $root $outputFolderName
$quality = 80

if (-not (Test-Path $imgPath)) {
  throw "img folder not found: $imgPath"
}

$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
  throw "ImageMagick is required. Install it and make sure 'magick' is in PATH."
}

if (-not (Test-Path $outPath)) {
  New-Item -ItemType Directory -Path $outPath | Out-Null
}

$files = Get-ChildItem -Path $imgPath -File |
  Where-Object { $_.Extension -match '\.(png|jpe?g|gif|bmp|tiff|webp)$' }

if ($files.Count -eq 0) {
  Write-Host "No images found in $imgPath"
  exit 0
}

foreach ($file in $files) {
  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $outputFile = Join-Path $outPath "$baseName.webp"
  & magick $file.FullName -quality $quality $outputFile
  Write-Host "Converted: $($file.Name) -> $outputFolderName/$baseName.webp"
}

Write-Host "Done. WebP files are in $outPath"
