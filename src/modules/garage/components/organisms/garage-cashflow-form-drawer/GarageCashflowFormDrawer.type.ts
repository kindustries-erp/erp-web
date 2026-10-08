import type {
  CreateGarageCashflowPayload,
  GarageCashflowItem,
} from "@/modules/garage/api/garageCashflowApi";

export interface GarageCashflowFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit" | "view";
  initialData?: GarageCashflowItem | null;
  /** Khi mở từ Báo giá / Phiếu dịch vụ cụ thể */
  fixedCaseId?: string;
  fixedCaseCode?: string;
  suggestedAmount?: number;
  defaultType?: "RECEIPT" | "PAYMENT";
  onSuccess?: () => void;
}

export interface GarageCashflowFormData extends CreateGarageCashflowPayload {
  id?: string;
}

export interface CaseOptionItem {
  id: string;
  soChungTu: string;
  bienSoXe?: string;
  tenKhachHang?: string;
  tienCoThue: number;
  tienDaThanhToan: number;
  tienConPhaiThanhToan: number;
}

export interface BankTxnOptionItem {
  id: string;
  transDate?: string;
  amount: number;
  description?: string;
  correspondentName?: string;
}
