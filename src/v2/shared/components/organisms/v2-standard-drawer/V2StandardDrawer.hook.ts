import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useV2DrawerStack } from "./v2DrawerStack";
import {
  V2_DRAWER_SIZE_CLASSES,
  type V2StandardDrawerProps,
  type V2DrawerLayout,
} from "./V2StandardDrawer.type";

import { useTabControl } from "./v2TabControl";

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

  // Multi-drawer stack coordination
  const stack = useV2DrawerStack(props.id, open, {
    stackOffsetPx: props.stackOffsetPx,
    disableStackOffset: props.disableStackOffset || isFullscreen,
  });

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

  // Esc Key Handler: Only topmost active drawer listens & closes on Escape
  useEffect(() => {
    if (!open || !stack.isTopmost) return;
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
  }, [
    open,
    stack.isTopmost,
    showConfirmClose,
    isFullscreen,
    toggleFullscreen,
    requestClose,
  ]);

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

  const effectiveLayout: V2DrawerLayout =
    props.layout || (size === "sm" || size === "md" ? "1-column" : "2-columns");

  const sizeClass = isFullscreen
    ? "w-screen h-dvh max-w-none rounded-none border-0"
    : V2_DRAWER_SIZE_CLASSES[size] || V2_DRAWER_SIZE_CLASSES.xl;

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
    stack,
    depth: stack.depth,
    isTopmost: stack.isTopmost,
    isUnderlying: stack.isUnderlying,
    desktopShiftPx: stack.desktopShiftPx,
    mobileTopOffsetPx: stack.mobileTopOffsetPx,
    zIndex: stack.zIndex,
  };
}
