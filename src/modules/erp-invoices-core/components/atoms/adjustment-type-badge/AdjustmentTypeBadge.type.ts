export type AdjustmentRoleType =
  | "ORIGINAL"
  | "ADJUSTING"
  | "REPLACEMENT"
  | "STANDARD"
  | "FULL_CANCELLATION";

export interface AdjustmentTypeBadgeProps {
  role: AdjustmentRoleType;
  taxInvoiceStatus?: number | null;
  className?: string;
}
