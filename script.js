// script.js: Animate hue blobs and unlock ambient audio playback.
const frame = document.querySelector(".hue-field");
const initialBlobs = Array.from(document.querySelectorAll(".hue-blob"));

const blobs = initialBlobs.map((el) => ({
  el,
  driftX: 0,
  driftY: 0,
  vx: (Math.random() - 0.5) * 0.18,
  vy: (Math.random() - 0.5) * 0.18,
  targetVX: 0,
  targetVY: 0,
  amp: 60 + Math.random() * 70,
  speed: 0.0012 + Math.random() * 0.0009,
  phase: Math.random() * Math.PI * 2,
  phaseY: Math.random() * Math.PI * 2,
  wanderTimer: 0,
}));

// Creates a single hue blob element and returns its animation state.
const createHueBlob = (top) => {
  if (!frame) return null;

  const blob = document.createElement("div");
  const size = 260 + Math.random() * 280;
  const left = 4 + Math.random() * 92;
  const red = 255;
  const green = 170 + Math.random() * 30;
  const blue = 200 + Math.random() * 35;

  blob.className = "hue-blob dynamic";
  blob.style.width = `${size}px`;
  blob.style.height = `${size}px`;
  blob.style.left = `${left}%`;
  blob.style.top = `${top}px`;
  blob.style.background = `radial-gradient(circle, rgba(${red}, ${green.toFixed(
    0
  )}, ${blue.toFixed(0)}, 0.68), transparent 72%)`;

  frame.appendChild(blob);

  return {
    el: blob,
    driftX: 0,
    driftY: 0,
    vx: (Math.random() - 0.5) * 0.18,
    vy: (Math.random() - 0.5) * 0.18,
    targetVX: 0,
    targetVY: 0,
    amp: 60 + Math.random() * 70,
    speed: 0.0012 + Math.random() * 0.0009,
    phase: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    wanderTimer: 0,
  };
};

// Fills the page with initial blobs based on scroll height.
const fillInitialHueField = () => {
  if (!frame) return;

  const height = Math.max(document.body.scrollHeight, window.innerHeight * 3.5);
  const spacing = 200;
  const count = Math.ceil(height / spacing);

  for (let i = 0; i < count; i += 1) {
    const top = i * spacing + Math.random() * 140;
    const blobData = createHueBlob(top);
    if (blobData) {
      blobs.push(blobData);
    }
  }
};

fillInitialHueField();

// Animates blob drift and wave motion each frame.
const updateBlobs = (time) => {
  const boundsX = window.innerWidth * 0.45;
  const boundsY = window.innerHeight * 0.45;

  blobs.forEach((blob) => {
    if (blob.wanderTimer <= 0) {
      blob.targetVX = (Math.random() - 0.5) * 0.35;
      blob.targetVY = (Math.random() - 0.5) * 0.35;
      blob.wanderTimer = 140 + Math.random() * 160;
    }

    blob.vx += (blob.targetVX - blob.vx) * 0.015;
    blob.vy += (blob.targetVY - blob.vy) * 0.015;
    blob.wanderTimer -= 1;

    const phase = time * blob.speed + blob.phase;
    const phaseY = time * blob.speed * 0.9 + blob.phaseY;
    const waveX = Math.sin(phase) * blob.amp;
    const waveY = Math.cos(phaseY) * blob.amp * 0.65;

    blob.driftX += blob.vx;
    blob.driftY += blob.vy;

    if (blob.driftX > boundsX || blob.driftX < -boundsX) {
      blob.driftX = Math.max(-boundsX, Math.min(boundsX, blob.driftX));
      blob.vx *= -0.8;
    }

    if (blob.driftY > boundsY || blob.driftY < -boundsY) {
      blob.driftY = Math.max(-boundsY, Math.min(boundsY, blob.driftY));
      blob.vy *= -0.8;
    }

    blob.el.style.setProperty("--drift-x", `${blob.driftX + waveX}px`);
    blob.el.style.setProperty("--drift-y", `${blob.driftY + waveY}px`);
  });

  requestAnimationFrame(updateBlobs);
};

requestAnimationFrame(updateBlobs);

const ambientAudio = document.getElementById("ambient-audio");
if (ambientAudio) {
  ambientAudio.volume = 0.2;
  // Attempts to start ambient audio playback (may be blocked until user gesture).
  const tryPlay = () => {
    ambientAudio.play().catch(() => {});
  };
  tryPlay();

  // Unlocks audio on first user interaction.
  const unlockAudio = () => {
    ambientAudio.muted = false;
    tryPlay();
    window.removeEventListener("pointerdown", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };

  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio);
}
