export interface XmlUploadDropzoneProps {
  /** Nhận các file đã qua kiểm tra định dạng, cỡ và số lượng */
  onFilesSelected: (files: File[]) => void;
}

export type UploadDropzoneProps = XmlUploadDropzoneProps;
