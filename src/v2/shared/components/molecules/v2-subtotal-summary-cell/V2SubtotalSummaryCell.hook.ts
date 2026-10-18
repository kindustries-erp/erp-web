import * as React from "react";

export const OPEN_DELAY_MS = 120;
export const CLOSE_DELAY_MS = 180;

/**
 * Trạng thái mở popover của cell: hover (có delay), focus, click và Esc.
 * Popover không đóng khi con trỏ đang ở trigger hoặc nội dung, hoặc khi trigger đang có focus.
 */
export function useV2SubtotalPopover() {
  const [open, setOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const hoveredRef = React.useRef(false);
  const focusedRef = React.useRef(false);
  const openTimerRef = React.useRef<ReturnType<typeof setTimeout>>();
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout>>();

  const clearTimers = React.useCallback(() => {
    clearTimeout(openTimerRef.current);
    clearTimeout(closeTimerRef.current);
  }, []);

  React.useEffect(() => clearTimers, [clearTimers]);

  const openNow = React.useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers]);

  const closeNow = React.useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  const scheduleOpen = () => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  };

  const isInsidePopover = (node: EventTarget | null) =>
    !!node && !!contentRef.current?.parentElement?.contains(node as Node);

  const onTriggerPointerEnter = () => {
    hoveredRef.current = true;
    scheduleOpen();
  };

  const onTriggerPointerLeave = () => {
    hoveredRef.current = false;
    if (!focusedRef.current) scheduleClose();
  };

  const onTriggerFocus = () => {
    focusedRef.current = true;
    openNow();
  };

  const onTriggerBlur = (event: React.FocusEvent) => {
    focusedRef.current = false;
    if (isInsidePopover(event.relatedTarget) || hoveredRef.current) return;
    closeNow();
  };

  const onContentPointerEnter = () => {
    hoveredRef.current = true;
    clearTimers();
  };

  const onContentPointerLeave = () => {
    hoveredRef.current = false;
    if (!focusedRef.current) scheduleClose();
  };

  /** Radix gọi khi click trigger hoặc click/Esc bên ngoài; bỏ qua khi trigger đang được hover hoặc focus */
  const onOpenChange = (next: boolean) => {
    if (next) {
      openNow();
      return;
    }
    if (hoveredRef.current || focusedRef.current) return;
    closeNow();
  };

  const onEscape = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape") return;
    focusedRef.current = false;
    hoveredRef.current = false;
    closeNow();
  };

  return {
    open,
    contentRef,
    closeNow,
    onOpenChange,
    onEscape,
    triggerHandlers: {
      onPointerEnter: onTriggerPointerEnter,
      onPointerLeave: onTriggerPointerLeave,
      onFocus: onTriggerFocus,
      onBlur: onTriggerBlur,
    },
    contentHandlers: {
      onPointerEnter: onContentPointerEnter,
      onPointerLeave: onContentPointerLeave,
    },
  };
}
