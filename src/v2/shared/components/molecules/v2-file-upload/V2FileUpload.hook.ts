import { useCallback, useRef, useState } from "react";
import type * as React from "react";
import { validateFiles } from "./V2FileUpload.helper";
import type { V2FileUploadProps, V2RejectedFile } from "./V2FileUpload.type";

type UseV2FileUploadParams = Pick<
  V2FileUploadProps,
  | "onFilesSelected"
  | "accept"
  | "maxSizeBytes"
  | "maxFiles"
  | "multiple"
  | "disabled"
>;

export function useV2FileUpload({
  onFilesSelected,
  accept,
  maxSizeBytes,
  maxFiles,
  multiple = true,
  disabled = false,
}: UseV2FileUploadParams) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState<V2RejectedFile[]>([]);

  const handle = useCallback(
    (list: FileList | File[] | null) => {
      if (disabled || !list) return;
      const files = Array.from(list);
      if (files.length === 0) return;
      const limit = multiple ? maxFiles : 1;
      const result = validateFiles(files, {
        accept,
        maxSizeBytes,
        maxFiles: limit,
      });
      setRejected(result.rejected);
      onFilesSelected(result.accepted, result.rejected);
    },
    [disabled, multiple, maxFiles, accept, maxSizeBytes, onFilesSelected],
  );

  const open = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      handle(event.dataTransfer.files);
    },
    [handle],
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) setDragging(true);
    },
    [disabled],
  );

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      handle(event.target.files);
      event.target.value = "";
    },
    [handle],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    },
    [open],
  );

  return {
    inputRef,
    dragging,
    rejected,
    open,
    onDrop,
    onDragOver,
    onDragLeave,
    onChange,
    onKeyDown,
  };
}
