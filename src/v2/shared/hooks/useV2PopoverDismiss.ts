import { useEffect, useRef, type RefObject } from "react";

type Closer = () => void;

/** Popover đang mở gần nhất. Chỉ một popover mở tại một thời điểm trên toàn app. */
let activeCloser: Closer | null = null;

export interface UseV2PopoverDismissOptions {
  open: boolean;
  onClose: () => void;
  /** Vùng trigger + nội dung nằm trong DOM của component; click ở đây không đóng */
  containerRef: RefObject<HTMLElement | null>;
  /** Selector của panel được portal ra ngoài container (ví dụ "[data-v2-date-panel]") */
  panelSelector: string;
}

/**
 * Đóng popover khi click ra ngoài (pha capture trên document, không phụ thuộc layer của Radix
 * khi nằm trong Dialog), và đảm bảo chỉ một popover mở tại một thời điểm.
 */
export function useV2PopoverDismiss({
  open,
  onClose,
  containerRef,
  panelSelector,
}: UseV2PopoverDismissOptions) {
  // Ref để effect không phải chạy lại mỗi lần parent render với onClose mới
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const close: Closer = () => onCloseRef.current();
    if (activeCloser && activeCloser !== close) activeCloser();
    activeCloser = close;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (target.closest?.(panelSelector)) return;
      close();
    };
    document.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      if (activeCloser === close) activeCloser = null;
    };
  }, [open, containerRef, panelSelector]);
}
