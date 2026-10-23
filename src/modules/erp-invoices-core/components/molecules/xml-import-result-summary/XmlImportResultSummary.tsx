import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle2, SkipForward } from "lucide-react";
import { Badge } from "@/v2/shared/ui/badge";
import type { XmlImportResultSummaryProps } from "./XmlImportResultSummary.type";

export function XmlImportResultSummary({
  result,
}: XmlImportResultSummaryProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-sm">
        <CheckCircle2 className="h-4 w-4" />
        {t("importCreated", {
          count: result.created,
          defaultValue: "{{count}} tạo mới",
        })}
      </Badge>
      <Badge variant="warning" className="gap-1.5 px-3 py-1.5 text-sm">
        <SkipForward className="h-4 w-4" />
        {t("importSkipped", {
          count: result.skipped.length,
          defaultValue: "{{count}} bỏ qua",
        })}
      </Badge>
      <Badge variant="destructive" className="gap-1.5 px-3 py-1.5 text-sm">
        <AlertCircle className="h-4 w-4" />
        {t("importErrors", {
          count: result.errors.length,
          defaultValue: "{{count}} lỗi",
        })}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {t("importTotal", {
          count: result.total,
          defaultValue: "/ {{count}} file",
        })}
      </span>
    </div>
  );
}

export const ImportResultSummary = XmlImportResultSummary;
