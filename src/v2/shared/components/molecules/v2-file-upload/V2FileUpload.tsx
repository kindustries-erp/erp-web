import * as React from "react";
import { UploadCloud } from "lucide-react";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import { useV2FileUpload } from "./V2FileUpload.hook";
import type {
  V2FileRejectReason,
  V2FileUploadProps,
} from "./V2FileUpload.type";

const REJECT_KEY: Record<V2FileRejectReason, [string, string]> = {
  type: ["v2.form.rejectType", "Định dạng tệp không được hỗ trợ"],
  size: ["v2.form.rejectSize", "Tệp vượt quá dung lượng cho phép"],
  count: ["v2.form.rejectCount", "Vượt quá số tệp cho phép"],
};

export const V2FileUpload: React.FC<V2FileUploadProps> = ({
  onFilesSelected,
  accept,
  maxSizeBytes,
  maxFiles,
  multiple = true,
  disabled = false,
  title,
  hint,
  className,
}) => {
  const { t } = useV2Translation();
  const upload = useV2FileUpload({
    onFilesSelected,
    accept,
    maxSizeBytes,
    maxFiles,
    multiple,
    disabled,
  });
  const label =
    title ?? t("v2.form.uploadTitle", "Kéo thả tệp vào đây hoặc bấm để chọn");

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-disabled={disabled}
        onClick={upload.open}
        onKeyDown={upload.onKeyDown}
        onDrop={upload.onDrop}
        onDragOver={upload.onDragOver}
        onDragLeave={upload.onDragLeave}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-background px-4 py-6 text-center transition-colors",
          "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          upload.dragging && "border-primary bg-muted",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <UploadCloud aria-hidden className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        <input
          ref={upload.inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept?.join(",")}
          disabled={disabled}
          onChange={upload.onChange}
          data-testid="v2-file-input"
        />
      </div>
      {upload.rejected.length > 0 && (
        <ul
          role="alert"
          className="flex flex-col gap-0.5 text-xs text-rose-600"
        >
          {upload.rejected.map(({ file, reason }, index) => (
            <li key={`${file.name}-${index}`}>
              {file.name}: {t(...REJECT_KEY[reason])}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
V2FileUpload.displayName = "V2FileUpload";
