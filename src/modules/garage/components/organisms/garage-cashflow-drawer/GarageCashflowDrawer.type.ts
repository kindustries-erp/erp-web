import type React from "react";
import { V2DrawerMode, type V2DrawerModeType } from "@/v2/shared/types";
import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";

export { V2DrawerMode };
export type DrawerModeType = V2DrawerModeType;

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
  initialMode?: V2DrawerMode | "view" | "edit" | "create";
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
