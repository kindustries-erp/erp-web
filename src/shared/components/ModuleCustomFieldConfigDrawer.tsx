import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Settings,
  Tag,
  X,
  Layers,
  Power,
  PowerOff,
  Loader2,
  FileText,
  Landmark,
  Network,
  AlignLeft,
  Hash,
  ListFilter,
  Calendar,
  ToggleLeft,
  Factory,
  ShoppingCart,
  Receipt,
  Boxes,
  ClipboardCheck,
  Wrench,
  ShieldCheck,
  Eye,
  FolderKanban,
  RotateCcw,
} from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Combobox, type ComboboxOption } from "@/shared/components/Combobox";
import { PillTabs } from "@/shared/components/PillTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  moduleConfigApi,
  type ModuleKey,
  type ModuleCategory,
  type ModuleAttributeDef,
  type ModuleAttributeFieldType,
  type ModuleAttributeOption,
} from "@/core/api/moduleConfigApi";

// ============================================================================
// 1. ERP DOMAINS & MODULE REGISTRY (With full i18n support)
// ============================================================================

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

export const ERP_DOMAIN_REGISTRY: Record<ErpModuleDomain, ErpDomainDefinition> =
  {
    FINANCE: {
      domain: "FINANCE",
      titleKey: "moduleConfig.domains.finance",
      defaultTitle: "Kế toán & Tài chính",
      icon: <Landmark className="w-3.5 h-3.5" />,
    },
    PRODUCTION: {
      domain: "PRODUCTION",
      titleKey: "moduleConfig.domains.production",
      defaultTitle: "Sản xuất & Kỹ thuật",
      icon: <Factory className="w-3.5 h-3.5" />,
    },
    COMMERCE: {
      domain: "COMMERCE",
      titleKey: "moduleConfig.domains.commerce",
      defaultTitle: "Mua hàng & Bán hàng",
      icon: <ShoppingCart className="w-3.5 h-3.5" />,
    },
    INVENTORY: {
      domain: "INVENTORY",
      titleKey: "moduleConfig.domains.inventory",
      defaultTitle: "Kho vận & Tồn kho",
      icon: <Boxes className="w-3.5 h-3.5" />,
    },
    GARAGE: {
      domain: "GARAGE",
      titleKey: "moduleConfig.domains.garage",
      defaultTitle: "Garage & Dịch vụ",
      icon: <Wrench className="w-3.5 h-3.5" />,
    },
  };

export interface ErpModuleDefinition {
  key: string;
  nameKey: string;
  defaultName: string;
  domain: ErpModuleDomain;
  icon: React.ReactNode;
  descKey: string;
  defaultDesc: string;
}

export const ERP_MODULE_REGISTRY: ErpModuleDefinition[] = [
  // Kế toán & Tài chính
  {
    key: "INVOICE",
    nameKey: "moduleConfig.modules.invoice.name",
    defaultName: "Hóa đơn & Thuế",
    domain: "FINANCE",
    icon: <FileText className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.invoice.desc",
    defaultDesc: "Hóa đơn mua vào/bán ra, chi phí thuế & khấu trừ",
  },
  {
    key: "BANK_TXN",
    nameKey: "moduleConfig.modules.bankTxn.name",
    defaultName: "Sao kê & Sổ quỹ",
    domain: "FINANCE",
    icon: <Landmark className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.bankTxn.desc",
    defaultDesc: "Giao dịch ngân hàng, sổ quỹ tiền mặt, định khoản hạch toán",
  },

  // Sản xuất & Kỹ thuật
  {
    key: "BOM",
    nameKey: "moduleConfig.modules.bom.name",
    defaultName: "Định mức (BOM)",
    domain: "PRODUCTION",
    icon: <Network className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.bom.desc",
    defaultDesc: "Định mức vật tư linh kiện, phụ tùng và cụm chi tiết lắp ráp",
  },
  {
    key: "PRODUCTION",
    nameKey: "moduleConfig.modules.production.name",
    defaultName: "Lệnh sản xuất",
    domain: "PRODUCTION",
    icon: <Factory className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.production.desc",
    defaultDesc: "Tiến độ lắp ráp xe, cấp phát linh kiện & bàn giao thành phẩm",
  },

  // Mua hàng & Bán hàng
  {
    key: "PURCHASE_ORDER",
    nameKey: "moduleConfig.modules.po.name",
    defaultName: "Mua hàng (PO)",
    domain: "COMMERCE",
    icon: <ShoppingCart className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.po.desc",
    defaultDesc:
      "Đơn mua hàng, theo dõi tiến độ nhập và đối chiếu nhà cung cấp",
  },
  {
    key: "SALES_ORDER",
    nameKey: "moduleConfig.modules.so.name",
    defaultName: "Bán hàng (SO)",
    domain: "COMMERCE",
    icon: <Receipt className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.so.desc",
    defaultDesc: "Đơn đặt hàng khách lẻ, đại lý phân phối & giao hàng",
  },

  // Kho vận & Tồn kho
  {
    key: "INVENTORY_ITEM",
    nameKey: "moduleConfig.modules.item.name",
    defaultName: "Mặt hàng & SKU",
    domain: "INVENTORY",
    icon: <Boxes className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.item.desc",
    defaultDesc: "Danh mục master data mặt hàng, quy cách và đơn vị tính",
  },
  {
    key: "INVENTORY_ADJUSTMENT",
    nameKey: "moduleConfig.modules.adjustment.name",
    defaultName: "Kiểm kê kho",
    domain: "INVENTORY",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.adjustment.desc",
    defaultDesc: "Biên bản kiểm kê kho, xử lý chênh lệch thừa/thiếu tồn kho",
  },

  // Garage & Dịch vụ
  {
    key: "GARAGE_CASE",
    nameKey: "moduleConfig.modules.garageCase.name",
    defaultName: "Vụ việc Garage",
    domain: "GARAGE",
    icon: <Wrench className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.garageCase.desc",
    defaultDesc: "Hồ sơ tiếp nhận xe, lệnh dịch vụ sửa chữa & báo giá",
  },
  {
    key: "AFTER_SALES",
    nameKey: "moduleConfig.modules.afterSales.name",
    defaultName: "Bảo hành & Bàn giao",
    domain: "GARAGE",
    icon: <ShieldCheck className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.afterSales.desc",
    defaultDesc:
      "Vòng đời serial xe/pin, bàn giao xe và kích hoạt bảo hành điện tử",
  },
];

