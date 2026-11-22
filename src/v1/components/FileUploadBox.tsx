import { useEffect, useId, useMemo } from "react";
import { Eye, FileText, UploadCloud, X } from "lucide-react";
import { cn } from "@/shared/utils";

interface FileUploadBoxProps {
  file: File | null;
  onChange: (file: File | null) => void;
  files?: never;
  onFilesChange?: never;
  accept?: string;
  multiple?: false;
  maxSizeMb?: number;
}

interface MultiFileUploadBoxProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  file?: never;
  onChange?: never;
  accept?: string;
  multiple: true;
  maxSizeMb?: number;
}

function formatSize(size: number) {
  if (size >= 1_048_576) return `${(size / 1_048_576).toFixed(1)} MB`;
  if (size >= 1024) return `${Math.round(size / 1024)} KB`;
  return `${size} B`;
}

export function FileUploadBox(
  props: FileUploadBoxProps | MultiFileUploadBoxProps,
) {
  const inputId = useId();
  const maxSizeMb = props.maxSizeMb ?? 10;
  const maxSize = maxSizeMb * 1_048_576;
  const isMulti = props.multiple === true;
  const file = isMulti ? null : props.file;
  const files = isMulti ? props.files : [];
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : ""),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function addFiles(selected: FileList | null) {
    if (!selected) return;
    const valid = Array.from(selected).filter((item) => item.size <= maxSize);
    if (isMulti) props.onFilesChange([...props.files, ...valid]);
    else props.onChange(valid[0] ?? null);
  }

  function removeFile(index: number) {
    if (!isMulti) return;
    props.onFilesChange(props.files.filter((_, i) => i !== index));
  }

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-dashed border-[color:var(--border)] bg-[color:var(--muted)]/70 p-3",
        "hover:border-primary/60 transition-colors",
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={props.accept}
        multiple={isMulti}
        className="sr-only"
        onChange={(e) => {
          addFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
      {isMulti ? (
        <div className="space-y-2">
          <label
            htmlFor={inputId}
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-center hover:bg-surface-hover",
              files.length
                ? "min-h-10 gap-2 px-3 py-2"
                : "min-h-[88px] flex-col gap-2 px-3 py-4",
            )}
          >
            {!files.length && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--muted)] text-[color:var(--muted-fg)]">
                <UploadCloud className="h-4 w-4" />
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-xs font-medium text-foreground">
                {files.length ? "Thêm file" : "Chọn file đính kèm"}
              </span>
              {!files.length && (
                <span className="block text-[11px] text-[color:var(--muted-fg)]">
                  Không giới hạn định dạng, tối đa {maxSizeMb}MB/file
                </span>
              )}
            </span>
          </label>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((item, index) => (
                <div
                  key={`${item.name}-${item.size}-${index}`}
                  className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-[color:var(--muted)] text-[color:var(--muted-fg)]">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="max-w-full truncate text-xs font-medium text-foreground">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-[color:var(--muted-fg)]">
                      {formatSize(item.size)}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Xem file"
                    onClick={() => {
                      const url = URL.createObjectURL(item);
                      window.open(url, "_blank", "noopener,noreferrer");
                      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
                    }}
                    className="flex-shrink-0 rounded-lg border border-border bg-surface p-2 text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    title="Bỏ file"
                    onClick={() => removeFile(index)}
                    className="flex-shrink-0 rounded-lg border border-border bg-surface p-2 text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : !file ? (
        <label
          htmlFor={inputId}
          className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 px-3 py-4 text-center"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color:var(--muted)] text-[color:var(--muted-fg)]">
            <UploadCloud className="h-4 w-4" />
          </span>
          <span className="text-xs font-medium text-foreground">
            Chọn file đính kèm
          </span>
          <span className="text-[11px] text-[color:var(--muted-fg)]">
            Không giới hạn định dạng, tối đa {maxSizeMb}MB
          </span>
        </label>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[color:var(--muted)] text-[color:var(--muted-fg)]">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-foreground">
              {file.name}
            </div>
            <div className="text-[11px] text-[color:var(--muted-fg)]">
              {formatSize(file.size)}
            </div>
          </div>
          <button
            type="button"
            title="Xem file"
            onClick={() =>
              window.open(previewUrl, "_blank", "noopener,noreferrer")
            }
            className="rounded-lg border border-border bg-surface p-2 text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Bỏ file"
            onClick={() => props.onChange(null)}
            className="rounded-lg border border-border bg-surface p-2 text-[color:var(--muted-fg)] hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
