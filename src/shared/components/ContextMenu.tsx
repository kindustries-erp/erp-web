import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { pageToUrl } from "@/shared/utils/pageUrl";
import { PageKey } from "@/shared/types";
import {
  useAppStore,
  STATIC_TABS,
  DUPLICATABLE_PAGES,
} from "@/core/config/appStore";
import { Copy } from "lucide-react";

type ContextMenuSource = "sidebar" | "tabbar";

// ── Singleton state ──────────────────────────────────────────────────────────
type ContextMenuState = {
  x: number;
  y: number;
  page: PageKey;
  instanceId?: string;
  tab?: string;
  label: string;
  source: ContextMenuSource;
} | null;

let _setState: ((s: ContextMenuState) => void) | null = null;

export function triggerContextMenu(
  x: number,
  y: number,
  page: PageKey,
  label: string,
  tab?: string,
  source: ContextMenuSource = "sidebar",
  instanceId?: string,
) {
  _setState?.({ x, y, page, tab, label, source, instanceId });
}

export function openPageContextMenu(
  page: PageKey,
  label: string,
  anchor: HTMLElement,
  tab?: string,
  source: ContextMenuSource = "sidebar",
  instanceId?: string,
) {
  const rect = anchor.getBoundingClientRect();
  triggerContextMenu(
    rect.left,
    rect.bottom + 8,
    page,
    label,
    tab,
    source,
    instanceId,
  );
}

export function closePageContextMenu() {
  _setState?.(null);
}

// ── Hook for sidebar/nav items ───────────────────────────────────────────────
export function usePageContextMenu(
  page: PageKey,
  label: string,
  tab?: string,
  source: ContextMenuSource = "sidebar",
  instanceId?: string,
) {
  return useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // For tabbar items, read page key from DOM data attribute to avoid stale closures
      if (source === "tabbar") {
        const el = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-tab-page]",
        );
        if (el) {
          const domPage = el.dataset.tabPage as PageKey;
          const domInstanceId = el.dataset.tabInstanceId || instanceId;
          const domLabel = el.dataset.tabLabel || label;
          triggerContextMenu(
            e.clientX,
            e.clientY,
            domPage,
            domLabel,
            tab,
            source,
            domInstanceId,
          );
          return;
        }
      }
      triggerContextMenu(
        e.clientX,
        e.clientY,
        page,
        label,
        tab,
        source,
        instanceId,
      );
    },
    [page, label, source, tab, instanceId],
  );
}

// ── App-level context menu renderer (mount once in App.tsx) ──────────────────
export function AppContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>(null);
  const openTabs = useAppStore((s) => s.openTabs);

  useEffect(() => {
    _setState = setMenu;
    return () => {
      _setState = null;
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const closeOnOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest?.(".context-menu")) return;
      setMenu(null);
    };
    const closeOnContextMenu = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest?.(".context-menu")) return;
      setMenu(null);
    };
    const timer = setTimeout(() => {
      window.addEventListener("click", closeOnOutsideClick);
      window.addEventListener("contextmenu", closeOnContextMenu, {
        capture: true,
      });
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", closeOnOutsideClick);
      window.removeEventListener("contextmenu", closeOnContextMenu, {
        capture: true,
      });
    };
  }, [menu]);

  if (!menu) return null;

  const GAP = 8;
  const isTabbarMenu = menu.source === "tabbar";
  const W = 220;
  const H = isTabbarMenu ? 180 : 44;
  const x = Math.min(menu.x, window.innerWidth - W - GAP);
  const y = Math.min(menu.y, window.innerHeight - H - GAP);

  const targetPage = menu.page;
  const targetInstanceId = menu.instanceId || targetPage;
  const isStaticTab = Boolean(STATIC_TABS[targetPage]);

  const canDuplicate = DUPLICATABLE_PAGES.has(targetPage);
  const instancesCount = openTabs.filter(
    (t) => t.pageKey === targetPage,
  ).length;
  const hasReachedMaxDuplicate = instancesCount >= 2;

  const targetIndex = openTabs.findIndex(
    (t) => t.instanceId === targetInstanceId,
  );
  const hasTabsToRightOfTarget =
    targetIndex >= 0 &&
    openTabs.slice(targetIndex + 1).some((tab) => !STATIC_TABS[tab.pageKey]);

  const hasOtherClosableTabs = openTabs.some(
    (tab) => !STATIC_TABS[tab.pageKey] && tab.instanceId !== targetInstanceId,
  );

  const handleOpenNewTab = () => {
    window.open(pageToUrl(menu.page, menu.tab), "_blank");
    setMenu(null);
  };

  const handleDuplicateTab = () => {
    setMenu(null);
    if (!canDuplicate || hasReachedMaxDuplicate) return;
    useAppStore.getState().duplicateTab(targetPage);
  };

  const handleCloseThisTab = () => {
    setMenu(null);
    if (isStaticTab) return;
    useAppStore.getState().closeTab(targetInstanceId);
  };

  const handleCloseTabsToRight = () => {
    setMenu(null);
    useAppStore.getState().closeTabsToRight(targetInstanceId);
  };

  const handleCloseOtherTabs = () => {
    setMenu(null);
    useAppStore.getState().closeOtherTabs(targetInstanceId);
  };

  return createPortal(
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="context-menu-item" onClick={handleOpenNewTab}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 opacity-60"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
        Mở trong tab mới
      </button>

      {isTabbarMenu && (
        <>
          {canDuplicate && (
            <button
              className="context-menu-item disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={hasReachedMaxDuplicate}
              title={
                hasReachedMaxDuplicate
                  ? "Đã đạt giới hạn tối đa 2 tab cho module này"
                  : undefined
              }
              onClick={handleDuplicateTab}
            >
              <Copy className="w-3.5 h-3.5 flex-shrink-0 opacity-60 mr-2" />
              Nhân đôi tab {hasReachedMaxDuplicate ? "(Tối đa 2)" : ""}
            </button>
          )}

          <button
            className="context-menu-item disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={isStaticTab}
            onClick={handleCloseThisTab}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-60"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Đóng tab này
          </button>

          <button
            className="context-menu-item disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!hasTabsToRightOfTarget}
            onClick={handleCloseTabsToRight}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-60"
            >
              <path d="M13 17l5-5-5-5" />
              <path d="M6 17l5-5-5-5" />
            </svg>
            Đóng tab bên phải
          </button>

          <button
            className="context-menu-item disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={!hasOtherClosableTabs}
            onClick={handleCloseOtherTabs}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-60"
            >
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
            Đóng các tab khác
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
