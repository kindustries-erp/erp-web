import { GarageCashflowTabKey } from "@/shared/constants/urlParams";

export { GarageCashflowTabKey };

export type GarageCashflowTabKeyType = "dashboard" | "vouchers" | "forecast";

export interface GarageCashflowTabProps {
  initialTab?: GarageCashflowTabKey | GarageCashflowTabKeyType;
  onOpenCaseDetail?: (caseCode: string) => void;
}