const FIELD_TYPE_OPTIONS: ComboboxOption[] = [
  {
    value: "TEXT",
    label: "Văn bản (Text)",
    subLabel: "Chuỗi ký tự tự do, ghi chú, mã hiệu",
  },
  {
    value: "NUMBER",
    label: "Số (Number)",
    subLabel: "Số lượng, kích thước, thông số kỹ thuật",
  },
  {
    value: "SELECT",
    label: "Danh sách chọn (Combobox)",
    subLabel: "Danh sách tùy chọn dropdown cố định",
  },
  {
    value: "DATE",
    label: "Ngày tháng (Date)",
    subLabel: "Thời gian, ngày cấp, hạn sử dụng",
  },
  {
    value: "CHECKBOX",
    label: "Đúng / Sai (Checkbox)",
    subLabel: "Công tắc bật/tắt (Boolean True/False)",
  },
];

const FIELD_TYPE_ICONS: Record<string, React.ReactNode> = {
  TEXT: <AlignLeft className="w-3.5 h-3.5" />,
  NUMBER: <Hash className="w-3.5 h-3.5" />,
  SELECT: <ListFilter className="w-3.5 h-3.5" />,
  DATE: <Calendar className="w-3.5 h-3.5" />,
  CHECKBOX: <ToggleLeft className="w-3.5 h-3.5" />,
};

const FIELD_TYPE_SHORT_LABELS: Record<string, string> = {
  TEXT: "Văn bản",
  NUMBER: "Số",
  SELECT: "Danh sách",
  DATE: "Ngày",
  CHECKBOX: "Đúng/Sai",
};

// ============================================================================
// 2. LIVE FORM PREVIEW COMPONENT (Cột phải liền mạch, không lồng card)
// ============================================================================

export interface ModuleLivePreviewPanelProps {
  categories: ModuleCategory[];
  moduleKey: string;
}

