import { useTranslation } from "react-i18next";
import { XCircle } from "lucide-react";
import type { PortalSyncResult } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceGdtSyncResultProps {
  result: PortalSyncResult;
}

export function InvoiceGdtSyncResult({ result }: InvoiceGdtSyncResultProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 space-y-1">
      <div className="font-semibold mb-2">
        {t("gdtSyncResultTitle", "Đồng bộ thành công")}
      </div>
      {result.note ? (
        <div className="text-sm">{result.note}</div>
      ) : (
        <>
          <div>
            • <span className="font-semibold">{result.imported}</span>{" "}
            {t("gdtSyncImportedLabel", "hóa đơn mới")}
          </div>
          <div>
            • {t("gdtSyncSkippedPrefix", "Bỏ qua")}{" "}
            <span className="font-semibold">{result.skipped}</span>{" "}
            {t("gdtSyncSkippedLabel", "hóa đơn trùng")}
          </div>
          <div>
            • {t("gdtSyncQueuedPrefix", "Xếp hàng tải nền")}{" "}
            <span className="font-semibold">{result.xmlDownloadQueued}</span>{" "}
            {t("gdtSyncQueuedLabel", "file XML")}
          </div>
        </>
      )}
      {result.errors && result.errors.length > 0 && (
        <div className="text-red-600 flex items-center gap-1 mt-2">
          <XCircle className="h-4 w-4" />
          {t("importErrors", {
            count: result.errors.length,
            defaultValue: "{{count}} lỗi",
          })}
        </div>
      )}
    </div>
  );
}
