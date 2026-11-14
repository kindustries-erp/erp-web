import * as React from "react";

/** Cuộn vùng tin nhắn xuống cuối mỗi khi mở khung chat hoặc `scrollKey` đổi. */
export function useChatAutoScroll(
  open: boolean,
  scrollKey: string | number | undefined,
) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = ref.current;
    if (open && node) node.scrollTop = node.scrollHeight;
  }, [open, scrollKey]);
  return ref;
}

/** Đóng khung chat bằng phím Escape khi đang mở. */
export function useCloseOnEscape(open: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!open) return undefined;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
}
