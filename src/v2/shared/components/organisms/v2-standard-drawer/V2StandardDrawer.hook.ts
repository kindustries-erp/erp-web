import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import type {
  V2StandardDrawerProps,
  V2DrawerSize,
  V2DrawerLayout,
} from "./V2StandardDrawer.type";

const SIZE_CLASSES: Record<V2DrawerSize, string> = {
  sm: "w-full min-w-0 max-w-full md:w-[90vw] lg:w-[42vw] xl:w-[38vw] 2xl:w-[32vw] lg:min-w-[420px] lg:max-w-[660px]",
  md: "w-full min-w-0 max-w-full md:w-[92vw] lg:w-[60vw] xl:w-[54vw] 2xl:w-[48vw] lg:min-w-[620px] lg:max-w-[980px]",
  lg: "w-full min-w-0 max-w-full md:w-[95vw] lg:w-[78vw] xl:w-[74vw] 2xl:w-[68vw] lg:min-w-[840px] lg:max-w-[1380px]",
  xl: "w-full min-w-0 max-w-full md:w-[96vw] lg:w-[93vw] xl:w-[90vw] 2xl:w-[88vw] lg:min-w-[1020px] lg:max-w-[1780px]",
  full: "w-full min-w-0 max-w-full md:w-[98vw] lg:w-[calc(100vw-36px)] xl:w-[calc(100vw-40px)] lg:min-w-[1020px]",
};

function useTabControl(
  controlled?: string,
  fallback?: string,
  onChange?: (k: string) => void,
) {
  const [internal, setInternal] = useState(fallback || "");
  const activeKey = controlled !== undefined ? controlled : internal;
  const handleChange = useCallback(
    (k: string) => {
      if (controlled === undefined) setInternal(k);
      onChange?.(k);
    },
    [controlled, onChange],
  );
  return [activeKey, handleChange] as const;
}

export function useStandardDrawer(props: V2StandardDrawerProps) {
  const { open, mode = "view", tabs, confirmOnClose = false, onClose } = props;
  const size = props.size ?? (props.layout === "1-column" ? "sm" : "xl");

  // 1. Top Header Tabs
  const firstHeaderKey = tabs?.[0]?.key ?? tabs?.[0]?.id ?? "details";
  const [activeTabKey, handleTabChange] = useTabControl(
    props.activeTabKey,
    props.defaultTabKey || firstHeaderKey,
    props.onTabChange,
  );
  const activeTabItem = useMemo(
    () => tabs?.find((t) => (t.key ?? t.id) === activeTabKey),
    [tabs, activeTabKey],
  );

  // 2. Left Sub-Tabs
  const firstLeftKey = props.leftTabs?.[0]?.key ?? props.leftTabs?.[0]?.id;
  const [activeLeftTabKey, handleLeftTabChange] = useTabControl(
    props.activeLeftTabKey,
    props.defaultLeftTabKey || firstLeftKey,
    props.onLeftTabChange,
  );
  const activeLeftTabItem = useMemo(
    () => props.leftTabs?.find((t) => (t.key ?? t.id) === activeLeftTabKey),
    [props.leftTabs, activeLeftTabKey],
  );

  // 3. Right Sub-Tabs
  const firstRightKey = props.rightTabs?.[0]?.key ?? props.rightTabs?.[0]?.id;
  const [activeRightTabKey, handleRightTabChange] = useTabControl(
    props.activeRightTabKey,
    props.defaultRightTabKey || firstRightKey,
    props.onRightTabChange,
  );
  const activeRightTabItem = useMemo(
    () => props.rightTabs?.find((t) => (t.key ?? t.id) === activeRightTabKey),
    [props.rightTabs, activeRightTabKey],
  );

  // Fullscreen controls
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = props.isFullscreen ?? internalFullscreen;
  const toggleFullscreen = useCallback(() => {
    const nextVal = !isFullscreen;
    if (props.isFullscreen === undefined) setInternalFullscreen(nextVal);
    props.onFullscreenChange?.(nextVal);
  }, [props.isFullscreen, isFullscreen, props.onFullscreenChange]);

  // Right panel collapsible
  const [internalRightCollapsed, setInternalRightCollapsed] = useState(false);
  const isRightPanelCollapsed =
    props.isRightPanelCollapsed ?? internalRightCollapsed;
  const toggleRightPanel = useCallback(() => {
    const nextVal = !isRightPanelCollapsed;
    if (props.isRightPanelCollapsed === undefined)
      setInternalRightCollapsed(nextVal);
    props.onRightPanelCollapseChange?.(nextVal);
  }, [
    props.isRightPanelCollapsed,
    isRightPanelCollapsed,
    props.onRightPanelCollapseChange,
  ]);

  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const requestClose = useCallback(() => {
    if (confirmOnClose && mode === "edit") setShowConfirmClose(true);
    else onClose();
  }, [confirmOnClose, mode, onClose]);

  // Esc Key Handler
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

  // Scroll detection
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

  const effectiveLayout: V2DrawerLayout = useMemo(() => {
    if (props.layout) return props.layout;
    return size === "sm" || size === "md" ? "1-column" : "2-columns";
  }, [props.layout, size]);

  const sizeClass = useMemo(() => {
    if (isFullscreen) return "w-screen h-dvh max-w-none rounded-none border-0";
    return SIZE_CLASSES[size] || SIZE_CLASSES.xl;
  }, [isFullscreen, size]);

  return {
    activeTabKey,
    handleTabChange,
    activeTabItem,
    activeLeftTabKey,
    handleLeftTabChange,
    activeLeftTabItem,
    activeRightTabKey,
    handleRightTabChange,
    activeRightTabItem,
    isFullscreen,
    toggleFullscreen,
    enableFullscreen:
      (props.enableFullscreen ?? true) && effectiveLayout === "2-columns",
    isRightPanelCollapsed,
    toggleRightPanel,
    collapsibleRightPanel:
      (props.collapsibleRightPanel ?? true) && effectiveLayout === "2-columns",
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
