import { useTranslation } from "react-i18next";
import { Upload, X, ExternalLink } from "lucide-react";
import {
  useInvoiceXmlUpload,
  type Direction,
} from "../hooks/useInvoiceXmlUpload";
import { UploadDropzone } from "./xml-upload/UploadDropzone";
import { UploadFileList } from "./xml-upload/UploadFileList";
import { ImportResultSummary } from "./xml-upload/ImportResultSummary";
import { ImportResultTables } from "./xml-upload/ImportResultTables";
import { AlertCircle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (importId: string, direction: Direction) => void;
}

export function InvoiceXmlUploadModal({ open, onClose, onImported }: Props) {
  const { t } = useTranslation("erpInvoices");

  const {
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
  } = useInvoiceXmlUpload(onImported);

  function handleClose() {
    setStep("select");
    handleReset();
    onClose();
  }

  if (!open) return null;

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
            <h2 className="text-base font-semibold">
              {t("importTitle", "Import XML hóa đơn")}
            </h2>
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
              {d === "IN"
                ? `📥 ${t("inbound", "Hóa đơn mua vào")}`
                : `📤 ${t("outbound", "Hóa đơn bán ra")}`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1 — SELECT */}
          {step === "select" && (
            <div className="flex flex-col gap-4">
              <UploadDropzone
                dragging={dragging}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onFilesSelected={addFiles}
              />

              <UploadFileList files={files} onRemove={removeFile} />

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
                {t("importProcessing", {
                  count: files.length,
                  defaultValue: "Đang xử lý {{count}} file XML...",
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(
                  "importProcessingSubtext",
                  "Hệ thống đang parse và tạo hóa đơn. Vui lòng chờ.",
                )}
              </p>
            </div>
          )}

          {/* STEP 3 — RESULT */}
          {step === "result" && result && (
            <div className="flex flex-col gap-5">
              <ImportResultSummary result={result} />

              <ImportResultTables result={result} />

              {result.created === 0 &&
                result.skipped.length === 0 &&
                result.errors.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("importNoData", "Không có file nào được xử lý.")}
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
                {t("actionCancel", "Hủy")}
              </button>
              <button
                onClick={handleImport}
                disabled={files.length === 0}
                className="px-5 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {t("importActionStart", {
                  count: files.length,
                  defaultValue: "Bắt đầu Import ({{count}} file)",
                })}
              </button>
            </>
          )}

          {step === "importing" && (
            <div className="flex-1 text-center text-sm text-muted-foreground">
              {t("importProcessing", {
                count: files.length,
                defaultValue: "Đang xử lý...",
              })}
            </div>
          )}

          {step === "result" && result && (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
              >
                {t("importActionMore", "Import thêm")}
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
                    {t("importActionViewCreated", "Xem hóa đơn vừa tạo")}
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
                >
                  {t("actionClose", "Đóng")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
