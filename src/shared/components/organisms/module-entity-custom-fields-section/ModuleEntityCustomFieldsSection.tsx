import React from "react";
import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { useModuleEntityCustomFields } from "@/shared/hooks/useModuleEntityCustomFields";
import { GlobalAttributesSection } from "@/shared/components/molecules/global-attributes-section";
import { CategoryAttributesSection } from "@/shared/components/molecules/category-attributes-section";
import type { ModuleEntityCustomFieldsSectionProps } from "@/shared/types/customFields";

export function ModuleEntityCustomFieldsSection(
  props: ModuleEntityCustomFieldsSectionProps,
) {
  const t = useT();

  const {
    effectiveCategoryId,
    effectiveAttributes,
    effectiveGlobalAttributes,
    selectedCategory,
    activeGlobalAttributeDefs,
    globalTrees,
    categoryTrees,
    categoryOptions,
    handleCategorySelect,
    handleCategoryAttributeChange,
    handleGlobalAttributeChange,
  } = useModuleEntityCustomFields({ ...props, t });

  const isEditable = props.editMode && !props.readOnly;
  const showGlobalSection =
    !props.hideGlobalSection && activeGlobalAttributeDefs.length > 0;
  const showCategorySection = !props.hideCategorySection;

  return (
    <div className={cn("space-y-4", props.className)}>
      {showGlobalSection && (
        <GlobalAttributesSection
          globalTrees={globalTrees}
          effectiveGlobalAttributes={effectiveGlobalAttributes}
          editMode={isEditable}
          moduleKey={props.moduleKey}
          onGlobalAttributeChange={handleGlobalAttributeChange}
          title={
            props.globalTitle ||
            t("moduleConfig.globalAttributesTitle", "1. Thông tin chung")
          }
          collapsible={props.globalCollapsible}
          defaultCollapsed={props.globalDefaultCollapsed}
          t={t}
        />
      )}

      {showCategorySection && (
        <CategoryAttributesSection
          editMode={isEditable}
          effectiveCategoryId={effectiveCategoryId}
          selectedCategory={selectedCategory}
          categoryOptions={categoryOptions}
          categoryTrees={categoryTrees}
          effectiveAttributes={effectiveAttributes}
          moduleKey={props.moduleKey}
          onCategorySelect={handleCategorySelect}
          onAttributeChange={handleCategoryAttributeChange}
          title={
            props.title ||
            t("moduleConfig.categoryAttributesTitle", "2. Phân loại & Chi tiết")
          }
          collapsible={props.collapsible}
          defaultCollapsed={props.defaultCollapsed}
          t={t}
        />
      )}
    </div>
  );
}
