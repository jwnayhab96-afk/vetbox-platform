export async function getFunctionErrorMessage(
  error: unknown,
  data: unknown,
  fallback = "تعذر تنفيذ العملية",
): Promise<string> {
  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    return data.error;
  }

  const context = (error as { context?: unknown } | null)?.context;
  if (context && typeof context === "object") {
    const response = context as { clone?: () => Response; text?: () => Promise<string> };
    try {
      const raw = typeof response.clone === "function"
        ? await response.clone().text()
        : typeof response.text === "function" ? await response.text() : "";
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (typeof parsed.error === "string") return parsed.error;
          if (typeof parsed.message === "string") return parsed.message;
        } catch {
          return raw.slice(0, 500);
        }
      }
    } catch {
      // Fall through to the SDK error message.
    }
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return fallback;
}
