import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PageKey, TabInfo, SectionRoot } from "@/shared/types";
import { pageToPath } from "@/shared/utils/pageUrl";

export type AppTheme = "shell" | "classic";

function applyDocumentTheme(appTheme: AppTheme) {
  document.documentElement.classList.toggle(
    "theme-classic",
    appTheme === "classic",
  );
}

export const STATIC_TABS: Record<string, TabInfo> = {
  dashboard: { labelKey: "nav.items.dashboard", closable: false },
};

export const SECTION_ROOTS: Record<string, SectionRoot> = {
  cashflow: { labelKey: "nav.items.cashflow", group: "cashflow" },
  "cash-fund": { labelKey: "nav.items.cashflowCash", group: "cashflow" },
  "bank-deposit": {
    labelKey: "nav.items.cashflowBankShort",
    group: "cashflow",
  },
  attachments: { labelKey: "nav.items.cashflowAttachments", group: "cashflow" },
  "settings-cash-fund": { labelKey: "nav.items.catalog", group: "settings" },
  "settings-bank": { labelKey: "nav.items.catalogBank", group: "settings" },
  "settings-accounts": {
    labelKey: "nav.items.catalogAccounts",
    group: "settings",
  },
  receivables: { labelKey: "nav.items.debt", group: "debt" },
  payables: { labelKey: "nav.items.debtPayable", group: "debt" },
  ledger: { labelKey: "nav.items.reportLedger", group: "reports" },
  journal: { labelKey: "nav.items.report", group: "reports" },
  employees: { labelKey: "nav.items.hr", group: "hr" },
  departments: { labelKey: "nav.items.hrDepts", group: "hr" },
  positions: { labelKey: "nav.items.hrPositions", group: "hr" },
  sales: { labelKey: "nav.items.sales", group: "sales" },
  customers: { labelKey: "nav.items.customers", group: "sales" },
  purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
  suppliers: { labelKey: "nav.items.suppliers", group: "purchasing" },
  "activity-log": { labelKey: "nav.items.activitylog", group: "system" },
  partners: { labelKey: "nav.items.partners", group: "partners" },
  "e-invoice": { labelKey: "nav.items.hoadondientu", group: "cashflow" },
  permissions: { labelKey: "nav.items.phanquyen", group: "system" },
};

export const BREADCRUMBS: Record<string, Array<[string, string?]>> = {
  dashboard: [["breadcrumb.dashboard"]],
  cashflow: [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow"],
    ["breadcrumb.cashflowOverview"],
  ],
  "cash-fund": [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow", "cashflow"],
    ["breadcrumb.cash"],
  ],
  "bank-deposit": [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow", "cashflow"],
    ["breadcrumb.bank"],
  ],
  attachments: [["breadcrumb.accounting"], ["breadcrumb.attachments"]],
  "e-invoice": [["breadcrumb.accounting"], ["breadcrumb.hoadondientu"]],
  "settings-cash-fund": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "settings-cash-fund"],
    ["breadcrumb.catalogFunds"],
  ],
  "settings-bank": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "settings-cash-fund"],
    ["breadcrumb.catalogBank"],
  ],
  "settings-accounts": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "settings-cash-fund"],
    ["breadcrumb.catalogAccounts"],
  ],
  receivables: [
    ["breadcrumb.accounting"],
    ["breadcrumb.debt"],
    ["breadcrumb.debtReceivable"],
  ],
  payables: [
    ["breadcrumb.accounting"],
    ["breadcrumb.debt"],
    ["breadcrumb.debtPayable"],
  ],
  ledger: [
    ["breadcrumb.accounting"],
    ["breadcrumb.report"],
    ["breadcrumb.reportLedger"],
  ],
  journal: [
    ["breadcrumb.accounting"],
    ["breadcrumb.report"],
    ["breadcrumb.reportJournal"],
  ],
  employees: [["breadcrumb.hr"], ["breadcrumb.hrStaff"]],
  departments: [["breadcrumb.hr"], ["breadcrumb.hrDepts"]],
  positions: [["breadcrumb.hr"], ["breadcrumb.hrPositions"]],
  sales: [["breadcrumb.sales"], ["breadcrumb.salesOrders"]],
  customers: [["breadcrumb.sales"], ["breadcrumb.customers"]],
  purchasing: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  suppliers: [["breadcrumb.purchasing"], ["breadcrumb.suppliers"]],
  "activity-log": [["breadcrumb.system"], ["breadcrumb.activitylog"]],
  partners: [["breadcrumb.accounting"], ["breadcrumb.partners"]],
  permissions: [["breadcrumb.system"], ["breadcrumb.phanquyen"]],
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
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleAppTheme: () => void;
  toggleLocale: () => void;
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
        const { openTabs, currentPage, navigate } = get();
        const newTabs = openTabs.filter((t) => t !== key);
        if (currentPage === key) {
          navigate(newTabs[newTabs.length - 1] ?? "dashboard");
        } else {
          set({ openTabs: newTabs });
        }
      },

      toggleSidebar: () => {
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
        // Fire resize after CSS transition (220ms) so Chart.js repaints
        setTimeout(() => window.dispatchEvent(new Event("resize")), 240);
      },
      setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

      toggleAppTheme: () => {
        const appTheme = get().appTheme === "shell" ? "classic" : "shell";
        set({ appTheme });
        applyDocumentTheme(appTheme);
      },

      toggleLocale: () =>
        set((s) => ({ locale: s.locale === "vi" ? "en" : "vi" })),
      login: () => set({ isLoggedIn: true }),
      logout: () => set({ isLoggedIn: false }),
    }),
    {
      name: "erp-ui",
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        appTheme: s.appTheme,
        locale: s.locale,
        isLoggedIn: s.isLoggedIn,
      }),
      onRehydrateStorage: () => (state) => {
        applyDocumentTheme(state?.appTheme ?? "shell");
      },
    },
  ),
);
