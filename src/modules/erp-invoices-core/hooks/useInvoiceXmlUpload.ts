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
  type: "xml" | "pdf" | "zip";
  pairedPdf?: string; // Tên của file PDF (nếu đã ghép được)
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
    const supported = arr.filter((f) => {
      const ext = f.name.toLowerCase();
      return ext.endsWith(".xml") || ext.endsWith(".pdf") || ext.endsWith(".zip");
    });
    
    if (supported.length === 0) return;
    
    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.file.name));
      const newEntries = supported
        .filter((f) => !existingNames.has(f.name))
        .map((f) => {
          const ext = f.name.toLowerCase().split('.').pop() || '';
          return { 
            file: f, 
            id: crypto.randomUUID(),
            type: ext as "xml" | "pdf" | "zip"
          };
        });
        
      const allEntries = [...prev, ...newEntries];
      
      // Auto-pairing logic
      const pdfMap = new Map<string, string>(); // basename -> fullName
      allEntries.forEach(e => {
        if (e.type === "pdf") {
          const basename = e.file.name.substring(0, e.file.name.lastIndexOf('.')).toLowerCase();
          pdfMap.set(basename, e.file.name);
        }
      });
      
      return allEntries.map(e => {
        if (e.type === "xml") {
          const basename = e.file.name.substring(0, e.file.name.lastIndexOf('.')).toLowerCase();
          if (pdfMap.has(basename)) {
            return { ...e, pairedPdf: pdfMap.get(basename) };
          }
        }
        return e;
      });
    });
  }

  function removeFile(id: string) {
    setFiles((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      // Re-run pairing in case a PDF was removed
      const pdfMap = new Map<string, string>();
      filtered.forEach(e => {
        if (e.type === "pdf") {
          const basename = e.file.name.substring(0, e.file.name.lastIndexOf('.')).toLowerCase();
          pdfMap.set(basename, e.file.name);
        }
      });
      return filtered.map(e => {
        if (e.type === "xml") {
          const basename = e.file.name.substring(0, e.file.name.lastIndexOf('.')).toLowerCase();
          return { ...e, pairedPdf: pdfMap.get(basename) };
        }
        return e;
      });
    });
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
