import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { V2Modal } from "@/v2/shared/components/molecules/v2-modal";
import { V2Button } from "@/v2/shared/components/atoms/v2-button";
import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { InvoiceXmlImportFilesTable } from "./InvoiceXmlImportFilesTable";
import { type MatchedInvoice } from "./InvoiceXmlImportFileNote";
import { XmlFilePreviewModal } from "@/modules/erp-invoices-core/components/molecules/xml-file-preview-modal";
import { InvoiceXmlImportSummary } from "./InvoiceXmlImportSummary";
import {
  buildInitialSelection,
  buildSelectionFrom,
  selectedIdsOf,
  toInvoiceOption,
} from "./invoiceXmlImportModal.helper";
import { type InvoiceXmlImportModalProps } from "./InvoiceXmlImportModal.type";

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
  const [matchedInvoices, setMatchedInvoices] = useState<
    Record<string, MatchedInvoice | null>
  >({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [manualMatches, setManualMatches] = useState<Record<string, string>>(
    {},
  );
  const [candidateInvoices, setCandidateInvoices] = useState<
    { value: string; label: string }[]
  >([]);

  // Reset selection when modal opens with new files
  const [prevFiles, setPrevFiles] = useState(files);
  if (prevFiles !== files) {
    setPrevFiles(files);
    setRowSelection(buildInitialSelection(files));
    setManualMatches({});
  }

  // Fetch matches when files change
  useEffect(() => {
    if (!open) return;
    const pdfNames = files
      .filter((f) => f.type === "pdf" && !f.pairedPdf)
      .map((f) => f.file.name);

    if (pdfNames.length > 0) {
      erpInvoicesCoreApi
        .previewPdfMatch(pdfNames, direction)
        .then((res) => setMatchedInvoices(res))
        .catch((err) => console.error("Failed to preview pdf match", err));

      erpInvoicesCoreApi
        .list({ direction, pageSize: 50 })
        .then((res) => setCandidateInvoices(res.items.map(toInvoiceOption)));
    }
  }, [open, files, direction]);

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;
  const selectedFiles = files.filter((f) => rowSelection[f.id]);

  const counts = useMemo(
    () =>
      files.reduce(
        (acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [files],
  );

  const setManualMatch = (id: string, value: string) => {
    setManualMatches((prev) => ({ ...prev, [id]: value }));
    if (value && !rowSelection[id]) {
      setRowSelection((prev) => ({ ...prev, [id]: true }));
    }
  };

  const footer = (
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
            {files.length} {t("importFilesUnit", "file")}
          </>
        )}
      </span>
      <div className="flex items-center gap-2">
        <V2Button variant="outline" size="sm" onClick={onCancel}>
          {t("importCancel", "Hủy")}
        </V2Button>
        <V2Button
          size="sm"
          disabled={selectedCount === 0}
          onClick={() => onConfirm(selectedFiles, manualMatches)}
        >
          {t("importConfirm", "Xác nhận Import")} ({selectedCount}{" "}
          {t("importFilesUnit", "file")})
        </V2Button>
      </div>
    </div>
  );

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
        footer={footer}
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
