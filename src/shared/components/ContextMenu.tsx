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

// ── Hook for menu items ──────────────────────────────────────────────────────
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
      triggerContextMenu(e.clientX, e.clientY, page, label, tab, source);
    },
    [page, label, source, tab],
  );
}

// ── App-level context menu renderer (mount once in App.tsx) ──────────────────
export function AppContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>(null);
  const { closeAllTabs, closeTabsToRight, openTabs } = useAppStore();

  useEffect(() => {
    _setState = setMenu;
    return () => {
      _setState = null;
    };
  }, []);

  useEffect(() => {
    if (!menu) return;
    const closeOnOutsideClick = () => setMenu(null);
    const closeOnContextMenu = () => setMenu(null);
    window.addEventListener("click", closeOnOutsideClick);
    window.addEventListener("contextmenu", closeOnContextMenu, {
      capture: true,
    });
    return () => {
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
  const H = isTabbarMenu ? 112 : 44;
  const x = Math.min(menu.x, window.innerWidth - W - GAP);
  const y = Math.min(menu.y, window.innerHeight - H - GAP);
  const activeTabIndex = openTabs.indexOf(menu.page);
  const hasTabsToRight = openTabs
    .slice(activeTabIndex + 1)
    .some((tab) => !STATIC_TABS[tab]);
  const isStaticTab = Boolean(STATIC_TABS[menu.page]);

  return createPortal(
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        className="context-menu-item"
        onClick={() => {
          window.open(pageToUrl(menu.page, menu.tab), "_blank");
          setMenu(null);
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-shrink-0 opacity-70"
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
            className="context-menu-item text-down-fg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isStaticTab || !hasTabsToRight}
            onClick={() => {
              if (isStaticTab || !hasTabsToRight) return;
              closeTabsToRight(menu.page);
              setMenu(null);
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-70"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
              <line x1="4" y1="12" x2="15" y2="12"></line>
            </svg>
            Đóng tab bên phải
          </button>

          <button
            className="context-menu-item text-down-fg"
            onClick={() => {
              closeAllTabs();
              setMenu(null);
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flex-shrink-0 opacity-70"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Đóng tất cả tab phụ
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
