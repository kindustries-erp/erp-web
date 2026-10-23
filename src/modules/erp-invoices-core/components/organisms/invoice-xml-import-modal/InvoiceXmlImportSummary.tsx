import { useTranslation } from "react-i18next";
import { Archive, FileCode, FileText } from "lucide-react";

export interface InvoiceXmlImportSummaryProps {
  selectedCount: number;
  totalCount: number;
  counts: Record<string, number>;
}

/** Thanh tóm tắt số file được chọn và số lượng theo loại */
export function InvoiceXmlImportSummary({
  selectedCount,
  totalCount,
  counts,
}: InvoiceXmlImportSummaryProps) {
  const { t } = useTranslation("erpInvoices");
  return (
    <div className="mb-3 flex flex-wrap items-center gap-4 rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
      <span className="font-medium text-foreground">
        {selectedCount}/{totalCount}{" "}
        {t("importSelectedFiles", "file được chọn")}
      </span>
      {!!counts["xml"] && (
        <span className="flex items-center gap-1">
          <FileCode className="h-3.5 w-3.5 text-sky-500" />
          {counts["xml"]} XML
        </span>
      )}
      {!!counts["pdf"] && (
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-red-500" />
          {counts["pdf"]} PDF
        </span>
      )}
      {!!counts["zip"] && (
        <span className="flex items-center gap-1">
          <Archive className="h-3.5 w-3.5 text-amber-500" />
          {counts["zip"]} ZIP
        </span>
      )}
    </div>
  );
}
