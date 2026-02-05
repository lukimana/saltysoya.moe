# salysoya.moe 

https://saltysoya.moe is a One-Page static site to display Links/Gallery for the VTuber SaltySoya

Created with the help of Codex.

# Image creation pipeline

## Folder roles

- `img/`: source/original images (PNG/JPG/etc).
- `img-webp/`: full-size WebP outputs (one per source image).
- `img-webp-1024/`: medium WebP variants (1024px wide).
- `img-webp-640/`: small WebP variants (640px wide).
- `images.json`: gallery index used by `index.html`.

## One-time setup

- Install ImageMagick and ensure `magick` is available in PATH.
  - Windows (Chocolatey):
    ```powershell
    choco install imagemagick -y
    ```
  - Windows (Winget):
    ```powershell
    winget install ImageMagick.ImageMagick
    ```
  - Manual: download the Windows installer from the ImageMagick site and
    select the option to add ImageMagick to PATH during setup.

## Update workflow (add or change images)

1. Put new or updated source images into `img/`.
2. Generate WebP variants:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\generate-responsive-webp.ps1
   ```
3. Regenerate the gallery index:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\generate-images-json.ps1
   ```
4. Commit and push the changes.

## What each script does

- `scripts/generate-responsive-webp.ps1`
  - Reads `img/`.
  - Writes full-size WebP to `img-webp/`.
  - Writes resized WebP to `img-webp-1024/` and `img-webp-640/`.

- `scripts/generate-images-json.ps1`
  - Reads `img-webp/`.
  - Detects width/height for each WebP.
  - Writes `images.json` entries used by the gallery.

## Gallery behavior

- `index.html` loads `images.json`.
- Thumbnails are lazy-loaded via IntersectionObserver.
- `srcset` uses 640w/1024w/full-size so the browser picks an efficient file.
