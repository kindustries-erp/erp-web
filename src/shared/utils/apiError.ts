import { useAppStore } from "@/core/config/appStore";
import { vi } from "@/core/locale/vi";
import { en } from "@/core/locale/en";

/**
 * Extracts a user-facing error message from an Axios error.
 * Preserves the original API/Directus error message as-is.
 * Falls back to a translated generic message if none is available.
 */
export function extractApiError(e: unknown, fallback?: string): string {
  const err = e as {
    response?: { data?: { message?: string | string[]; error?: string } };
    code?: string;
    message?: string;
  };

  // API returned a structured error body (NestJS / Directus passthrough)
  const apiMsg = err?.response?.data?.message;
  if (apiMsg) {
    // NestJS validation pipe can return string[]
    return Array.isArray(apiMsg) ? apiMsg.join("; ") : apiMsg;
  }

  // Explicit fallback from caller
  if (fallback) return fallback;

  // Network / timeout errors from axios (no response received)
  if (err?.code === "ECONNABORTED" || err?.code === "ERR_NETWORK") {
    const locale = useAppStore.getState().locale;
    const dict = locale === "en" ? en : vi;
    return err.code === "ECONNABORTED"
      ? dict.apiErrors.timeout
      : dict.apiErrors.networkError;
  }

  // Default i18n fallback
  const locale = useAppStore.getState().locale;
  const dict = locale === "en" ? en : vi;
  return dict.apiErrors.unknown;
}
