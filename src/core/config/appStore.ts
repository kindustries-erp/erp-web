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

export const STATIC_TABS: Partial<Record<PageKey, TabInfo>> = {
  dashboard: { labelKey: "nav.items.dashboard", closable: false },
};

export const SECTION_ROOTS: Partial<Record<PageKey, SectionRoot>> = {
  purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
  "erp-inventory-stock": {
    labelKey: "nav.items.erpInventoryStock",
    group: "inventory",
  },
  "erp-inventory-tracking": {
    labelKey: "nav.items.erpInventoryTracking",
    group: "inventory",
  },
  "erp-inventory-vouchers": {
    labelKey: "nav.items.erpInventoryVouchers",
    group: "inventory",
  },
  "mfg-items": { labelKey: "nav.items.mfgItems", group: "manufacturing" },
  "mfg-purchase-orders": {
    labelKey: "nav.items.mfgPo",
    group: "manufacturing",
  },
  "mfg-vehicles": { labelKey: "nav.items.mfgVehicles", group: "manufacturing" },
  "erp-bom": { labelKey: "nav.items.erpBom", group: "manufacturing" },
  "erp-goods-issues": {
    labelKey: "nav.items.erpGoodsIssues",
    group: "inventory",
  },
  "erp-inventory-items": {
    labelKey: "nav.items.erpInventoryItems",
    group: "inventory",
  },
  "erp-inventory-uom": {
    labelKey: "nav.items.erpInventoryUom",
    group: "settings",
  },
  "erp-inventory-item-types": {
    labelKey: "nav.items.erpInventoryItemTypes",
    group: "settings",
  },
  "erp-inventory-tracking-categories": {
    labelKey: "nav.items.erpInventoryTrackingCategories",
    group: "settings",
  },
  "erp-production": {
    labelKey: "nav.items.erpProduction",
    group: "manufacturing",
  },
  "erp-sales-orders": {
    labelKey: "nav.items.erpSalesOrders",
    group: "sales",
  },
  "erp-customers": {
    labelKey: "nav.items.customers",
    group: "sales",
  },
  "after-sales": {
    labelKey: "nav.items.afterSales",
    group: "sales",
  },
  "erp-suppliers": {
    labelKey: "nav.items.suppliers",
    group: "purchasing",
  },
  "journal-entry": {
    labelKey: "nav.items.reportJournal",
    group: "reports",
  },
  "settings-accounts": {
    labelKey: "nav.items.catalogAccounts",
    group: "settings",
  },
  "erp-activity-logs": {
    labelKey: "nav.items.activitylog",
    group: "settings",
  },
  "erp-employees": {
    labelKey: "nav.items.erpEmployees",
    group: "hr",
  },
  "erp-users": {
    labelKey: "nav.items.users",
    group: "settings",
  },
  "erp-permissions-core": {
    labelKey: "nav.items.phanquyen",
    group: "settings",
  },
  "sys-tags": {
    labelKey: "nav.items.sysTags",
    group: "settings",
  },
  "erp-invoices-in": {
    labelKey: "nav.items.erpInvoicesIn",
    group: "accounting",
  },
  "erp-invoices-out": {
    labelKey: "nav.items.erpInvoicesOut",
    group: "accounting",
  },
  "settings-branch": {
    labelKey: "thietlap.tabs.chi-nhanh",
    group: "settings",
  },
  "settings-bank": {
    labelKey: "thietlap.tabs.ngan-hang",
    group: "settings",
  },
  "settings-cash-fund": {
    labelKey: "thietlap.tabs.quy",
    group: "settings",
  },
  "bank-statement": {
    labelKey: "bankStatement.bankTitle",
    group: "accounting",
  },
  "cash-statement": {
    labelKey: "bankStatement.cashTitle",
    group: "accounting",
  },
  "cashflow-dashboard": {
    labelKey: "nav.items.cashflowDashboard",
    group: "accounting",
  },
  "garage-dashboard": {
    labelKey: "nav.items.garageDashboard",
    group: "garage",
  },
  "garage-cases": {
    labelKey: "nav.items.garageCases",
    group: "garage",
  },
  "garage-receivables": {
    labelKey: "nav.items.garageReceivables",
    group: "garage",
  },
  "garage-payables": {
    labelKey: "nav.items.garagePayables",
    group: "garage",
  },
};

