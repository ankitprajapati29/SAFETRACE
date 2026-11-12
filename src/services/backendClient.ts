
import type { BackendAnalysisResponse } from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://safetrace-backend-ygfi.onrender.com")
).replace(/\/+$/, "");

const REQUEST_TIMEOUT = 30_000;

export async function analyzeWithBackend(
  message: string,
): Promise<string> {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error("Message cannot be empty.");
  }

  const controller = new AbortController();

  const timeoutId = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT,
  );

  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ message: cleanMessage }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `Backend request failed (${response.status}).`,
      );
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("analysis" in data) ||
      typeof (data as BackendAnalysisResponse).analysis !== "string"
    ) {
      throw new Error("Invalid backend response format.");
    }

    return (data as BackendAnalysisResponse).analysis;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Analysis request timed out.");
    }

    throw error instanceof Error
      ? error
      : new Error("Unable to connect to the analysis server.");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
