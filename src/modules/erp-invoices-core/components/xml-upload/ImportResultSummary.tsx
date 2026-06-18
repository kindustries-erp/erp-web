import { CheckCircle2, SkipForward, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type BulkImportResult } from "../../api/erpInvoicesCoreApi";

interface Props {
  result: BulkImportResult;
}

function badgeBase(color: string) {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${color}`;
}

export function ImportResultSummary({ result }: Props) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex flex-wrap gap-3">
      <span className={badgeBase("bg-green-100 text-green-800")}>
        <CheckCircle2 className="w-4 h-4" />
        {t("importCreated", {
          count: result.created,
          defaultValue: "{{count}} tạo mới",
        })}
      </span>
      <span className={badgeBase("bg-amber-100 text-amber-800")}>
        <SkipForward className="w-4 h-4" />
        {t("importSkipped", {
          count: result.skipped.length,
          defaultValue: "{{count}} bỏ qua",
        })}
      </span>
      <span className={badgeBase("bg-red-100 text-red-800")}>
        <AlertCircle className="w-4 h-4" />
        {t("importErrors", {
          count: result.errors.length,
          defaultValue: "{{count}} lỗi",
        })}
      </span>
      <span className="text-xs text-muted-foreground self-center">
        {t("importTotal", {
          count: result.total,
          defaultValue: "/ {{count}} file",
        })}
      </span>
    </div>
  );
}
