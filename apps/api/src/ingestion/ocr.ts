import { createCanvas, DOMMatrix, ImageData, Path2D } from '@napi-rs/canvas';
import { createWorker, Worker } from 'tesseract.js';

interface RenderablePage {
  getViewport(params: { scale: number }): { width: number; height: number };
  render(params: {
    canvas: null;
    canvasContext: unknown;
    viewport: { width: number; height: number };
  }): { promise: Promise<void> };
}

let workerPromise: Promise<Worker> | null = null;

function ensureCanvasGlobals() {
  const target = globalThis as unknown as Record<string, unknown>;
  target.DOMMatrix ??= DOMMatrix;
  target.ImageData ??= ImageData;
  target.Path2D ??= Path2D;
}

function worker() {
  workerPromise ??= createWorker('spa');
  return workerPromise;
}

export async function stopOcr() {
  if (!workerPromise) return;
  const current = await workerPromise;
  workerPromise = null;
  await current.terminate();
}

export async function readPageImage(page: unknown) {
  const renderable = page as RenderablePage;
  ensureCanvasGlobals();
  const viewport = renderable.getViewport({ scale: 2 });
  const canvas = createCanvas(
    Math.ceil(viewport.width),
    Math.ceil(viewport.height),
  );
  const context = canvas.getContext('2d');
  await renderable.render({ canvas: null, canvasContext: context, viewport })
    .promise;
  const png = canvas.toBuffer('image/png');
  const result = await (await worker()).recognize(png);
  return result.data.text.replace(/\s+/g, ' ').trim();
}
