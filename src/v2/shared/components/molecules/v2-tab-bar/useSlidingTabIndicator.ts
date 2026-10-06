import * as React from "react";

export interface UseSlidingTabIndicatorOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  indicatorRef: React.RefObject<HTMLDivElement | null>;
  activeKey?: string;
  enabled?: boolean;
  extraDeps?: React.DependencyList;
}

export function useSlidingTabIndicator({
  containerRef,
  indicatorRef,
  activeKey,
  enabled = true,
  extraDeps = [],
}: UseSlidingTabIndicatorOptions) {
  const updateIndicator = React.useCallback(() => {
    if (!enabled) return;
    const container = containerRef.current;
    const indicator = indicatorRef.current;
    if (!container || !indicator) return;

    const activeEl = container.querySelector<HTMLElement>(
      `[role="tab"][aria-selected="true"], [role="tab"][data-active="true"]`,
    );
    if (!activeEl || activeEl.offsetWidth < 4) {
      indicator.style.opacity = "0";
      indicator.style.width = "0px";
      indicator.style.left = "0px";
      return;
    }

    const adjustedLeft = activeEl.offsetLeft - container.scrollLeft;
    indicator.style.opacity = "1";
    indicator.style.width = `${activeEl.offsetWidth}px`;
    indicator.style.height = `${activeEl.offsetHeight}px`;
    indicator.style.left = `${adjustedLeft}px`;
    indicator.style.top = `${activeEl.offsetTop}px`;
  }, [enabled, containerRef, indicatorRef]);

  React.useLayoutEffect(() => {
    if (!enabled) return;
    updateIndicator();
  }, [enabled, activeKey, updateIndicator, ...extraDeps]);

  React.useLayoutEffect(() => {
    if (!enabled) return;
    const container = containerRef.current;
    if (!container) return;

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updateIndicator)
        : null;
    if (ro) {
      ro.observe(container);
      Array.from(
        container.querySelectorAll<HTMLElement>('[role="tab"]'),
      ).forEach((el) => ro.observe(el));
    }

    container.addEventListener("scroll", updateIndicator, { passive: true });
    window.addEventListener("resize", updateIndicator);

    return () => {
      ro?.disconnect();
      container.removeEventListener("scroll", updateIndicator);
      window.removeEventListener("resize", updateIndicator);
    };
  }, [enabled, containerRef, updateIndicator]);

  return { updateIndicator };
}
