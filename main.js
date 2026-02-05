// main.js: Build the gallery, handle the feesh counter, and wire UI interactions.
const galleryGrid = document.getElementById("gallery-grid");
const feeshButton = document.getElementById("feesh-button");
const feeshCounter = document.getElementById("feesh-counter");
const feeshCounterValue = document.getElementById("feesh-counter-value");
const feeshFallback = document.getElementById("feesh-counter-fallback");
const feeshButtonWrap = document.getElementById("feesh-button-wrap");
const feeshCounterTop = document.getElementById("feesh-counter");
const feeshApi = "https://api.saltysoya.moe/api/feesh";

// Loads the WebP gallery list, renders tiles, and maps clicks to originals.
// Loads the gallery image list.
fetch("images.json")
  .then((response) => response.json())
  .then((images) => {
    const originalExtensions = ["png", "jpg", "jpeg"];
    const items = images
      .map((item) => {
        if (typeof item === "string") {
          return { src: item };
        }
        if (item && typeof item === "object" && item.src) {
          return item;
        }
        return null;
      })
      .filter(Boolean);

    // Finds the matching original image in /img by probing common extensions.
    // Finds the matching original image in /img by probing common extensions.
    const resolveOriginal = async (webpPath) => {
      const fileName = webpPath.split("/").pop() || "";
      const baseName = fileName.replace(/\.(webp|avif)$/i, "");
      for (const ext of originalExtensions) {
        const candidate = `img/${baseName}.${ext}`;
        try {
          const res = await fetch(candidate, { method: "HEAD" });
          if (res.ok) {
            return candidate;
          }
        } catch (error) {
          // Ignore and try next extension.
        }
      }
      return `img/${baseName}.png`;
    };

    // Lazily populates image sources when they enter the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          const dataSrc = img.getAttribute("data-src");
          if (dataSrc) {
            img.src = dataSrc;
            const dataSrcset = img.getAttribute("data-srcset");
            if (dataSrcset) {
              img.setAttribute("srcset", dataSrcset);
              img.removeAttribute("data-srcset");
            }
            const dataSizes = img.getAttribute("data-sizes");
            if (dataSizes) {
              img.setAttribute("sizes", dataSizes);
              img.removeAttribute("data-sizes");
            }
            img.removeAttribute("data-src");
          }
          io.unobserve(img);
        });
      },
      { rootMargin: "200px 0px" }
    );

    // Maps a base WebP path to a size-specific folder.
    const buildVariantPath = (srcPath, folder) =>
      srcPath.replace(/^img-webp\//, `${folder}/`);

    items
      .sort(() => Math.random() - 0.5)
    .forEach((item) => {
      const src = item.src;
      const link = document.createElement("a");
      link.className = "gallery-item";
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener";
      link.dataset.webp = src;

        const img = document.createElement("img");
        img.decoding = "async";
        img.loading = "lazy";
        img.alt = "";
        const smallSrc = buildVariantPath(src, "img-webp-640");
        const mediumSrc = buildVariantPath(src, "img-webp-1024");
        img.setAttribute("data-src", smallSrc);
        const srcsetParts = [
          `${smallSrc} 640w`,
          `${mediumSrc} 1024w`,
        ];
        if (Number.isFinite(item.width)) {
          srcsetParts.push(`${src} ${item.width}w`);
        }
        img.setAttribute("data-srcset", srcsetParts.join(", "));
        img.setAttribute(
          "data-sizes",
          "(max-width: 520px) 100vw, (max-width: 820px) 50vw, (max-width: 1100px) 33vw, 25vw"
        );
        if (Number.isFinite(item.width) && Number.isFinite(item.height)) {
          img.width = item.width;
          img.height = item.height;
        }

        link.appendChild(img);
        galleryGrid.appendChild(link);
        io.observe(img);

        // On click, resolve the original image and open it in a new tab.
        link.addEventListener("click", (event) => {
          event.preventDefault();
          const webpPath = link.dataset.webp || src;
          resolveOriginal(webpPath).then((originalSrc) => {
            window.open(originalSrc, "_blank", "noopener");
          });
        });
      });
  })
  .catch((error) => {
    console.error("Failed to load gallery images:", error);
  });

