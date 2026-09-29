import { useT } from "@/core/i18n";
import { cn } from "@/shared/utils";
import { useModuleEntityCustomFields } from "../../hooks/useModuleEntityCustomFields";
import { GlobalAttributesSection } from "../molecules/GlobalAttributesSection";
import { CategoryAttributesSection } from "../molecules/CategoryAttributesSection";
import type { ModuleEntityCustomFieldsSectionProps } from "../../domains/types";

export function ModuleEntityCustomFieldsSection(
  props: ModuleEntityCustomFieldsSectionProps,
) {
  const t = useT();

  const {
    effectiveCategoryId,
    effectiveAttributes,
    effectiveGlobalAttributes,
    selectedCategory,
    activeCategoryAttributeDefs,
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
      {/* 1. GLOBAL ATTRIBUTES SECTION */}
      {showGlobalSection && (
        <GlobalAttributesSection
          globalTrees={globalTrees}
          effectiveGlobalAttributes={effectiveGlobalAttributes}
          isEditable={isEditable}
          moduleKey={props.moduleKey}
          effectiveAttributes={effectiveAttributes}
          handleGlobalAttributeChange={handleGlobalAttributeChange}
          activeGlobalDefsCount={activeGlobalAttributeDefs.length}
          globalTitle={props.globalTitle}
          globalCollapsible={props.globalCollapsible}
          globalDefaultCollapsed={props.globalDefaultCollapsed}
          t={t}
        />
      )}

      {/* 2. CATEGORY & CATEGORY ATTRIBUTES SECTION */}
      {showCategorySection && (
        <CategoryAttributesSection
          isEditable={isEditable}
          effectiveCategoryId={effectiveCategoryId}
          selectedCategory={selectedCategory}
          categoryOptions={categoryOptions}
          categoryTrees={categoryTrees}
          effectiveAttributes={effectiveAttributes}
          effectiveGlobalAttributes={effectiveGlobalAttributes}
          activeCategoryAttributeDefs={activeCategoryAttributeDefs}
          moduleKey={props.moduleKey}
          handleCategorySelect={handleCategorySelect}
          handleCategoryAttributeChange={handleCategoryAttributeChange}
          title={props.title}
          collapsible={props.collapsible}
          defaultCollapsed={props.defaultCollapsed}
          t={t}
        />
      )}
    </div>
  );
}
