import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { pageToUrl } from "@/shared/utils/pageUrl";
import { PageKey } from "@/shared/types";
import { useAppStore, STATIC_TABS } from "@/core/config/appStore";

type ContextMenuSource = "sidebar" | "tabbar";

// ── Singleton state ──────────────────────────────────────────────────────────
type ContextMenuState = {
  x: number;
  y: number;
  page: PageKey;
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
) {
  _setState?.({ x, y, page, tab, label, source });
}

export function openPageContextMenu(
  page: PageKey,
  label: string,
  anchor: HTMLElement,
  tab?: string,
  source: ContextMenuSource = "sidebar",
) {
  const rect = anchor.getBoundingClientRect();
  triggerContextMenu(rect.left, rect.bottom + 8, page, label, tab, source);
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
          const domLabel = el.dataset.tabLabel || label;
          triggerContextMenu(
            e.clientX,
            e.clientY,
            domPage,
            domLabel,
            tab,
            source,
          );
          return;
        }
      }
      triggerContextMenu(e.clientX, e.clientY, page, label, tab, source);
    },
    [page, label, source, tab],
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
      // Don't close if click is inside the context menu
      const target = e.target as HTMLElement;
      if (target.closest?.(".context-menu")) return;
      setMenu(null);
    };
    const closeOnContextMenu = (e: Event) => {
      // Don't close if the new right-click is inside the context menu itself
      const target = e.target as HTMLElement;
      if (target.closest?.(".context-menu")) return;
      setMenu(null);
    };
    // Use setTimeout to avoid the current event from immediately closing the menu
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
  const H = isTabbarMenu ? 148 : 44;
  const x = Math.min(menu.x, window.innerWidth - W - GAP);
  const y = Math.min(menu.y, window.innerHeight - H - GAP);

  // Always compute based on menu.page (the right-clicked tab)
  const targetPage = menu.page;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const targetIndex = openTabs.indexOf(targetPage);
  const isStaticTab = Boolean(STATIC_TABS[targetPage]);

  // "Close tabs to right" is relative to the CURRENT ACTIVE tab (not the right-clicked tab)
  // This matches user expectation: the action affects tabs to the right of where they are
  const currentPage = useAppStore.getState().currentPage;
  const currentIndex = openTabs.indexOf(currentPage);
  const hasTabsToRightOfCurrent =
    currentIndex >= 0 &&
    openTabs.slice(currentIndex + 1).some((tab) => !STATIC_TABS[tab]);
  // "Close other tabs" — are there any closable tabs besides the current one?
  const hasOtherClosableTabs = openTabs.some(
    (tab) => !STATIC_TABS[tab] && tab !== currentPage,
  );

  const handleOpenNewTab = () => {
    window.open(pageToUrl(menu.page, menu.tab), "_blank");
    setMenu(null);
  };

  const handleCloseThisTab = () => {
    const page = menu.page;
    setMenu(null);
    if (STATIC_TABS[page]) return;
    useAppStore.getState().closeTab(page);
  };

  const handleCloseTabsToRight = () => {
    setMenu(null);
    // Close tabs to the right of the CURRENT ACTIVE tab (not the right-clicked tab)
    const {
      openTabs: tabs,
      currentPage: active,
      closeTabsToRight,
    } = useAppStore.getState();
    const idx = tabs.indexOf(active);
    if (idx < 0) return;
    const hasTabs = tabs.slice(idx + 1).some((t) => !STATIC_TABS[t]);
    if (!hasTabs) return;
    closeTabsToRight(active);
  };

  const handleCloseAllTabs = () => {
    setMenu(null);
    // Close all tabs except static tabs and the current active tab
    const { openTabs: tabs, currentPage: active } = useAppStore.getState();
    const newTabs = tabs.filter((t) => STATIC_TABS[t] || t === active);
    useAppStore.setState({ openTabs: newTabs });
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
            disabled={!hasTabsToRightOfCurrent}
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
            onClick={handleCloseAllTabs}
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