if (feeshButton) {
  const feeshSounds = [
    "music/mhm1.wav",
    "music/mhm2.wav",
    "music/mhm3.wav",
    "music/mhm4.wav",
  ];

  const feeshGifs = [
    "gif/image01.gif",
    "gif/image02.gif",
    "gif/image03.gif",
  ];

  let lastGifTime = 0;
  let lastGifSide = null;
  let pressTimes = [];
  const lastGifBySide = { left: null, right: null };

  // Shows a temporary feesh GIF near the button.
  const showFeeshGif = () => {
    if (!feeshButtonWrap) return;
    const now = Date.now();
    pressTimes = pressTimes.filter((t) => now - t < 3000);
    if (pressTimes.length >= 2) {
      return;
    }

    const recent = now - lastGifTime < 3000;
    let side = "left";
    if (recent && lastGifSide) {
      side = lastGifSide === "left" ? "right" : "left";
    } else {
      side = Math.random() > 0.5 ? "left" : "right";
    }

    const otherSide = side === "left" ? "right" : "left";
    const otherGif = lastGifBySide[otherSide];
    const available = feeshGifs.filter((gifPath) => gifPath !== otherGif);
    const chosenList = available.length ? available : feeshGifs;
    const chosenGif =
      chosenList[Math.floor(Math.random() * chosenList.length)];

    const gif = document.createElement("img");
    gif.className = `feesh-gif ${side}`;
    gif.src = chosenGif;
    gif.alt = "";

    const marginPx = Math.max(8, Math.min(window.innerWidth * 0.02, 18));
    const buttonRect = feeshButtonWrap.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const maxWidth =
      side === "left"
        ? buttonRect.left - marginPx
        : viewportWidth - buttonRect.right - marginPx;
    const preferredWidth = 80;

    if (maxWidth > 30) {
      gif.style.width = `${Math.max(40, Math.min(preferredWidth, maxWidth))}px`;
      gif.style.height = "auto";
    }

    gif.style.height = "auto";

    feeshButtonWrap.appendChild(gif);

    lastGifTime = now;
    lastGifSide = side;
    lastGifBySide[side] = chosenGif;
    pressTimes.push(now);

    setTimeout(() => {
      gif.remove();
    }, 3000);
  };

  // Updates the visible counter text and clears fallback messages.
  // Updates the visible counter text and clears fallback messages.
  const updateFeeshCounter = (count) => {
    if (feeshCounter) {
      feeshCounter.style.display = "";
      if (feeshCounterValue) {
        feeshCounterValue.textContent = String(count);
      }
    }
    if (feeshFallback) {
      feeshFallback.style.display = "none";
      feeshFallback.textContent = "";
    }
  };

  // Loads the current global count from the Worker endpoint.
  fetch(feeshApi)
    .then((response) => response.json())
    .then((data) => {
      if (typeof data.count === "number") {
        updateFeeshCounter(data.count);
      }
    })
    .catch((error) => {
      console.error("The feesh has been patted too much. Try again later.", error);
      if (feeshFallback) {
        feeshFallback.textContent =
          "The feesh has been patted too much. Try again later.";
        feeshFallback.style.display = "block";
      }
      if (feeshCounter) {
        feeshCounter.style.display = "none";
      }
    });

  // Plays a random sound and increments the global counter.
  // Plays a random sound, shows a GIF, and increments the global counter.
  feeshButton.addEventListener("click", () => {
    const choice =
      feeshSounds[Math.floor(Math.random() * feeshSounds.length)];
    const audio = new Audio(choice);
    audio.volume = 0.6;
    audio.play().catch(() => {});

    showFeeshGif();

    fetch(feeshApi, { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (typeof data.count === "number") {
          updateFeeshCounter(data.count);
        }
      })
      .catch((error) => {
        console.error("The feesh has been patted too much. Try again later.", error);
        if (feeshFallback) {
          feeshFallback.textContent =
            "The feesh has been patted too much. Try again later.";
          feeshFallback.style.display = "block";
        }
        if (feeshCounter) {
          feeshCounter.style.display = "none";
        }
      });
  });
}

const actionButtons = document.querySelectorAll(".action-button");
actionButtons.forEach((button) => {
  // Toggles the associated panel open/closed.
  button.addEventListener("click", () => {
    const panelId = button.getAttribute("data-panel");
    if (!panelId) return;
    const panel = document.getElementById(panelId);
    if (!panel) return;

    const isOpen = panel.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
});
