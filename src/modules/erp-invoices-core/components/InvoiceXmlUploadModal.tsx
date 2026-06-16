/**
 * InvoiceXmlUploadModal.tsx
 * Modal 3-step để import hàng loạt file XML hóa đơn điện tử lên R2 + tạo invoice.
 */
import { useCallback, useRef, useState } from "react";
import {
  erpInvoicesCoreApi,
  type BulkImportResult,
  type BulkImportSkippedItem,
  type BulkImportErrorItem,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { extractApiError } from "@/shared/utils/apiError";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  SkipForward,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type Step = "select" | "importing" | "result";
type Direction = "IN" | "OUT";

interface Props {
  open: boolean;
  onClose: () => void;
  /** Gọi sau khi import thành công (created > 0) để reload list */
  onImported: (importId: string, direction: Direction) => void;
}

interface FileEntry {
  file: File;
  id: string;
}

function badgeBase(color: string) {
  return `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${color}`;
}

export function InvoiceXmlUploadModal({ open, onClose, onImported }: Props) {
  const [direction, setDirection] = useState<Direction>("IN");
  const [step, setStep] = useState<Step>("select");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // File handling
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Drag & drop
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Import
  // ---------------------------------------------------------------------------
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
      setImportError(extractApiError(e, "Không thể import. Vui lòng thử lại."));
      setStep("select");
    }
  }

  // ---------------------------------------------------------------------------
  // Reset + close
  // ---------------------------------------------------------------------------
  function handleClose() {
    setStep("select");
    setFiles([]);
    setResult(null);
    setImportError(null);
    onClose();
  }

  function handleReset() {
    setStep("select");
    setFiles([]);
    setResult(null);
    setImportError(null);
  }

  if (!open) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl bg-background rounded-xl shadow-2xl border border-border overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h2 className="text-base font-semibold">Import XML hóa đơn</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Direction */}
        <div className="flex border-b border-border shrink-0">
          {(["IN", "OUT"] as Direction[]).map((d) => (
            <button
              key={d}
              disabled={step !== "select"}
              onClick={() => setDirection(d)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                direction === d
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
              }`}
            >
              {d === "IN" ? "📥 Đầu vào (Mua vào)" : "📤 Đầu ra (Bán ra)"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1 — SELECT */}
          {step === "select" && (
            <div className="flex flex-col gap-4">
              {/* Drop zone */}
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  Kéo thả file <span className="text-primary">.xml</span> vào
                  đây
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  hoặc click để chọn từ máy tính (tối đa 200 file, 5MB/file)
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xml,application/xml,text/xml"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border">
                    {files.length} file đã chọn
                  </div>
                  <ul className="divide-y divide-border max-h-48 overflow-y-auto">
                    {files.map((entry) => (
                      <li
                        key={entry.id}
                        className="flex items-center justify-between px-4 py-2 text-sm hover:bg-muted/20"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{entry.file.name}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {(entry.file.size / 1024).toFixed(0)} KB
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(entry.id);
                          }}
                          className="ml-2 p-0.5 hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {importError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {importError}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 — IMPORTING */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-foreground">
                Đang xử lý {files.length} file XML...
              </p>
              <p className="text-xs text-muted-foreground">
                Hệ thống đang parse và tạo hóa đơn. Vui lòng chờ.
              </p>
            </div>
          )}

          {/* STEP 3 — RESULT */}
          {step === "result" && result && (
            <div className="flex flex-col gap-5">
              {/* Summary badges */}
              <div className="flex flex-wrap gap-3">
                <span className={badgeBase("bg-green-100 text-green-800")}>
                  <CheckCircle2 className="w-4 h-4" />
                  {result.created} tạo mới
                </span>
                <span className={badgeBase("bg-amber-100 text-amber-800")}>
                  <SkipForward className="w-4 h-4" />
                  {result.skipped.length} bỏ qua
                </span>
                <span className={badgeBase("bg-red-100 text-red-800")}>
                  <AlertCircle className="w-4 h-4" />
                  {result.errors.length} lỗi
                </span>
                <span className="text-xs text-muted-foreground self-center">
                  / {result.total} file
                </span>
              </div>

              {/* Skipped table */}
              {result.skipped.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <SkipForward className="w-4 h-4 text-amber-600" />
                    Hóa đơn bị bỏ qua (trùng lặp)
                  </h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                          <th className="text-left px-3 py-2 font-medium">
                            File
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Số HĐ
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Tên NCC
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            MST
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Lý do
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.skipped.map((s: BulkImportSkippedItem, i) => (
                          <tr
                            key={i}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">
                              {s.filename}
                            </td>
                            <td className="px-3 py-2 font-medium text-primary">
                              {s.invoiceNo}
                            </td>
                            <td className="px-3 py-2 max-w-[140px] truncate">
                              {s.sellerName || "—"}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {s.sellerTaxCode || "—"}
                            </td>
                            <td className="px-3 py-2">
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                                Trùng lặp
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error table */}
              {result.errors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    Lỗi xử lý
                  </h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground">
                          <th className="text-left px-3 py-2 font-medium">
                            File
                          </th>
                          <th className="text-left px-3 py-2 font-medium">
                            Lý do lỗi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.errors.map((e: BulkImportErrorItem, i) => (
                          <tr
                            key={i}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/20"
                          >
                            <td className="px-3 py-2 text-muted-foreground max-w-[160px] truncate">
                              {e.filename}
                            </td>
                            <td className="px-3 py-2 text-red-700 max-w-[320px]">
                              {e.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {result.created === 0 &&
                result.skipped.length === 0 &&
                result.errors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Không có file nào được xử lý.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border shrink-0 bg-muted/20">
          {step === "select" && (
            <>
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleImport}
                disabled={files.length === 0}
                className="px-5 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Bắt đầu Import ({files.length} file)
              </button>
            </>
          )}

          {step === "importing" && (
            <div className="flex-1 text-center text-sm text-muted-foreground">
              Đang xử lý...
            </div>
          )}

          {step === "result" && result && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                Import thêm
              </button>
              <div className="flex items-center gap-2">
                {result.created > 0 && (
                  <button
                    onClick={() => {
                      handleClose();
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Xem hóa đơn vừa tạo
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                >
                  Đóng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
