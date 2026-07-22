import React, { useId } from "react";
import { Eye, UploadCloud, X, Paperclip } from "lucide-react";
import { cn } from "@/shared/utils";

export interface AttachmentProps {
  /** Array of currently attached files */
  files: File[];
  /** Callback when files change */
  onFilesChange: (files: File[]) => void;
  /** Max size in MB per file */
  maxSizeMb?: number;
  /** Accept string for input */
  accept?: string;
  /** Max number of files */
  maxFiles?: number;
  /** Optional callback for previewing file inline instead of opening in a new tab */
  onPreview?: (file: File) => void;
  className?: string;
}

function formatSize(size: number) {
  if (size >= 1_048_576) return `${(size / 1_048_576).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

/**
 * Standard Attachment component following shadcn/ui aesthetics.
 * Supports multiple file drop, preview, and removal.
 */
export function Attachment({
  files,
  onFilesChange,
  maxSizeMb = 10,
  accept,
  maxFiles = 5,
  onPreview,
  className,
}: AttachmentProps) {
  const inputId = useId();
  const maxSize = maxSizeMb * 1_048_576;

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const valid = Array.from(selected).filter((item) => item.size <= maxSize);
    const newFiles = [...files, ...valid];
    if (newFiles.length > maxFiles) {
      onFilesChange(newFiles.slice(0, maxFiles));
    } else {
      onFilesChange(newFiles);
    }
  }

  function removeFile(index: number) {
    onFilesChange(files.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-8 text-center transition-colors hover:bg-muted/50",
          files.length >= maxFiles &&
            "opacity-50 pointer-events-none cursor-not-allowed",
        )}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            Kéo thả file vào đây hoặc{" "}
            <span className="text-primary hover:underline">Click để chọn</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Tối đa {maxFiles} file, dung lượng {maxSizeMb}MB/file.
          </p>
        </div>
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple
          className="sr-only"
          disabled={files.length >= maxFiles}
          onChange={(e) => {
            addFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          {files.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 rounded-md border bg-card p-3 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col text-left">
                  <span className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatSize(file.size)}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    title="Xem file"
                    onClick={() => {
                      if (onPreview) {
                        onPreview(file);
                      } else {
                        window.open(
                          previewUrl,
                          "_blank",
                          "noopener,noreferrer",
                        );
                        window.setTimeout(
                          () => URL.revokeObjectURL(previewUrl),
                          30_000,
                        );
                      }
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Xóa file"
                    onClick={() => removeFile(index)}
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
