let html2canvasInstance = null;

export async function loadHtml2Canvas() {
  if (html2canvasInstance) return html2canvasInstance;

  try {
    const module = await import("html2canvas");
    html2canvasInstance = module.default;
    return html2canvasInstance;
  } catch (err) {
    console.error("Failed to load html2canvas:", err);
    throw new Error("Export unavailable");
  }
}

export async function captureElement(element, options = {}) {
  const html2canvas = await loadHtml2Canvas();
  return html2canvas(element, {
    allowTaint: true,
    useCORS: true,
    ...options,
  });
}