export function ModuleLivePreviewPanel({
  categories,
  moduleKey,
}: ModuleLivePreviewPanelProps) {
  const t = useT();
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [mockValues, setMockValues] = useState<Record<string, any>>({});

  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive !== false),
    [categories],
  );

  useEffect(() => {
    if (activeCategories.length > 0) {
      if (
        !selectedCatId ||
        !activeCategories.some((c) => c.id === selectedCatId)
      ) {
        setSelectedCatId(activeCategories[0].id);
      }
    } else {
      setSelectedCatId("");
    }
  }, [activeCategories, selectedCatId]);

  const currentCat = useMemo(
    () => activeCategories.find((c) => c.id === selectedCatId) || null,
    [activeCategories, selectedCatId],
  );

  const activeAttrs = useMemo(
    () => (currentCat?.attributeDefs || []).filter((d) => d.isActive !== false),
    [currentCat],
  );

  const currentModMeta = useMemo(
    () => ERP_MODULE_REGISTRY.find((m) => m.key === moduleKey),
    [moduleKey],
  );

  const handleFieldChange = (code: string, val: any) => {
    setMockValues((prev) => ({ ...prev, [code]: val }));
  };

  const handleResetPreview = () => {
    setMockValues({});
  };

  return (
    <div className="flex flex-col gap-3.5 text-xs">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <Eye className="w-4 h-4 text-primary" />
          <span className="font-semibold text-xs">
            {currentModMeta
              ? t(currentModMeta.nameKey, currentModMeta.defaultName)
              : moduleKey}
          </span>
        </div>
        <button
          type="button"
          onClick={handleResetPreview}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{t("common.reset", "Làm mới")}</span>
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t(
          "moduleConfig.livePreviewDesc",
          "Mô phỏng trực tiếp cách các trường tùy chỉnh sẽ hiển thị trên Drawer chứng từ thực tế.",
        )}
      </p>

      {/* Category selector for preview */}
      {activeCategories.length > 0 ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            {t(
              "moduleConfig.selectCategoryPreview",
              "Chọn danh mục thử nghiệm:",
            )}
          </label>
          <Combobox
            value={selectedCatId}
            onChange={setSelectedCatId}
            options={activeCategories.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.code})`,
            }))}
            placeholder={t(
              "moduleConfig.selectCatPlaceholder",
              "Chọn danh mục",
            )}
            allowClear={false}
          />
        </div>
      ) : (
        <div className="py-6 text-center text-muted-foreground text-[11px] bg-surface/30 rounded-lg">
          {t(
            "moduleConfig.noActiveCategoriesPreview",
            "Chưa có danh mục nào được tạo. Hãy thêm danh mục ở cột trái.",
          )}
        </div>
      )}

      {/* Fields list simulator */}
      {currentCat && (
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-foreground pb-1 border-b border-border/30">
            <span className="font-semibold">{currentCat.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {activeAttrs.length} {t("moduleConfig.attrsCount", "thuộc tính")}
            </span>
          </div>

          {activeAttrs.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-[11px] opacity-70">
              {t(
                "moduleConfig.noAttrsToPreview",
                "Danh mục này chưa có thuộc tính nào.",
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeAttrs.map((attr) => {
                const val = mockValues[attr.code];

                if (attr.fieldType === "CHECKBOX") {
                  return (
                    <div
                      key={attr.id}
                      className="flex items-center gap-2 py-1 select-none"
                    >
                      <Checkbox
                        id={`preview-attr-${attr.id}`}
                        checked={Boolean(val)}
                        onCheckedChange={(checked) =>
                          handleFieldChange(attr.code, Boolean(checked))
                        }
                      />
                      <label
                        htmlFor={`preview-attr-${attr.id}`}
                        className="text-xs text-foreground cursor-pointer font-medium"
                      >
                        {attr.name}
                        {attr.isRequired && (
                          <span className="text-destructive ml-1">*</span>
                        )}
                      </label>
                    </div>
                  );
                }

                if (attr.fieldType === "SELECT") {
                  const opts: ComboboxOption[] = (attr.options || []).map(
                    (o) => ({
                      value: o.value,
                      label: `${o.label} (${o.value})`,
                    }),
                  );
                  return (
                    <DrawerField
                      key={attr.id}
                      label={attr.name}
                      required={attr.isRequired}
                    >
                      <Combobox
                        value={val || ""}
                        onChange={(v) => handleFieldChange(attr.code, v)}
                        options={opts}
                        placeholder={t("common.select", "Chọn giá trị")}
                      />
                    </DrawerField>
                  );
                }

                return (
                  <DrawerField
                    key={attr.id}
                    label={attr.name}
                    required={attr.isRequired}
                  >
                    <input
                      type={
                        attr.fieldType === "NUMBER"
                          ? "number"
                          : attr.fieldType === "DATE"
                            ? "date"
                            : "text"
                      }
                      className={inputCls}
                      value={val ?? ""}
                      onChange={(e) =>
                        handleFieldChange(attr.code, e.target.value)
                      }
                      placeholder={
                        attr.fieldType === "NUMBER"
                          ? "0"
                          : `Nhập ${attr.name.toLowerCase()}...`
                      }
                    />
                  </DrawerField>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 3. MAIN WORKSPACE CONTENT COMPONENT (Left Panel with Group Sub-PillTabs)
// ============================================================================

export interface ModuleCustomFieldConfigContentProps {
  domainKey: ErpModuleDomain;
  activeModuleKey: string;
  onSelectModule: (key: string) => void;
  isOpen?: boolean;
}

export function ModuleCustomFieldConfigContent({
  domainKey,
  activeModuleKey,
  onSelectModule,
  isOpen = true,
}: ModuleCustomFieldConfigContentProps) {
  const t = useT();
  const queryClient = useQueryClient();

  // Modules in this domain
  const domainMods = useMemo(
    () => ERP_MODULE_REGISTRY.filter((m) => m.domain === domainKey),
    [domainKey],
  );

  // Pill tab items for this domain
  const pillTabItems = useMemo(
    () =>
      domainMods.map((m) => ({
        value: m.key,
        label: t(m.nameKey, m.defaultName),
      })),
    [domainMods, t],
  );

  // Query categories + attributes scoped by activeModuleKey
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["module-config-categories", activeModuleKey],
    queryFn: () => moduleConfigApi.getCategories(activeModuleKey),
    enabled: isOpen && !!activeModuleKey,
  });

  // Find module meta
  const currentModule = useMemo(
    () =>
      ERP_MODULE_REGISTRY.find((m) => m.key === activeModuleKey) || {
        key: String(activeModuleKey),
        nameKey: "",
        defaultName: String(activeModuleKey),
        domain: domainKey,
        icon: <FolderKanban className="w-4 h-4" />,
        descKey: "",
        defaultDesc: "Cấu hình danh mục và trường mở rộng",
      },
    [activeModuleKey, domainKey],
  );

  const domainMeta = ERP_DOMAIN_REGISTRY[domainKey];

  // State: Category Form (Create / Edit)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ModuleCategory | null>(
    null,
  );
  const [catCode, setCatCode] = useState("");
  const [catName, setCatName] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [deleteCatTarget, setDeleteCatTarget] = useState<ModuleCategory | null>(
    null,
  );

  // State: Attribute Form (Create / Edit)
  const [addingAttrForCatId, setAddingAttrForCatId] = useState<string | null>(
    null,
  );
  const [editingAttr, setEditingAttr] = useState<ModuleAttributeDef | null>(
    null,
  );
  const [attrCode, setAttrCode] = useState("");
  const [attrName, setAttrName] = useState("");
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);

  // Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (payload: {
      code: string;
      name: string;
      description?: string;
    }) =>
      moduleConfigApi.createCategory({
        moduleKey: activeModuleKey,
        ...payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.catCreated", "Tạo danh mục thành công"));
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catCreateError", "Lỗi tạo danh mục"),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      moduleConfigApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(
        t("moduleConfig.catUpdated", "Cập nhật danh mục thành công"),
      );
      resetCatForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catUpdateError", "Lỗi cập nhật danh mục"),
      );
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: moduleConfigApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.catDeleted", "Xóa danh mục thành công"));
      setDeleteCatTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.catDeleteDeleteError", "Lỗi xóa danh mục"),
      );
    },
  });

  const createAttrMutation = useMutation({
    mutationFn: moduleConfigApi.createAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.attrCreated", "Tạo thuộc tính thành công"));
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrCreateError", "Lỗi tạo thuộc tính"),
      );
    },
  });

  const updateAttrMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      moduleConfigApi.updateAttributeDef(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(
        t("moduleConfig.attrUpdated", "Cập nhật thuộc tính thành công"),
      );
      resetAttrForm();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrUpdateError", "Lỗi cập nhật thuộc tính"),
      );
    },
  });

  const deleteAttrMutation = useMutation({
    mutationFn: moduleConfigApi.deleteAttributeDef,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-categories", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-categories"],
      });
      queryClient.invalidateQueries({
        queryKey: ["bom-config-categories"],
      });
      toast.success(t("moduleConfig.attrDeleted", "Xóa thuộc tính thành công"));
      setDeleteAttrTarget(null);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
          t("moduleConfig.attrDeleteError", "Lỗi xóa thuộc tính"),
      );
    },
  });

  // Handlers for Category
  const openCreateCategory = () => {
    setEditingCategory(null);
    setCatCode("");
    setCatName("");
    setCatDescription("");
    setIsCreatingCategory(true);
  };

  const openEditCategory = (cat: ModuleCategory) => {
    setIsCreatingCategory(false);
    setEditingCategory(cat);
    setCatCode(cat.code);
    setCatName(cat.name);
    setCatDescription(cat.description || "");
  };

  const resetCatForm = () => {
    setIsCreatingCategory(false);
    setEditingCategory(null);
    setCatCode("");
    setCatName("");
    setCatDescription("");
  };

  const handleToggleCategoryActive = (cat: ModuleCategory) => {
    const nextActive = !cat.isActive;
    updateCategoryMutation.mutate({
      id: cat.id,
      payload: { isActive: nextActive },
    });
  };

  const handleSaveCategory = () => {
    const trimmedCode = catCode.trim().toUpperCase();
    const trimmedName = catName.trim();

    if (!trimmedCode || !trimmedName) {
      toast.error(
        t(
          "moduleConfig.catValidation",
          "Vui lòng nhập đầy đủ mã và tên danh mục",
        ),
      );
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.code.toUpperCase() === trimmedCode &&
        (!editingCategory || c.id !== editingCategory.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "moduleConfig.catCodeDuplicate",
          `Mã danh mục "${trimmedCode}" đã tồn tại. Vui lòng chọn mã khác.`,
        ),
      );
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        payload: {
          code: trimmedCode,
          name: trimmedName,
          description: catDescription.trim() || undefined,
        },
      });
    } else {
      createCategoryMutation.mutate({
        code: trimmedCode,
        name: trimmedName,
        description: catDescription.trim() || undefined,
      });
    }
  };

  // Handlers for Attribute
  const openCreateAttr = (categoryId: string) => {
    setEditingAttr(null);
    setAddingAttrForCatId(categoryId);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const openEditAttr = (attr: ModuleAttributeDef) => {
    setAddingAttrForCatId(null);
    setEditingAttr(attr);
    setAttrCode(attr.code);
    setAttrName(attr.name);
    setAttrFieldType(attr.fieldType);
    setAttrRequired(attr.isRequired || false);
    setAttrOptions(attr.options || []);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const resetAttrForm = () => {
    setAddingAttrForCatId(null);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleAddOption = () => {
    const key = newOptionKey.trim().toUpperCase();
    const label = newOptionLabel.trim();

    if (!key || !label) {
      toast.error(
        t(
          "moduleConfig.optionRequired",
          "Vui lòng nhập cả Mã (Key) và Tên hiển thị (Label)",
        ),
      );
      return;
    }

    if (attrOptions.some((o) => o.value === key)) {
      toast.error(
        t(
          "moduleConfig.optionKeyDuplicate",
          `Mã option "${key}" đã tồn tại. Vui lòng chọn mã khác.`,
        ),
      );
      return;
    }

    setAttrOptions([...attrOptions, { value: key, label }]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleRemoveOption = (index: number) => {
    setAttrOptions(attrOptions.filter((_, i) => i !== index));
  };

  const handleToggleAttrActive = (attr: ModuleAttributeDef) => {
    const nextActive = !attr.isActive;
    updateAttrMutation.mutate({
      id: attr.id,
      payload: { isActive: nextActive },
    });
  };

  const handleSaveAttribute = () => {
    const targetCatId = addingAttrForCatId || editingAttr?.categoryId;
    if (!targetCatId) return;

    const trimmedCode = attrCode.trim().toLowerCase();
    const trimmedName = attrName.trim();

    if (!trimmedCode || !trimmedName) {
      toast.error(
        t(
          "moduleConfig.attrValidation",
          "Vui lòng nhập đầy đủ mã và tên thuộc tính",
        ),
      );
      return;
    }

    const currentCat = categories.find((c) => c.id === targetCatId);
    const existingDefs = currentCat?.attributeDefs || [];
    const isDuplicate = existingDefs.some(
      (d) =>
        d.code.toLowerCase() === trimmedCode &&
        (!editingAttr || d.id !== editingAttr.id),
    );
    if (isDuplicate) {
      toast.error(
        t(
          "moduleConfig.attrCodeDuplicate",
          `Mã thuộc tính "${trimmedCode}" đã tồn tại trong danh mục này.`,
        ),
      );
      return;
    }

    if (attrFieldType === "SELECT" && attrOptions.length === 0) {
      toast.error(
        t(
          "moduleConfig.selectOptionsRequired",
          "Kiểu Combobox yêu cầu ít nhất 1 option lựa chọn.",
        ),
      );
      return;
    }

    if (editingAttr) {
      updateAttrMutation.mutate({
        id: editingAttr.id,
        payload: {
          code: trimmedCode,
          name: trimmedName,
          fieldType: attrFieldType,
          isRequired: attrRequired,
          options: attrFieldType === "SELECT" ? attrOptions : null,
        },
      });
    } else {
      createAttrMutation.mutate({
        categoryId: targetCatId,
        code: trimmedCode,
        name: trimmedName,
        fieldType: attrFieldType,
        isRequired: attrRequired,
        options: attrFieldType === "SELECT" ? attrOptions : undefined,
      });
    }
  };

  const totalAttrs = categories.reduce(
    (sum, c) => sum + (c.attributeDefs?.length || 0),
    0,
  );

  const moduleName = currentModule.nameKey
    ? t(currentModule.nameKey, currentModule.defaultName)
    : currentModule.defaultName;
  const moduleDesc = currentModule.descKey
    ? t(currentModule.descKey, currentModule.defaultDesc)
    : currentModule.defaultDesc;

  return (
    <>
      <div className="flex flex-col gap-4 pb-6">
        {/* Group Sub-Tabs (PillTabs - Standard ERP Style like Hình 2) */}
        {domainMods.length > 1 && (
          <div className="flex items-center justify-start pb-0.5">
            <PillTabs
              className="w-full sm:w-auto shrink-0"
              listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
              triggerClassName="h-7 px-4 text-xs rounded-full"
              items={pillTabItems}
              value={activeModuleKey}
              onValueChange={onSelectModule}
              hideBorder
            />
          </div>
        )}

        {/* Header Description Section */}
        <DrawerSection
          title={
            <div className="flex items-center gap-2">
              <span className="text-primary">{currentModule.icon}</span>
              <span>{moduleName}</span>
              <span className="text-xs font-normal text-muted-foreground font-mono">
                ({currentModule.key})
              </span>
            </div>
          }
          collapsible
          defaultCollapsed={false}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-2 min-w-0">
                {domainMeta && (
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {t(domainMeta.titleKey, domainMeta.defaultTitle)}
                  </Badge>
                )}
                <p className="truncate">{moduleDesc}</p>
              </div>

              {!isCreatingCategory && !editingCategory && (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={openCreateCategory}
                  className="flex items-center gap-1 text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t("moduleConfig.addCategory", "Thêm danh mục")}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {categories.length}
                  </span>
                  <span>{t("moduleConfig.categoriesCount", "danh mục")}</span>
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">
                    {totalAttrs}
                  </span>
                  <span>{t("moduleConfig.attrsCount", "thuộc tính")}</span>
                </span>
              </div>

              {(isCreatingCategory || editingCategory) && (
                <span className="text-xs text-primary font-medium italic">
                  ✎{" "}
                  {isCreatingCategory
                    ? t(
                        "moduleConfig.creatingCategoryHint",
                        "Đang tạo danh mục mới...",
                      )
                    : t(
                        "moduleConfig.editingCategoryHint",
                        `Đang sửa: ${editingCategory?.name}`,
                      )}
                </span>
              )}
            </div>
          </div>
        </DrawerSection>

        {/* Category Form Section (Create / Edit Category) */}
        {(isCreatingCategory || editingCategory) && (
          <DrawerSection
            title={
              editingCategory
                ? t("moduleConfig.editCategory", "Chỉnh sửa danh mục")
                : t("moduleConfig.newCategory", "Tạo danh mục mới")
            }
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-3 p-3 bg-surface/40 rounded-xl border border-dashed border-border/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <DrawerField
                  label={t("moduleConfig.catCode", "Mã danh mục")}
                  required
                >
                  <input
                    type="text"
                    className={inputCls}
                    value={catCode}
                    onChange={(e) => setCatCode(e.target.value)}
                    placeholder="VD: CAR, ACC, GENERAL"
                  />
                </DrawerField>
                <DrawerField
                  label={t("moduleConfig.catName", "Tên danh mục")}
                  required
                >
                  <input
                    type="text"
                    className={inputCls}
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="VD: Xe điện, Phụ kiện..."
                  />
                </DrawerField>
              </div>
              <DrawerField label={t("moduleConfig.catDescription", "Mô tả")}>
                <textarea
                  rows={2}
                  className={inputCls}
                  value={catDescription}
                  onChange={(e) => setCatDescription(e.target.value)}
                  placeholder="Mô tả chi tiết về danh mục..."
                />
              </DrawerField>
              <div className="flex items-center justify-end gap-2 mt-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={resetCatForm}
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {t("common.cancel", "Hủy")}
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveCategory}
                  disabled={
                    createCategoryMutation.isPending ||
                    updateCategoryMutation.isPending
                  }
                >
                  {createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                  ) : null}
                  {editingCategory
                    ? t("common.save", "Lưu")
                    : t("common.create", "Tạo mới")}
                </Button>
              </div>
            </div>
          </DrawerSection>
        )}

        {/* Loading & Error states */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs">
              {t("common.loading", "Đang tải cấu hình...")}
            </span>
          </div>
        )}

        {isError && (
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs">
            {t(
              "moduleConfig.loadError",
              "Không thể tải danh sách cấu hình danh mục & thuộc tính.",
            )}
          </div>
        )}

        {/* List Categories & Attributes Section */}
        {!isLoading && categories.length === 0 && !isCreatingCategory && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground p-6">
            <Layers className="w-8 h-8 opacity-40 mb-2" />
            <p className="text-xs font-medium">
              {t(
                "moduleConfig.noCategories",
                "Chưa có danh mục nào được định nghĩa.",
              )}
            </p>
            <p className="text-[11px] opacity-70 mt-1">
              {t(
                "moduleConfig.noCategoriesHint",
                "Bấm 'Thêm danh mục' ở trên để bắt đầu cấu hình.",
              )}
            </p>
          </div>
        )}

        {categories.map((cat) => {
          const defs = cat.attributeDefs || [];
          const isAddingAttr = addingAttrForCatId === cat.id;

          return (
            <DrawerSection
              key={cat.id}
              title={`${cat.name} (${cat.code})`}
              collapsible
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* Category Header Controls */}
                <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface/40 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge
                      variant={cat.isActive ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {cat.isActive
                        ? t("common.active", "Đang dùng")
                        : t("common.inactive", "Ngừng dùng")}
                    </Badge>
                    {cat.description && (
                      <span className="text-xs text-muted-foreground truncate">
                        {cat.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip
                      content={
                        cat.isActive
                          ? t("common.deactivate", "Ngừng hoạt động")
                          : t("common.activate", "Kích hoạt lại")
                      }
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => handleToggleCategoryActive(cat)}
                      >
                        {cat.isActive ? (
                          <Power className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </Tooltip>
                    <Tooltip content={t("common.edit", "Chỉnh sửa")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7"
                        onClick={() => openEditCategory(cat)}
                      >
                        <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </Tooltip>
                    <Tooltip content={t("common.delete", "Xóa danh mục")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteCatTarget(cat)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                {/* Attribute Form (Inside Category) */}
                {(isAddingAttr ||
                  (editingAttr && editingAttr.categoryId === cat.id)) && (
                  <div className="p-3.5 bg-surface/80 rounded-xl border border-border/80 flex flex-col gap-3 mt-1 shadow-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-primary" />
                        {editingAttr
                          ? t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")
                          : t("moduleConfig.addAttr", "Thêm thuộc tính")}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-6 h-6"
                        onClick={resetAttrForm}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <DrawerField
                        label={t("moduleConfig.attrCode", "Mã thuộc tính")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          value={attrCode}
                          onChange={(e) => setAttrCode(e.target.value)}
                          placeholder="VD: color, battery_type"
                          disabled={
                            !!editingAttr && (editingAttr.usageCount || 0) > 0
                          }
                        />
                      </DrawerField>

                      <DrawerField
                        label={t("moduleConfig.attrName", "Tên hiển thị")}
                        required
                      >
                        <input
                          type="text"
                          className={inputCls}
                          value={attrName}
                          onChange={(e) => setAttrName(e.target.value)}
                          placeholder="VD: Màu sắc, Loại pin..."
                        />
                      </DrawerField>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                      {/* Standard Combobox for Field Type */}
                      <DrawerField
                        label={t("moduleConfig.attrFieldType", "Kiểu dữ liệu")}
                        required
                      >
                        <Combobox
                          options={FIELD_TYPE_OPTIONS}
                          value={attrFieldType}
                          onChange={(v) =>
                            setAttrFieldType(v as ModuleAttributeFieldType)
                          }
                          disabled={
                            !!editingAttr && (editingAttr.usageCount || 0) > 0
                          }
                          placeholder={t(
                            "moduleConfig.selectTypePlaceholder",
                            "Chọn kiểu dữ liệu",
                          )}
                          allowClear={false}
                        />
                      </DrawerField>

                      <div className="flex items-center gap-2 pb-2">
                        <Checkbox
                          id={`attr-req-${cat.id}`}
                          checked={attrRequired}
                          onCheckedChange={(checked) =>
                            setAttrRequired(Boolean(checked))
                          }
                        />
                        <label
                          htmlFor={`attr-req-${cat.id}`}
                          className="text-xs text-foreground cursor-pointer select-none font-medium"
                        >
                          {t(
                            "moduleConfig.isRequired",
                            "Bắt buộc nhập (Required)",
                          )}
                        </label>
                      </div>
                    </div>

                    {/* SELECT Options builder */}
                    {attrFieldType === "SELECT" && (
                      <div className="p-3 bg-surface/50 rounded-lg border border-border/60 flex flex-col gap-2">
                        <span className="text-xs font-semibold text-foreground">
                          {t(
                            "moduleConfig.selectOptionsTitle",
                            "Danh sách tùy chọn (Options)",
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            className={inputCls}
                            value={newOptionKey}
                            onChange={(e) => setNewOptionKey(e.target.value)}
                            placeholder="Mã (Key, VD: RED)"
                          />
                          <input
                            type="text"
                            className={inputCls}
                            value={newOptionLabel}
                            onChange={(e) => setNewOptionLabel(e.target.value)}
                            placeholder="Tên (Label, VD: Màu đỏ)"
                          />
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleAddOption}
                            className="shrink-0 text-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            {t("common.add", "Thêm")}
                          </Button>
                        </div>

                        {attrOptions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {attrOptions.map((opt, idx) => (
                              <Badge
                                key={opt.value}
                                variant="secondary"
                                className="text-xs py-1 px-2 flex items-center gap-1.5"
                              >
                                <span>{opt.label}</span>
                                <span className="text-[10px] opacity-60">
                                  ({opt.value})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(idx)}
                                  className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 mt-1 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={resetAttrForm}
                        disabled={
                          createAttrMutation.isPending ||
                          updateAttrMutation.isPending
                        }
                      >
                        {t("common.cancel", "Hủy")}
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleSaveAttribute}
                        disabled={
                          createAttrMutation.isPending ||
                          updateAttrMutation.isPending
                        }
                      >
                        {createAttrMutation.isPending ||
                        updateAttrMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                        ) : null}
                        {editingAttr
                          ? t("common.save", "Lưu")
                          : t("common.create", "Tạo mới")}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Attribute List */}
                <div className="flex flex-col gap-1.5 mt-1">
                  {defs.length === 0 && !isAddingAttr && (
                    <div className="py-3 text-center text-muted-foreground text-xs opacity-70">
                      {t(
                        "moduleConfig.noAttrs",
                        "Chưa có thuộc tính nào trong danh mục này.",
                      )}
                    </div>
                  )}

                  {defs.map((attr) => (
                    <div
                      key={attr.id}
                      className="flex items-center justify-between px-3 py-2 bg-surface/40 hover:bg-surface rounded-lg text-xs transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge
                          variant="outline"
                          className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface/60 border-border/60"
                        >
                          {FIELD_TYPE_ICONS[attr.fieldType]}
                          <span>
                            {FIELD_TYPE_SHORT_LABELS[attr.fieldType] ||
                              attr.fieldType}
                          </span>
                        </Badge>
                        <span className="font-medium text-foreground truncate">
                          {attr.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          ({attr.code})
                        </span>
                        {attr.isRequired && (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1 py-0"
                          >
                            {t("moduleConfig.requiredBadge", "Bắt buộc")}
                          </Badge>
                        )}
                        {!attr.isActive && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0"
                          >
                            {t("common.inactive", "Ngừng dùng")}
                          </Badge>
                        )}
                        {(attr.usageCount || 0) > 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1 py-0 text-muted-foreground"
                          >
                            {attr.usageCount}{" "}
                            {t("moduleConfig.used", "đang dùng")}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Tooltip
                          content={
                            attr.isActive
                              ? t("common.deactivate", "Ngừng hoạt động")
                              : t("common.activate", "Kích hoạt lại")
                          }
                        >
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => handleToggleAttrActive(attr)}
                          >
                            {attr.isActive ? (
                              <Power className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </Button>
                        </Tooltip>
                        <Tooltip content={t("common.edit", "Chỉnh sửa")}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6"
                            onClick={() => openEditAttr(attr)}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                          </Button>
                        </Tooltip>
                        <Tooltip content={t("common.delete", "Xóa thuộc tính")}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="w-6 h-6 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteAttrTarget(attr)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  {!isAddingAttr &&
                    (!editingAttr || editingAttr.categoryId !== cat.id) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openCreateAttr(cat.id)}
                        className="w-full text-xs text-primary hover:text-primary hover:bg-primary/5 border border-dashed border-primary/30 mt-1 flex items-center justify-center gap-1 h-8"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {t("moduleConfig.addAttr", "Thêm thuộc tính")}
                      </Button>
                    )}
                </div>
              </div>
            </DrawerSection>
          );
        })}
      </div>

      {/* Delete Category Modal */}
      <ConfirmModal
        open={!!deleteCatTarget}
        title={t("moduleConfig.deleteCatTitle", "Xóa danh mục")}
        message={t(
          "moduleConfig.deleteCatMsg",
          `Bạn có chắc chắn muốn xóa danh mục "${deleteCatTarget?.name}"? Nếu có dữ liệu đang sử dụng, hệ thống sẽ yêu cầu chuyển sang Ngừng hoạt động.`,
        )}
        onConfirm={() => {
          if (deleteCatTarget) {
            deleteCategoryMutation.mutate(deleteCatTarget.id);
          }
        }}
        onCancel={() => setDeleteCatTarget(null)}
      />

      {/* Delete Attribute Modal */}
      <ConfirmModal
        open={!!deleteAttrTarget}
        title={t("moduleConfig.deleteAttrTitle", "Xóa thuộc tính")}
        message={t(
          "moduleConfig.deleteAttrMsg",
          `Bạn có chắc chắn muốn xóa thuộc tính "${deleteAttrTarget?.name}"? Nếu đã có dữ liệu sử dụng, vui lòng chuyển sang trạng thái Ngừng hoạt động.`,
        )}
        onConfirm={() => {
          if (deleteAttrTarget) {
            deleteAttrMutation.mutate(deleteAttrTarget.id);
          }
        }}
        onCancel={() => setDeleteAttrTarget(null)}
      />
    </>
  );
}

// ============================================================================
// 4. MAIN EXPORT: 2-COLUMN DRAWER WITH GROUP TABS + SUB PILL TABS + SEAMLESS PREVIEW
// ============================================================================

export interface ModuleCustomFieldConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  mode?: "unified" | "single";
  moduleKey?: ModuleKey | null;
  moduleLabel?: string;
  initialTab?: ModuleKey | string;
}

export function ModuleCustomFieldConfigDrawer({
  open,
  onClose,
  mode = "unified",
  moduleKey,
  moduleLabel,
  initialTab,
}: ModuleCustomFieldConfigDrawerProps) {
  const t = useT();

  // Query ALL categories across the ERP ecosystem to compute total attributes count per domain
  const { data: allCategories = [] } = useQuery({
    queryKey: ["module-config-all-categories"],
    queryFn: () => moduleConfigApi.getCategories(),
    enabled: open,
  });

  // Calculate total attributes count per domain for top group tab badges
  const domainAttrCounts = useMemo(() => {
    const counts: Record<ErpModuleDomain, number> = {
      FINANCE: 0,
      PRODUCTION: 0,
      COMMERCE: 0,
      INVENTORY: 0,
      GARAGE: 0,
    };

    for (const cat of allCategories) {
      const mod = ERP_MODULE_REGISTRY.find((m) => m.key === cat.moduleKey);
      if (mod) {
        const validDefs = (cat.attributeDefs || []).filter((d) => !d.isDeleted);
        counts[mod.domain] += validDefs.length;
      }
    }
    return counts;
  }, [allCategories]);

  // Initial active module key
  const [activeModuleKey, setActiveModuleKey] = useState<string>(() => {
    return (
      (initialTab as string) || (moduleKey ? String(moduleKey) : "INVOICE")
    );
  });

  useEffect(() => {
    if (open) {
      if (initialTab) {
        setActiveModuleKey(String(initialTab));
      } else if (moduleKey) {
        setActiveModuleKey(String(moduleKey));
      } else {
        setActiveModuleKey("INVOICE");
      }
    }
  }, [open, initialTab, moduleKey]);

  // Find active module's domain
  const activeModuleDef = useMemo(
    () => ERP_MODULE_REGISTRY.find((m) => m.key === activeModuleKey),
    [activeModuleKey],
  );

  const activeDomain = activeModuleDef?.domain || "FINANCE";

  // When domain group tab changes, switch to the first module of that domain
  const handleDomainGroupChange = (domainKey: string) => {
    const domainMods = ERP_MODULE_REGISTRY.filter(
      (m) => m.domain === domainKey,
    );
    if (domainMods.length > 0) {
      const alreadyInDomain = domainMods.some((m) => m.key === activeModuleKey);
      if (!alreadyInDomain) {
        setActiveModuleKey(domainMods[0].key);
      }
    }
  };

  // Build Top Group Tabs for the 5 ERP Domains
  const domainKeys = Object.keys(ERP_DOMAIN_REGISTRY) as ErpModuleDomain[];

  const tabs: DrawerTopTabItem[] = useMemo(() => {
    return domainKeys.map((dKey) => {
      const domainMeta = ERP_DOMAIN_REGISTRY[dKey];
      const domainBadge = domainAttrCounts[dKey] || 0;

      return {
        key: dKey,
        label: t(domainMeta.titleKey, domainMeta.defaultTitle),
        icon: domainMeta.icon,
        badgeCount: domainBadge,
        badgeVariant: domainBadge > 0 ? "default" : "secondary",
        content: (
          <ModuleCustomFieldConfigContent
            domainKey={dKey}
            activeModuleKey={activeModuleKey}
            onSelectModule={setActiveModuleKey}
            isOpen={open}
          />
        ),
      };
    });
  }, [domainKeys, domainAttrCounts, activeModuleKey, open, t]);

  // Query categories for activeModuleKey (for right panel preview)
  const { data: currentModuleCategories = [] } = useQuery({
    queryKey: ["module-config-categories", activeModuleKey],
    queryFn: () => moduleConfigApi.getCategories(activeModuleKey),
    enabled: open && !!activeModuleKey,
  });

  const titleText =
    mode === "single" && moduleLabel
      ? `${t("moduleConfig.title", "Cấu hình trường tùy chỉnh")} — ${moduleLabel}`
      : t("moduleConfig.title", "Cấu hình trường tùy chỉnh");

  return (
    <StandardFormDrawer
      open={open}
      mode="view"
      onClose={onClose}
      icon={<Settings className="w-5 h-5 text-primary" />}
      title={titleText}
      subtitle={t(
        "moduleConfig.subtitleUnified",
        "Quản lý danh mục & các thuộc tính động cấu hình theo từng phân hệ",
      )}
      layout="2-columns"
      size="lg"
      zIndex={410}
      tabs={tabs}
      activeTabKey={activeDomain}
      onTabChange={handleDomainGroupChange}
      collapsibleRightPanel={true}
      rightPanelTitle={t(
        "moduleConfig.livePreviewTitle",
        "Xem trước Form thực tế",
      )}
      rightPanelDefaultCollapsed={false}
      stickyRightPanel={true}
      rightPanel={
        <ModuleLivePreviewPanel
          categories={currentModuleCategories}
          moduleKey={activeModuleKey}
        />
      }
    />
  );
}
