import type {
  GarageCashflowMethodBreakdown,
  GarageCashflowContentBreakdown,
} from "../../../api/garageCashflowApi";

export interface GarageCashflowBreakdownPanelsProps {
  methodBreakdown?: GarageCashflowMethodBreakdown;
  contentBreakdown?: GarageCashflowContentBreakdown;
  loading?: boolean;
}
