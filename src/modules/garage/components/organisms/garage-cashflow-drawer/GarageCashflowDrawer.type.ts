import type React from "react";
import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";

export type DrawerModeType = "view" | "edit";

export interface InitialCashflowData {
  voucherType?: "RECEIPT" | "PAYMENT";
  transDate?: string;
  amount?: number;
  partnerName?: string;
  partnerPhone?: string;
  licensePlate?: string;
  note?: string;
  paymentMethod?: string;
  paymentContent?: string;
  caseId?: string;
  customerCode?: string;
  supplierId?: string;
}

export interface GarageCashflowDrawerProps {
  open: boolean;
  onClose: () => void;
  voucher: GarageCashflowVoucher | null;
  initialMode?: "view" | "edit" | "create";
  initialData?: InitialCashflowData;
  onSuccess?: () => void;
}

export interface DrawerSectionProps {
  mode: DrawerModeType;
  voucher: GarageCashflowVoucher | null;
  formData: Partial<CreateGarageCashflowVoucherDto>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<CreateGarageCashflowVoucherDto>>
  >;
  initialData?: InitialCashflowData;
}
