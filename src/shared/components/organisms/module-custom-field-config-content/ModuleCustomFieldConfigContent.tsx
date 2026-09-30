import React, { useMemo } from "react";
import { Plus, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { NeutralCountBadge } from "@/shared/components/atoms";
import { AttributeFormFields } from "@/shared/components/molecules/attribute-form-fields";
import { buildAttributeTree } from "@/shared/utils/buildAttributeTree";
import type { ErpModuleDomain } from "@/shared/types/customFields";
import { useModuleConfigContentState } from "./hooks/useModuleConfigContentState";
import { ModuleConfigAttributeHeader } from "./components/ModuleConfigAttributeHeader";
import { ModuleConfigAttributeTree } from "./components/ModuleConfigAttributeTree";
import { ModuleConfigModals } from "./components/ModuleConfigModals";

export interface ModuleCustomFieldConfigContentProps {
  domainKey?: ErpModuleDomain;
  activeModuleKey: string;
  onSelectModule: (moduleKey: string) => void;
  isOpen: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  hidePillTabs?: boolean;
  initialAttrCode?: string | null;
}

export function ModuleCustomFieldConfigContent({
  domainKey,
  activeModuleKey,
  onSelectModule,
  isOpen,
  onDirtyChange,
  hidePillTabs = false,
  initialAttrCode,
}: ModuleCustomFieldConfigContentProps) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);

  const state = useModuleConfigContentState({
    activeModuleKey,
    isOpen,
    initialAttrCode,
    onDirtyChange,
    locale,
    t,
  });

  const systemTrees = useMemo(
    () => buildAttributeTree(state.systemDefs),
    [state.systemDefs],
  );
  const customTrees = useMemo(
    () => buildAttributeTree(state.customDefs),
    [state.customDefs],
  );

  const handleSelectModuleWithGuard = (nextKey: string) => {
    if (nextKey === activeModuleKey) return;
    if (state.isAttrDirty) {
      state.setCancelConfirmTarget({ type: "module", nextKey });
    } else {
      state.closeAttrForm();
      onSelectModule(nextKey);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <ModuleConfigAttributeHeader
        domainKey={domainKey}
        activeModuleKey={activeModuleKey}
        onSelectModule={handleSelectModuleWithGuard}
        hidePillTabs={hidePillTabs}
        t={t}
      />

      {state.systemDefs.length > 0 && (
        <div className="flex flex-col gap-2 p-3 bg-muted/15 dark:bg-muted/5 rounded-xl border border-border/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
              <ShieldCheck className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {t(
                  "moduleConfig.systemAttributes",
                  "Thuộc tính mặc định (Hệ thống)",
                )}
              </span>
            </div>
            <NeutralCountBadge count={state.systemDefs.length} />
          </div>
          <ModuleConfigAttributeTree
            nodes={systemTrees}
            isSystem={true}
            editingAttr={state.editingAttr}
            activeModuleKey={activeModuleKey}
            locale={locale}
            domainKey={domainKey}
            formState={state}
            onEdit={state.openEditAttr}
            t={t}
          />
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
            <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>
              {t(
                "moduleConfig.customAttributes",
                "Thuộc tính tùy chỉnh (Người dùng)",
              )}
            </span>
          </div>
          <NeutralCountBadge count={state.customDefs.length} />
        </div>

        {state.isAddingAttr && (
          <AttributeFormFields
            editingAttr={null}
            attrCode={state.attrCode}
            setAttrCode={state.setAttrCode}
            attrNames={state.attrNames}
            setAttrNames={state.setAttrNames}
            setAttrName={state.setAttrName}
            setAttrNameEn={state.setAttrNameEn}
            attrFieldType={state.attrFieldType}
            setAttrFieldType={state.setAttrFieldType}
            attrRequired={state.attrRequired}
            setAttrRequired={state.setAttrRequired}
            attrParentAttrCode={state.attrParentAttrCode}
            setAttrParentAttrCode={state.setAttrParentAttrCode}
            attrOptions={state.attrOptions}
            setAttrOptions={state.setAttrOptions}
            fieldTypeOptions={state.fieldTypeOptions}
            parentSelectAttrOptions={state.parentSelectAttrOptions}
            parentCategoryOptions={state.parentCategoryOptions}
            activeModuleKey={activeModuleKey}
            domainKey={domainKey}
            locale={locale}
            isSaving={
              state.createAttrMutation.isPending ||
              state.updateAttrMutation.isPending
            }
            t={t}
            onSave={state.handleSaveAttribute}
            onCancel={state.closeAttrForm}
          />
        )}

        {state.customDefs.length === 0 && !state.isAddingAttr ? (
          <div className="p-6 text-center text-muted-foreground text-xs bg-muted/10 rounded-xl border border-dashed border-border/50">
            {t(
              "moduleConfig.noCustomAttributes",
              "Chưa có trường tùy chỉnh nào cho phân hệ này.",
            )}
          </div>
        ) : (
          <ModuleConfigAttributeTree
            nodes={customTrees}
            isSystem={false}
            editingAttr={state.editingAttr}
            activeModuleKey={activeModuleKey}
            locale={locale}
            domainKey={domainKey}
            formState={state}
            onEdit={state.openEditAttr}
            onDelete={(def) => state.setDeleteAttrTarget(def)}
            onToggleActive={state.handleToggleAttrActive}
            t={t}
          />
        )}

        {!state.isAddingAttr && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={state.openCreateAttr}
            className="w-full h-9 border-dashed text-xs gap-1.5 hover:border-primary hover:text-primary mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("moduleConfig.addAttribute", "Thêm thuộc tính")}</span>
          </Button>
        )}
      </div>

      <ModuleConfigModals state={state} onSelectModule={onSelectModule} t={t} />
    </div>
  );
}
