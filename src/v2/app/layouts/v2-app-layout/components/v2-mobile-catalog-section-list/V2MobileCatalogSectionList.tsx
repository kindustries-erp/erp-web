import * as React from "react";
import { Search, X, Check } from "lucide-react";
import { V2Input, V2Button, V2Text, V2Icon } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { cn } from "@/v2/shared/utils/cn";
import type { V2MobileCatalogSectionListProps } from "./V2MobileCatalogSectionList.type";

export const V2MobileCatalogSectionList: React.FC<
  V2MobileCatalogSectionListProps
> = ({
  sections,
  searchQuery,
  onSearchChange,
  isCustomizing,
  selectedIds,
  activeNavId,
  onItemClick,
}) => {
  const { t } = useV2Translation();

  return (
    <div className="space-y-4">
      {/* Search Bar using Shared V2Input & V2Button */}
      <div className="relative">
        <V2Input
          data-testid="mobile-catalog-search-input"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("v2.nav.searchPlaceholder", "Tìm nhanh phân hệ...")}
          leftIcon={
            <V2Icon icon={Search} size={14} className="text-muted-fg" />
          }
          size="sm"
          className="h-8 pl-8 pr-8 rounded-lg bg-muted/50 border border-border/80 text-xs"
        />
        {searchQuery && (
          <V2Button
            type="button"
            variant="ghost"
            size="xs"
            data-testid="mobile-catalog-clear-search"
            onClick={() => onSearchChange("")}
            aria-label={t("v2.nav.clearSearch", "Xóa tìm kiếm")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 h-6 w-6 rounded text-muted-fg hover:text-foreground"
          >
            <V2Icon icon={X} size={14} />
          </V2Button>
        )}
      </div>

      {/* Empty Search State */}
      {searchQuery && sections.length === 0 && (
        <div
          data-testid="mobile-catalog-empty"
          className="py-8 text-center flex flex-col items-center justify-center space-y-2"
        >
          <V2Text variant="body-sm" color="muted">
            {t("v2.nav.noSearchResults", "Không tìm thấy phân hệ phù hợp")}
          </V2Text>
          <V2Button
            size="xs"
            variant="ghost"
            className="text-xs"
            onClick={() => onSearchChange("")}
          >
            {t("v2.nav.clearSearch", "Xóa tìm kiếm")}
          </V2Button>
        </div>
      )}

      {/* Sections List */}
      {sections.map((section) => (
        <section key={section.id} className="space-y-2.5">
          <V2Text
            variant="section-title"
            color="muted"
            className="text-xs font-semibold tracking-wider uppercase"
          >
            {section.label}
          </V2Text>
          <div className="grid grid-cols-2 gap-2">
            {section.items.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const isActive = activeNavId === item.id;
              const Icon = item.icon;

              return (
                <V2Button
                  key={item.id}
                  variant={
                    isCustomizing
                      ? isSelected
                        ? "secondary"
                        : "outline"
                      : isActive
                        ? "secondary"
                        : "outline"
                  }
                  className={cn(
                    "h-auto justify-between gap-2 py-2.5 px-3 text-left transition-all",
                    isCustomizing &&
                      isSelected &&
                      "border-primary bg-primary/10 text-primary font-medium",
                    !isCustomizing &&
                      isActive &&
                      "border-primary/50 text-primary font-medium",
                  )}
                  onClick={() => onItemClick(item)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-muted-fg" />
                    <V2Text
                      as="span"
                      variant="caption"
                      weight="medium"
                      truncate
                      className="text-xs text-inherit"
                    >
                      {item.label}
                    </V2Text>
                  </div>
                  {isCustomizing && isSelected && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                </V2Button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

V2MobileCatalogSectionList.displayName = "V2MobileCatalogSectionList";
