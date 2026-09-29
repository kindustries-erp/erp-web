import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Plus, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { PillTabs } from "@/shared/components/PillTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import {
  moduleConfigApi,
  resolveAttrName,
  type ModuleAttributeDef,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";
import type { ComboboxOption } from "@/shared/components/Combobox";
import {
  ERP_MODULE_REGISTRY,
  getFieldTypeOptions,
  type ErpModuleDomain,
} from "../../domains/constants";
import type { AttributeTreeNode } from "../../domains/types";
import { buildAttributeTree } from "../../utils/buildAttributeTree";
import { NeutralCountBadge } from "../atoms/NeutralCountBadge";
import { AttributeFieldRow } from "../molecules/AttributeFieldRow";
import { AttributeFormFields } from "../molecules/AttributeFormFields";

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
  const queryClient = useQueryClient();

  const domainMods = useMemo(
    () => ERP_MODULE_REGISTRY.filter((m) => m.domain === domainKey),
    [domainKey],
  );

  const pillTabItems = useMemo(
    () =>
      domainMods.map((m) => ({
        value: m.key,
        label: t(m.nameKey, m.defaultName),
      })),
    [domainMods, t],
  );

  const fieldTypeOptions = useMemo(() => getFieldTypeOptions(t), [t]);

  const { data: globalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", activeModuleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(activeModuleKey),
    enabled: isOpen && !!activeModuleKey,
  });

  const systemDefs = useMemo(
    () => globalDefs.filter((d) => Boolean(d.isSystem)),
    [globalDefs],
  );
  const customDefs = useMemo(
    () => globalDefs.filter((d) => !d.isSystem),
    [globalDefs],
  );

  // State: Attribute Form (Create / Edit)
  const [isAddingAttr, setIsAddingAttr] = useState(false);
  const [editingAttr, setEditingAttr] = useState<ModuleAttributeDef | null>(
    null,
  );
  const [attrCode, setAttrCode] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrNameEn, setAttrNameEn] = useState("");
  const [attrNames, setAttrNames] = useState<Record<string, string>>({
    vi: "",
    en: "",
  });
  const [attrParentAttrCode, setAttrParentAttrCode] = useState("");
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<
    "attr" | { type: "module"; nextKey: string } | null
  >(null);

  const isAttrDirty = useMemo(() => {
    if (isAddingAttr) {
      return Boolean(
        attrCode.trim() !== "" ||
        attrName.trim() !== "" ||
        attrNameEn.trim() !== "" ||
        attrParentAttrCode.trim() !== "" ||
        attrRequired ||
        attrFieldType !== "TEXT" ||
        attrOptions.length > 0,
      );
    }
    if (editingAttr) {
      const origOpts = editingAttr.options || [];
      const optsChanged =
        JSON.stringify(attrOptions) !== JSON.stringify(origOpts);
      return (
        attrCode.trim() !== (editingAttr.code || "") ||
        attrName.trim() !== (editingAttr.name || "") ||
        attrNameEn.trim() !== (editingAttr.nameEn || "") ||
        attrParentAttrCode.trim() !== (editingAttr.parentAttrCode || "") ||
        attrFieldType !== (editingAttr.fieldType || "TEXT") ||
        attrRequired !== Boolean(editingAttr.isRequired) ||
        optsChanged
      );
    }
    return false;
  }, [
    isAddingAttr,
    editingAttr,
    attrCode,
    attrName,
    attrNameEn,
    attrParentAttrCode,
    attrFieldType,
    attrRequired,
    attrOptions,
  ]);

  useEffect(() => {
    onDirtyChange?.(
      Boolean(isAddingAttr || editingAttr !== null || isAttrDirty),
    );
  }, [isAddingAttr, editingAttr, isAttrDirty, onDirtyChange]);

  const parentSelectAttrOptions: ComboboxOption[] = useMemo(() => {
    const candidateDefs = globalDefs.filter(
      (d) =>
        d.fieldType === "SELECT" &&
        !d.isDeleted &&
        d.code !== attrCode &&
        (!editingAttr || d.id !== editingAttr.id) &&
        !d.parentAttrCode,
    );
    return [
      {
        value: "",
        label: t(
          "moduleConfig.noParentAttr",
          "— Không phụ thuộc (Thuộc tính độc lập) —",
        ),
      },
      ...candidateDefs.map((d) => ({
        value: d.code,
        label: `${resolveAttrName(d, activeModuleKey, locale, t)} (${d.code})`,
        code: d.code,
      })),
    ];
  }, [globalDefs, attrCode, editingAttr, activeModuleKey, locale, t]);

  const effectiveParentAttrDef = useMemo(() => {
    if (!attrParentAttrCode) return null;
    return globalDefs.find(
      (d) => d.code === attrParentAttrCode && !d.isDeleted,
    );
  }, [globalDefs, attrParentAttrCode]);

  const parentCategoryOptions: ComboboxOption[] = useMemo(() => {
    if (!effectiveParentAttrDef?.options) return [];
    return effectiveParentAttrDef.options.map((opt) => ({
      value: opt.value,
      label: `${opt.label} (${opt.value})`,
      code: opt.value,
    }));
  }, [effectiveParentAttrDef]);

  const openCreateAttr = () => {
    setIsAddingAttr(true);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrParentAttrCode("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
  };

  const openEditAttr = (attr: ModuleAttributeDef) => {
    setEditingAttr(attr);
    setIsAddingAttr(false);
    setAttrCode(attr.code);
    setAttrName(attr.name);
    setAttrNameEn(attr.nameEn || "");
    setAttrNames({
      vi: attr.name || "",
      en: attr.nameEn || "",
    });
    setAttrParentAttrCode(attr.parentAttrCode || "");
    setAttrFieldType(attr.fieldType);
    setAttrRequired(Boolean(attr.isRequired));
    setAttrOptions(attr.options || []);
  };

  const closeAttrForm = () => {
    setIsAddingAttr(false);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrParentAttrCode("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
  };

  useEffect(() => {
    if (isOpen && initialAttrCode && globalDefs.length > 0) {
      const found = globalDefs.find(
        (d) => d.code.toLowerCase() === initialAttrCode.toLowerCase(),
      );
      if (found && editingAttr?.id !== found.id) {
        openEditAttr(found);
      }
    }
  }, [isOpen, initialAttrCode, globalDefs]);

  useEffect(() => {
    closeAttrForm();
  }, [activeModuleKey]);

  const handleRequestCloseAttr = () => {
    if (isAttrDirty) {
      setCancelConfirmTarget("attr");
    } else {
      closeAttrForm();
    }
  };

  const handleSelectModuleWithGuard = (nextKey: string) => {
    if (nextKey === activeModuleKey) return;
    if (isAttrDirty) {
      setCancelConfirmTarget({ type: "module", nextKey });
    } else {
      closeAttrForm();
      onSelectModule(nextKey);
    }
  };

  // Mutations
  const createAttrMutation = useMutation({
    mutationFn: (dto: any) => moduleConfigApi.createAttributeDef(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.createAttrSuccess", "Thêm thuộc tính thành công"),
      );
      closeAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.createAttrError", "Không thể thêm thuộc tính"),
      );
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) =>
      moduleConfigApi.updateAttributeDef(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.updateAttrSuccess", "Cập nhật thuộc tính thành công"),
      );
      closeAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.updateAttrError", "Không thể cập nhật thuộc tính"),
      );
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: (id: string) => moduleConfigApi.deleteAttributeDef(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      toast.success(
        t("moduleConfig.deleteAttrSuccess", "Xóa thuộc tính thành công"),
      );
      setDeleteAttrTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          t("moduleConfig.deleteAttrError", "Không thể xóa thuộc tính"),
      );
      setDeleteAttrTarget(null);
    },
  });

  const handleSaveAttribute = async () => {
    const trimmedCode = attrCode.trim().toLowerCase();
    const trimmedName = (attrNames.vi || attrName).trim();
    const trimmedNameEn = (attrNames.en || attrNameEn).trim();

    if (!trimmedCode) {
      toast.error(
        t("moduleConfig.attrCodeRequired", "Vui lòng nhập mã thuộc tính"),
      );
      return;
    }
    if (!trimmedName) {
      toast.error(
        t("moduleConfig.attrNameRequired", "Vui lòng nhập tên hiển thị"),
      );
      return;
    }
    if (attrFieldType === "SELECT" && attrOptions.length === 0) {
      toast.error(
        t(
          "moduleConfig.selectOptionsRequired",
          "Kiểu SELECT cần ít nhất 1 tùy chọn",
        ),
      );
      return;
    }

    const currentFieldType = editingAttr?.isSystem
      ? editingAttr.fieldType
      : attrFieldType;
    const finalParentAttrCode =
      currentFieldType === "SELECT" && attrParentAttrCode.trim()
        ? attrParentAttrCode.trim()
        : null;

    if (editingAttr) {
      await updateAttrMutation.mutateAsync({
        id: editingAttr.id,
        dto: {
          code: editingAttr.isSystem ? editingAttr.code : trimmedCode,
          name: trimmedName,
          nameEn: trimmedNameEn || undefined,
          parentAttrCode: finalParentAttrCode,
          fieldType: currentFieldType,
          isRequired: attrRequired,
          options: currentFieldType === "SELECT" ? attrOptions : undefined,
        },
      });
    } else {
      await createAttrMutation.mutateAsync({
        isGlobal: true,
        moduleKeyGlobal: activeModuleKey,
        code: trimmedCode,
        name: trimmedName,
        nameEn: trimmedNameEn || undefined,
        parentAttrCode: finalParentAttrCode,
        fieldType: attrFieldType,
        isRequired: attrRequired,
        options: attrFieldType === "SELECT" ? attrOptions : undefined,
        isActive: true,
      });
    }
  };

  const handleToggleAttrActive = async (attr: ModuleAttributeDef) => {
    try {
      await moduleConfigApi.updateAttributeDef(attr.id, {
        isActive: !attr.isActive,
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      toast.success(
        attr.isActive
          ? t("common.deactivated", "Đã ngừng hoạt động")
          : t("common.activated", "Đã kích hoạt lại"),
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          t("common.updateFailed", "Cập nhật thất bại"),
      );
    }
  };

  const renderTreeNodes = (nodes: AttributeTreeNode[], isSystem: boolean) => {
    return nodes.map((node) => {
      const isRootEditing = editingAttr?.id === node.def.id;
      if (isRootEditing) {
        return (
          <div key={node.def.id} className="w-full">
            <AttributeFormFields
              editingAttr={editingAttr}
              attrCode={attrCode}
              setAttrCode={setAttrCode}
              attrNames={attrNames}
              setAttrNames={setAttrNames}
              setAttrName={setAttrName}
              setAttrNameEn={setAttrNameEn}
              attrFieldType={attrFieldType}
              setAttrFieldType={setAttrFieldType}
              attrRequired={attrRequired}
              setAttrRequired={setAttrRequired}
              attrParentAttrCode={attrParentAttrCode}
              setAttrParentAttrCode={setAttrParentAttrCode}
              attrOptions={attrOptions}
              setAttrOptions={setAttrOptions}
              fieldTypeOptions={fieldTypeOptions}
              parentSelectAttrOptions={parentSelectAttrOptions}
              parentCategoryOptions={parentCategoryOptions}
              activeModuleKey={activeModuleKey}
              domainKey={domainKey}
              locale={locale}
              isSaving={
                createAttrMutation.isPending || updateAttrMutation.isPending
              }
              t={t}
              onSave={handleSaveAttribute}
              onCancel={handleRequestCloseAttr}
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
            onEdit={openEditAttr}
            onDelete={!isSystem ? (def) => setDeleteAttrTarget(def) : undefined}
            onToggleActive={!isSystem ? handleToggleAttrActive : undefined}
          />
          {node.children && node.children.length > 0 && (
            <div className="ml-4 pl-3 border-l-2 border-primary/30 flex flex-col gap-1.5">
              {renderTreeNodes(node.children, isSystem)}
            </div>
          )}
        </div>
      );
    });
  };

  const systemTrees = useMemo(
    () => buildAttributeTree(systemDefs),
    [systemDefs],
  );
  const customTrees = useMemo(
    () => buildAttributeTree(customDefs),
    [customDefs],
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Sub-module Pill Tabs */}
      {!hidePillTabs && pillTabItems.length > 1 && (
        <div className="flex items-center overflow-x-auto scrollbar-none max-w-full pb-1 -mb-1 shrink-0">
          <PillTabs
            className="w-full sm:w-auto shrink-0"
            size="sm"
            variant="pill"
            items={pillTabItems}
            value={activeModuleKey}
            onValueChange={handleSelectModuleWithGuard}
          />
        </div>
      )}

      {/* 2. System Attributes Section */}
      {systemDefs.length > 0 && (
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
            <NeutralCountBadge count={systemDefs.length} />
          </div>
          <div className="flex flex-col gap-2 pt-1">
            {renderTreeNodes(systemTrees, true)}
          </div>
        </div>
      )}

      {/* 3. Custom Attributes Section */}
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
          <NeutralCountBadge count={customDefs.length} />
        </div>

        {isAddingAttr && (
          <AttributeFormFields
            editingAttr={null}
            attrCode={attrCode}
            setAttrCode={setAttrCode}
            attrNames={attrNames}
            setAttrNames={setAttrNames}
            setAttrName={setAttrName}
            setAttrNameEn={setAttrNameEn}
            attrFieldType={attrFieldType}
            setAttrFieldType={setAttrFieldType}
            attrRequired={attrRequired}
            setAttrRequired={setAttrRequired}
            attrParentAttrCode={attrParentAttrCode}
            setAttrParentAttrCode={setAttrParentAttrCode}
            attrOptions={attrOptions}
            setAttrOptions={setAttrOptions}
            fieldTypeOptions={fieldTypeOptions}
            parentSelectAttrOptions={parentSelectAttrOptions}
            parentCategoryOptions={parentCategoryOptions}
            activeModuleKey={activeModuleKey}
            domainKey={domainKey}
            locale={locale}
            isSaving={
              createAttrMutation.isPending || updateAttrMutation.isPending
            }
            t={t}
            onSave={handleSaveAttribute}
            onCancel={handleRequestCloseAttr}
          />
        )}

        {customDefs.length === 0 && !isAddingAttr ? (
          <div className="p-6 text-center text-muted-foreground text-xs bg-muted/10 rounded-xl border border-dashed border-border/50">
            {t(
              "moduleConfig.noCustomAttributes",
              "Chưa có trường tùy chỉnh nào cho phân hệ này.",
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {renderTreeNodes(customTrees, false)}
          </div>
        )}

        {!isAddingAttr && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateAttr}
            className="w-full h-9 border-dashed text-xs gap-1.5 hover:border-primary hover:text-primary mt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t("moduleConfig.addAttribute", "Thêm thuộc tính")}</span>
          </Button>
        )}
      </div>

      {/* Delete attribute confirm modal */}
      <ConfirmModal
        open={deleteAttrTarget !== null}
        title={t("moduleConfig.confirmDeleteTitle", "Xóa thuộc tính")}
        message={t(
          "moduleConfig.confirmDeleteDesc",
          "Bạn có chắc chắn muốn xóa thuộc tính này? Thao tác này không thể hoàn tác.",
        )}
        confirmLabel={t("common.delete", "Xóa")}
        danger
        onConfirm={() => {
          if (deleteAttrTarget) {
            deleteAttrMutation.mutate(deleteAttrTarget.id);
          }
        }}
        onCancel={() => setDeleteAttrTarget(null)}
      />

      {/* Cancel discard confirm modal */}
      <ConfirmModal
        open={cancelConfirmTarget !== null}
        title={t("common.confirmCancelTitle", "Xác nhận hủy thay đổi")}
        message={t(
          "common.confirmCancelDesc",
          "Bạn có thay đổi chưa được lưu. Nếu hủy bây giờ, các thay đổi sẽ bị mất.",
        )}
        confirmLabel={t("common.discardChanges", "Hủy thay đổi")}
        cancelLabel={t("common.continueEditing", "Tiếp tục sửa")}
        danger
        onConfirm={() => {
          if (cancelConfirmTarget === "attr") {
            closeAttrForm();
          } else if (
            cancelConfirmTarget &&
            cancelConfirmTarget.type === "module"
          ) {
            closeAttrForm();
            onSelectModule(cancelConfirmTarget.nextKey);
          }
          setCancelConfirmTarget(null);
        }}
        onCancel={() => setCancelConfirmTarget(null)}
      />
    </div>
  );
}
