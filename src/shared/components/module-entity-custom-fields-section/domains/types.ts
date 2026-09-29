import type { ModuleKey, ModuleAttributeDef } from "@/core/api/moduleConfigApi";

export interface AttributeTreeNode {
  def: ModuleAttributeDef;
  parentDef?: ModuleAttributeDef;
  children: AttributeTreeNode[];
}

export interface ModuleEntityCustomFieldsSectionProps {
  moduleKey: ModuleKey;
  entityId?: string | null;
  editMode: boolean;
  categoryId?: string | null;
  onCategoryChange?: (categoryId: string | null) => void;
  attributes?: Record<string, any>;
  onAttributesChange?: (attributes: Record<string, any>) => void;
  globalAttributes?: Record<string, any>;
  onGlobalAttributesChange?: (globalAttributes: Record<string, any>) => void;
  title?: string;
  globalTitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  globalCollapsible?: boolean;
  globalDefaultCollapsed?: boolean;
  readOnly?: boolean;
  hideGlobalSection?: boolean;
  hideCategorySection?: boolean;
  includeSystemAttributes?: boolean;
  className?: string;
}

export interface AttributeFieldRendererProps {
  attr: ModuleAttributeDef;
  value: any;
  isEditable: boolean;
  moduleKey: string;
  categoryCode?: string | null;
  allAttributes?: Record<string, any>;
  onChange: (val: any) => void;
  t: (key: string, fallback: string) => string;
  isChild?: boolean;
  parentDef?: ModuleAttributeDef;
}

export interface AttributeFieldLabelProps {
  displayName: string;
  isSystem?: boolean;
  isChild?: boolean;
  parentDisplayName?: string | null;
  parentCode?: string | null;
  t: (key: string, fallback: string) => string;
}

export interface AttributeViewBoxProps {
  attr: ModuleAttributeDef;
  value: any;
  locale: string;
  t: (key: string, fallback: string) => string;
}

export interface ValidateModuleRequiredFieldsParams {
  globalDefs?: ModuleAttributeDef[];
  globalAttributes?: Record<string, any>;
  categoryDefs?: ModuleAttributeDef[];
  attributes?: Record<string, any>;
  hasCategory?: boolean;
  moduleKey?: string;
  categoryCode?: string | null;
  includeSystemAttributes?: boolean;
  t?: (key: string, fallback: string) => string;
}

export interface GlobalAttributesSectionProps {
  globalTrees: AttributeTreeNode[];
  effectiveGlobalAttributes: Record<string, any>;
  isEditable: boolean;
  moduleKey: ModuleKey;
  effectiveAttributes: Record<string, any>;
  handleGlobalAttributeChange: (attrDefId: string, value: any) => void;
  activeGlobalDefsCount: number;
  globalTitle?: string;
  globalCollapsible?: boolean;
  globalDefaultCollapsed?: boolean;
  t: (key: string, fallback: string) => string;
}

export interface CategoryAttributesSectionProps {
  isEditable: boolean;
  effectiveCategoryId: string | null;
  selectedCategory: any;
  categoryOptions: any[];
  categoryTrees: AttributeTreeNode[];
  effectiveAttributes: Record<string, any>;
  effectiveGlobalAttributes: Record<string, any>;
  activeCategoryAttributeDefs: ModuleAttributeDef[];
  moduleKey: ModuleKey;
  handleCategorySelect: (newCatId: string | null) => void;
  handleCategoryAttributeChange: (attrDefId: string, value: any) => void;
  title?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  t: (key: string, fallback: string) => string;
}
