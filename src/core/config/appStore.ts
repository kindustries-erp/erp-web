import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PageKey, TabInfo, SectionRoot, TabInstance } from "@/shared/types";
import { pageToPath } from "@/shared/utils/pageUrl";
import { updateUserPreferencesApi } from "@/core/api/appConfigApi";
import { useTableColumnStore } from "@/shared/hooks/useTableColumnState";
import { useErpInvoiceListStore } from "@/modules/erp-invoices-core/hooks/useErpInvoiceListStore";

export type AppTheme = "shell" | "classic" | "orcaq" | "midnight";

function applyDocumentTheme(appTheme: AppTheme) {
  document.documentElement.classList.toggle(
    "theme-classic",
    appTheme === "classic",
  );
  document.documentElement.classList.toggle(
    "theme-orcaq",
    appTheme === "orcaq",
  );
  document.documentElement.classList.toggle(
    "theme-midnight",
    appTheme === "midnight",
  );
}

export const STATIC_TABS: Partial<Record<PageKey, TabInfo>> = {
  dashboard: { labelKey: "nav.items.dashboard", closable: false },
};

export const SECTION_ROOTS: Partial<Record<PageKey, SectionRoot>> = {
  purchasing: { labelKey: "nav.items.purchasing", group: "purchasing" },
  "inventory-dashboard": {
    labelKey: "nav.items.inventoryDashboard",
    group: "inventory",
  },
  "erp-inventory-stock": {
    labelKey: "nav.items.erpInventoryStock",
    group: "inventory",
  },
  "erp-inventory-tracking": {
    labelKey: "nav.items.erpInventoryTracking",
    group: "inventory",
  },
  "erp-inventory-tracking-parts": {
    labelKey: "nav.items.erpInventoryTrackingParts",
    group: "inventory",
  },
  "erp-inventory-tracking-lot": {
    labelKey: "nav.items.erpInventoryTrackingLot",
    group: "inventory",
  },
  "erp-inventory-tracking-custom": {
    labelKey: "nav.items.erpInventoryTrackingCustom",
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
  "sales-report-dashboard": {
    labelKey: "nav.items.salesReportDashboard",
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
  "purchasing-report-dashboard": {
    labelKey: "nav.items.purchasingReportDashboard",
    group: "purchasing",
  },
  "journal-entry": {
    labelKey: "nav.items.reportJournal",
    group: "reports",
  },
  "settings-accounts": {
    labelKey: "nav.items.catalogAccounts",
    group: "accounting",
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
  attachments: {
    labelKey: "nav.items.attachments",
    group: "settings",
  },
  "invoice-dashboard": {
    labelKey: "nav.items.invoiceDashboard",
    group: "accounting",
  },
  "erp-invoices-draft": {
    labelKey: "Hóa đơn nháp",
    group: "accounting",
  },
  "erp-invoices-in": {
    labelKey: "nav.items.erpInvoicesIn",
    group: "accounting",
  },
  "erp-invoices-out": {
    labelKey: "nav.items.erpInvoicesOut",
    group: "accounting",
  },
  "vinfast-parts": {
    labelKey: "nav.items.vinfastParts",
    group: "vinfast",
  },
  "vinfast-invoice-settlement": {
    labelKey: "nav.items.vinfastSettlement",
    group: "vinfast",
  },
  "vinfast-parts-dashboard": {
    labelKey: "nav.items.vinfastPartsDashboard",
    group: "vinfast",
  },
  "vinfast-parts-oto-stock": {
    labelKey: "nav.items.vinfastPartsOtoStock",
    group: "vinfast",
  },
  "vinfast-parts-xemay-stock": {
    labelKey: "nav.items.vinfastPartsXemayStock",
    group: "vinfast",
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
  "email-inbox": { labelKey: "nav.items.emailInbox", group: "system" },
  "cashflow-dashboard": {
    labelKey: "nav.items.cashflowDashboard",
    group: "accounting",
  },
  "garage-dashboard": {
    labelKey: "breadcrumb.garageDashboard",
    group: "garage",
  },
  "garage-cases": {
    labelKey: "breadcrumb.garageCases",
    group: "garage",
  },
  "garage-receivables": {
    labelKey: "breadcrumb.garageReceivables",
    group: "garage",
  },
  "garage-payables": {
    labelKey: "breadcrumb.garagePayables",
    group: "garage",
  },
  "garage-customers": {
    labelKey: "breadcrumb.garageCustomers",
    group: "garage",
  },
  budget: {
    labelKey: "budget:pageTitle",
    group: "accounting",
  },
};

export const BREADCRUMBS: Partial<Record<PageKey, Array<[string, string?]>>> = {
  dashboard: [["breadcrumb.dashboard"]],
  budget: [["nav.items.accounting"], ["budget:pageTitle"]],

  purchasing: [["breadcrumb.purchasing"], ["breadcrumb.purchasingOrders"]],
  "inventory-dashboard": [
    ["breadcrumb.inventory"],
    ["nav.items.inventoryDashboard"],
  ],
  "erp-inventory-stock": [
    ["breadcrumb.inventory"],
    ["breadcrumb.inventoryStock"],
  ],
  "erp-inventory-tracking": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
    ["nav.items.erpInventoryTracking"],
  ],
  "erp-inventory-tracking-parts": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
    ["nav.items.erpInventoryTrackingParts"],
  ],
  "erp-inventory-tracking-lot": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
    ["nav.items.erpInventoryTrackingLot"],
  ],
  "erp-inventory-tracking-custom": [
    ["breadcrumb.inventory"],
    ["nav.items.erpInventoryTrackingGroup"],
    ["nav.items.erpInventoryTrackingCustom"],
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
  "sales-report-dashboard": [
    ["breadcrumb.sales"],
    ["breadcrumb.salesReportDashboard"],
  ],
  "erp-customers": [["breadcrumb.sales"], ["breadcrumb.customers"]],
  "after-sales": [["nav.items.sales"], ["nav.items.afterSales"]],
  "erp-suppliers": [["breadcrumb.purchasing"], ["breadcrumb.suppliers"]],
  "purchasing-report-dashboard": [
    ["breadcrumb.purchasing"],
    ["breadcrumb.purchasingReportDashboard"],
  ],
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
  "erp-activity-logs": [
    ["breadcrumb.settings"],
    ["nav.items.accessControl"],
    ["breadcrumb.activitylog"],
  ],
  "erp-employees": [["breadcrumb.hr"], ["breadcrumb.erpEmployees"]],
  "erp-users": [["breadcrumb.settings"], ["breadcrumb.users"]],
  "erp-permissions-core": [["breadcrumb.settings"], ["breadcrumb.phanquyen"]],
  attachments: [["breadcrumb.settings"], ["nav.items.attachments"]],
  "invoice-dashboard": [["breadcrumb.accounting"], ["Tổng quan hóa đơn"]],
  "erp-invoices-in": [["breadcrumb.accounting"], ["breadcrumb.inbound"]],
  "erp-invoices-out": [["breadcrumb.accounting"], ["breadcrumb.outbound"]],
  "erp-invoices-draft": [["breadcrumb.accounting"], ["Hóa đơn nháp"]],
  "vinfast-parts": [["breadcrumb.vinfast"], ["nav.items.vinfastParts"]],
  "vinfast-parts-dashboard": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsDashboard"],
  ],
  "vinfast-parts-oto-stock": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsOtoStock"],
  ],
  "vinfast-parts-xemay-stock": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastPartsGroup"],
    ["nav.items.vinfastPartsXemayStock"],
  ],
  "vinfast-invoice-settlement": [
    ["breadcrumb.vinfast"],
    ["nav.items.vinfastWorkshopGroup"],
    ["nav.items.vinfastSettlement"],
  ],
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
  "email-inbox": [["nav.items.system"], ["nav.items.emailInbox"]],
  "cashflow-dashboard": [
    ["breadcrumb.accounting"],
    ["nav.items.cashflow"],
    ["nav.items.dashboard"],
  ],
  "settings-branch": [["breadcrumb.settings"], ["thietlap.tabs.chi-nhanh"]],
  "settings-bank": [["breadcrumb.settings"], ["thietlap.tabs.ngan-hang"]],
  "garage-dashboard": [["breadcrumb.garage"], ["breadcrumb.garageDashboard"]],
  "garage-cases": [["breadcrumb.garage"], ["breadcrumb.garageCases"]],
  "garage-customers": [["breadcrumb.garage"], ["breadcrumb.garageCustomers"]],
  "garage-receivables": [
    ["breadcrumb.garage"],
    ["breadcrumb.garagePartnersGroup", "garage-receivables"],
    ["breadcrumb.garageReceivables"],
  ],
  "garage-payables": [
    ["breadcrumb.garage"],
    ["breadcrumb.garagePartnersGroup", "garage-payables"],
    ["breadcrumb.garagePayables"],
  ],
};

