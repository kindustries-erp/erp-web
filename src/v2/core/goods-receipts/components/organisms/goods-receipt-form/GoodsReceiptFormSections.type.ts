import type { GoodsReceiptFormValue } from "@/v2/core/goods-receipts";

export interface FormSectionsProps {
  form: GoodsReceiptFormValue;
  viewing: boolean;
  codeEditable: boolean;
  onRegenerateCode: () => void;
  errorField: string | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof GoodsReceiptFormValue>(
    key: K,
    value: GoodsReceiptFormValue[K],
  ) => void;
  hideLines?: boolean;
  columns?: 1 | 2;
}
