import { useTranslation } from "react-i18next";
import { Upload, ExternalLink, AlertCircle } from "lucide-react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import {
  useInvoiceXmlUpload,
  type Direction,
} from "../hooks/useInvoiceXmlUpload";
import { UploadDropzone } from "./xml-upload/UploadDropzone";
import { UploadFileList } from "./xml-upload/UploadFileList";
import { ImportResultSummary } from "./xml-upload/ImportResultSummary";
import { ImportResultTables } from "./xml-upload/ImportResultTables";

interface Props {
  open: boolean;
  onClose: () => void;
  onImported: (importId: string, direction: Direction) => void;
}

export function InvoiceXmlUploadDrawer({ open, onClose, onImported }: Props) {
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

  const actions = [];

  if (step === "select") {
    actions.push({
      label: t("actionCancel", "Hủy"),
      variant: "outline" as const,
      onClick: handleClose,
    });
    actions.push({
      label: t("importActionStart", {
        count: files.length,
        defaultValue: "Bắt đầu Import ({{count}} file)",
      }),
      icon: <Upload className="w-4 h-4" />,
      onClick: handleImport,
      disabled: files.length === 0,
    });
  } else if (step === "result" && result) {
    actions.push({
      label: t("importActionMore", "Import thêm"),
      variant: "outline" as const,
      onClick: handleReset,
    });
    if (result.created > 0) {
      actions.push({
        label: t("importActionViewCreated", "Xem hóa đơn vừa tạo"),
        icon: <ExternalLink className="w-4 h-4" />,
        variant: "secondary" as const,
        onClick: handleClose,
      });
    }
    actions.push({
      label: t("actionClose", "Đóng"),
      onClick: handleClose,
    });
  }

  return (
    <DrawerModal
      open={open}
      onClose={handleClose}
      title={t("importTitle", "Import XML hóa đơn")}
      icon={<Upload className="w-5 h-5" />}
      actions={actions}
      panelClassName="w-[450px]"
    >
      <div className="flex flex-col h-full">
        {/* Tab Direction */}
        <div className="flex border-b border-border shrink-0 px-6 mt-[-1rem]">
          {(["IN", "OUT"] as Direction[]).map((d) => (
            <button
              key={d}
              disabled={step !== "select"}
              onClick={() => setDirection(d)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
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
              <p className="text-xs text-muted-foreground text-center">
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
      </div>
    </DrawerModal>
  );
}
