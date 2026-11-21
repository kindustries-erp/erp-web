import { useState, useCallback, useEffect, useRef } from "react";

interface UseDataTableScrollParams {
  items: any[];
  loading?: boolean;
}

export function useDataTableScroll({
  items,
  loading,
}: UseDataTableScrollParams) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const handleTableScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsScrolledTop(el.scrollTop > 2);
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 4;
    setIsScrolledBottom(!atBottom && el.scrollHeight > el.clientHeight);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    handleTableScroll();
    el.addEventListener("scroll", handleTableScroll, { passive: true });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handleTableScroll)
        : null;
    if (ro) ro.observe(el);
    return () => {
      el.removeEventListener("scroll", handleTableScroll);
      if (ro) ro.disconnect();
    };
  }, [handleTableScroll, items, loading]);

  return {
    scrollContainerRef,
    isScrolledTop,
    isScrolledBottom,
    handleTableScroll,
  };
}