export const DUPLICATABLE_PAGES = new Set<PageKey>([
  "erp-invoices-in",
  "erp-invoices-out",
]);

interface AppState {
  currentPage: PageKey;
  currentInstanceId: string;
  openTabs: TabInstance[];
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  appTheme: AppTheme;
  locale: "vi" | "en";
  isLoggedIn: boolean;
  forbidden: boolean;
  companyProfileOpen: boolean;
  customFieldsDrawerOpen: boolean;
  customFieldsDrawerMode: "unified" | "single";
  customFieldsDrawerModule: string | null;
  customFieldsDrawerLabel?: string;
  customFieldsDrawerInitialTab?: string;
  currentBranchId: string | null;
  customBreadcrumbs: Array<[string, string?]> | null;
  setForbidden: (value: boolean) => void;
  setCurrentBranchId: (id: string | null) => void;
  navigate: (page: PageKey, instanceIndex?: 1 | 2) => void;
  duplicateTab: (page: PageKey) => void;
  syncFromUrl: (page: PageKey, tab?: string, instanceIndex?: 1 | 2) => void;
  closeTab: (idOrKey: string) => void;
  closeOtherTabs: (idOrKey: string) => void;
  closeAllTabs: () => void;
  closeTabsToRight: (idOrKey: string) => void;
  reorderTabs: (sourceId: string, targetId: string) => void;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCompanyProfileOpen: (open: boolean) => void;
  openCustomFieldsDrawer: (
    moduleKeyOrAll: string,
    moduleLabelOrInitialTab?: string,
  ) => void;
  closeCustomFieldsDrawer: () => void;
  toggleAppTheme: () => void;
  setAppTheme: (theme: AppTheme) => void;
  toggleLocale: () => void;
  setLocale: (locale: "vi" | "en") => void;
  login: () => void;
  logout: () => void;
  setCustomBreadcrumbs: (crumbs: Array<[string, string?]> | null) => void;
  preloadTab: (page: PageKey) => void;
}

