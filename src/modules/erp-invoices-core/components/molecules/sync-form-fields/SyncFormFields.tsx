import { useTranslation } from "react-i18next";
import { Input } from "@/shared/components/ui/input";

/** Giá trị các ô của form đồng bộ nâng cao (khai báo tại đây để molecule không phụ thuộc organism) */
export interface SyncFormFieldValues {
  companyTaxCode: string;
  syncType: "purchase" | "sold";
  fromDate: string;
  toDate: string;
}

export interface SyncFormFieldsProps {
  values: SyncFormFieldValues;
  /** Cú pháp method để tham số được so sánh hai chiều: hook có thể có thêm khóa khác */
  onFieldChange<K extends keyof SyncFormFieldValues>(
    field: K,
    value: SyncFormFieldValues[K],
  ): void;
}

/** Hai hàng ô nhập: mã số thuế + loại hóa đơn, từ ngày + đến ngày */
export function SyncFormFields({ values, onFieldChange }: SyncFormFieldsProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            {t("advancedSyncTaxCode", "Mã số thuế")} *
          </label>
          <Input
            value={values.companyTaxCode}
            onChange={(e) => onFieldChange("companyTaxCode", e.target.value)}
            placeholder={t("advancedSyncTaxCodePlaceholder", "VD: 0101234567")}
            className="h-8 text-xs font-mono"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            {t("advancedSyncType", "Loại hóa đơn")}
          </label>
          <select
            value={values.syncType}
            onChange={(e) =>
              onFieldChange("syncType", e.target.value as "purchase" | "sold")
            }
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="purchase">
              {t("advancedSyncPurchase", "Hóa đơn mua vào")}
            </option>
            <option value="sold">
              {t("advancedSyncSold", "Hóa đơn bán ra")}
            </option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            {t("advancedSyncFromDate", "Từ ngày")}
          </label>
          <Input
            type="date"
            value={values.fromDate}
            onChange={(e) => onFieldChange("fromDate", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-slate-700 dark:text-slate-300">
            {t("advancedSyncToDate", "Đến ngày")}
          </label>
          <Input
            type="date"
            value={values.toDate}
            onChange={(e) => onFieldChange("toDate", e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>
    </>
  );
}
