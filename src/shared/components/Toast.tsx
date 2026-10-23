import { V2Toaster } from "@/v2/shared/components";

/**
 * Toast V1 legacy compatibility wrapper.
 * Unified with V2Toaster to ensure consistent positioning and dark theme design.
 */
export function Toast() {
  return <V2Toaster />;
}
