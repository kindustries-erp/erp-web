import { CheckCircle2, SkipForward, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { XmlImportResultSummaryProps } from "./XmlImportResultSummary.type";

function badgeBase(color: string) {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${color}`;
}

export function XmlImportResultSummary({
  result,
}: XmlImportResultSummaryProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex flex-wrap gap-3">
      <span
        className={badgeBase(
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
        )}
      >
        <CheckCircle2 className="w-4 h-4" />
        {t("importCreated", {
          count: result.created,
          defaultValue: "{{count}} tạo mới",
        })}
      </span>
      <span
        className={badgeBase(
          "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
        )}
      >
        <SkipForward className="w-4 h-4" />
        {t("importSkipped", {
          count: result.skipped.length,
          defaultValue: "{{count}} bỏ qua",
        })}
      </span>
      <span
        className={badgeBase(
          "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300",
        )}
      >
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

export const ImportResultSummary = XmlImportResultSummary;
