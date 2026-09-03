import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PageKey, TabInstance } from "@/shared/types";
import { pageToPath } from "@/shared/utils/pageUrl";
import { updateUserPreferencesApi } from "@/core/api/appConfigApi";
import { AppState, AppTheme } from "./types";
import { applyDocumentTheme } from "./themeHelper";
import { STATIC_TABS, SECTION_ROOTS, DUPLICATABLE_PAGES } from "./constants";
import {
  getPathWithPreservedSearch,
  normalizeTabInstances,
} from "./tabHelpers";

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

      updateCurrentTabUrl: (instanceId, url) => {
        const { openTabs } = get();
        const idx = openTabs.findIndex((t) => t.instanceId === instanceId);
        if (idx === -1) return;
        const currentTab = openTabs[idx];
        if (currentTab.url === url) return;
        const newTabs = [...openTabs];
        newTabs[idx] = {
          ...currentTab,
          url,
        };
        set({ openTabs: newTabs });
      },

      navigate: (page, instanceIndex = 1) => {
        const { openTabs, currentInstanceId } = get();
        const instanceId = instanceIndex === 2 ? `${page}__2` : page;

        // 1. Lưu URL hiện tại của tab đang active trước khi chuyển đi
        const currentUrl =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : undefined;
        const newTabs = openTabs.map((t) => {
          if (t.instanceId === currentInstanceId && currentUrl) {
            return { ...t, url: currentUrl };
          }
          return t;
        });

        const existingTab = newTabs.find((t) => t.instanceId === instanceId);

        if (!existingTab) {
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

        // 2. Khôi phục URL: nếu tab mục tiêu đã có url lưu trước đó thì dùng lại url đó, ngược lại sinh basePath
        const targetSavedUrl = existingTab?.url;
        const defaultPath = pageToPath(
          page,
          undefined,
          instanceIndex === 2 ? { _i: "2" } : undefined,
        );
        let targetPath = targetSavedUrl || defaultPath;
        if (page === "erp-invoices" && !targetPath.includes("tab=")) {
          targetPath = pageToPath(
            "erp-invoices",
            "in",
            instanceIndex === 2 ? { _i: "2" } : undefined,
          );
        }
        const current =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : "";
        if (current !== targetPath && typeof window !== "undefined") {
          window.history.pushState(null, "", targetPath);
        }
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

        const currentUrl =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : undefined;

        const existingIdx = openTabs.findIndex(
          (t) => t.instanceId === instanceId,
        );
        const newTabs = [...openTabs];

        if (existingIdx === -1) {
          const newTab: TabInstance = {
            instanceId,
            pageKey: page,
            instanceIndex: targetIndex,
            url: currentUrl,
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
        } else if (currentUrl) {
          newTabs[existingIdx] = {
            ...newTabs[existingIdx],
            url: currentUrl,
          };
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
