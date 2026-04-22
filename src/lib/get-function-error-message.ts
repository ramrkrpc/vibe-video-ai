export async function getFunctionErrorMessage(error: unknown, fallback = "Request failed") {
  let message =
    typeof error === "object" && error && "message" in error && typeof error.message === "string"
      ? error.message
      : String(error ?? fallback);

  if (typeof error === "object" && error && "context" in error) {
    const context = error.context;

    if (context instanceof Response) {
      try {
        const payload = await context.clone().json();
        if (payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string") {
          message = payload.error;
        }
      } catch {
        try {
          const text = await context.clone().text();
          if (text) message = text;
        } catch {
          message = message || fallback;
        }
      }
    }
  }

  return message;
}