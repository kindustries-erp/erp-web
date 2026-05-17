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
  dongtien: { labelKey: "nav.items.cashflow", group: "dongtien" },
  tienmat: { labelKey: "nav.items.cashflowCash", group: "dongtien" },
  tiengui: { labelKey: "nav.items.cashflowBankShort", group: "dongtien" },
  dinhkem: { labelKey: "nav.items.cashflowAttachments", group: "dongtien" },
  "thietlap-quy": { labelKey: "nav.items.catalog", group: "thietlap" },
  "thietlap-nh": { labelKey: "nav.items.catalogBank", group: "thietlap" },
  "thietlap-tk": { labelKey: "nav.items.catalogAccounts", group: "thietlap" },
  phaithu: { labelKey: "nav.items.debt", group: "congno" },
  phaittra: { labelKey: "nav.items.debtPayable", group: "congno" },
  socat: { labelKey: "nav.items.reportLedger", group: "baocao" },
  nhatkyechung: { labelKey: "nav.items.report", group: "baocao" },
  nhansu: { labelKey: "nav.items.hr", group: "nhansu" },
  phongban: { labelKey: "nav.items.hrDepts", group: "nhansu" },
  chucvu: { labelKey: "nav.items.hrPositions", group: "nhansu" },
  banhang: { labelKey: "nav.items.sales", group: "sales" },
  khachhang: { labelKey: "nav.items.customers", group: "sales" },
  muahang: { labelKey: "nav.items.purchasing", group: "purchasing" },
  nhacungcap: { labelKey: "nav.items.suppliers", group: "purchasing" },
  activitylog: { labelKey: "nav.items.activitylog", group: "system" },
  doitac: { labelKey: "nav.items.partners", group: "partners" },
  hoadondientu: { labelKey: "nav.items.hoadondientu", group: "dongtien" },
  phanquyen: { labelKey: "nav.items.phanquyen", group: "system" },
};

export const BREADCRUMBS: Record<string, Array<[string, string?]>> = {
  dashboard: [["breadcrumb.dashboard"]],
  dongtien: [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow"],
    ["breadcrumb.cashflowOverview"],
  ],
  tienmat: [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow", "dongtien"],
    ["breadcrumb.cash"],
  ],
  tiengui: [
    ["breadcrumb.accounting"],
    ["breadcrumb.cashflow", "dongtien"],
    ["breadcrumb.bank"],
  ],
  dinhkem: [
    ["breadcrumb.accounting"],
    ["breadcrumb.attachments"],
  ],
  hoadondientu: [
    ["breadcrumb.accounting"],
    ["breadcrumb.hoadondientu"],
  ],
  "thietlap-quy": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "thietlap-quy"],
    ["breadcrumb.catalogFunds"],
  ],
  "thietlap-nh": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "thietlap-quy"],
    ["breadcrumb.catalogBank"],
  ],
  "thietlap-tk": [
    ["breadcrumb.accounting"],
    ["breadcrumb.catalog", "thietlap-quy"],
    ["breadcrumb.catalogAccounts"],
  ],
  phaithu: [
    ["breadcrumb.accounting"],
    ["breadcrumb.debt"],
    ["breadcrumb.debtReceivable"],
  ],
  phaittra: [
    ["breadcrumb.accounting"],
    ["breadcrumb.debt"],
    ["breadcrumb.debtPayable"],
  ],
  socat: [
    ["breadcrumb.accounting"],
    ["breadcrumb.report"],
    ["breadcrumb.reportLedger"],
  ],
  nhatkyechung: [
    ["breadcrumb.accounting"],
    ["breadcrumb.report"],
    ["breadcrumb.reportJournal"],
  ],
  nhansu: [["breadcrumb.hr"], ["breadcrumb.hrStaff"]],
  phongban: [["breadcrumb.hr"], ["breadcrumb.hrDepts"]],
  chucvu: [["breadcrumb.hr"], ["breadcrumb.hrPositions"]],
  banhang: [["breadcrumb.sales"], ["breadcrumb.salesOrders"]],
  khachhang: [["breadcrumb.sales"], ["breadcrumb.customers"]],
  muahang: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  nhacungcap: [["breadcrumb.purchasing"], ["breadcrumb.suppliers"]],
  activitylog: [["breadcrumb.system"], ["breadcrumb.activitylog"]],
  doitac: [["breadcrumb.accounting"], ["breadcrumb.partners"]],
  phanquyen: [["breadcrumb.system"], ["breadcrumb.phanquyen"]],
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
        let newTabs = [...openTabs];
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
        let newTabs = [...openTabs];
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
