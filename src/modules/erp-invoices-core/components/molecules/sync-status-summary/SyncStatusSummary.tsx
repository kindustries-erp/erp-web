import { FileCheck2 } from "lucide-react";
import { useTranslation } from "react-i18next";

/** Số liệu tóm tắt của một tiến trình đồng bộ PDF gốc */
export interface SyncStatusSummaryProps {
  status: {
    id: string;
    totalFound: number;
    totalPdfSuccess: number;
    totalPdfFailed: number;
  };
}

export function SyncStatusSummary({ status }: SyncStatusSummaryProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
      <div className="flex items-center gap-1.5 font-medium">
        <FileCheck2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <span>
          {t("advancedSyncTaskCreated", "Đã tạo tiến trình đồng bộ")}:{" "}
          {status.id.slice(0, 8)}...
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400">
        <span>
          {t("advancedSyncTotalFound", "Tìm thấy")}: {status.totalFound}
        </span>
        <span>
          {t("advancedSyncPdfSuccess", "PDF thành công")}:{" "}
          {status.totalPdfSuccess}
        </span>
        <span>
          {t("advancedSyncPdfFailed", "Thất bại")}: {status.totalPdfFailed}
        </span>
      </div>
    </div>
  );
}
