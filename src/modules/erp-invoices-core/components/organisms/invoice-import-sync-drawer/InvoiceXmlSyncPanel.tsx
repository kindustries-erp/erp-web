import { useTranslation } from "react-i18next";
import { AlertCircle } from "lucide-react";
import type { useInvoiceXmlUpload } from "@/modules/erp-invoices-core/hooks/useInvoiceXmlUpload";
import { XmlUploadDropzone as UploadDropzone } from "@/modules/erp-invoices-core/components/molecules/xml-upload-dropzone";
import { XmlUploadFileList as UploadFileList } from "@/modules/erp-invoices-core/components/molecules/xml-upload-file-list";
import { XmlImportResultSummary as ImportResultSummary } from "@/modules/erp-invoices-core/components/molecules/xml-import-result-summary";
import { XmlImportResultTables as ImportResultTables } from "@/modules/erp-invoices-core/components/organisms/xml-import-result-tables";

export interface InvoiceXmlSyncPanelProps {
  xml: ReturnType<typeof useInvoiceXmlUpload>;
  onOpenInvoice: (invoiceId: string) => void;
}

/** Nhánh "Tải file từ máy tính": chọn file → đang import → kết quả */
export function InvoiceXmlSyncPanel({
  xml,
  onOpenInvoice,
}: InvoiceXmlSyncPanelProps) {
  const { t } = useTranslation("erpInvoices");

  if (xml.step === "select") {
    return (
      <div className="flex flex-col gap-4">
        <UploadDropzone onFilesSelected={xml.addFiles} />
        <UploadFileList files={xml.files} onRemove={xml.removeFile} />
        {xml.importError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {xml.importError}
          </div>
        )}
      </div>
    );
  }

  if (xml.step === "importing") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-foreground">
          {t("importProcessing", {
            count: xml.files.length,
            defaultValue: `Đang xử lý ${xml.files.length} file XML...`,
          })}
        </p>
        <p className="text-xs text-muted-foreground text-center">
          {t(
            "importProcessingSubtext",
            "Hệ thống đang parse và tạo hóa đơn. Vui lòng chờ.",
          )}
        </p>
      </div>
    );
  }

  if (!xml.result) return null;

  const { result } = xml;
  const hasNothing =
    result.created === 0 &&
    result.skipped.length === 0 &&
    result.errors.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <ImportResultSummary result={result} />
      <ImportResultTables result={result} onOpenInvoice={onOpenInvoice} />
      {hasNothing && (
        <p className="text-sm text-muted-foreground text-center py-4">
          {t("importNoData", "Không có file nào được xử lý.")}
        </p>
      )}
    </div>
  );
}
