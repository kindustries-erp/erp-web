import { type SettlementType } from "../voucher-netoff-right-panel";

export type { SettlementType };

export type ManualSettlementCategory =
  | "TIEN_MAT_NGOAI"
  | "CHUYEN_KHOAN_CA_NHAN"
  | "CHI_PHI_KHAC"
  | "VI_DIEN_TU"
  | "DAT_COC"
  | "THU_KHAC"
  | "HOAN_UNG"
  | "CHI_KHAC";

export interface OffSystemManualSectionProps {
  settlementType: SettlementType;
  currentRemaining: number;
  manualAmount: number;
  setManualAmount: (val: number) => void;
  manualDate: string;
  setManualDate: (val: string) => void;
  manualCategory: ManualSettlementCategory;
  setManualCategory: (val: ManualSettlementCategory) => void;
  manualPartner: string;
  setManualPartner: (val: string) => void;
  manualNote: string;
  setManualNote: (val: string) => void;
}
