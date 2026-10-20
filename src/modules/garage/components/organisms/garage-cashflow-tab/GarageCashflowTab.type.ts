export type GarageCashflowTabKey = "dashboard" | "vouchers";

export interface GarageCashflowTabProps {
  initialTab?: GarageCashflowTabKey;
  onOpenCaseDetail?: (caseCode: string) => void;
}
