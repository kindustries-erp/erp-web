import { AlertCircle, CheckCircle2, SkipForward } from "lucide-react";
import { useTranslation } from "react-i18next";
import { XmlImportResultTable } from "@/modules/erp-invoices-core/components/molecules/xml-import-result-table";
import {
  errorColumns,
  pdfAttachedColumns,
  pdfOrphanColumns,
  skippedColumns,
} from "./xmlImportResultColumns";
import { type XmlImportResultTablesProps } from "./XmlImportResultTables.type";

function SectionTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
      {icon}
      {children}
    </h3>
  );
}

export function XmlImportResultTables({
  result,
  onOpenInvoice,
}: XmlImportResultTablesProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <div className="flex flex-col gap-6">
      {result.skipped.length > 0 && (
        <div>
          <SectionTitle
            icon={<SkipForward className="h-4 w-4 text-amber-600" />}
          >
            {t("importSkippedTitle", "Hóa đơn bị bỏ qua (trùng lặp)")}
          </SectionTitle>
          <XmlImportResultTable
            columns={skippedColumns(t)}
            rows={result.skipped}
            getRowKey={(r) => r.filename + r.invoiceNo}
          />
        </div>
      )}

      {result.errors.length > 0 && (
        <div>
          <SectionTitle
            icon={<AlertCircle className="h-4 w-4 text-destructive" />}
          >
            {t("importErrorTitle", "Lỗi xử lý")}
          </SectionTitle>
          <XmlImportResultTable
            columns={errorColumns(t)}
            rows={result.errors}
            getRowKey={(r) => r.filename}
          />
        </div>
      )}

      {result.pdfAttached && result.pdfAttached.length > 0 && (
        <div>
          <SectionTitle
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          >
            PDF đã được ghép vào hóa đơn
          </SectionTitle>
          <XmlImportResultTable
            columns={pdfAttachedColumns(onOpenInvoice)}
            rows={result.pdfAttached}
            getRowKey={(r) => r.filename}
          />
        </div>
      )}

      {result.pdfOrphans && result.pdfOrphans.length > 0 && (
        <div>
          <SectionTitle
            icon={<AlertCircle className="h-4 w-4 text-amber-600" />}
          >
            PDF không ghép được (Orphans)
          </SectionTitle>
          <XmlImportResultTable
            columns={pdfOrphanColumns()}
            rows={result.pdfOrphans}
            getRowKey={(r) => r.filename}
          />
        </div>
      )}
    </div>
  );
}
