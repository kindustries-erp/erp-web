import { Upload } from "lucide-react";
import { useTranslation, Trans } from "react-i18next";
import { useRef } from "react";

interface Props {
  dragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFilesSelected: (files: FileList) => void;
}

export function UploadDropzone({
  dragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onFilesSelected,
}: Props) {
  const { t } = useTranslation("erpInvoices");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
        <Trans
          i18nKey="importDropzoneText"
          ns="erpInvoices"
          defaults="Kéo thả file <1>.xml</1> vào đây"
          components={{ 1: <span className="text-primary" /> }}
        />
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {t(
          "importDropzoneSubtext",
          "hoặc click để chọn từ máy tính (tối đa 200 file, 5MB/file)",
        )}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".xml,application/xml,text/xml"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
      />
    </div>
  );
}
