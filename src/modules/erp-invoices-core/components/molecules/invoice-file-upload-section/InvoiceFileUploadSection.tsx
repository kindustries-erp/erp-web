import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud, Loader2 } from "lucide-react";
import { Combobox } from "@/shared/components/Combobox";
import type { InvoiceFileUploadSectionProps } from "./InvoiceFileUploadSection.type";

const TYPE_OPTS = [
  { value: "HOA_DON", label: "Hóa đơn" },
  { value: "HOP_DONG", label: "Hợp đồng" },
  { value: "BANG_KE", label: "Bảng kê" },
  { value: "KHAC", label: "Khác" },
];

export const InvoiceFileUploadSection = React.memo(
  function InvoiceFileUploadSection({
    uploadType,
    onUploadTypeChange,
    onFilesAdded,
    isUploading = false,
  }: InvoiceFileUploadSectionProps) {
    const { t } = useTranslation("erpInvoices");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onFilesAdded(files);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFilesAdded(files);
      }
    };

    return (
      <div className="space-y-2 pt-2 border-t border-border/70">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            {t("uploadNewDocument", "Thêm tệp mới")}
          </span>
          <Combobox
            options={TYPE_OPTS}
            value={uploadType}
            onChange={(v) => onUploadTypeChange(v as string)}
            className="w-[140px] h-7 text-xs bg-background"
            placeholder={t("selectDocumentType", "Loại tài liệu")}
          />
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 transition-all cursor-pointer text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.docx,.doc,.zip,.xml"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-1 text-primary">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-xs font-medium">
                {t("actionSaving", "Đang lưu...")}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-foreground">
                {t("dragDropOrClick", "Kéo thả tệp vào đây hoặc bấm để chọn")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {t(
                  "supportedFileTypes",
                  "Hỗ trợ PDF, Ảnh, Excel, Word, ZIP (Tối đa 20MB)",
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
);
