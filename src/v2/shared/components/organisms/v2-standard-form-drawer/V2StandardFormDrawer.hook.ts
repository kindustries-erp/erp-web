import { useState, useEffect, useCallback, useMemo } from "react";
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
  full: "w-full min-w-0 max-w-full md:w-[98vw] lg:w-[calc(100vw-208px)] xl:w-[calc(100vw-208px)] lg:min-w-[1020px] lg:max-w-[calc(100vw-208px)]",
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

  // Active Tab State
  const [internalTabKey, setInternalTabKey] = useState<string>(
    () => defaultTabKey || tabs?.[0]?.key || "details",
  );
  const activeTabKey =
    controlledTabKey !== undefined ? controlledTabKey : internalTabKey;

  const handleTabChange = useCallback(
    (key: string) => {
      if (controlledTabKey === undefined) {
        setInternalTabKey(key);
      }
      onTabChange?.(key);
    },
    [controlledTabKey, onTabChange],
  );

  // Fullscreen State
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen =
    controlledFullscreen !== undefined
      ? controlledFullscreen
      : internalFullscreen;

  const toggleFullscreen = useCallback(() => {
    const nextVal = !isFullscreen;
    if (controlledFullscreen === undefined) {
      setInternalFullscreen(nextVal);
    }
    onFullscreenChange?.(nextVal);
  }, [controlledFullscreen, isFullscreen, onFullscreenChange]);

  // Right Panel Collapsed State
  const [internalRightCollapsed, setInternalRightCollapsed] = useState(false);
  const isRightPanelCollapsed =
    controlledRightCollapsed !== undefined
      ? controlledRightCollapsed
      : internalRightCollapsed;

  const toggleRightPanel = useCallback(() => {
    const nextVal = !isRightPanelCollapsed;
    if (controlledRightCollapsed === undefined) {
      setInternalRightCollapsed(nextVal);
    }
    onRightPanelCollapseChange?.(nextVal);
  }, [
    controlledRightCollapsed,
    isRightPanelCollapsed,
    onRightPanelCollapseChange,
  ]);

  // Confirm Close State
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const requestClose = useCallback(() => {
    if (confirmOnClose && mode === "edit") {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [confirmOnClose, mode, onClose]);

  const confirmClose = useCallback(() => {
    setShowConfirmClose(false);
    onClose();
  }, [onClose]);

  const cancelClose = useCallback(() => {
    setShowConfirmClose(false);
  }, []);

  // Esc Key Handler: Esc 1st shrinks fullscreen; Esc 2nd requests close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (showConfirmClose) {
          setShowConfirmClose(false);
        } else if (isFullscreen) {
          toggleFullscreen();
        } else {
          requestClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, showConfirmClose, isFullscreen, toggleFullscreen, requestClose]);

  // Active Tab Item Resolution
  const activeTabItem = useMemo(
    () => tabs?.find((t) => t.key === activeTabKey),
    [tabs, activeTabKey],
  );

  // Layout Resolution: if active tab hides right panel, force 1-column layout
  const effectiveLayout: V2DrawerLayout = useMemo(() => {
    if (activeTabItem?.hideRightPanel) return "1-column";
    if (props.layout) return props.layout;
    return size === "sm" || size === "md" ? "1-column" : "2-columns";
  }, [activeTabItem?.hideRightPanel, props.layout, size]);

  // Dynamic Size Class
  const sizeClass = useMemo(() => {
    if (isFullscreen) {
      return "w-full min-w-0 max-w-full md:w-[98vw] lg:w-[calc(100vw-208px)] xl:w-[calc(100vw-208px)] lg:min-w-[1020px] lg:max-w-[calc(100vw-208px)]";
    }
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
    confirmClose,
    cancelClose,
  };
}
