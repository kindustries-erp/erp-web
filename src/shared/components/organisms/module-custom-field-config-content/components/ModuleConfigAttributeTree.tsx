import React from "react";
import type {
  AttributeTreeNode,
  ErpModuleDomain,
} from "@/shared/types/customFields";
import type { ModuleAttributeDef } from "@/core/api/moduleConfigApi";
import { AttributeFieldRow } from "@/shared/components/molecules/attribute-field-row";
import { AttributeFormFields } from "@/shared/components/molecules/attribute-form-fields";

export interface ModuleConfigAttributeTreeProps {
  nodes: AttributeTreeNode[];
  isSystem: boolean;
  editingAttr: ModuleAttributeDef | null;
  activeModuleKey: string;
  locale: string;
  domainKey?: ErpModuleDomain;
  formState: any;
  onEdit: (def: ModuleAttributeDef) => void;
  onDelete?: (def: ModuleAttributeDef) => void;
  onToggleActive?: (def: ModuleAttributeDef) => void;
  t: (key: string, fallback: string) => string;
}

export function ModuleConfigAttributeTree({
  nodes,
  isSystem,
  editingAttr,
  activeModuleKey,
  locale,
  domainKey,
  formState,
  onEdit,
  onDelete,
  onToggleActive,
  t,
}: ModuleConfigAttributeTreeProps) {
  return (
    <div className="flex flex-col gap-2">
      {nodes.map((node) => {
        const isRootEditing = editingAttr?.id === node.def.id;
        if (isRootEditing) {
          return (
            <div key={node.def.id} className="w-full">
              <AttributeFormFields
                editingAttr={editingAttr}
                attrCode={formState.attrCode}
                setAttrCode={formState.setAttrCode}
                attrNames={formState.attrNames}
                setAttrNames={formState.setAttrNames}
                setAttrName={formState.setAttrName}
                setAttrNameEn={formState.setAttrNameEn}
                attrFieldType={formState.attrFieldType}
                setAttrFieldType={formState.setAttrFieldType}
                attrRequired={formState.attrRequired}
                setAttrRequired={formState.setAttrRequired}
                attrParentAttrCode={formState.attrParentAttrCode}
                setAttrParentAttrCode={formState.setAttrParentAttrCode}
                attrOptions={formState.attrOptions}
                setAttrOptions={formState.setAttrOptions}
                fieldTypeOptions={formState.fieldTypeOptions}
                parentSelectAttrOptions={formState.parentSelectAttrOptions}
                parentCategoryOptions={formState.parentCategoryOptions}
                activeModuleKey={activeModuleKey}
                domainKey={domainKey}
                locale={locale}
                isSaving={
                  formState.createAttrMutation.isPending ||
                  formState.updateAttrMutation.isPending
                }
                t={t}
                onSave={formState.handleSaveAttribute}
                onCancel={formState.closeAttrForm}
              />
            </div>
          );
        }

        return (
          <div key={node.def.id} className="flex flex-col gap-1.5">
            <AttributeFieldRow
              def={node.def}
              isSystem={isSystem}
              activeModuleKey={activeModuleKey}
              locale={locale}
              t={t}
              onEdit={onEdit}
              onDelete={!isSystem ? onDelete : undefined}
              onToggleActive={!isSystem ? onToggleActive : undefined}
            />
            {node.children && node.children.length > 0 && (
              <div className="ml-4 pl-3 border-l-2 border-primary/30 flex flex-col gap-1.5">
                <ModuleConfigAttributeTree
                  nodes={node.children}
                  isSystem={isSystem}
                  editingAttr={editingAttr}
                  activeModuleKey={activeModuleKey}
                  locale={locale}
                  domainKey={domainKey}
                  formState={formState}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleActive={onToggleActive}
                  t={t}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
