import { PageKey, TabInstance } from "@/shared/types";

export type AppTheme = "shell" | "classic" | "orcaq" | "midnight";

export enum AppThemeEnum {
  CLASSIC = "classic",
  SHELL = "shell",
  ORCAQ = "orcaq",
  MIDNIGHT = "midnight",
}

export interface AppState {
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
