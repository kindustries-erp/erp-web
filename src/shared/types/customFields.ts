import type { ModuleKey, ModuleAttributeDef } from "@/core/api/moduleConfigApi";

export type ErpModuleDomain =
  | "FINANCE"
  | "PRODUCTION"
  | "COMMERCE"
  | "INVENTORY"
  | "GARAGE";

export interface ErpDomainDefinition {
  domain: ErpModuleDomain;
  titleKey: string;
  defaultTitle: string;
  icon: React.ReactNode;
}

export interface ErpModuleDefinition {
  key: string;
  nameKey: string;
  defaultName: string;
  domain: ErpModuleDomain;
  icon: React.ReactNode;
  descKey: string;
  defaultDesc: string;
}

export interface AttributeTreeNode {
  def: ModuleAttributeDef;
  parentDef?: ModuleAttributeDef;
  children: AttributeTreeNode[];
}

export interface ModuleCustomFieldConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: "unified" | "single";
  moduleKey?: ModuleKey | string | null;
  moduleLabel?: string;
  initialTab?: ModuleKey | string;
  initialAttrCode?: string | null;
  title?: string;
  onAttributeChanged?: () => void;
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
