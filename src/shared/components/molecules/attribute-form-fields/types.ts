import type {
  ModuleAttributeDef,
  ModuleAttributeFieldType,
  ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import type { ComboboxOption } from "@/shared/components/Combobox";
import type { ErpModuleDomain } from "@/shared/types/customFields";

export interface AttributeFormFieldsProps {
  editingAttr: ModuleAttributeDef | null;
  attrCode: string;
  setAttrCode: (val: string) => void;
  attrNames: Record<string, string>;
  setAttrNames: (val: Record<string, string>) => void;
  setAttrName: (val: string) => void;
  setAttrNameEn: (val: string) => void;
  attrFieldType: ModuleAttributeFieldType;
  setAttrFieldType: (val: ModuleAttributeFieldType) => void;
  attrRequired: boolean;
  setAttrRequired: (val: boolean) => void;
  attrParentAttrCode: string;
  setAttrParentAttrCode: (val: string) => void;
  attrOptions: ModuleAttributeOption[];
  setAttrOptions: (options: ModuleAttributeOption[]) => void;
  fieldTypeOptions: ComboboxOption[];
  parentSelectAttrOptions: ComboboxOption[];
  parentCategoryOptions: ComboboxOption[];
  activeModuleKey: string;
  domainKey?: ErpModuleDomain;
  locale: string;
  isSaving: boolean;
  t: (key: string, fallback: string) => string;
  onSave: () => void;
  onCancel: () => void;
}
