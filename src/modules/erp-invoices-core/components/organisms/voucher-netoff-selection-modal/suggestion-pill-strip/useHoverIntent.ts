import { useCallback, useEffect, useRef, useState } from "react";

export interface HoverIntentOptions {
  openDelay?: number;
  closeDelay?: number;
}

/**
 * Mở/đóng popover theo hover có độ trễ, để di chuột qua nhanh không bật popover
 * và di chuột vào chính popover thì không bị đóng.
 */
export function useHoverIntent(options: HoverIntentOptions = {}) {
  const { openDelay = 250, closeDelay = 120 } = options;
  const [open, setOpen] = useState(false);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const onEnter = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openTimer.current) return;
    openTimer.current = setTimeout(() => {
      openTimer.current = null;
      setOpen(true);
    }, openDelay);
  }, [openDelay]);

  const onLeave = useCallback(() => {
    if (openTimer.current) {
      clearTimeout(openTimer.current);
      openTimer.current = null;
    }
    if (closeTimer.current) return;
    closeTimer.current = setTimeout(() => {
      closeTimer.current = null;
      setOpen(false);
    }, closeDelay);
  }, [closeDelay]);

  const close = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  return { open, onEnter, onLeave, close };
}
