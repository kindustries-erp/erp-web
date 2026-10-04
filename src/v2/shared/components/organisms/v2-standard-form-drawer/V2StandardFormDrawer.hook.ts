import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  V2StandardFormDrawerProps,
  V2DrawerSize,
  V2DrawerLayout,
} from "./V2StandardFormDrawer.type";

const DESKTOP_SIZE_CLASSES: Record<V2DrawerSize, string> = {
  sm: "w-full min-w-0 max-w-full md:w-[90vw] lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw] lg:min-w-[420px] lg:max-w-[660px]",
  md: "w-full min-w-0 max-w-full md:w-[92vw] lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw] lg:min-w-[620px] lg:max-w-[980px]",
  lg: "w-full min-w-0 max-w-full md:w-[95vw] lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw] lg:min-w-[840px] lg:max-w-[1380px]",
  xl: "w-full min-w-0 max-w-full md:w-[96vw] lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw] lg:min-w-[1020px] lg:max-w-[1780px]",
  full: "w-full min-w-0 max-w-full md:w-[98vw] lg:w-[calc(100vw-36px)] xl:w-[calc(100vw-40px)] lg:min-w-[1020px]",
};

export function useStandardFormDrawer(props: V2StandardFormDrawerProps) {
  const {
    open,
    mode = "view",
    size = props.layout === "1-column" ? "sm" : "xl",
    tabs,
    activeTabKey: controlledTabKey,
    defaultTabKey,
    onTabChange,
    isFullscreen: controlledFullscreen,
    onFullscreenChange,
    enableFullscreen = true,
    isRightPanelCollapsed: controlledRightCollapsed,
    onRightPanelCollapseChange,
    collapsibleRightPanel = true,
    confirmOnClose = false,
    onClose,
  } = props;

  const [internalTabKey, setInternalTabKey] = useState<string>(
    () => defaultTabKey || tabs?.[0]?.key || "details",
  );
  const activeTabKey =
    controlledTabKey !== undefined ? controlledTabKey : internalTabKey;

  const handleTabChange = useCallback(
    (key: string) => {
      if (controlledTabKey === undefined) setInternalTabKey(key);
      onTabChange?.(key);
    },
    [controlledTabKey, onTabChange],
  );

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen =
    controlledFullscreen !== undefined
      ? controlledFullscreen
      : internalFullscreen;

  const toggleFullscreen = useCallback(() => {
    const nextVal = !isFullscreen;
    if (controlledFullscreen === undefined) setInternalFullscreen(nextVal);
    onFullscreenChange?.(nextVal);
  }, [controlledFullscreen, isFullscreen, onFullscreenChange]);

  const [internalRightCollapsed, setInternalRightCollapsed] = useState(false);
  const isRightPanelCollapsed =
    controlledRightCollapsed !== undefined
      ? controlledRightCollapsed
      : internalRightCollapsed;

  const toggleRightPanel = useCallback(() => {
    const nextVal = !isRightPanelCollapsed;
    if (controlledRightCollapsed === undefined)
      setInternalRightCollapsed(nextVal);
    onRightPanelCollapseChange?.(nextVal);
  }, [
    controlledRightCollapsed,
    isRightPanelCollapsed,
    onRightPanelCollapseChange,
  ]);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const requestClose = useCallback(() => {
    if (confirmOnClose && mode === "edit") {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [confirmOnClose, mode, onClose]);

  // Esc Key Handler: Esc 1st shrinks fullscreen; Esc 2nd requests close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (showConfirmClose) setShowConfirmClose(false);
        else if (isFullscreen) toggleFullscreen();
        else requestClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, showConfirmClose, isFullscreen, toggleFullscreen, requestClose]);

  // Scroll detection for shadows
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolledTop, setIsScrolledTop] = useState(false);
  const [isScrolledBottom, setIsScrolledBottom] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsScrolledTop(el.scrollTop > 8);
    setIsScrolledBottom(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !open) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [open, checkScroll]);

  const activeTabItem = useMemo(
    () => tabs?.find((t) => t.key === activeTabKey),
    [tabs, activeTabKey],
  );

  const effectiveLayout: V2DrawerLayout = useMemo(() => {
    if (activeTabItem?.hideRightPanel) return "1-column";
    if (props.layout) return props.layout;
    return size === "sm" || size === "md" ? "1-column" : "2-columns";
  }, [activeTabItem?.hideRightPanel, props.layout, size]);

  const sizeClass = useMemo(() => {
    if (isFullscreen) return "w-screen h-dvh max-w-none rounded-none border-0";
    return DESKTOP_SIZE_CLASSES[size] || DESKTOP_SIZE_CLASSES.xl;
  }, [isFullscreen, size]);

  return {
    activeTabKey,
    handleTabChange,
    activeTabItem,
    isFullscreen,
    toggleFullscreen,
    enableFullscreen: enableFullscreen && effectiveLayout === "2-columns",
    isRightPanelCollapsed,
    toggleRightPanel,
    collapsibleRightPanel:
      collapsibleRightPanel && effectiveLayout === "2-columns",
    effectiveLayout,
    sizeClass,
    showConfirmClose,
    requestClose,
    confirmClose: () => {
      setShowConfirmClose(false);
      onClose();
    },
    cancelClose: () => setShowConfirmClose(false),
    scrollContainerRef,
    isScrolledTop,
    isScrolledBottom,
    checkScroll,
  };
}
