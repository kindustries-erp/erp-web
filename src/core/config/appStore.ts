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
  dashboard: { label: "Bảng điều khiển", closable: false },
};

export const SECTION_ROOTS: Record<string, SectionRoot> = {
  dongtien: { label: "Tổng hợp dòng tiền", group: "dongtien" },
  tienmat: { label: "Tiền mặt", group: "dongtien" },
  tiengui: { label: "UNT / UNC", group: "dongtien" },
  dinhkem: { label: "Tài liệu đính kèm", group: "dongtien" },
  thietlap: { label: "Thiết lập danh mục", group: "thietlap" },
  phaithu: { label: "Phải thu", group: "congno" },
  phaittra: { label: "Phải trả", group: "congno" },
  socat: { label: "Sổ cái", group: "baocao" },
  nhatkyechung: { label: "Nhật ký chung", group: "baocao" },
  nhansu: { label: "Nhân viên", group: "nhansu" },
  phongban: { label: "Phòng ban", group: "nhansu" },
  chucvu: { label: "Chức danh", group: "nhansu" },
  banhang: { label: "Bán hàng", group: "sales" },
  khachhang: { label: "Khách hàng", group: "sales" },
  muahang: { label: "Mua hàng", group: "purchasing" },
  nhacungcap: { label: "Nhà cung cấp", group: "purchasing" },
  activitylog: { label: "Nhật ký hoạt động", group: "system" },
  doitac: { label: "Đối tác", group: "partners" },
  phanquyen: { label: "Phân quyền & Vai trò", group: "system" },
};

export const BREADCRUMBS: Record<string, Array<[string, string?]>> = {
  dashboard: [["breadcrumb.accounting"], ["breadcrumb.dashboard"]],
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
    ["breadcrumb.cashflow", "dongtien"],
    ["breadcrumb.attachments"],
  ],
  thietlap: [["breadcrumb.accounting"], ["breadcrumb.catalog"]],
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
  settingsActiveTab: string;
  isLoggedIn: boolean;
  forbidden: boolean;
  setForbidden: (value: boolean) => void;
  navigate: (page: PageKey, settingsTab?: string) => void;
  syncFromUrl: (page: PageKey, settingsTab?: string) => void;
  closeTab: (key: PageKey) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleAppTheme: () => void;
  toggleLocale: () => void;
  setSettingsTab: (tab: string) => void;
  login: () => void;
  logout: () => void;
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
      settingsActiveTab: "quy",
      isLoggedIn: false,

      setForbidden: (value) => set({ forbidden: value }),

      navigate: (page, settingsTab) => {
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
        const nextState = {
          currentPage: page,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
          ...(settingsTab ? { settingsActiveTab: settingsTab } : {}),
        };
        set(nextState);
        // Sync URL
        const path = pageToPath(page, settingsTab);
        const current = window.location.pathname + window.location.search;
        if (current !== path) {
          history.pushState(null, "", path);
        }
      },

      syncFromUrl: (page, settingsTab) => {
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
          ...(settingsTab ? { settingsActiveTab: settingsTab } : {}),
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
      setSettingsTab: (tab) => set({ settingsActiveTab: tab }),
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
