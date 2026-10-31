import * as React from "react";
import { Shapes } from "lucide-react";
import {
  type V2SidebarNavItem,
  type V2SidebarSectionData,
} from "@/v2/shared/components";
import { useV2PermissionChecker } from "@/v2/shared/hooks/useV2HasPermission";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { useV2ToastStore } from "@/v2/shared/stores/useV2ToastStore";
import {
  useV2MobileNavStore,
  MAX_PINNED_MOBILE_NAV,
} from "@/v2/shared/stores/useV2MobileNavStore";
import { filterV2NavSections, getV2NavigationSections } from "../navigation";
import {
  extractAllAvailableItems,
  filterSectionsByQuery,
  resolveDefault4Items,
  resolveBottomActiveId,
} from "./useV2MobileNav.helper";

export interface UseV2MobileNavOptions {
  activeNavId?: string;
  sections?: V2SidebarSectionData[];
  navItems?: V2SidebarNavItem[];
  onNavigate?: (item: V2SidebarNavItem) => void;
}

export function useV2MobileNav({
  activeNavId = "dashboard",
  sections,
  navItems,
  onNavigate,
}: UseV2MobileNavOptions = {}) {
  const { t, locale } = useV2Translation();
  const can = useV2PermissionChecker();

  const [catalogOpen, setCatalogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isCustomizing, setIsCustomizing] = React.useState(false);
  const [limitWarning, setLimitWarning] = React.useState<string | null>(null);

  const { pinnedIds, setPinnedIds, resetToDefault } = useV2MobileNavStore();

  const effectiveSections = React.useMemo(() => {
    if (sections && sections.length > 0) return sections;
    return filterV2NavSections(getV2NavigationSections(t), can);
  }, [sections, t, locale, can]);

  const allAvailableItems = React.useMemo(
    () => extractAllAvailableItems(effectiveSections),
    [effectiveSections],
  );

  const filteredSections = React.useMemo(
    () => filterSectionsByQuery(effectiveSections, searchQuery),
    [effectiveSections, searchQuery],
  );

  const default4Items = React.useMemo(
    () => resolveDefault4Items(allAvailableItems),
    [allAvailableItems],
  );

  const currentSelectedIds = React.useMemo(() => {
    if (pinnedIds && pinnedIds.length > 0) {
      const hasCoreFeature = pinnedIds.some(
        (id) => !id.includes("dashboard") && !id.includes("report"),
      );
      if (hasCoreFeature) {
        return pinnedIds.slice(0, MAX_PINNED_MOBILE_NAV);
      }
    }
    return default4Items.map((it) => it.id);
  }, [pinnedIds, default4Items]);

  const allMenuItem: V2SidebarNavItem = React.useMemo(
    () => ({
      id: "catalog",
      label: t("v2.nav.items.allModules", "Tất cả"),
      icon: Shapes,
      href: "#catalog",
    }),
    [t],
  );

  const quick4Items = React.useMemo(() => {
    return currentSelectedIds
      .map((id) => allAvailableItems.find((it) => it.id === id))
      .filter(Boolean) as V2SidebarNavItem[];
  }, [currentSelectedIds, allAvailableItems]);

  const effectiveNavItems = React.useMemo(() => {
    if (navItems) return navItems;
    return [...quick4Items, allMenuItem];
  }, [navItems, quick4Items, allMenuItem]);

  const handleMobileNavigate = (item: V2SidebarNavItem) => {
    if (item.id === "catalog") {
      setCatalogOpen(true);
      return;
    }
    onNavigate?.(item);
  };

  const handleToggleItem = (itemId: string) => {
    if (currentSelectedIds.includes(itemId)) {
      setPinnedIds(currentSelectedIds.filter((id) => id !== itemId));
      setLimitWarning(null);
    } else {
      if (currentSelectedIds.length >= MAX_PINNED_MOBILE_NAV) {
        const warningMsg = t(
          "v2.nav.maxShortcutsDesc",
          "Đã chọn đủ 4/4 mục lối tắt. Vui lòng bỏ chọn bớt một mục trước khi chọn mục mới.",
        );
        setLimitWarning(warningMsg);
        useV2ToastStore.getState().showToast({
          title: t("v2.nav.maxShortcutsTitle", "Đã đạt giới hạn lối tắt"),
          description: warningMsg,
          variant: "destructive",
        });
        return;
      }
      setPinnedIds([...currentSelectedIds, itemId]);
      setLimitWarning(null);
    }
  };

  const closeCatalog = () => {
    setCatalogOpen(false);
    setIsCustomizing(false);
    setLimitWarning(null);
    setSearchQuery("");
  };

  const bottomActiveId = React.useMemo(
    () =>
      resolveBottomActiveId(effectiveNavItems, activeNavId, effectiveSections),
    [effectiveNavItems, activeNavId, effectiveSections],
  );

  return {
    t,
    locale,
    catalogOpen,
    setCatalogOpen,
    closeCatalog,
    searchQuery,
    setSearchQuery,
    isCustomizing,
    setIsCustomizing,
    limitWarning,
    setLimitWarning,
    pinnedIds,
    setPinnedIds,
    resetToDefault,
    effectiveSections,
    allAvailableItems,
    filteredSections,
    default4Items,
    currentSelectedIds,
    quick4Items,
    allMenuItem,
    effectiveNavItems,
    bottomActiveId,
    handleMobileNavigate,
    handleToggleItem,
  };
}
