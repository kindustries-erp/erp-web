import type {
  PurchaseOrderFormField,
  PurchaseOrderFormValue,
} from "../../../domain/purchaseOrder";

export interface PurchaseOrderFormSectionsProps {
  form: PurchaseOrderFormValue;
  viewing: boolean;
  /** Đang tạo mới: cho sửa số đơn và hiện nút sinh số */
  creating: boolean;
  onRegenerateNo: () => void;
  errorField: PurchaseOrderFormField | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof PurchaseOrderFormValue>(
    key: K,
    value: PurchaseOrderFormValue[K],
  ) => void;
}
