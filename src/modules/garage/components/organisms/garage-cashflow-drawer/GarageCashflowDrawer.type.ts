import type {
  GarageCashflowVoucher,
  CreateGarageCashflowVoucherDto,
} from "../../../api/garageCashflowApi";

export type DrawerModeType = "view" | "edit";

export interface GarageCashflowDrawerProps {
  open: boolean;
  onClose: () => void;
  voucher: GarageCashflowVoucher | null;
  initialMode?: "view" | "edit" | "create";
}

export interface DrawerSectionProps {
  mode: DrawerModeType;
  voucher: GarageCashflowVoucher | null;
  formData: Partial<CreateGarageCashflowVoucherDto>;
  setFormData: React.Dispatch<
    React.SetStateAction<Partial<CreateGarageCashflowVoucherDto>>
  >;
}
