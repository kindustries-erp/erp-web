import { useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { Upload } from "lucide-react";
import { V2Button } from "@/v2/shared/components";

const MAX_MANUAL_PDF_BYTES = 10 * 1024 * 1024;

interface ManualPdfUploadButtonProps {
  invoiceId: string;
  onUpload: (invoiceId: string, file: File) => Promise<void> | void;
  isUploading?: boolean;
}

export function isPdfFile(file: File): boolean {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function ManualPdfUploadButton({
  invoiceId,
  onUpload,
  isUploading,
}: ManualPdfUploadButtonProps) {
  const { t } = useTranslation("erpInvoices");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isPdfFile(file) || file.size > MAX_MANUAL_PDF_BYTES) {
      toast.error(t("invalidPdfFile", "Tệp phải là PDF, tối đa 10MB"));
      return;
    }
    await onUpload(invoiceId, file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        aria-label={t("lookupUploadPdf", "Tải lên PDF đã tải")}
        onChange={handleChange}
      />
      <V2Button
        type="button"
        variant="outline"
        size="sm"
        isLoading={isUploading}
        onClick={() => inputRef.current?.click()}
        className="h-7 flex-1 text-xs"
        leftIcon={<Upload className="h-3.5 w-3.5" />}
      >
        <span>{t("lookupUploadPdf", "Tải lên PDF đã tải")}</span>
      </V2Button>
    </>
  );
}
