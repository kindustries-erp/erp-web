import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PageKey, TabInfo, SectionRoot } from "@/shared/types";
import { pageToPath } from "@/shared/utils/pageUrl";

export type AppTheme = "shell" | "classic" | "orcaq";

function applyDocumentTheme(appTheme: AppTheme) {
  document.documentElement.classList.toggle(
    "theme-classic",
    appTheme === "classic",
  );
  document.documentElement.classList.toggle(
    "theme-orcaq",
    appTheme === "orcaq",
  );
}

export const STATIC_TABS: Record<string, TabInfo> = {
  dashboard: { labelKey: "nav.items.dashboard", closable: false },
};

export const SECTION_ROOTS: Record<string, SectionRoot> = {
  sales: { labelKey: "nav.items.sales", group: "sales" },
  purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
  inventory: { labelKey: "nav.items.inventory", group: "inventory" },
  "mfg-items": { labelKey: "nav.items.mfgItems", group: "manufacturing" },
  "mfg-purchase-orders": {
    labelKey: "nav.items.mfgPo",
    group: "manufacturing",
  },
  "mfg-vehicles": { labelKey: "nav.items.mfgVehicles", group: "manufacturing" },
  "erp-bom": { labelKey: "nav.items.erpBom", group: "manufacturing" },
  "erp-goods-receipts": {
    labelKey: "nav.items.erpGoodsReceipts",
    group: "manufacturing",
  },
  "erp-production": {
    labelKey: "nav.items.erpProduction",
    group: "manufacturing",
  },
  "erp-sales-orders": {
    labelKey: "nav.items.erpSalesOrders",
    group: "manufacturing",
  },
  "erp-goods-issues": {
    labelKey: "nav.items.erpGoodsIssues",
    group: "manufacturing",
  },
  "erp-inventory-items": {
    labelKey: "nav.items.erpInventoryItems",
    group: "manufacturing",
  },
};

export const BREADCRUMBS: Record<string, Array<[string, string?]>> = {
  dashboard: [["breadcrumb.dashboard"]],
  sales: [["breadcrumb.sales"], ["breadcrumb.salesOrders"]],
  purchasing: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  inventory: [["breadcrumb.inventory"]],
  "mfg-items": [["breadcrumb.manufacturing"], ["breadcrumb.mfgItems"]],
  "mfg-purchase-orders": [["breadcrumb.manufacturing"], ["breadcrumb.mfgPo"]],
  "mfg-vehicles": [["breadcrumb.manufacturing"], ["breadcrumb.mfgVehicles"]],
  "erp-bom": [["breadcrumb.manufacturing"], ["breadcrumb.erpBom"]],
  "erp-goods-receipts": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpGoodsReceipts"],
  ],
  "erp-production": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpProduction"],
  ],
  "erp-sales-orders": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpSalesOrders"],
  ],
  "erp-goods-issues": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpGoodsIssues"],
  ],
  "erp-inventory-items": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpInventoryItems"],
  ],
};

interface AppState {
  currentPage: PageKey;
  openTabs: PageKey[];
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  appTheme: AppTheme;
  locale: "vi" | "en";
  isLoggedIn: boolean;
  forbidden: boolean;
  customBreadcrumbs: Array<[string, string?]> | null;
  setForbidden: (value: boolean) => void;
  navigate: (page: PageKey) => void;
  syncFromUrl: (page: PageKey) => void;
  closeTab: (key: PageKey) => void;
  closeAllTabs: () => void;
  closeTabsToRight: (key: PageKey) => void;
  reorderTabs: (sourceKey: PageKey, targetKey: PageKey) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleAppTheme: () => void;
  setAppTheme: (theme: AppTheme) => void;
  toggleLocale: () => void;
  setLocale: (locale: "vi" | "en") => void;
  login: () => void;
  logout: () => void;
  setCustomBreadcrumbs: (crumbs: Array<[string, string?]> | null) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: "dashboard",
      openTabs: ["dashboard"],
      forbidden: false,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      appTheme: "shell",
      locale: "vi",
      isLoggedIn: false,
      customBreadcrumbs: null,

      setForbidden: (value) => set({ forbidden: value }),
      setCustomBreadcrumbs: (crumbs) => set({ customBreadcrumbs: crumbs }),

