import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type BulkImportResult,
} from "../api/erpInvoicesCoreApi";
import { extractApiError } from "@/shared/utils/apiError";

export type Step = "select" | "importing" | "result";
export type Direction = "IN" | "OUT";

export interface FileEntry {
  file: File;
  id: string;
}

export function useInvoiceXmlUpload(
  onImported: (importId: string, direction: Direction) => void,
) {
  const { t } = useTranslation("erpInvoices");

  const [direction, setDirection] = useState<Direction>("IN");
  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming);
    const xmlOnly = arr.filter((f) => f.name.toLowerCase().endsWith(".xml"));
    if (xmlOnly.length === 0) return;
    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.file.name));
      const newEntries = xmlOnly
        .filter((f) => !existingNames.has(f.name))
        .map((f) => ({ file: f, id: crypto.randomUUID() }));
      return [...prev, ...newEntries];
    });
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((e) => e.id !== id));
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  }, []);

  async function handleImport() {
    if (files.length === 0) return;
    setStep("importing");
    setImportError(null);
    try {
      const rawFiles = files.map((e) => e.file);
      const res =
        direction === "IN"
          ? await erpInvoicesCoreApi.bulkImportBuyerXml(rawFiles)
          : await erpInvoicesCoreApi.bulkImportSellerXml(rawFiles);
      setResult(res);
      setStep("result");
      if (res.created > 0) {
        onImported(res.importId, res.direction);
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
    dragging,
    result,
    importError,
    addFiles,
    removeFile,
    onDragOver,
    onDragLeave,
    onDrop,
    handleImport,
    handleReset,
  };
}
