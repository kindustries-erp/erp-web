import { useCallback, useMemo } from "react";
import { updateV2SearchParams } from "@/v2/shared/utils/v2Url";
import { useV2SearchParams } from "./useV2SearchParams";

export interface UseV2OverlayStateOptions {
  /** Tên tham số URL giữ chồng drawer/modal đang mở */
  paramName?: string;
}

const SEPARATOR = ",";

const decodeStack = (raw: string | null): string[] =>
  raw
    ? raw
        .split(SEPARATOR)
        .filter(Boolean)
        .map((id) => decodeURIComponent(id))
    : [];

const encodeStack = (stack: string[]): string =>
  stack.map((id) => encodeURIComponent(id)).join(SEPARATOR);

/**
 * Chồng drawer/modal đang mở, lưu trên URL (`?overlay=a,b`, phần tử cuối là lớp trên cùng).
 * Mở bằng push để nút Back đóng lớp trên cùng; đóng bằng replace để không thêm lịch sử.
 * Tải lại trang hoặc gửi link vẫn mở đúng chồng. `id` có thể chứa mã bản ghi, ví dụ `invoice:123`.
 */
export function useV2OverlayState({
  paramName = "overlay",
}: UseV2OverlayStateOptions = {}) {
  const params = useV2SearchParams();
  const raw = params.get(paramName);
  const stack = useMemo(() => decodeStack(raw), [raw]);

  const write = useCallback(
    (update: (current: string[]) => string[], mode: "push" | "replace") =>
      updateV2SearchParams((search) => {
        const next = update(decodeStack(search.get(paramName)));
        if (next.length === 0) search.delete(paramName);
        else search.set(paramName, encodeStack(next));
      }, mode),
    [paramName],
  );

  const open = useCallback(
    (id: string) =>
      write(
        (current) => [...current.filter((item) => item !== id), id],
        "push",
      ),
    [write],
  );

  const close = useCallback(
    (id?: string) =>
      write(
        (current) =>
          id === undefined
            ? current.slice(0, -1)
            : current.filter((item) => item !== id),
        "replace",
      ),
    [write],
  );

  const closeAll = useCallback(() => write(() => [], "replace"), [write]);

  const isOpen = useCallback((id: string) => stack.includes(id), [stack]);

  return {
    stack,
    topId: stack[stack.length - 1] ?? null,
    isOpen,
    open,
    close,
    closeAll,
  };
}
