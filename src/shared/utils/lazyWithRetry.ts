import { ComponentType, lazy, LazyExoticComponent } from "react";

const RETRY_KEY = "erp_chunk_load_retried";

/**
 * Wraps dynamic component imports with React.lazy and adds automatic recovery
 * when encountering ChunkLoadError / dynamic import fetch failures (typically
 * caused by a new deployment replacing previous build assets on the server).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const component = await factory();
      // Reset the retry flag on successful component load
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(RETRY_KEY);
      }
      return component;
    } catch (error) {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const hasRetried = window.sessionStorage.getItem(RETRY_KEY);
        if (!hasRetried) {
          console.warn(
            "[lazyWithRetry] Dynamic import failed (chunk mismatch). Triggering page reload to sync assets...",
            error,
          );
          window.sessionStorage.setItem(RETRY_KEY, "true");
          window.location.reload();
          // Return a pending promise so React doesn't crash during reload
          return new Promise<{ default: T }>(() => {});
        }
        // If already retried once and still failing, clear flag and let error boundary catch it
        window.sessionStorage.removeItem(RETRY_KEY);
      }
      throw error;
    }
  });
}
