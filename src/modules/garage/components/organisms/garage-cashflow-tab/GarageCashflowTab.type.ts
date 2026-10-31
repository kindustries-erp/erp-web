export enum GarageCashflowTabKey {
  DASHBOARD = "dashboard",
  VOUCHERS = "vouchers",
  FORECAST = "forecast",
}

export type GarageCashflowTabKeyType = "dashboard" | "vouchers" | "forecast";

export interface GarageCashflowTabProps {
  initialTab?: GarageCashflowTabKey | GarageCashflowTabKeyType;
  onOpenCaseDetail?: (caseCode: string) => void;
}
