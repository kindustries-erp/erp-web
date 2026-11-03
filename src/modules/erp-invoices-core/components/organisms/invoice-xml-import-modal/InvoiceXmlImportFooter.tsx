import { useTranslation } from "react-i18next";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";

export interface InvoiceXmlImportFooterProps {
  selectedCount: number;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Thanh cuối modal xem trước: số file đã chọn, nút hủy và xác nhận import */
export function InvoiceXmlImportFooter({
  selectedCount,
  totalCount,
  onCancel,
  onConfirm,
}: InvoiceXmlImportFooterProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="text-xs text-muted-foreground">
        {selectedCount === 0 ? (
          <span className="font-medium text-amber-600">
            {t("importPickAtLeastOne", "Chọn ít nhất 1 file để import")}
          </span>
        ) : (
          <>
            {t("importSelectedCount", "Đã chọn")}{" "}
            <strong className="text-foreground">{selectedCount}</strong> /{" "}
            {totalCount} {t("importFilesUnit", "file")}
          </>
        )}
      </span>
      <div className="flex items-center gap-2">
        <V2Button variant="outline" size="sm" onClick={onCancel}>
          {t("importCancel", "Hủy")}
        </V2Button>
        <V2Button size="sm" disabled={selectedCount === 0} onClick={onConfirm}>
          {t("importConfirm", "Xác nhận Import")} ({selectedCount}{" "}
          {t("importFilesUnit", "file")})
        </V2Button>
      </div>
    </div>
  );
}
