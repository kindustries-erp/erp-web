import { useTranslation } from "react-i18next";
import { V2FileUpload } from "@/v2/shared/components/molecules/v2-file-upload";
import type { XmlUploadDropzoneProps } from "./XmlUploadDropzone.type";

/** Đồng bộ với API: `FilesInterceptor('files', 200, { fileSize: 5MB })` */
export const XML_UPLOAD_ACCEPT = [
  ".xml",
  ".pdf",
  ".zip",
  "application/xml",
  "text/xml",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
];
export const XML_UPLOAD_MAX_FILES = 200;
export const XML_UPLOAD_MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function XmlUploadDropzone({ onFilesSelected }: XmlUploadDropzoneProps) {
  const { t } = useTranslation("erpInvoices");

  return (
    <V2FileUpload
      multiple
      accept={XML_UPLOAD_ACCEPT}
      maxFiles={XML_UPLOAD_MAX_FILES}
      maxSizeBytes={XML_UPLOAD_MAX_SIZE_BYTES}
      title={t("importDropzoneTitle", "Kéo thả file .xml, .pdf, .zip vào đây")}
      hint={t(
        "importDropzoneSubtext",
        "hoặc click để chọn từ máy tính (tối đa 200 file, 5MB/file)",
      )}
      onFilesSelected={(accepted) => {
        if (accepted.length > 0) onFilesSelected(accepted);
      }}
    />
  );
}

export const UploadDropzone = XmlUploadDropzone;