export const BREADCRUMBS: Partial<Record<PageKey, Array<[string, string?]>>> = {
  dashboard: [["breadcrumb.dashboard"]],

  purchasing: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  "erp-inventory-stock": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryGroup"],
    ["breadcrumb.inventoryStock"],
  ],
  "erp-inventory-tracking": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryGroup"],
    ["breadcrumb.inventoryTracking"],
  ],
  "erp-inventory-vouchers": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryVouchers"],
  ],
  "mfg-items": [["breadcrumb.manufacturing"], ["breadcrumb.mfgItems"]],
  "mfg-purchase-orders": [["breadcrumb.manufacturing"], ["breadcrumb.mfgPo"]],
  "mfg-vehicles": [["breadcrumb.manufacturing"], ["breadcrumb.mfgVehicles"]],
  "erp-bom": [["breadcrumb.manufacturing"], ["breadcrumb.erpBom"]],
  "erp-production": [
    ["breadcrumb.manufacturing"],
    ["breadcrumb.erpProduction"],
  ],
  "erp-sales-orders": [["breadcrumb.sales"], ["breadcrumb.erpSalesOrders"]],
  "erp-customers": [["breadcrumb.sales"], ["breadcrumb.customers"]],
  "after-sales": [["nav.items.sales"], ["nav.items.afterSales"]],
  "erp-suppliers": [["breadcrumb.purchasing"], ["breadcrumb.suppliers"]],
  "erp-goods-issues": [["breadcrumb.inventory"], ["breadcrumb.erpGoodsIssues"]],
  "erp-inventory-items": [
    ["breadcrumb.inventory"],
    ["breadcrumb.erpInventoryItems"],
  ],
  "erp-inventory-uom": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryUom"],
  ],
  "erp-inventory-item-types": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryItemTypes"],
  ],
  "erp-inventory-tracking-categories": [
    ["breadcrumb.settings"],
    ["breadcrumb.erpInventoryMasters"],
    ["breadcrumb.erpInventoryTrackingCategories"],
  ],
  "erp-activity-logs": [["breadcrumb.settings"], ["breadcrumb.activitylog"]],
  "erp-employees": [["breadcrumb.hr"], ["breadcrumb.erpEmployees"]],
  "erp-users": [["breadcrumb.settings"], ["breadcrumb.users"]],
  "erp-permissions-core": [["breadcrumb.settings"], ["breadcrumb.phanquyen"]],
  "sys-tags": [["breadcrumb.settings"], ["nav.items.sysTags"]],
  "erp-invoices-in": [["breadcrumb.accounting"], ["breadcrumb.inbound"]],
  "erp-invoices-out": [["breadcrumb.accounting"], ["breadcrumb.outbound"]],
  "journal-entry": [["breadcrumb.accounting"], ["nav.items.reportJournal"]],
  "settings-accounts": [
    ["breadcrumb.accounting"],
    ["nav.items.catalogAccounts"],
  ],
  "bank-statement": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["bankStatement.bankTitle"],
  ],
  "cash-statement": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["bankStatement.cashTitle"],
  ],
  "cashflow-dashboard": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["nav.items.dashboard"],
  ],
  "settings-branch": [["breadcrumb.settings"], ["thietlap.tabs.chi-nhanh"]],
  "settings-bank": [["breadcrumb.settings"], ["thietlap.tabs.ngan-hang"]],
  "settings-cash-fund": [["breadcrumb.settings"], ["thietlap.tabs.quy"]],
  "garage-dashboard": [["nav.items.garage"], ["nav.items.garageDashboard"]],
  "garage-cases": [["nav.items.garage"], ["nav.items.garageCases"]],
  "garage-receivables": [["nav.items.garage"], ["nav.items.garageReceivables"]],
  "garage-payables": [["nav.items.garage"], ["nav.items.garagePayables"]],
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
  companyProfileOpen: boolean;
  currentBranchId: string | null;
  customBreadcrumbs: Array<[string, string?]> | null;
  setForbidden: (value: boolean) => void;
  setCurrentBranchId: (id: string | null) => void;
  navigate: (page: PageKey) => void;
  syncFromUrl: (page: PageKey) => void;
  closeTab: (key: PageKey) => void;
  closeAllTabs: () => void;
  closeTabsToRight: (key: PageKey) => void;
  reorderTabs: (sourceKey: PageKey, targetKey: PageKey) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCompanyProfileOpen: (open: boolean) => void;
  toggleAppTheme: () => void;
  setAppTheme: (theme: AppTheme) => void;
  toggleLocale: () => void;
  setLocale: (locale: "vi" | "en") => void;
  login: () => void;
  logout: () => void;
  setCustomBreadcrumbs: (crumbs: Array<[string, string?]> | null) => void;
  preloadTab: (page: PageKey) => void;
  sidebarSearchQuery: string;
  setSidebarSearchQuery: (q: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: "dashboard",
      openTabs: ["dashboard"],
      forbidden: false,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      appTheme: "classic",
      locale: "vi",
      isLoggedIn: false,
      companyProfileOpen: false,
      currentBranchId: null,
      customBreadcrumbs: null,
      sidebarSearchQuery: "",

      setForbidden: (value) => set({ forbidden: value }),
      setCurrentBranchId: (id) => set({ currentBranchId: id }),
      setCustomBreadcrumbs: (crumbs) => set({ customBreadcrumbs: crumbs }),
      setSidebarSearchQuery: (q) => set({ sidebarSearchQuery: q }),

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

      preloadTab: (page) => {
        const { openTabs } = get();
        if (openTabs.includes(page)) return;
        const newTabs = [...openTabs];
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
        set({ openTabs: newTabs });
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
      setCompanyProfileOpen: (open) => set({ companyProfileOpen: open }),

      toggleAppTheme: () => {
        const order: AppTheme[] = ["classic", "shell", "orcaq"];
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
        currentBranchId: s.currentBranchId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyDocumentTheme(state.appTheme);
        } else {
          applyDocumentTheme("classic");
        }
      },
    },
  ),
);
