import * as React from "react";
import { LayoutGrid } from "lucide-react";
import {
  V2BottomSheet,
  V2Text,
  V2Badge,
  V2BadgeVariant,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2MobileAppearanceSettings } from "../v2-mobile-appearance-settings";
import { V2MobileNavCustomizeBar } from "../v2-mobile-nav-customize-bar";
import { V2MobileCatalogSectionList } from "../v2-mobile-catalog-section-list";
import type { V2MobileCatalogDrawerProps } from "./V2MobileCatalogDrawer.type";

export const V2MobileCatalogDrawer: React.FC<V2MobileCatalogDrawerProps> = ({
  open,
  onOpenChange,
  totalModulesCount,
  filteredSectionsCount,
  searchQuery,
  onSearchChange,
  currentTheme,
  onThemeChange,
  isCustomizing,
  limitWarning,
  currentCount,
  maxCount,
  onStartCustomize,
  onFinishCustomize,
  onResetDefault,
  sections,
  selectedIds,
  activeNavId,
  onItemClick,
}) => {
  const { t } = useV2Translation();

  return (
    <V2BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={
        <div className="flex items-center gap-2">
          <V2Text as="h2" variant="h4" className="text-foreground truncate">
            {t("v2.nav.items.catalogTitle", "Danh mục phân hệ")}
          </V2Text>
          <V2Badge
            variant={V2BadgeVariant.SECONDARY}
            className="px-1.5 py-0.5 text-[10px] font-medium shrink-0"
          >
            {searchQuery
              ? `${filteredSectionsCount}`
              : t("v2.nav.modulesCountBadge", {
                  defaultValue: `${totalModulesCount} phân hệ`,
                  count: totalModulesCount,
                })}
          </V2Badge>
        </div>
      }
      subtitle={t(
        "v2.nav.items.catalogSubtitle",
        "Toàn bộ chức năng và nghiệp vụ ERP",
      )}
      icon={LayoutGrid}
      maxHeightClass="max-h-[88vh]"
    >
      <div className="space-y-4 pb-6">
        {/* Quick theme & language settings */}
        {!searchQuery && (
          <V2MobileAppearanceSettings
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        )}

        {/* Quick actions customization bar */}
        {!searchQuery && (
          <V2MobileNavCustomizeBar
            currentCount={currentCount}
            maxCount={maxCount}
            isCustomizing={isCustomizing}
            limitWarning={limitWarning}
            onStartCustomize={onStartCustomize}
            onFinishCustomize={onFinishCustomize}
            onResetDefault={onResetDefault}
          />
        )}

        {/* Catalog search and section grid */}
        <V2MobileCatalogSectionList
          sections={sections}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isCustomizing={isCustomizing}
          selectedIds={selectedIds}
          activeNavId={activeNavId}
          onItemClick={onItemClick}
        />
      </div>
    </V2BottomSheet>
  );
};

V2MobileCatalogDrawer.displayName = "V2MobileCatalogDrawer";
