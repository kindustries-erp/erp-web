import { useCallback, useEffect, useRef, useState } from "react";

const TOP_THRESHOLD_PX = 2;
const BOTTOM_THRESHOLD_PX = 4;

/** Theo dõi vị trí cuộn của khung bảng để hiện bóng đổ trên/dưới như V1 */
export const useV2TableScroll = (rowCount: number, loading: boolean) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIsScrolledTop(el.scrollTop > TOP_THRESHOLD_PX);
    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - BOTTOM_THRESHOLD_PX;
    setIsScrolledBottom(!atBottom && el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      observer?.disconnect();
    };
  }, [update, rowCount, loading]);

  return { scrollRef, isScrolledTop, isScrolledBottom };
};