function getPathWithPreservedSearch(
  pageKey: PageKey,
  instanceIndex: 1 | 2,
): string {
  const currentSearch = new URLSearchParams(window.location.search);
  if (instanceIndex === 1) {
    currentSearch.delete("_i");
  } else if (instanceIndex === 2) {
    currentSearch.set("_i", "2");
  }
  const searchStr = currentSearch.toString();
  const basePath = pageToPath(pageKey);
  return `${basePath}${searchStr ? `?${searchStr}` : ""}`;
}

function normalizeTabInstances(
  tabs: TabInstance[],
  currentInstanceId: string,
): { normalizedTabs: TabInstance[]; nextCurrentId: string } {
  let nextCurrentId = currentInstanceId;
  const normalizedTabs = tabs.map((tab) => {
    if (tab.instanceIndex === 2) {
      const hasInstance1 = tabs.some(
        (t) => t.pageKey === tab.pageKey && t.instanceIndex === 1,
      );
      if (!hasInstance1) {
        if (nextCurrentId === tab.instanceId) {
          nextCurrentId = tab.pageKey;
        }
        // Migrate table column states & invoice states if any
        try {
          useTableColumnStore
            .getState()
            .migrateTableState(`${tab.pageKey}__2`, tab.pageKey);
          useTableColumnStore
            .getState()
            .migrateTableState(
              `erp-invoices-table-IN_2`,
              `erp-invoices-table-IN`,
            );
          useTableColumnStore
            .getState()
            .migrateTableState(
              `erp-invoices-table-OUT_2`,
              `erp-invoices-table-OUT`,
            );
          useErpInvoiceListStore.getState().migrateState("IN_2", "IN");
          useErpInvoiceListStore.getState().migrateState("OUT_2", "OUT");
        } catch {
          // ignore
        }
        return {
          ...tab,
          instanceId: tab.pageKey,
          instanceIndex: 1 as const,
        };
      }
    }
    return tab;
  });
  return { normalizedTabs, nextCurrentId };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentPage: "dashboard",
      currentInstanceId: "dashboard",
      openTabs: [
        {
          instanceId: "dashboard",
          pageKey: "dashboard",
          instanceIndex: 1,
        },
      ],
      forbidden: false,
      sidebarCollapsed: false,
      mobileSidebarOpen: false,
      appTheme: "classic",
      locale: "vi",
      isLoggedIn: false,
      companyProfileOpen: false,
      customFieldsDrawerOpen: false,
      customFieldsDrawerMode: "single",
      customFieldsDrawerModule: null,
      customFieldsDrawerLabel: undefined,
      customFieldsDrawerInitialTab: undefined,
      currentBranchId: null,
      customBreadcrumbs: null,

      setForbidden: (value) => set({ forbidden: value }),
      setCurrentBranchId: (id) => set({ currentBranchId: id }),
      setCustomBreadcrumbs: (crumbs) => set({ customBreadcrumbs: crumbs }),

      navigate: (page, instanceIndex = 1) => {
        const { openTabs } = get();
        const instanceId = instanceIndex === 2 ? `${page}__2` : page;
        const existingIdx = openTabs.findIndex(
          (t) => t.instanceId === instanceId,
        );
        const newTabs = [...openTabs];

        if (existingIdx === -1) {
          const newTab: TabInstance = {
            instanceId,
            pageKey: page,
            instanceIndex,
          };
          const group = SECTION_ROOTS[page]?.group;
          if (group) {
            let lastIdx = -1;
            newTabs.forEach((t, i) => {
              if (SECTION_ROOTS[t.pageKey]?.group === group) lastIdx = i;
            });
            if (lastIdx >= 0) newTabs.splice(lastIdx + 1, 0, newTab);
            else newTabs.push(newTab);
          } else {
            newTabs.push(newTab);
          }
        }

        set({
          currentPage: page,
          currentInstanceId: instanceId,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
          customBreadcrumbs: null,
        });

        const path = pageToPath(
          page,
          undefined,
          instanceIndex === 2 ? { _i: "2" } : undefined,
        );
        const current = window.location.pathname + window.location.search;
        if (current !== path) history.pushState(null, "", path);
      },

      duplicateTab: (page) => {
        if (!DUPLICATABLE_PAGES.has(page)) return;
        const { openTabs } = get();
        const instances = openTabs.filter((t) => t.pageKey === page);
        if (instances.length >= 2) return;

        const instanceId = `${page}__2`;
        const instance1Idx = openTabs.findIndex(
          (t) => t.pageKey === page && t.instanceIndex === 1,
        );
        const newTab: TabInstance = {
          instanceId,
          pageKey: page,
          instanceIndex: 2,
        };

        const newTabs = [...openTabs];
        if (instance1Idx >= 0) {
          newTabs.splice(instance1Idx + 1, 0, newTab);
        } else {
          newTabs.push(newTab);
        }

        set({
          currentPage: page,
          currentInstanceId: instanceId,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
          customBreadcrumbs: null,
        });

        const path = pageToPath(page, undefined, { _i: "2" });
        const current = window.location.pathname + window.location.search;
        if (current !== path) history.pushState(null, "", path);
      },

      syncFromUrl: (page, tab, instanceIndex = 1) => {
        const { openTabs } = get();
        let targetIndex: 1 | 2 = instanceIndex;
        let instanceId = targetIndex === 2 ? `${page}__2` : page;

        // If URL has _i=2, but page is not duplicatable, demote to instance 1
        if (targetIndex === 2 && !DUPLICATABLE_PAGES.has(page)) {
          targetIndex = 1;
          instanceId = page;
        }

        // If reload happened directly on _i=2 without instance 1 existing
        const instance1Exists = openTabs.some(
          (t) => t.pageKey === page && t.instanceIndex === 1,
        );
        if (targetIndex === 2 && !instance1Exists && openTabs.length <= 1) {
          // Demote instance 2 to instance 1 and clean URL
          targetIndex = 1;
          instanceId = page;
          const searchParams = new URLSearchParams(window.location.search);
          searchParams.delete("_i");
          const cleanQuery = searchParams.toString();
          const cleanUrl = pageToPath(
            page,
            tab,
            cleanQuery ? Object.fromEntries(searchParams.entries()) : undefined,
          );
          window.history.replaceState(null, "", cleanUrl);
        }

        const existingIdx = openTabs.findIndex(
          (t) => t.instanceId === instanceId,
        );
        const newTabs = [...openTabs];

        if (existingIdx === -1) {
          const newTab: TabInstance = {
            instanceId,
            pageKey: page,
            instanceIndex: targetIndex,
          };
          const group = SECTION_ROOTS[page]?.group;
          if (group) {
            let lastIdx = -1;
            newTabs.forEach((t, i) => {
              if (SECTION_ROOTS[t.pageKey]?.group === group) lastIdx = i;
            });
            if (lastIdx >= 0) newTabs.splice(lastIdx + 1, 0, newTab);
            else newTabs.push(newTab);
          } else {
            newTabs.push(newTab);
          }
        }

        set({
          currentPage: page,
          currentInstanceId: instanceId,
          openTabs: newTabs,
          forbidden: false,
          mobileSidebarOpen: false,
        });
      },

      preloadTab: (page) => {
        const { openTabs } = get();
        if (openTabs.some((t) => t.pageKey === page)) return;
        const newTabs = [...openTabs];
        const newTab: TabInstance = {
          instanceId: page,
          pageKey: page,
          instanceIndex: 1,
        };
        const group = SECTION_ROOTS[page]?.group;
        if (group) {
          let lastIdx = -1;
          newTabs.forEach((t, i) => {
            if (SECTION_ROOTS[t.pageKey]?.group === group) lastIdx = i;
          });
          if (lastIdx >= 0) newTabs.splice(lastIdx + 1, 0, newTab);
          else newTabs.push(newTab);
        } else {
          newTabs.push(newTab);
        }
        set({ openTabs: newTabs });
      },

      closeTab: (idOrKey) => {
        const { openTabs, currentInstanceId } = get();
        let idx = openTabs.findIndex((t) => t.instanceId === idOrKey);
        if (idx === -1) {
          idx = openTabs.findIndex((t) => t.pageKey === idOrKey);
        }
        if (idx === -1) return;
        const targetTab = openTabs[idx];
        if (STATIC_TABS[targetTab.pageKey]) return;

        const rawNewTabs = openTabs.filter((_, i) => i !== idx);
        const { normalizedTabs, nextCurrentId } = normalizeTabInstances(
          rawNewTabs,
          currentInstanceId,
        );

        if (currentInstanceId === targetTab.instanceId) {
          const nextTab = normalizedTabs[
            Math.min(idx, normalizedTabs.length - 1)
          ] ?? {
            instanceId: "dashboard",
            pageKey: "dashboard" as PageKey,
            instanceIndex: 1 as const,
          };
          const path = getPathWithPreservedSearch(
            nextTab.pageKey,
            nextTab.instanceIndex,
          );
          const current = window.location.pathname + window.location.search;
          if (current !== path) history.pushState(null, "", path);
          set({
            currentPage: nextTab.pageKey,
            currentInstanceId: nextTab.instanceId,
            openTabs: normalizedTabs,
            customBreadcrumbs: null,
          });
        } else {
          // If closing another tab, ensure current tab URL is preserved or demoted
          const currentTab = normalizedTabs.find(
            (t) => t.instanceId === nextCurrentId,
          );
          if (currentTab) {
            const path = getPathWithPreservedSearch(
              currentTab.pageKey,
              currentTab.instanceIndex,
            );
            const current = window.location.pathname + window.location.search;
            if (current !== path) history.replaceState(null, "", path);
            set({
              currentPage: currentTab.pageKey,
              currentInstanceId: currentTab.instanceId,
              openTabs: normalizedTabs,
            });
          } else {
            set({ openTabs: normalizedTabs });
          }
        }
      },

      closeOtherTabs: (idOrKey) => {
        const { openTabs, currentInstanceId, navigate } = get();
        let targetId = idOrKey;
        const exists = openTabs.some((t) => t.instanceId === targetId);
        if (!exists) {
          const byPage = openTabs.find((t) => t.pageKey === idOrKey);
          if (byPage) targetId = byPage.instanceId;
        }
        const rawKeepTabs = openTabs.filter(
          (t) => t.instanceId === targetId || STATIC_TABS[t.pageKey],
        );
        const { normalizedTabs, nextCurrentId } = normalizeTabInstances(
          rawKeepTabs,
          currentInstanceId,
        );

        const isCurrentKept = normalizedTabs.some(
          (t) => t.instanceId === nextCurrentId,
        );
        if (!isCurrentKept) {
          const targetTab =
            normalizedTabs.find((t) => t.instanceId === targetId) ??
            normalizedTabs[normalizedTabs.length - 1];
          if (targetTab) {
            navigate(targetTab.pageKey, targetTab.instanceIndex);
          }
        } else {
          const currentTab = normalizedTabs.find(
            (t) => t.instanceId === nextCurrentId,
          );
          if (currentTab) {
            const path = getPathWithPreservedSearch(
              currentTab.pageKey,
              currentTab.instanceIndex,
            );
            const current = window.location.pathname + window.location.search;
            if (current !== path) history.replaceState(null, "", path);
            set({
              currentPage: currentTab.pageKey,
              currentInstanceId: currentTab.instanceId,
              openTabs: normalizedTabs,
            });
          } else {
            set({ openTabs: normalizedTabs });
          }
        }
      },

      closeAllTabs: () => {
        const { openTabs, currentInstanceId, navigate } = get();
        const newTabs = openTabs.filter((t) => STATIC_TABS[t.pageKey]);
        const isCurrentKept = newTabs.some(
          (t) => t.instanceId === currentInstanceId,
        );
        if (!isCurrentKept) {
          const fallback = newTabs[newTabs.length - 1]?.pageKey ?? "dashboard";
          navigate(fallback);
        } else {
          set({ openTabs: newTabs });
        }
      },

      closeTabsToRight: (idOrKey) => {
        const { openTabs, currentInstanceId, navigate } = get();
        let index = openTabs.findIndex((t) => t.instanceId === idOrKey);
        if (index < 0) {
          index = openTabs.findIndex((t) => t.pageKey === idOrKey);
        }
        if (index < 0) return;
        const rawKeepTabs = openTabs.filter((tab, tabIndex) => {
          if (tabIndex <= index) return true;
          return Boolean(STATIC_TABS[tab.pageKey]);
        });
        const { normalizedTabs, nextCurrentId } = normalizeTabInstances(
          rawKeepTabs,
          currentInstanceId,
        );

        const isCurrentKept = normalizedTabs.some(
          (t) => t.instanceId === nextCurrentId,
        );
        if (!isCurrentKept) {
          const fallbackTab = normalizedTabs[normalizedTabs.length - 1];
          navigate(
            fallbackTab?.pageKey ?? "dashboard",
            fallbackTab?.instanceIndex ?? 1,
          );
        } else {
          const currentTab = normalizedTabs.find(
            (t) => t.instanceId === nextCurrentId,
          );
          if (currentTab) {
            const path = getPathWithPreservedSearch(
              currentTab.pageKey,
              currentTab.instanceIndex,
            );
            const current = window.location.pathname + window.location.search;
            if (current !== path) history.replaceState(null, "", path);
            set({
              currentPage: currentTab.pageKey,
              currentInstanceId: currentTab.instanceId,
              openTabs: normalizedTabs,
            });
          } else {
            set({ openTabs: normalizedTabs });
          }
        }
      },

      reorderTabs: (sourceId, targetId) => {
        if (sourceId === targetId) return;
        const { openTabs } = get();
        const sourceIndex = openTabs.findIndex(
          (t) => t.instanceId === sourceId || t.pageKey === sourceId,
        );
        const targetIndex = openTabs.findIndex(
          (t) => t.instanceId === targetId || t.pageKey === targetId,
        );
        if (sourceIndex < 0 || targetIndex < 0) return;
        if (
          STATIC_TABS[openTabs[sourceIndex].pageKey] ||
          STATIC_TABS[openTabs[targetIndex].pageKey]
        )
          return;

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
      openCustomFieldsDrawer: (moduleKeyOrAll, moduleLabelOrInitialTab) => {
        if (moduleKeyOrAll === "ALL" || !moduleKeyOrAll) {
          set({
            customFieldsDrawerOpen: true,
            customFieldsDrawerMode: "unified",
            customFieldsDrawerModule: null,
            customFieldsDrawerInitialTab: moduleLabelOrInitialTab || "INVOICE",
            customFieldsDrawerLabel: undefined,
          });
        } else {
          set({
            customFieldsDrawerOpen: true,
            customFieldsDrawerMode: "single",
            customFieldsDrawerModule: moduleKeyOrAll,
            customFieldsDrawerLabel: moduleLabelOrInitialTab,
            customFieldsDrawerInitialTab: undefined,
          });
        }
      },
      closeCustomFieldsDrawer: () =>
        set({
          customFieldsDrawerOpen: false,
          customFieldsDrawerModule: null,
          customFieldsDrawerLabel: undefined,
          customFieldsDrawerInitialTab: undefined,
        }),

      toggleAppTheme: () => {
        const order: AppTheme[] = ["classic", "shell", "orcaq", "midnight"];
        const idx = order.indexOf(get().appTheme);
        const appTheme = order[(idx + 1) % order.length];
        set({ appTheme });
        applyDocumentTheme(appTheme);
        if (get().isLoggedIn) {
          updateUserPreferencesApi({ theme: appTheme }).catch(() => {});
        }
      },
      setAppTheme: (theme) => {
        set({ appTheme: theme });
        applyDocumentTheme(theme);
        if (get().isLoggedIn) {
          updateUserPreferencesApi({ theme }).catch(() => {});
        }
      },

      toggleLocale: () => {
        const newLocale = get().locale === "vi" ? "en" : "vi";
        set({ locale: newLocale });
        if (get().isLoggedIn) {
          updateUserPreferencesApi({ language: newLocale }).catch(() => {});
        }
      },
      setLocale: (locale) => {
        set({ locale });
        if (get().isLoggedIn) {
          updateUserPreferencesApi({ language: locale }).catch(() => {});
        }
      },

      login: () => set({ isLoggedIn: true }),
      logout: () =>
        set({
          isLoggedIn: false,
          currentPage: "dashboard",
          currentInstanceId: "dashboard",
          openTabs: [
            {
              instanceId: "dashboard",
              pageKey: "dashboard",
              instanceIndex: 1,
            },
          ],
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
