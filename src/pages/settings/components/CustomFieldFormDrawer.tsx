import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Lock, Eye, Settings2 } from "lucide-react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
  type DrawerAction,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { cn } from "@/shared/utils";
import {
  moduleConfigApi,
  resolveAttrName,
  resolveOptionLabel,
  type ModuleAttributeDef,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
  type CreateModuleAttributeDefPayload,
  type UpdateModuleAttributeDefPayload,
} from "@/core/api/moduleConfigApi";
import {
  ERP_MODULE_REGISTRY,
  ERP_DOMAIN_REGISTRY,
  ModuleLivePreviewPanel,
  NeutralCountBadge,
} from "@/shared/components/ModuleCustomFieldConfigDrawer";
import type { CustomFieldRow } from "../hooks/useCustomFieldsList";

export interface CustomFieldFormDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create";
  setMode?: (mode: "view" | "edit") => void;
  fieldRow?: CustomFieldRow | null;
  defaultModuleKey?: string;
  onSuccess?: () => void;
}

export function CustomFieldFormDrawer({
  open,
  onClose,
  mode,
  setMode,
  fieldRow,
  defaultModuleKey = "GOODS_RECEIPT",
  onSuccess,
}: CustomFieldFormDrawerProps) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);
  const queryClient = useQueryClient();
  const isView = mode === "view";
  const isCreate = mode === "create";

  // Form State
  const [selectedModuleKey, setSelectedModuleKey] =
    useState<string>(defaultModuleKey);
  const [scopeType, setScopeType] = useState<"GLOBAL" | "CATEGORY">("GLOBAL");
  const [categoryId, setCategoryId] = useState<string>("");
  const [attrCode, setAttrCode] = useState<string>("");
  const [attrNames, setAttrNames] = useState<Record<string, string>>({
    vi: "",
    en: "",
  });
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrParentAttrCode, setAttrParentAttrCode] = useState<string>("");
  const [attrRequired, setAttrRequired] = useState<boolean>(false);
  const [attrActive, setAttrActive] = useState<boolean>(true);
  const [attrSortOrder, setAttrSortOrder] = useState<number>(0);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);

  // Option adding state
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabels, setNewOptionLabels] = useState<
    Record<string, string>
  >({ vi: "", en: "" });
  const [newOptionParentValue, setNewOptionParentValue] = useState("");
  const [deleteOptionTarget, setDeleteOptionTarget] =
    useState<ModuleAttributeOption | null>(null);

  // Load Categories for the selected module
  const { data: categories = [] } = useQuery({
    queryKey: ["module-config-categories", selectedModuleKey],
    queryFn: () => moduleConfigApi.getCategories(selectedModuleKey),
    enabled: open && !!selectedModuleKey,
  });

  // Load Global Defs for the selected module (for parent dependency selection)
  const { data: moduleGlobalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", selectedModuleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(selectedModuleKey),
    enabled: open && !!selectedModuleKey,
  });

  // Options usage for the current attribute (when editing)
  const { data: optionsUsage = {} as Record<string, number> } = useQuery<
    Record<string, number>
  >({
    queryKey: ["module-config-options-usage", fieldRow?.id],
    queryFn: () =>
      fieldRow?.id
        ? moduleConfigApi.getAttributeOptionsUsage(fieldRow.id)
        : Promise.resolve({}),
    enabled:
      open && !isCreate && !!fieldRow?.id && fieldRow.fieldType === "SELECT",
  });

  // Populate form state when opening / changing target
  useEffect(() => {
    if (!open) return;

    if (isCreate) {
      setSelectedModuleKey(
        defaultModuleKey && defaultModuleKey !== "ALL"
          ? defaultModuleKey
          : "GOODS_RECEIPT",
      );
      setScopeType("GLOBAL");
      setCategoryId("");
      setAttrCode("");
      setAttrNames({ vi: "", en: "" });
      setAttrFieldType("TEXT");
      setAttrParentAttrCode("");
      setAttrRequired(false);
      setAttrActive(true);
      setAttrSortOrder(0);
      setAttrOptions([]);
    } else if (fieldRow) {
      setSelectedModuleKey(fieldRow.moduleKey);
      setScopeType(fieldRow.isGlobal ? "GLOBAL" : "CATEGORY");
      setCategoryId(fieldRow.categoryId || "");
      setAttrCode(fieldRow.code);
      setAttrNames({
        vi: fieldRow.name,
        en: fieldRow.nameEn || "",
      });
      setAttrFieldType(fieldRow.fieldType);
      setAttrParentAttrCode(fieldRow.parentAttrCode || "");
      setAttrRequired(fieldRow.isRequired);
      setAttrActive(fieldRow.isActive);
      setAttrSortOrder(fieldRow.sortOrder);
      setAttrOptions(fieldRow.options || []);
    }
  }, [open, isCreate, fieldRow, defaultModuleKey]);

  // Options for Module selector
  const moduleComboboxOptions: ComboboxOption[] = useMemo(() => {
    return ERP_MODULE_REGISTRY.map((m) => {
      const domainDef = ERP_DOMAIN_REGISTRY[m.domain];
      const domainName = domainDef
        ? t(domainDef.titleKey, domainDef.defaultTitle)
        : m.domain;
      return {
        value: m.key,
        label: `${t(m.nameKey, m.defaultName)} — (${domainName})`,
        code: m.key,
      };
    });
  }, [t]);

  // Category combobox options
  const categoryComboboxOptions: ComboboxOption[] = useMemo(() => {
    return categories
      .filter((c) => !c.isDeleted && c.isActive !== false)
      .map((c) => ({
        value: c.id,
        label: `${c.name} (${c.code})`,
        code: c.code,
      }));
  }, [categories]);

  // Parent attribute options (SELECT attributes without parent in the same module)
  const parentSelectAttrOptions: ComboboxOption[] = useMemo(() => {
    const candidateDefs = moduleGlobalDefs.filter(
      (d) =>
        d.fieldType === "SELECT" &&
        !d.isDeleted &&
        d.code !== attrCode &&
        (!fieldRow || d.id !== fieldRow.id) &&
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
        label: `${resolveAttrName(d, selectedModuleKey, null, t, locale)} (${d.code})`,
      })),
    ];
  }, [moduleGlobalDefs, attrCode, fieldRow, selectedModuleKey, t, locale]);

  // Selected parent attribute definition
  const effectiveParentAttrDef = useMemo(() => {
    if (!attrParentAttrCode) return null;
    return moduleGlobalDefs.find(
      (d) => d.code === attrParentAttrCode && !d.isDeleted,
    );
  }, [moduleGlobalDefs, attrParentAttrCode]);

  // Parent values options
  const parentOptionValues: ComboboxOption[] = useMemo(() => {
    if (!effectiveParentAttrDef?.options) return [];
    return effectiveParentAttrDef.options.map((opt) => ({
      value: opt.value,
      label: `${resolveOptionLabel(opt, locale, t)} (${opt.value})`,
      code: opt.value,
    }));
  }, [effectiveParentAttrDef, locale, t]);

  // Field type options
  const fieldTypeOptions: ComboboxOption[] = useMemo(() => {
    return [
      {
        value: "TEXT",
        label: t("moduleConfig.fieldTypes.text.label", "Văn bản ngắn (Text)"),
      },
      {
        value: "NUMBER",
        label: t("moduleConfig.fieldTypes.number.label", "Số (Number)"),
      },
      {
        value: "SELECT",
        label: t(
          "moduleConfig.fieldTypes.select.label",
          "Lựa chọn (Dropdown Select)",
        ),
      },
      {
        value: "DATE",
        label: t("moduleConfig.fieldTypes.date.label", "Ngày tháng (Date)"),
      },
      {
        value: "CHECKBOX",
        label: t(
          "moduleConfig.fieldTypes.checkbox.label",
          "Hộp kiểm (Checkbox)",
        ),
      },
    ];
  }, [t]);

  // Add option handler
  const handleAddOption = () => {
    const key = newOptionKey.trim().toUpperCase();
    const lblVi = (newOptionLabels.vi || "").trim();
    const lblEn = (newOptionLabels.en || "").trim();

    if (!key) {
      toast.error(t("moduleConfig.optionRequired", "Vui lòng nhập Mã option"));
      return;
    }
    if (!lblVi) {
      toast.error(
        t(
          "moduleConfig.optionLabelRequired",
          "Vui lòng nhập Tên hiển thị (Tiếng Việt)",
        ),
      );
      return;
    }

    if (attrOptions.some((o) => o.value.toUpperCase() === key)) {
      toast.error(
        t("moduleConfig.optionKeyDuplicate", `Mã option "${key}" đã tồn tại.`),
      );
      return;
    }

    const newOpt: ModuleAttributeOption = {
      value: key,
      label: lblVi,
      labelEn: lblEn || undefined,
      labels: {
        vi: lblVi,
        en: lblEn || undefined,
      },
      parentValue: newOptionParentValue || undefined,
    };

    setAttrOptions((prev) => [...prev, newOpt]);
    setNewOptionKey("");
    setNewOptionLabels({ vi: "", en: "" });
    setNewOptionParentValue("");
  };

  const handleRemoveOption = (opt: ModuleAttributeOption) => {
    const usedCount = optionsUsage[opt.value] || 0;
    if (usedCount > 0) {
      toast.error(
        t(
          "moduleConfig.optionInUseTooltip",
          `Đang có ${usedCount} bản ghi sử dụng tùy chọn này, không thể xóa`,
        ),
      );
      return;
    }
    setAttrOptions((prev) => prev.filter((o) => o.value !== opt.value));
    setDeleteOptionTarget(null);
  };

  // Mutation: Create or Update Attribute Def
  const saveMutation = useMutation({
    mutationFn: async () => {
      const nameVi = (attrNames.vi || "").trim();
      const nameEn = (attrNames.en || "").trim();
      const cleanCode = attrCode.trim().toLowerCase();

      if (!cleanCode) {
        throw new Error(
          t("moduleConfig.attrValidation", "Vui lòng nhập Mã thuộc tính"),
        );
      }
      if (!nameVi) {
        throw new Error(
          t(
            "moduleConfig.attrValidation",
            "Vui lòng nhập Tên hiển thị thuộc tính",
          ),
        );
      }
      if (scopeType === "CATEGORY" && !categoryId) {
        throw new Error(
          t("moduleConfig.selectCategoryPlaceholder", "Vui lòng chọn danh mục"),
        );
      }
      if (attrFieldType === "SELECT" && attrOptions.length === 0) {
        throw new Error(
          t(
            "moduleConfig.selectOptionsRequired",
            "Kiểu Combobox yêu cầu ít nhất 1 option lựa chọn.",
          ),
        );
      }

      if (isCreate) {
        const payload: CreateModuleAttributeDefPayload = {
          code: cleanCode,
          name: nameVi,
          nameEn: nameEn || undefined,
          fieldType: attrFieldType,
          isGlobal: scopeType === "GLOBAL",
          moduleKeyGlobal:
            scopeType === "GLOBAL" ? selectedModuleKey : undefined,
          categoryId: scopeType === "CATEGORY" ? categoryId : null,
          parentAttrCode: attrParentAttrCode || null,
          options: attrFieldType === "SELECT" ? attrOptions : undefined,
          isRequired: attrRequired,
          isActive: attrActive,
          sortOrder: attrSortOrder,
        };
        return moduleConfigApi.createAttributeDef(payload);
      } else if (fieldRow) {
        const payload: UpdateModuleAttributeDefPayload = {
          code: cleanCode,
          name: nameVi,
          nameEn: nameEn || undefined,
          parentAttrCode: attrParentAttrCode || null,
          fieldType: attrFieldType,
          options: attrFieldType === "SELECT" ? attrOptions : undefined,
          isRequired: attrRequired,
          isActive: attrActive,
          sortOrder: attrSortOrder,
        };
        return moduleConfigApi.updateAttributeDef(fieldRow.id, payload);
      }
    },
    onSuccess: () => {
      toast.success(
        isCreate
          ? t("moduleConfig.attrCreated", "Tạo thuộc tính thành công")
          : t("moduleConfig.attrUpdated", "Cập nhật thuộc tính thành công"),
      );
      queryClient.invalidateQueries({
        queryKey: ["custom-fields-all-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["custom-fields-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-entity-values"],
      });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Lỗi lưu thuộc tính",
      );
    },
  });

  // Simulated Attribute Def for Live Preview
  const previewAttributeDef: ModuleAttributeDef = useMemo(() => {
    return {
      id: fieldRow?.id || "preview-id",
      code: attrCode || "field_code",
      name: attrNames.vi || "Tên trường tùy chỉnh",
      nameEn: attrNames.en || null,
      fieldType: attrFieldType,
      isGlobal: scopeType === "GLOBAL",
      moduleKeyGlobal: selectedModuleKey,
      categoryId: scopeType === "CATEGORY" ? categoryId : null,
      parentAttrCode: attrParentAttrCode || null,
      options: attrFieldType === "SELECT" ? attrOptions : null,
      sortOrder: attrSortOrder,
      isRequired: attrRequired,
      isActive: attrActive,
      isSystem: Boolean(fieldRow?.isSystem),
    };
  }, [
    fieldRow,
    attrCode,
    attrNames,
    attrFieldType,
    scopeType,
    selectedModuleKey,
    categoryId,
    attrParentAttrCode,
    attrOptions,
    attrSortOrder,
    attrRequired,
    attrActive,
  ]);

  const previewDefs = useMemo(() => {
    const otherDefs = moduleGlobalDefs.filter(
      (d) => !fieldRow || d.id !== fieldRow.id,
    );
    return [...otherDefs, previewAttributeDef];
  }, [moduleGlobalDefs, fieldRow, previewAttributeDef]);

  const isSystem = Boolean(fieldRow?.isSystem);
  const isInUse = (fieldRow?.usageCount || 0) > 0;

  const drawerActions: DrawerAction[] = useMemo(() => {
    if (isView) {
      return [
        {
          label: t("common.edit", "Chỉnh sửa"),
          onClick: () => setMode?.("edit"),
          variant: "outline",
        },
      ];
    }
    return [
      {
        label: t("common.cancel", "Hủy"),
        onClick: onClose,
        variant: "ghost",
        disabled: saveMutation.isPending,
      },
      {
        label: t("common.save", "Lưu cấu hình"),
        onClick: () => saveMutation.mutate(),
        primary: true,
        loading: saveMutation.isPending,
      },
    ];
  }, [isView, setMode, onClose, saveMutation, t]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode={isView ? "view" : "edit"}
        onClose={onClose}
        title={
          isCreate
            ? t("moduleConfig.addAttr", "Tạo trường tùy chỉnh mới")
            : isView
              ? t("moduleConfig.viewAttr", "Chi tiết trường tùy chỉnh")
              : t("moduleConfig.editAttr", "Chỉnh sửa trường tùy chỉnh")
        }
        subtitle={`${fieldRow ? fieldRow.code : "Dynamic Custom Field"} — ${selectedModuleKey}`}
        icon={<Settings2 className="w-4 h-4 text-primary" />}
        layout="2-columns"
        size="lg"
        actions={drawerActions}
        leftPanel={
          <div className="space-y-5">
            {/* System Notice Warning */}
            {isSystem && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1">
                  <span className="font-semibold">
                    {t("moduleConfig.systemAttributes", "Thuộc tính hệ thống")}:
                  </span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {t(
                      "moduleConfig.systemAttrNotice",
                      "Mã và Kiểu dữ liệu được cố định để bảo vệ tính toàn vẹn dữ liệu. Bạn có thể tùy chỉnh Tên hiển thị, Ràng buộc bắt buộc và Danh sách các lựa chọn (Options).",
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Section 1: Phân hệ & Phạm vi */}
            <DrawerSection
              title={t(
                "moduleConfig.moduleScopeSection",
                "1. PHÂN HỆ & PHẠM VI ÁP DỤNG",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <DrawerField
                  label={t("moduleConfig.targetModule", "Phân hệ áp dụng")}
                  required
                >
                  <Combobox
                    options={moduleComboboxOptions}
                    value={selectedModuleKey}
                    onChange={(val) => setSelectedModuleKey(val)}
                    disabled={!isCreate}
                    placeholder={t("common.select", "Chọn phân hệ...")}
                  />
                </DrawerField>

                <DrawerField
                  label={t("moduleConfig.scopeType", "Phạm vi trường")}
                  required
                >
                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="scopeType"
                        value="GLOBAL"
                        checked={scopeType === "GLOBAL"}
                        onChange={() => setScopeType("GLOBAL")}
                        disabled={!isCreate || isSystem}
                        className="accent-primary"
                      />
                      <span className="font-medium">
                        {t("moduleConfig.globalScope", "Toàn phân hệ (Global)")}
                      </span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input
                        type="radio"
                        name="scopeType"
                        value="CATEGORY"
                        checked={scopeType === "CATEGORY"}
                        onChange={() => setScopeType("CATEGORY")}
                        disabled={!isCreate || isSystem}
                        className="accent-primary"
                      />
                      <span className="font-medium">
                        {t("moduleConfig.categoryScope", "Theo danh mục")}
                      </span>
                    </label>
                  </div>
                </DrawerField>
              </div>

              {scopeType === "CATEGORY" && (
                <div className="pt-2">
                  <DrawerField
                    label={t(
                      "moduleConfig.categoryLabel",
                      "Danh mục trực thuộc",
                    )}
                    required
                  >
                    <Combobox
                      options={categoryComboboxOptions}
                      value={categoryId}
                      onChange={(val) => setCategoryId(val)}
                      disabled={!isCreate || isView}
                      placeholder={t(
                        "moduleConfig.selectCategoryPlaceholder",
                        "-- Chọn danh mục --",
                      )}
                    />
                  </DrawerField>
                </div>
              )}
            </DrawerSection>

            {/* Section 2: Thông tin định danh thuộc tính */}
            <DrawerSection
              title={t(
                "moduleConfig.attrInfoSection",
                "2. THÔNG TIN ĐỊNH DANH & KIỂU DỮ LIỆU",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <DrawerField
                  label={t("moduleConfig.attrCode", "Mã thuộc tính (Code)")}
                  required
                  labelExtra={
                    <span className="text-[10px] text-muted-foreground font-normal">
                      snake_case
                    </span>
                  }
                >
                  <input
                    type="text"
                    className={cn(inputCls, "font-mono text-xs")}
                    value={attrCode}
                    onChange={(e) =>
                      setAttrCode(
                        e.target.value.toLowerCase().replace(/\s+/g, "_"),
                      )
                    }
                    disabled={!isCreate || isSystem || isInUse}
                    placeholder="custom_field_code"
                  />
                </DrawerField>

                <DrawerField
                  label={t("moduleConfig.attrFieldType", "Kiểu dữ liệu")}
                  required
                >
                  <Combobox
                    options={fieldTypeOptions}
                    value={attrFieldType}
                    onChange={(val) =>
                      setAttrFieldType(val as ModuleAttributeFieldType)
                    }
                    disabled={!isCreate || isSystem || isInUse}
                    placeholder={t(
                      "moduleConfig.selectTypePlaceholder",
                      "Chọn kiểu dữ liệu",
                    )}
                  />
                </DrawerField>
              </div>

              <div className="pt-2">
                <DrawerField
                  label={t(
                    "moduleConfig.attrNameMultilingual",
                    "Tên hiển thị đa ngôn ngữ",
                  )}
                  required
                >
                  <MultilingualInput
                    values={attrNames}
                    onChange={(vals) => setAttrNames(vals)}
                    disabled={isView}
                    placeholder={(lang) =>
                      lang.code === "vi"
                        ? t(
                            "moduleConfig.attrName",
                            "Tên thuộc tính (Tiếng Việt)...",
                          )
                        : t(
                            "moduleConfig.attrNameEn",
                            "Field Name (English)...",
                          )
                    }
                  />
                </DrawerField>
              </div>

              {/* Parent dependency for cascading select */}
              {attrFieldType === "SELECT" && (
                <div className="pt-2">
                  <DrawerField
                    label={t(
                      "moduleConfig.parentAttrDependency",
                      "Phụ thuộc vào thuộc tính cha (Cascading)",
                    )}
                    labelExtra={
                      <span className="text-[10px] text-muted-foreground font-normal">
                        Áp dụng cho Dropdown phụ thuộc Dropdown cha
                      </span>
                    }
                  >
                    <Combobox
                      options={parentSelectAttrOptions}
                      value={attrParentAttrCode}
                      onChange={(val) => setAttrParentAttrCode(val)}
                      disabled={isView || isSystem}
                    />
                  </DrawerField>
                </div>
              )}
            </DrawerSection>

            {/* Section 3: Quản lý danh sách tùy chọn (Khi fieldType === 'SELECT') */}
            {attrFieldType === "SELECT" && (
              <DrawerSection
                title={
                  <div className="flex items-center justify-between w-full pr-2">
                    <span>
                      {t(
                        "moduleConfig.selectOptionsTitle",
                        "3. DANH SÁCH TÙY CHỌN (OPTIONS)",
                      )}
                    </span>
                    <NeutralCountBadge count={attrOptions.length} />
                  </div>
                }
                collapsible
                defaultCollapsed={false}
              >
                {!isView && (
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border/60 space-y-2.5 mb-3">
                    <span className="text-[11px] font-semibold text-foreground block">
                      {t("moduleConfig.addNewOption", "Thêm tùy chọn mới")}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        className={cn(inputCls, "font-mono text-xs uppercase")}
                        placeholder="MÃ KEY (VD: OPT_1)"
                        value={newOptionKey}
                        onChange={(e) =>
                          setNewOptionKey(
                            e.target.value.toUpperCase().replace(/\s+/g, "_"),
                          )
                        }
                      />
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Tên Tiếng Việt (*)"
                        value={newOptionLabels.vi || ""}
                        onChange={(e) =>
                          setNewOptionLabels((prev) => ({
                            ...prev,
                            vi: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="text"
                        className={inputCls}
                        placeholder="Tên Tiếng Anh (English)"
                        value={newOptionLabels.en || ""}
                        onChange={(e) =>
                          setNewOptionLabels((prev) => ({
                            ...prev,
                            en: e.target.value,
                          }))
                        }
                      />
                    </div>

                    {attrParentAttrCode && (
                      <div className="pt-1">
                        <Combobox
                          options={[
                            {
                              value: "",
                              label: "— Thuộc mọi giá trị của trường cha —",
                            },
                            ...parentOptionValues,
                          ]}
                          value={newOptionParentValue}
                          onChange={(val) => setNewOptionParentValue(val)}
                          placeholder="Chọn giá trị cha tương ứng..."
                        />
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddOption}
                        className="gap-1.5 text-xs h-7"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        {t("common.add", "Thêm tùy chọn")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Options Table */}
                <div className="border border-border/60 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-muted-foreground font-medium border-b border-border/60">
                      <tr>
                        <th className="py-2 px-3 w-10 text-center">#</th>
                        <th className="py-2 px-3 w-32 font-mono">Mã Key</th>
                        <th className="py-2 px-3">Tên Tiếng Việt</th>
                        <th className="py-2 px-3">Tên Tiếng Anh</th>
                        {attrParentAttrCode && (
                          <th className="py-2 px-3">Giá trị cha</th>
                        )}
                        <th className="py-2 px-3 w-20 text-center">Sử dụng</th>
                        {!isView && (
                          <th className="py-2 px-3 w-12 text-center"></th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {attrOptions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={attrParentAttrCode ? 7 : 6}
                            className="py-6 text-center text-muted-foreground italic text-xs"
                          >
                            {t(
                              "moduleConfig.noOptionsHint",
                              "Chưa có tùy chọn nào.",
                            )}
                          </td>
                        </tr>
                      ) : (
                        attrOptions.map((opt, idx) => {
                          const usedCount = optionsUsage[opt.value] || 0;
                          return (
                            <tr
                              key={opt.value}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-900/30"
                            >
                              <td className="py-2 px-3 text-center text-muted-foreground font-mono text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-3 font-mono font-semibold text-primary">
                                {opt.value}
                              </td>
                              <td className="py-2 px-3 font-medium text-foreground">
                                {opt.label || opt.labels?.vi}
                              </td>
                              <td className="py-2 px-3 text-muted-foreground">
                                {opt.labelEn || opt.labels?.en || "—"}
                              </td>
                              {attrParentAttrCode && (
                                <td className="py-2 px-3">
                                  {opt.parentValue ? (
                                    <Badge
                                      variant="secondary"
                                      className="font-mono text-[10px]"
                                    >
                                      {opt.parentValue}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted-foreground text-[11px]">
                                      —
                                    </span>
                                  )}
                                </td>
                              )}
                              <td className="py-2 px-3 text-center">
                                {usedCount > 0 ? (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] font-mono"
                                  >
                                    {usedCount}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-[11px]">
                                    0
                                  </span>
                                )}
                              </td>
                              {!isView && (
                                <td className="py-2 px-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                    onClick={() => setDeleteOptionTarget(opt)}
                                    disabled={usedCount > 0}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </DrawerSection>
            )}

            {/* Section 4: Cài đặt nâng cao & Bắt buộc */}
            <DrawerSection
              title={t(
                "moduleConfig.attrConstraintSection",
                "4. RÀNG BUỘC & TRẠNG THÁI",
              )}
              collapsible
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="drawer-attr-required"
                    checked={attrRequired}
                    onCheckedChange={(c) => setAttrRequired(Boolean(c))}
                    disabled={isView}
                  />
                  <label
                    htmlFor="drawer-attr-required"
                    className="text-xs text-foreground cursor-pointer font-medium select-none"
                  >
                    {t("moduleConfig.isRequired", "Bắt buộc nhập (*)")}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="drawer-attr-active"
                    checked={attrActive}
                    onCheckedChange={(c) => setAttrActive(Boolean(c))}
                    disabled={isView}
                  />
                  <label
                    htmlFor="drawer-attr-active"
                    className="text-xs text-foreground cursor-pointer font-medium select-none"
                  >
                    {t("common.active", "Hoạt động")}
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">
                    {t("moduleConfig.sortOrder", "Thứ tự:")}
                  </span>
                  <input
                    type="number"
                    className={cn(inputCls, "w-20 text-center")}
                    value={attrSortOrder}
                    onChange={(e) =>
                      setAttrSortOrder(parseInt(e.target.value, 10) || 0)
                    }
                    disabled={isView}
                  />
                </div>
              </div>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Eye className="w-4 h-4 text-primary" />
                <span>
                  {t("moduleConfig.livePreviewTitle", "Mô phỏng Form Thực tế")}
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-mono"
              >
                {selectedModuleKey}
              </Badge>
            </div>

            <ModuleLivePreviewPanel
              attributes={previewDefs}
              moduleKey={selectedModuleKey}
              resetKey={Date.now()}
            />
          </div>
        }
      />

      {/* Confirm Modal for Option Delete */}
      <ConfirmModal
        open={Boolean(deleteOptionTarget)}
        onCancel={() => setDeleteOptionTarget(null)}
        onConfirm={() =>
          deleteOptionTarget && handleRemoveOption(deleteOptionTarget)
        }
        title={t("moduleConfig.confirmDeleteOptionTitle", "Xóa tùy chọn")}
        message={t(
          "moduleConfig.confirmDeleteOptionMsg",
          `Bạn có chắc chắn muốn xóa tùy chọn "${deleteOptionTarget?.label}" (${deleteOptionTarget?.value})?`,
        )}
      />
    </>
  );
}
