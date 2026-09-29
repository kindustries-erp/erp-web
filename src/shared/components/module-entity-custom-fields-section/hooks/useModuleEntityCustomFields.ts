import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  moduleConfigApi,
  resolveCategoryName,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { buildAttributeTree } from "../utils/buildAttributeTree";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { ModuleEntityCustomFieldsSectionProps } from "../domains/types";

export function useModuleEntityCustomFields({
  moduleKey,
  entityId,
  categoryId,
  onCategoryChange,
  attributes,
  onAttributesChange,
  globalAttributes,
  onGlobalAttributesChange,
  readOnly = false,
  hideGlobalSection = false,
  hideCategorySection = false,
  includeSystemAttributes = false,
  t,
}: ModuleEntityCustomFieldsSectionProps & {
  t: (key: string, fallback: string) => string;
}) {
  // 1. Fetch categories for this moduleKey
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: !!moduleKey && !hideCategorySection,
  });

  // 2. Fetch global attribute defs for this moduleKey
  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", moduleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(moduleKey),
    enabled: !!moduleKey && !hideGlobalSection,
  });

  // 3. Fetch saved values for entity if entityId is present
  const { data: savedEntityData } = useQuery({
    queryKey: ["module-entity-values", moduleKey, entityId],
    queryFn: () => moduleConfigApi.getEntityValues(moduleKey, entityId!),
    enabled: !!entityId && !readOnly,
  });

  // Category ID resolution (prop takes precedence over query data)
  const effectiveCategoryId =
    categoryId !== undefined ? categoryId : savedEntityData?.categoryId || null;

  // Category Attributes resolution (prop takes precedence over query data)
  const effectiveAttributes = useMemo(() => {
    if (
      attributes !== undefined &&
      attributes !== null &&
      Object.keys(attributes).length > 0
    ) {
      return attributes;
    }
    return savedEntityData?.attributes || attributes || {};
  }, [attributes, savedEntityData?.attributes]);

  // Global Attributes resolution (prop takes precedence over query data)
  const effectiveGlobalAttributes = useMemo(() => {
    if (
      globalAttributes !== undefined &&
      globalAttributes !== null &&
      Object.keys(globalAttributes).length > 0
    ) {
      return globalAttributes;
    }
    return savedEntityData?.globalAttributes || globalAttributes || {};
  }, [globalAttributes, savedEntityData?.globalAttributes]);

  // Selected category object
  const selectedCategory = useMemo(() => {
    if (!effectiveCategoryId) return null;
    return categories.find((c) => c.id === effectiveCategoryId) || null;
  }, [categories, effectiveCategoryId]);

  // Active category attribute definitions
  const activeCategoryAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    if (!selectedCategory?.attributeDefs) return [];
    return selectedCategory.attributeDefs
      .filter((d) => !d.isDeleted && d.isActive !== false && !d.isGlobal)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [selectedCategory]);

  // Active global attribute definitions (excluding system attributes handled elsewhere unless includeSystemAttributes is true)
  const activeGlobalAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    const list =
      globalDefs.length > 0
        ? globalDefs
        : savedEntityData?.globalAttributeDefs || [];
    return list
      .filter(
        (d) =>
          !d.isDeleted &&
          d.isActive !== false &&
          d.isGlobal &&
          (includeSystemAttributes || !d.isSystem),
      )
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [
    globalDefs,
    savedEntityData?.globalAttributeDefs,
    includeSystemAttributes,
  ]);

  // Tree structures
  const globalTrees = useMemo(
    () => buildAttributeTree(activeGlobalAttributeDefs),
    [activeGlobalAttributeDefs],
  );

  const categoryTrees = useMemo(
    () => buildAttributeTree(activeCategoryAttributeDefs),
    [activeCategoryAttributeDefs],
  );

  // Category dropdown options (with i18n resolution)
  const categoryOptions: ComboboxOption[] = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        value: c.id,
        label: `${resolveCategoryName(c, t)} (${c.code})`,
      }));
  }, [categories, t]);

  // Handlers
  const handleCategorySelect = useCallback(
    (newCatId: string | null) => {
      if (onCategoryChange) {
        onCategoryChange(newCatId);
      }
      if (onAttributesChange) {
        onAttributesChange({});
      }
    },
    [onCategoryChange, onAttributesChange],
  );

  const handleCategoryAttributeChange = useCallback(
    (attrDefId: string, value: any) => {
      if (onAttributesChange) {
        onAttributesChange({
          ...effectiveAttributes,
          [attrDefId]: value,
        });
      }
    },
    [onAttributesChange, effectiveAttributes],
  );

  const handleGlobalAttributeChange = useCallback(
    (attrDefId: string, value: any) => {
      if (onGlobalAttributesChange) {
        onGlobalAttributesChange({
          ...effectiveGlobalAttributes,
          [attrDefId]: value,
        });
      }
    },
    [onGlobalAttributesChange, effectiveGlobalAttributes],
  );

  return {
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
  };
}