      navigate: (page) => {
        const { openTabs } = get();
        const newTabs = [...openTabs];
        if (!newTabs.includes(page)) {
          const group = SECTION_ROOTS[page]?.group;
          if (group) {
            let lastIdx = -1;
            newTabs.forEach((t, i) => {
              if (SECTION_ROOTS[t]?.group === group) lastIdx = i;
            });
            if (lastIdx >= 0) newTabs.splice(lastIdx + 1, 0, page);
            else newTabs.push(page);
          } else {
            newTabs.push(page);
          }
        }
        set({
          currentPage: page,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
          customBreadcrumbs: null,
        });
        const path = pageToPath(page);
        const current = window.location.pathname + window.location.search;
        if (current !== path) history.pushState(null, "", path);
      },

      syncFromUrl: (page) => {
        const { openTabs } = get();
        const newTabs = [...openTabs];
        if (!newTabs.includes(page)) {
          const group = SECTION_ROOTS[page]?.group;
          if (group) {
            let lastIdx = -1;
            newTabs.forEach((t, i) => {
              if (SECTION_ROOTS[t]?.group === group) lastIdx = i;
            });
            if (lastIdx >= 0) newTabs.splice(lastIdx + 1, 0, page);
            else newTabs.push(page);
          } else {
            newTabs.push(page);
          }
        }
        set({
          currentPage: page,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
        });
      },

      closeTab: (key) => {
        const { openTabs, currentPage } = get();
        const idx = openTabs.indexOf(key);
        const newTabs = openTabs.filter((t) => t !== key);
        if (currentPage === key) {
          const nextPage =
            newTabs[Math.min(idx, newTabs.length - 1)] ?? "dashboard";
          const path = pageToPath(nextPage);
          const current = window.location.pathname + window.location.search;
          if (current !== path) history.pushState(null, "", path);
          set({
            currentPage: nextPage,
            openTabs: newTabs,
            customBreadcrumbs: null,
          });
        } else {
          set({ openTabs: newTabs });
        }
      },

      closeAllTabs: () => {
        const { openTabs, currentPage, navigate } = get();
        const newTabs = openTabs.filter((t) => STATIC_TABS[t]);
        if (!newTabs.includes(currentPage)) {
          navigate(newTabs[newTabs.length - 1] ?? "dashboard");
        } else {
          set({ openTabs: newTabs });
        }
      },

      closeTabsToRight: (key) => {
        const { openTabs, currentPage, navigate } = get();
        const index = openTabs.indexOf(key);
        if (index < 0) return;
        const keepTabs = openTabs.filter((tab, tabIndex) => {
          if (tabIndex <= index) return true;
          return Boolean(STATIC_TABS[tab]);
        });
        if (!keepTabs.includes(currentPage)) {
          navigate(keepTabs[keepTabs.length - 1] ?? key ?? "dashboard");
        } else {
          set({ openTabs: keepTabs });
        }
      },

      reorderTabs: (sourceKey, targetKey) => {
        if (sourceKey === targetKey) return;
        if (STATIC_TABS[sourceKey] || STATIC_TABS[targetKey]) return;
        const { openTabs } = get();
        const sourceIndex = openTabs.indexOf(sourceKey);
        const targetIndex = openTabs.indexOf(targetKey);
        if (sourceIndex < 0 || targetIndex < 0) return;
        const newTabs = [...openTabs];
        const [movedTab] = newTabs.splice(sourceIndex, 1);
        newTabs.splice(targetIndex, 0, movedTab);
        set({ openTabs: newTabs });
      },

      toggleSidebar: () => {
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
        setTimeout(() => window.dispatchEvent(new Event("resize")), 240);
      },
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      toggleAppTheme: () => {
        const order: AppTheme[] = ["shell", "classic", "orcaq"];
        const idx = order.indexOf(get().appTheme);
        const appTheme = order[(idx + 1) % order.length];
        set({ appTheme });
        applyDocumentTheme(appTheme);
      },
      setAppTheme: (theme) => {
        set({ appTheme: theme });
        applyDocumentTheme(theme);
      },

      toggleLocale: () =>
        set((s) => ({ locale: s.locale === "vi" ? "en" : "vi" })),
      setLocale: (locale) => set({ locale }),

      login: () => set({ isLoggedIn: true }),
      logout: () =>
        set({
          isLoggedIn: false,
          currentPage: "dashboard",
          openTabs: ["dashboard"],
        }),
    }),
    {
      name: "erp-app",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        appTheme: s.appTheme,
        locale: s.locale,
        isLoggedIn: s.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDocumentTheme(state.appTheme);
        } else {
          applyDocumentTheme("shell");
        }
      },
    },
  ),
);
