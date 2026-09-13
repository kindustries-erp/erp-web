import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  erpInvoicesCoreApi,
  type BulkImportResult,
} from "../api/erpInvoicesCoreApi";
import { extractApiError } from "@/shared/utils/apiError";

function createClientId() {
  const maybeCrypto = (globalThis as any)?.crypto;
  if (maybeCrypto && typeof maybeCrypto.randomUUID === "function") {
    return maybeCrypto.randomUUID();
  }
  return `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type Step = "select" | "importing" | "result";
export type Direction = "IN" | "OUT";

export interface FileEntry {
  file: File;
  id: string;
  type: "xml" | "pdf" | "zip";
  pairedPdf?: string; // Tên của file PDF (nếu đã ghép được)
}

export type FilePreviewStatus = "new-invoice" | "attach-pdf" | "extract-zip";

/** Phân loại file ở bước preview (client-side, trước API).
 *  PDF (cả standalone lẫn paired) đều là "attach-pdf" — server mới biết có ghép được không. */
export function getFilePreviewStatus(entry: FileEntry): FilePreviewStatus {
  if (entry.type === "zip") return "extract-zip";
  if (entry.type === "pdf") return "attach-pdf";
  return "new-invoice";
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
      return (
        ext.endsWith(".xml") || ext.endsWith(".pdf") || ext.endsWith(".zip")
      );
    });

    if (supported.length === 0) return;

    setFiles((prev) => {
      const existingNames = new Set(prev.map((e) => e.file.name));
      const newEntries = supported
        .filter((f) => !existingNames.has(f.name))
        .map((f) => {
          const ext = f.name.toLowerCase().split(".").pop() || "";
          return {
            file: f,
            id: createClientId(),
            type: ext as "xml" | "pdf" | "zip",
          };
        });

      const allEntries = [...prev, ...newEntries];

      // Auto-pairing logic
      const pdfMap = new Map<string, string>(); // basename -> fullName
      allEntries.forEach((e) => {
        if (e.type === "pdf") {
          const basename = e.file.name
            .substring(0, e.file.name.lastIndexOf("."))
            .toLowerCase();
          pdfMap.set(basename, e.file.name);
        }
      });

      return allEntries.map((e) => {
        if (e.type === "xml") {
          const basename = e.file.name
            .substring(0, e.file.name.lastIndexOf("."))
            .toLowerCase();
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
      filtered.forEach((e) => {
        if (e.type === "pdf") {
          const basename = e.file.name
            .substring(0, e.file.name.lastIndexOf("."))
            .toLowerCase();
          pdfMap.set(basename, e.file.name);
        }
      });
      return filtered.map((e) => {
        if (e.type === "xml") {
          const basename = e.file.name
            .substring(0, e.file.name.lastIndexOf("."))
            .toLowerCase();
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

  async function handleImport(
    filesToImport?: FileEntry[],
    manualMatches?: Record<string, string>,
  ) {
    const targetFiles = filesToImport ?? files;
    if (targetFiles.length === 0) return;
    setStep("importing");
    setImportError(null);
    try {
      const autoFiles: File[] = [];
      const manualFiles = new Map<string, File[]>();

      for (const entry of targetFiles) {
        if (entry.type === "pdf" && manualMatches && manualMatches[entry.id]) {
          const invoiceId = manualMatches[entry.id];
          if (!manualFiles.has(invoiceId)) manualFiles.set(invoiceId, []);
          manualFiles.get(invoiceId)!.push(entry.file);
        } else {
          autoFiles.push(entry.file);
        }
      }

      let finalResult: BulkImportResult = {
        importId: createClientId(),
        direction,
        total: targetFiles.length,
        created: 0,
        skipped: [],
        errors: [],
        pdfAttached: [],
        pdfOrphans: [],
      };

      if (autoFiles.length > 0) {
        const res =
          direction === "IN"
            ? await erpInvoicesCoreApi.bulkImportBuyerXml(autoFiles)
            : await erpInvoicesCoreApi.bulkImportSellerXml(autoFiles);
        finalResult = res;
      }

      if (manualFiles.size > 0) {
        if (!finalResult.pdfAttached) finalResult.pdfAttached = [];
        const promises = Array.from(manualFiles.entries()).map(
          async ([invoiceId, pdfs]) => {
            try {
              await erpInvoicesCoreApi.uploadPdfs(invoiceId, pdfs);
              pdfs.forEach((f) => {
                finalResult.pdfAttached!.push({
                  filename: f.name,
                  invoiceId: invoiceId,
                  invoiceNo: "Ghép thủ công",
                } as any);
              });
            } catch (e) {
              pdfs.forEach((f) => {
                finalResult.errors.push({
                  filename: f.name,
                  reason: extractApiError(e, "Lỗi ghép thủ công"),
                });
              });
            }
          },
        );
        await Promise.all(promises);
      }

      setResult(finalResult);
      setStep("result");
      if (finalResult.created > 0 || manualFiles.size > 0) {
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
