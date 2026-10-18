import React from "react";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { EmptyState } from "@/shared/components/EmptyState";
import type { AttributeTreeNode } from "@/shared/types/customFields";
import { AttributeTreeList } from "../attribute-tree-list";

export interface CategoryAttributesSectionProps {
  title: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  categoryOptions: ComboboxOption[];
  effectiveCategoryId: string | null;
  onCategorySelect: (id: string | null) => void;
  selectedCategory: any;
  categoryTrees: AttributeTreeNode[];
  editMode: boolean;
  moduleKey: string;
  effectiveAttributes: Record<string, any>;
  onAttributeChange: (id: string, val: any) => void;
  t: (key: string, fallback: string) => string;
}

export function CategoryAttributesSection({
  title,
  collapsible,
  defaultCollapsed,
  categoryOptions,
  effectiveCategoryId,
  onCategorySelect,
  selectedCategory,
  categoryTrees,
  editMode,
  moduleKey,
  effectiveAttributes,
  onAttributeChange,
  t,
}: CategoryAttributesSectionProps) {
  return (
    <DrawerSection
      title={title}
      collapsible={collapsible}
      defaultCollapsed={defaultCollapsed}
    >
      <div className="space-y-3">
        <DrawerField
          label={t("moduleConfig.categorySelectLabel", "Phân loại danh mục")}
        >
          {editMode ? (
            <Combobox
              options={categoryOptions}
              value={effectiveCategoryId || ""}
              onChange={(val) => onCategorySelect(val || null)}
              placeholder={`-- ${t("moduleConfig.selectCategoryPlaceholder", "Chọn phân loại")} --`}
              allowClear={true}
            />
          ) : (
            <div className="text-sm font-medium text-foreground py-1.5 px-3 bg-muted/40 rounded-md border border-border/40 min-h-[36px] flex items-center">
              {selectedCategory
                ? `${selectedCategory.name} (${selectedCategory.code})`
                : "-"}
            </div>
          )}
        </DrawerField>

        {effectiveCategoryId && categoryTrees.length > 0 && (
          <AttributeTreeList
            nodes={categoryTrees}
            editMode={editMode}
            moduleKey={moduleKey}
            categoryCode={selectedCategory?.code}
            attributes={effectiveAttributes}
            onChange={onAttributeChange}
            t={t}
          />
        )}

        {effectiveCategoryId && categoryTrees.length === 0 && (
          <EmptyState
            message={t(
              "moduleConfig.noCategoryAttributes",
              "Chưa có thuộc tính phân loại",
            )}
            description={t(
              "moduleConfig.noCategoryAttributesDesc",
              "Phân loại này chưa được cấu hình trường động.",
            )}
            className="py-4"
          />
        )}
      </div>
    </DrawerSection>
  );
}
