import { useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  moduleConfigApi,
  resolveCategoryName,
  type ModuleAttributeDef,
} from "@/core/api/moduleConfigApi";
import { buildAttributeTree } from "../utils/buildAttributeTree";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { ModuleEntityCustomFieldsSectionProps } from "../types/customFields";

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
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", moduleKey],
    queryFn: () => moduleConfigApi.getCategories(moduleKey),
    enabled: !!moduleKey && !hideCategorySection,
  });

  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", moduleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(moduleKey),
    enabled: !!moduleKey && !hideGlobalSection,
  });

  const { data: savedEntityData } = useQuery({
    queryKey: ["module-entity-values", moduleKey, entityId],
    queryFn: () => moduleConfigApi.getEntityValues(moduleKey, entityId!),
    enabled: !!entityId && !readOnly,
  });

  const effectiveCategoryId =
    categoryId !== undefined ? categoryId : savedEntityData?.categoryId || null;

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

  const selectedCategory = useMemo(() => {
    if (!effectiveCategoryId) return null;
    return categories.find((c) => c.id === effectiveCategoryId) || null;
  }, [categories, effectiveCategoryId]);

  const activeCategoryAttributeDefs: ModuleAttributeDef[] = useMemo(() => {
    if (!selectedCategory?.attributeDefs) return [];
    return selectedCategory.attributeDefs
      .filter((d) => !d.isDeleted && d.isActive !== false && !d.isGlobal)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [selectedCategory]);

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

  const globalTrees = useMemo(
    () => buildAttributeTree(activeGlobalAttributeDefs),
    [activeGlobalAttributeDefs],
  );
  const categoryTrees = useMemo(
    () => buildAttributeTree(activeCategoryAttributeDefs),
    [activeCategoryAttributeDefs],
  );

  const categoryOptions: ComboboxOption[] = useMemo(() => {
    return categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        value: c.id,
        label: `${resolveCategoryName(c, t)} (${c.code})`,
      }));
  }, [categories, t]);

  const handleCategorySelect = useCallback(
    (newCatId: string | null) => {
      if (onCategoryChange) onCategoryChange(newCatId);
      if (onAttributesChange) onAttributesChange({});
    },
    [onCategoryChange, onAttributesChange],
  );

  const handleCategoryAttributeChange = useCallback(
    (attrDefId: string, value: any) => {
      if (onAttributesChange) {
        onAttributesChange({ ...effectiveAttributes, [attrDefId]: value });
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
