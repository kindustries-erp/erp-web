import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { BulkImportResult } from "../api/erpInvoicesCoreApi";
import { extractApiError } from "@/shared/utils/apiError";
import {
  createClientId,
  pairXmlWithPdf,
  splitManualMatches,
} from "./invoiceXmlPairing.helper";
import { useInvoiceXmlImportMutation } from "./useInvoiceXmlImportMutation";
import type { Direction, FileEntry, Step } from "./invoiceXmlUpload.type";

export type {
  Direction,
  FileEntry,
  FilePreviewStatus,
  Step,
} from "./invoiceXmlUpload.type";
export { getFilePreviewStatus } from "./invoiceXmlPairing.helper";

const SUPPORTED_EXTENSIONS = [".xml", ".pdf", ".zip"];

export function useInvoiceXmlUpload(
  onImported: (importId: string, direction: Direction) => void,
) {
  const { t } = useTranslation("erpInvoices");
  const importMutation = useInvoiceXmlImportMutation();

  const [direction, setDirection] = useState<Direction>("IN");
  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function addFiles(incoming: FileList | File[]) {
    const supported = Array.from(incoming).filter((f) =>
      SUPPORTED_EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext)),
    );
    if (supported.length === 0) return;

    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.file.name));
      const newEntries = supported
        .filter((f) => !existingNames.has(f.name))
        .map((f) => ({
          file: f,
          id: createClientId(),
          type: (f.name.toLowerCase().split(".").pop() ||
            "") as FileEntry["type"],
        }));
      return pairXmlWithPdf([...prev, ...newEntries]);
    });
  }

  function removeFile(id: string) {
    setFiles((prev) => pairXmlWithPdf(prev.filter((e) => e.id !== id)));
  }

  async function handleImport(
    filesToImport?: FileEntry[],
    manualMatches?: Record<string, string>,
  ) {
    const targetFiles = filesToImport ?? files;
    if (targetFiles.length === 0) return;
    setStep("importing");
    setImportError(null);
    try {
      const finalResult = await importMutation.mutateAsync({
        direction,
        targetFiles,
        manualMatches,
      });
      setResult(finalResult);
      setStep("result");
      const hasManualMatch =
        splitManualMatches(targetFiles, manualMatches).manualFiles.size > 0;
      if (finalResult.created > 0 || hasManualMatch) {
        onImported(finalResult.importId, finalResult.direction);
      }
    } catch (e) {
      setImportError(
        extractApiError(
          e,
          t("errorImport", "Không thể import. Vui lòng thử lại."),
        ),
      );
      setStep("select");
    }
  }

  function handleReset() {
    setStep("select");
    setFiles([]);
    setResult(null);
    setImportError(null);
  }

  return {
    direction,
    setDirection,
    step,
    setStep,
    files,
    result,
    importError,
    addFiles,
    removeFile,
    handleImport,
    handleReset,
  };
}
