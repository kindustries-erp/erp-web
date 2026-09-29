import React from "react";
import { Layers } from "lucide-react";
import { DrawerField, DrawerSection } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import {
  resolveCategoryName,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { AttributeTreeList } from "./AttributeTreeList";
import type { AttributeTreeNode } from "../../domains/types";

export interface CategoryAttributesSectionProps {
  isEditable: boolean;
  effectiveCategoryId: string | null;
  selectedCategory: any;
  categoryOptions: ComboboxOption[];
  categoryTrees: AttributeTreeNode[];
  effectiveAttributes: Record<string, any>;
  effectiveGlobalAttributes: Record<string, any>;
  activeCategoryAttributeDefs: ModuleAttributeDef[];
  moduleKey: string;
  handleCategorySelect: (newCatId: string | null) => void;
  handleCategoryAttributeChange: (attrDefId: string, value: any) => void;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  t: (key: string, fallback: string) => string;
}

export function CategoryAttributesSection({
  isEditable,
  effectiveCategoryId,
  selectedCategory,
  categoryOptions,
  categoryTrees,
  effectiveAttributes,
  effectiveGlobalAttributes,
  activeCategoryAttributeDefs,
  moduleKey,
  handleCategorySelect,
  handleCategoryAttributeChange,
  title,
  collapsible = true,
  defaultCollapsed = false,
  t,
}: CategoryAttributesSectionProps) {
  const categorySectionTitle =
    title || t("moduleConfig.customFieldsSection", "Danh mục & Thuộc tính");

  return (
    <DrawerSection
      title={categorySectionTitle}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-3">
        {/* Category Field */}
        <DrawerField label={t("moduleConfig.categoryLabel", "Danh mục")}>
          {isEditable ? (
            <Combobox
              options={categoryOptions}
              value={effectiveCategoryId || ""}
              onChange={(val) => handleCategorySelect(val || null)}
              placeholder={t(
                "moduleConfig.selectCategoryPlaceholder",
                "-- Chọn danh mục --",
              )}
              allowClear={true}
              searchPlaceholder={t(
                "moduleConfig.searchCategory",
                "Tìm kiếm danh mục...",
              )}
            />
          ) : selectedCategory ? (
            <div className="flex items-center gap-2 p-2 bg-surface rounded-lg border border-border/60">
              <Layers className="w-4 h-4 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-foreground truncate">
                  {resolveCategoryName(selectedCategory, t)}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {selectedCategory.code}
                </span>
              </div>
            </div>
          ) : (
            <div className="font-medium text-muted-foreground text-xs px-3 py-2 bg-muted/30 rounded-lg border border-transparent">
              {t("moduleConfig.noCategorySelected", "— Chưa chọn danh mục —")}
            </div>
          )}
        </DrawerField>

        {/* Dynamic Category Attributes */}
        {selectedCategory && (
          <div className="pt-2 border-t border-border/50 space-y-3">
            {activeCategoryAttributeDefs.length === 0 ? (
              <div className="p-2.5 text-center text-muted-foreground text-xs bg-muted/20 rounded-lg border border-dashed border-border/50">
                {t(
                  "moduleConfig.noAttributesInCategory",
                  "Danh mục này chưa có thuộc tính nào được cấu hình.",
                )}
              </div>
            ) : (
              <AttributeTreeList
                nodes={categoryTrees}
                attrsValues={effectiveAttributes}
                isCategory={true}
                isEditable={isEditable}
                moduleKey={moduleKey}
                categoryCode={selectedCategory?.code}
                allAttributes={{
                  ...(effectiveAttributes || {}),
                  ...(effectiveGlobalAttributes || {}),
                }}
                onAttributeChange={handleCategoryAttributeChange}
                t={t}
              />
            )}
          </div>
        )}
      </div>
    </DrawerSection>
  );
}
