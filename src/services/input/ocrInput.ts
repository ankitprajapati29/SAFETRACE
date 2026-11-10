import { createWorker } from "tesseract.js";
import type { OCRResult } from "../../types";

type OCRWorker = Awaited<ReturnType<typeof createWorker>>;

let workerPromise: Promise<OCRWorker> | null = null;

async function getWorker(): Promise<OCRWorker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng+hin").catch((error) => {
      workerPromise = null;
      throw error;
    });
  }

  return workerPromise;
}

export async function extractTextFromImage(
  image: File,
): Promise<OCRResult> {
  if (!image.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const maxSize = 10 * 1024 * 1024;

  if (image.size > maxSize) {
    throw new Error("Image size must be below 10 MB.");
  }

  if (image.size === 0) {
    throw new Error("The selected image is empty.");
  }

  const worker = await getWorker();
  const result = await worker.recognize(image);

  return {
    text: result.data.text.trim(),
    confidence: Math.round(result.data.confidence),
  };
}

export async function terminateOCRWorker(): Promise<void> {
  const currentWorkerPromise = workerPromise;
  workerPromise = null;

  if (!currentWorkerPromise) return;

  try {
    const worker = await currentWorkerPromise;
    await worker.terminate();
  } catch {
    // Worker may already have failed during initialization.
  }
}