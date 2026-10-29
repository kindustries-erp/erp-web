import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { InvoiceXmlImportFilesTable } from "./InvoiceXmlImportFilesTable";
import { type MatchedInvoice } from "./InvoiceXmlImportFileNote";
import { XmlFilePreviewModal } from "@/modules/erp-invoices-core/components/molecules/xml-file-preview-modal";
import { InvoiceXmlImportSummary } from "./InvoiceXmlImportSummary";
import { InvoiceXmlImportFooter } from "./InvoiceXmlImportFooter";
import {
  buildInitialSelection,
  buildSelectionFrom,
  countFilesByType,
  selectedIdsOf,
  toInvoiceOption,
} from "./invoiceXmlImportModal.helper";
import { type InvoiceXmlImportModalProps } from "./InvoiceXmlImportModal.type";

const NO_MATCHES: Record<string, MatchedInvoice | null> = {};

export function InvoiceXmlImportModal({
  open,
  files,
  direction,
  onConfirm,
  onCancel,
}: InvoiceXmlImportModalProps) {
  const { t } = useTranslation("erpInvoices");

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>(
    () => buildInitialSelection(files),
  );
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [manualMatches, setManualMatches] = useState<Record<string, string>>(
    {},
  );

  // Reset selection when modal opens with new files
  const [prevFiles, setPrevFiles] = useState(files);
  if (prevFiles !== files) {
    setPrevFiles(files);
    setRowSelection(buildInitialSelection(files));
    setManualMatches({});
  }

  // PDF chưa ghép tự động: server đề xuất hóa đơn khớp và tải danh sách để ghép tay
  const pdfNames = useMemo(
    () =>
      files
        .filter((f) => f.type === "pdf" && !f.pairedPdf)
        .map((f) => f.file.name),
    [files],
  );
  const needsMatching = open && pdfNames.length > 0;

  const matchQuery = useQuery({
    queryKey: ["erp-invoices", "xml-pdf-match", direction, pdfNames],
    queryFn: () => erpInvoicesCoreApi.previewPdfMatch(pdfNames, direction),
    enabled: needsMatching,
  });
  const candidateQuery = useQuery({
    queryKey: ["erp-invoices", "xml-candidates", direction],
    queryFn: async () =>
      (await erpInvoicesCoreApi.list({ direction, pageSize: 50 })).items,
    enabled: needsMatching,
  });

  const matchedInvoices = matchQuery.data ?? NO_MATCHES;
  const candidateInvoices = useMemo(
    () => (candidateQuery.data ?? []).map((inv) => toInvoiceOption(inv, t)),
    [candidateQuery.data, t],
  );

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const selectedFiles = files.filter((f) => rowSelection[f.id]);

  const counts = useMemo(() => countFilesByType(files), [files]);

  const setManualMatch = (id: string, value: string) => {
    setManualMatches((prev) => ({ ...prev, [id]: value }));
    if (value && !rowSelection[id]) {
      setRowSelection((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <>
      <V2Modal
        open={open}
        onOpenChange={(next) => {
          if (!next) onCancel();
        }}
        size="xl"
        title={t("importPreviewTitle", "Xem trước danh sách file")}
        description={t(
          "importPreviewDesc",
          "Bỏ chọn file không muốn import, sau đó xác nhận",
        )}
        footer={
          <InvoiceXmlImportFooter
            selectedCount={selectedCount}
            totalCount={files.length}
            onCancel={onCancel}
            onConfirm={() => onConfirm(selectedFiles, manualMatches)}
          />
        }
      >
        <InvoiceXmlImportSummary
          selectedCount={selectedCount}
          totalCount={files.length}
          counts={counts}
        />

        <div className="max-h-[60vh] overflow-auto">
          <InvoiceXmlImportFilesTable
            files={files}
            direction={direction}
            selectedIds={selectedIdsOf(files, rowSelection)}
            onSelectedIdsChange={(ids) =>
              setRowSelection(buildSelectionFrom(files, ids))
            }
            onPreview={setPreviewFile}
            matchedInvoices={matchedInvoices}
            manualMatches={manualMatches}
            candidateOptions={candidateInvoices}
            onManualMatchChange={setManualMatch}
          />
        </div>
      </V2Modal>

      <XmlFilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </>
  );
}

// Backward compatibility alias
export const ImportPreviewModal = InvoiceXmlImportModal;
