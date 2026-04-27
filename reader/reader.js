const totalPages = 12;
function buildPageSvg(page) {
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1700" viewBox="0 0 1200 1700">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff9ed"/>
      <stop offset="100%" stop-color="#f6ead3"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1700" fill="url(#paper)"/>
  <text x="600" y="840" text-anchor="middle" fill="#715b43" font-size="52" font-family="serif">连环画 · 第 ${page} 页</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const sampleImages = Array.from({ length: totalPages }, (_, index) => buildPageSvg(index + 1));

const state = {
  page: 1,
  mode: "spread",
  zoom: 100,
  fit: "height",
  uiVisible: true,
};

const el = {
  shell: document.getElementById("readerShell"),
  spread: document.getElementById("spread"),
  leftPaper: document.getElementById("leftPaper"),
  rightPaper: document.getElementById("rightPaper"),
  leftImage: document.getElementById("leftImage"),
  rightImage: document.getElementById("rightImage"),
  leftNumber: document.getElementById("leftNumber"),
  rightNumber: document.getElementById("rightNumber"),
  pageStatus: document.getElementById("pageStatus"),
  progressRange: document.getElementById("progressRange"),
  zoomLabel: document.getElementById("zoomLabel"),
  modeBtn: document.getElementById("modeBtn"),
  fullscreenBtn: document.getElementById("fullscreenBtn"),
  recommendPanel: document.getElementById("recommendPanel"),
};

el.progressRange.max = String(totalPages);
let uiTimer;

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getSpreadPages() {
  if (state.mode === "single") {
    return [state.page, null];
  }

  if (state.page <= 1) {
    return [1, null];
  }

  const left = state.page % 2 === 0 ? state.page : state.page - 1;
  const right = left + 1 <= totalPages ? left + 1 : null;
  return [left, right];
}

function applyScale() {
  const scale = state.zoom / 100;
  [el.leftImage, el.rightImage].forEach((img) => {
    img.style.transform = `scale(${scale})`;
  });
}

function render() {
  const [left, right] = getSpreadPages();

  el.spread.classList.toggle("single", state.mode === "single");
  el.rightPaper.style.display = right ? "block" : "none";

  el.leftImage.src = sampleImages[left - 1];
  el.leftNumber.textContent = `第 ${left} 页`;

  if (right) {
    el.rightImage.src = sampleImages[right - 1];
    el.rightNumber.textContent = `第 ${right} 页`;
  }

  el.pageStatus.textContent = state.mode === "spread" && right ? `${left}–${right} / ${totalPages}` : `${left} / ${totalPages}`;
  el.progressRange.value = String(state.page);
  el.zoomLabel.textContent = `${state.zoom}%`;
  el.modeBtn.textContent = state.mode === "spread" ? "双页" : "单页";

  applyScale();
}

function toggleUI(forceVisible) {
  if (typeof forceVisible === "boolean") {
    state.uiVisible = forceVisible;
  } else {
    state.uiVisible = !state.uiVisible;
  }
  el.shell.classList.toggle("ui-hidden", !state.uiVisible);
}

function startUIFadeTimer() {
  clearTimeout(uiTimer);
  toggleUI(true);
  uiTimer = setTimeout(() => toggleUI(false), 1500);
}

function nextPage() {
  if (state.mode === "spread") {
    state.page = clamp(state.page + 2, 1, totalPages);
  } else {
    state.page = clamp(state.page + 1, 1, totalPages);
  }
  render();
}

function prevPage() {
  if (state.mode === "spread") {
    state.page = clamp(state.page - 2, 1, totalPages);
  } else {
    state.page = clamp(state.page - 1, 1, totalPages);
  }
  render();
}

function setFit(mode) {
  state.fit = mode;
  if (mode === "height") {
    el.spread.style.height = "calc(100vh - 240px)";
    el.spread.style.width = "min(1200px, calc(100vw - 60px))";
  } else {
    el.spread.style.height = "auto";
    el.spread.style.width = "min(1400px, calc(100vw - 40px))";
  }
}

document.getElementById("modeBtn").addEventListener("click", () => {
  state.mode = state.mode === "spread" ? "single" : "spread";
  render();
});

document.getElementById("zoomInBtn").addEventListener("click", () => {
  state.zoom = clamp(state.zoom + 10, 50, 250);
  render();
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  state.zoom = clamp(state.zoom - 10, 50, 250);
  render();
});

document.getElementById("zoomResetBtn").addEventListener("click", () => {
  state.zoom = 100;
  render();
});

document.getElementById("fitWidthBtn").addEventListener("click", () => setFit("width"));
document.getElementById("fitHeightBtn").addEventListener("click", () => setFit("height"));

document.getElementById("prevBtn").addEventListener("click", prevPage);
document.getElementById("nextBtn").addEventListener("click", nextPage);

document.getElementById("fullscreenBtn").addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

el.progressRange.addEventListener("input", (event) => {
  state.page = Number(event.target.value);
  render();
});

document.querySelectorAll(".hotzone").forEach((zone) => {
  zone.addEventListener("click", (event) => {
    const action = event.currentTarget.dataset.action;
    if (action === "prev") prevPage();
    if (action === "next") nextPage();
    if (action === "toggle-ui") toggleUI();
  });
});

["mousemove", "keydown", "click", "touchstart"].forEach((eventName) => {
  document.addEventListener(eventName, startUIFadeTimer, { passive: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    nextPage();
  }

  if (event.key === "ArrowLeft" || (event.shiftKey && event.key === " ")) {
    event.preventDefault();
    prevPage();
  }

  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    el.fullscreenBtn.click();
  }
});

document.addEventListener("fullscreenchange", () => {
  const isFullscreen = Boolean(document.fullscreenElement);
  el.recommendPanel.style.display = isFullscreen ? "none" : "block";
});

document.getElementById("backBtn").addEventListener("click", () => {
  history.back();
});

render();
startUIFadeTimer();
