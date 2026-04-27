import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs";

const fallbackTotalPages = 12;
const fallbackImages = Array.from(
  { length: fallbackTotalPages },
  () => "../c8aeba54-6e23-4044-a7ba-eafb6bba4bfe.png"
);

const state = {
  spreadIndex: 0,
  zoom: 100,
  uiVisible: true,
  pages: fallbackImages,
  title: "示例连环画",
};

const el = {
  shell: document.getElementById("readerShell"),
  book: document.getElementById("book"),
  leftImage: document.getElementById("leftImage"),
  rightImage: document.getElementById("rightImage"),
  leftNumber: document.getElementById("leftNumber"),
  rightNumber: document.getElementById("rightNumber"),
  pageStatus: document.getElementById("pageStatus"),
  zoomLabel: document.getElementById("zoomLabel"),
  pdfInput: document.getElementById("pdfInput"),
  bookMeta: document.getElementById("bookMeta"),
  toolbar: document.getElementById("toolbar"),
  topbar: document.getElementById("topbar"),
};

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function spreadCount() {
  return Math.ceil(state.pages.length / 2);
}

function getCurrentSpreadPages() {
  const left = state.spreadIndex * 2 + 1;
  const right = left + 1 <= state.pages.length ? left + 1 : null;
  return [left, right];
}

function applyZoom() {
  const scale = state.zoom / 100;
  [el.leftImage, el.rightImage].forEach((img) => {
    img.style.transform = `scale(${scale})`;
  });
  el.zoomLabel.textContent = `${state.zoom}%`;
}

function render() {
  const [leftPageNo, rightPageNo] = getCurrentSpreadPages();
  el.leftImage.src = state.pages[leftPageNo - 1] || "";
  el.leftNumber.textContent = `第 ${leftPageNo} 页`;

  if (rightPageNo) {
    el.rightImage.style.visibility = "visible";
    el.rightImage.src = state.pages[rightPageNo - 1];
    el.rightNumber.textContent = `第 ${rightPageNo} 页`;
    el.rightNumber.style.visibility = "visible";
  } else {
    el.rightImage.style.visibility = "hidden";
    el.rightImage.src = "";
    el.rightNumber.style.visibility = "hidden";
  }

  el.pageStatus.textContent = rightPageNo
    ? `${leftPageNo}–${rightPageNo} / ${state.pages.length}`
    : `${leftPageNo} / ${state.pages.length}`;

  applyZoom();
}

function animateTurn(direction) {
  const cls = direction === "next" ? "turn-next" : "turn-prev";
  el.book.classList.remove("turn-next", "turn-prev");
  el.book.classList.add(cls);
  setTimeout(() => el.book.classList.remove(cls), 340);
}

function nextSpread() {
  const maxIndex = spreadCount() - 1;
  if (state.spreadIndex >= maxIndex) return;
  state.spreadIndex = clamp(state.spreadIndex + 1, 0, maxIndex);
  animateTurn("next");
  render();
}

function prevSpread() {
  if (state.spreadIndex <= 0) return;
  state.spreadIndex = clamp(state.spreadIndex - 1, 0, spreadCount() - 1);
  animateTurn("prev");
  render();
}

let hideUiTimer;
function showUiTemporarily() {
  clearTimeout(hideUiTimer);
  state.uiVisible = true;
  el.shell.classList.remove("ui-hidden");
  hideUiTimer = setTimeout(() => {
    if (!state.uiVisible) return;
    el.shell.classList.add("ui-hidden");
  }, 2200);
}

function toggleUiPinned() {
  const willHide = !el.shell.classList.contains("ui-hidden");
  el.shell.classList.toggle("ui-hidden", willHide);
  state.uiVisible = !willHide;
  const button = document.getElementById("toggleUiBtn");
  button.textContent = willHide ? "显示界面" : "隐藏界面";
}

async function pdfToImages(file) {
  const data = await file.arrayBuffer();
  const task = pdfjsLib.getDocument({ data });
  const pdf = await task.promise;
  const urls = [];

  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.1 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    urls.push(canvas.toDataURL("image/jpeg", 0.9));
  }

  return urls;
}

el.pdfInput.addEventListener("change", async (event) => {
  const [file] = event.target.files || [];
  if (!file) return;

  el.bookMeta.textContent = "正在转换 PDF…";
  try {
    const pages = await pdfToImages(file);
    if (!pages.length) throw new Error("empty_pdf");
    state.pages = pages;
    state.spreadIndex = 0;
    state.title = file.name;
    el.bookMeta.textContent = `${file.name} · 共 ${pages.length} 页（双页翻书模式）`;
    render();
  } catch (error) {
    console.error(error);
    el.bookMeta.textContent = "PDF 转换失败，请重试其他文件";
  }
});

document.getElementById("nextBtn").addEventListener("click", nextSpread);
document.getElementById("prevBtn").addEventListener("click", prevSpread);

document.getElementById("zoomInBtn").addEventListener("click", () => {
  state.zoom = clamp(state.zoom + 10, 50, 220);
  render();
});

document.getElementById("zoomOutBtn").addEventListener("click", () => {
  state.zoom = clamp(state.zoom - 10, 50, 220);
  render();
});

document.getElementById("zoomResetBtn").addEventListener("click", () => {
  state.zoom = 100;
  render();
});

document.getElementById("toggleUiBtn").addEventListener("click", toggleUiPinned);

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " ") {
    event.preventDefault();
    nextSpread();
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    prevSpread();
  }
});

["mousemove", "click", "touchstart", "keydown"].forEach((eventName) => {
  document.addEventListener(eventName, showUiTemporarily, { passive: true });
});

render();
showUiTemporarily();
