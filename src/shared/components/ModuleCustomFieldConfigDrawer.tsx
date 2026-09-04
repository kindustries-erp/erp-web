import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  Plus,
  Trash2,
  Edit2,
  Tag,
  X,
  Power,
  PowerOff,
  Loader2,
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
  PackagePlus,
  PackageMinus,
  ClipboardCheck,
  Wrench,
  ShieldCheck,
  Eye,
  RotateCcw,
  Settings,
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
import { DatePicker } from "@/shared/components/DatePicker";
import { PillTabs } from "@/shared/components/PillTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useT } from "@/core/i18n";
import {
  moduleConfigApi,
  resolveAttrName,
  type ModuleKey,
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
    defaultName: "Hóa đơn điện tử",
    domain: "FINANCE",
    icon: <Receipt className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.invoice.desc",
    defaultDesc: "Quản lý trường tùy chỉnh cho hóa đơn mua vào và bán ra",
  },
  {
    key: "BANK_TXN",
    nameKey: "moduleConfig.modules.bankTxn.name",
    defaultName: "Giao dịch ngân hàng",
    domain: "FINANCE",
    icon: <Landmark className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.bankTxn.desc",
    defaultDesc: "Sao kê tài khoản ngân hàng & giao dịch sổ quỹ tiền mặt",
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
    key: "GOODS_RECEIPT",
    nameKey: "moduleConfig.modules.receipt.name",
    defaultName: "Phiếu nhập kho",
    domain: "INVENTORY",
    icon: <PackagePlus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.receipt.desc",
    defaultDesc: "Phiếu nhập mua hàng, nhập sản xuất & nhập trả hàng",
  },
  {
    key: "GOODS_ISSUE",
    nameKey: "moduleConfig.modules.issue.name",
    defaultName: "Phiếu xuất kho",
    domain: "INVENTORY",
    icon: <PackageMinus className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.issue.desc",
    defaultDesc: "Phiếu xuất bán hàng, xuất NVL sản xuất & xuất hủy",
  },
  {
    key: "INVENTORY_ADJUSTMENT",
    nameKey: "moduleConfig.modules.adjustment.name",
    defaultName: "Phiếu điều chỉnh",
    domain: "INVENTORY",
    icon: <ClipboardCheck className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.adjustment.desc",
    defaultDesc: "Biên bản kiểm kê kho, xử lý chênh lệch thừa/thiếu tồn kho",
  },
  {
    key: "INVENTORY_ITEM",
    nameKey: "moduleConfig.modules.item.name",
    defaultName: "Mặt hàng & SKU",
    domain: "INVENTORY",
    icon: <Boxes className="w-3.5 h-3.5" />,
    descKey: "moduleConfig.modules.item.desc",
    defaultDesc: "Danh mục master data mặt hàng, quy cách và đơn vị tính",
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

const FIELD_TYPE_ICONS: Record<ModuleAttributeFieldType, React.ReactNode> = {
  TEXT: <AlignLeft className="w-3.5 h-3.5" />,
  NUMBER: <Hash className="w-3.5 h-3.5" />,
  SELECT: <ListFilter className="w-3.5 h-3.5" />,
  DATE: <Calendar className="w-3.5 h-3.5" />,
  CHECKBOX: <ToggleLeft className="w-3.5 h-3.5" />,
};

function getFieldTypeOptions(
  t: (key: string, fallback: string) => string,
): ComboboxOption[] {
  return [
    {
      value: "TEXT",
      label: t("moduleConfig.fieldTypes.text", "Văn bản ngắn (Text)"),
    },
    {
      value: "NUMBER",
      label: t("moduleConfig.fieldTypes.number", "Số (Number)"),
    },
    {
      value: "SELECT",
      label: t("moduleConfig.fieldTypes.select", "Lựa chọn (Dropdown Select)"),
    },
    {
      value: "DATE",
      label: t("moduleConfig.fieldTypes.date", "Ngày tháng (Date)"),
    },
    {
      value: "CHECKBOX",
      label: t("moduleConfig.fieldTypes.checkbox", "Hộp kiểm (Checkbox)"),
    },
  ];
}

function getFieldTypeShortLabel(
  type: ModuleAttributeFieldType,
  t: (key: string, fallback: string) => string,
): string {
  switch (type) {
    case "TEXT":
      return t("moduleConfig.fieldTypes.shortText", "Văn bản");
    case "NUMBER":
      return t("moduleConfig.fieldTypes.shortNumber", "Số");
    case "SELECT":
      return t("moduleConfig.fieldTypes.shortSelect", "Lựa chọn");
    case "DATE":
      return t("moduleConfig.fieldTypes.shortDate", "Ngày");
    case "CHECKBOX":
      return t("moduleConfig.fieldTypes.shortCheckbox", "Hộp kiểm");
    default:
      return type;
  }
}

// ============================================================================
// 2. LIVE PREVIEW PANEL (Interactive Form Simulator)
// ============================================================================

export interface ModuleLivePreviewPanelProps {
  attributes?: ModuleAttributeDef[];
  globalDefs?: ModuleAttributeDef[];
  moduleKey?: string;
}

export function ModuleLivePreviewPanel({
  attributes,
  globalDefs = [],
  moduleKey,
}: ModuleLivePreviewPanelProps) {
  const t = useT();
  const [mockValues, setMockValues] = useState<Record<string, any>>({});

  const allDefs = useMemo(
    () => attributes || globalDefs || [],
    [attributes, globalDefs],
  );
  const activeAttrs = useMemo(
    () => allDefs.filter((d) => !d.isDeleted && d.isActive !== false),
    [allDefs],
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
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

      {/* Attributes Section Preview */}
      <div className="flex flex-col gap-2 p-3 bg-surface/60 rounded-xl border border-border/60">
        <div className="flex items-center justify-between pb-1 border-b border-border/30">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
            <Tag className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              {t("moduleConfig.customFieldsSection", "Trường tùy chỉnh")}
            </span>
          </div>
          <Badge variant="outline" className="text-[9px] font-mono">
            {activeAttrs.length} {t("moduleConfig.attrsCount", "thuộc tính")}
          </Badge>
        </div>

        {activeAttrs.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-[11px] opacity-70">
            {t(
              "moduleConfig.noCustomAttributes",
              "Chưa có trường tùy chỉnh nào cho phân hệ này.",
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 pt-1">
            {activeAttrs.map((attr) => {
              const val = mockValues[attr.code];
              const displayName = resolveAttrName(
                attr,
                moduleKey || "",
                undefined,
                t,
              );

              if (attr.fieldType === "CHECKBOX") {
                return (
                  <div
                    key={attr.id}
                    className="flex items-center gap-2 py-0.5 select-none"
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
                      className="text-xs text-foreground cursor-pointer font-medium flex items-center gap-0.5"
                    >
                      {displayName}
                      {attr.isRequired && (
                        <span className="text-destructive ml-0.5">*</span>
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
                    label={displayName}
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

              if (attr.fieldType === "DATE") {
                return (
                  <DrawerField
                    key={attr.id}
                    label={displayName}
                    required={attr.isRequired}
                  >
                    <DatePicker
                      value={val || ""}
                      onChange={(v) => handleFieldChange(attr.code, v)}
                      placeholder={t("common.dateFormat", "DD/MM/YYYY")}
                    />
                  </DrawerField>
                );
              }

              return (
                <DrawerField
                  key={attr.id}
                  label={displayName}
                  required={attr.isRequired}
                >
                  <input
                    type={attr.fieldType === "NUMBER" ? "number" : "text"}
                    className={inputCls}
                    value={val || ""}
                    onChange={(e) =>
                      handleFieldChange(attr.code, e.target.value)
                    }
                    placeholder={`${t("common.enter", "Nhập")} ${displayName}...`}
                  />
                </DrawerField>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// 3. INTERNAL MODULE CONTENT COMPONENT (Direct Attribute Management)
// ============================================================================

export interface ModuleCustomFieldConfigContentProps {
  domainKey?: ErpModuleDomain;
  activeModuleKey: string;
  onSelectModule: (moduleKey: string) => void;
  isOpen: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  hidePillTabs?: boolean;
}

export function ModuleCustomFieldConfigContent({
  domainKey,
  activeModuleKey,
  onSelectModule,
  isOpen,
  onDirtyChange,
  hidePillTabs = false,
}: ModuleCustomFieldConfigContentProps) {
  const t = useT();
  const queryClient = useQueryClient();

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

  // Dynamic translated field type options
  const fieldTypeOptions = useMemo(() => getFieldTypeOptions(t), [t]);

  // Query global attribute defs scoped by activeModuleKey
  const {
    data: globalDefs = [],
    isLoading,
    isError,
  } = useQuery({
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
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);

  // State: Discard / Cancel Confirm Modal
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<
    "attr" | { type: "module"; nextKey: string } | null
  >(null);

  // Computed Dirty State
  const isAttrDirty = useMemo(() => {
    if (isAddingAttr) {
      return Boolean(
        attrCode.trim() !== "" ||
        attrName.trim() !== "" ||
        attrRequired ||
        attrFieldType !== "TEXT" ||
        attrOptions.length > 0 ||
        newOptionKey.trim() !== "" ||
        newOptionLabel.trim() !== "",
      );
    }
    if (editingAttr) {
      const origOpts = editingAttr.options || [];
      const optsChanged =
        JSON.stringify(attrOptions) !== JSON.stringify(origOpts);
      return (
        attrCode.trim() !== (editingAttr.code || "") ||
        attrName.trim() !== (editingAttr.name || "") ||
        attrFieldType !== (editingAttr.fieldType || "TEXT") ||
        attrRequired !== Boolean(editingAttr.isRequired) ||
        optsChanged ||
        Boolean(newOptionKey.trim() !== "" || newOptionLabel.trim() !== "")
      );
    }
    return false;
  }, [
    isAddingAttr,
    editingAttr,
    attrCode,
    attrName,
    attrFieldType,
    attrRequired,
    attrOptions,
    newOptionKey,
    newOptionLabel,
  ]);

  useEffect(() => {
    onDirtyChange?.(isAttrDirty);
  }, [isAttrDirty, onDirtyChange]);

  // Open Create Attribute form
  const openCreateAttr = () => {
    setIsAddingAttr(true);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  // Open Edit Attribute form
  const openEditAttr = (attr: ModuleAttributeDef) => {
    setEditingAttr(attr);
    setIsAddingAttr(false);
    setAttrCode(attr.code);
    setAttrName(attr.name);
    setAttrFieldType(attr.fieldType);
    setAttrRequired(Boolean(attr.isRequired));
    setAttrOptions(attr.options || []);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const closeAttrForm = () => {
    setIsAddingAttr(false);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

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
      onSelectModule(nextKey);
    }
  };

  // Option builder helpers
  const handleAddOption = () => {
    const rawK = newOptionKey.trim();
    const rawL = newOptionLabel.trim();
    if (!rawK && !rawL) return;
    const finalK = (rawK || rawL).toUpperCase().replace(/\s+/g, "_");
    const finalL = rawL || rawK;
    if (attrOptions.some((o) => o.value === finalK)) {
      toast.error(
        t("moduleConfig.duplicateOptionKey", "Mã tùy chọn đã tồn tại"),
      );
      return;
    }
    setAttrOptions((prev) => [...prev, { value: finalK, label: finalL }]);
    setNewOptionKey("");
    setNewOptionLabel("");
  };

  const handleRemoveOption = (index: number) => {
    setAttrOptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Mutations
  const createAttrMutation = useMutation({
    mutationFn: (dto: {
      isGlobal: boolean;
      moduleKeyGlobal: string;
      code: string;
      name: string;
      fieldType: ModuleAttributeFieldType;
      options?: ModuleAttributeOption[];
      isRequired?: boolean;
      isActive?: boolean;
    }) => moduleConfigApi.createAttributeDef(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs", activeModuleKey],
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
        queryKey: ["module-config-global-defs", activeModuleKey],
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
        queryKey: ["module-config-global-defs", activeModuleKey],
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
    const trimmedName = attrName.trim();
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

    if (editingAttr) {
      await updateAttrMutation.mutateAsync({
        id: editingAttr.id,
        dto: {
          code: editingAttr.isSystem ? editingAttr.code : trimmedCode,
          name: trimmedName,
          fieldType: editingAttr.isSystem
            ? editingAttr.fieldType
            : attrFieldType,
          isRequired: attrRequired,
          options:
            (editingAttr.isSystem ? editingAttr.fieldType : attrFieldType) ===
            "SELECT"
              ? attrOptions
              : undefined,
        },
      });
    } else {
      await createAttrMutation.mutateAsync({
        isGlobal: true,
        moduleKeyGlobal: activeModuleKey,
        code: trimmedCode,
        name: trimmedName,
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
        queryKey: ["module-config-global-defs", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
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

  // Render attribute form subcomponent
  const renderAttributeForm = () => (
    <div className="p-3.5 bg-surface/80 rounded-xl border border-border/80 flex flex-col gap-3 mt-1 shadow-xs">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-primary" />
          {editingAttr
            ? editingAttr.isSystem
              ? t(
                  "moduleConfig.editSystemAttr",
                  "Chỉnh sửa thuộc tính mặc định",
                )
              : t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")
            : t("moduleConfig.addAttr", "Thêm thuộc tính tùy chỉnh")}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6"
          onClick={handleRequestCloseAttr}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {editingAttr?.isSystem && (
        <div className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-500" />
          <span>
            {t(
              "moduleConfig.systemAttrNotice",
              "Thuộc tính mặc định của hệ thống: Mã và Kiểu dữ liệu được cố định để bảo vệ tính toàn vẹn dữ liệu. Bạn có thể tùy chỉnh Tên hiển thị, Ràng buộc bắt buộc và Danh sách các lựa chọn (Options).",
            )}
          </span>
        </div>
      )}

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
            placeholder={t(
              "moduleConfig.attrCodePlaceholder",
              "VD: color, payment_status, approval_note",
            )}
            disabled={Boolean(
              editingAttr?.isSystem ||
              (editingAttr && (editingAttr.usageCount || 0) > 0),
            )}
          />
        </DrawerField>

        <DrawerField
          label={t("moduleConfig.attrName", "Tên hiển thị (Fallback)")}
          required
        >
          <input
            type="text"
            className={inputCls}
            value={attrName}
            onChange={(e) => setAttrName(e.target.value)}
            placeholder={t(
              "moduleConfig.attrNamePlaceholder",
              "VD: Màu sắc, Ghi chú phê duyệt...",
            )}
          />
        </DrawerField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <DrawerField
          label={t("moduleConfig.attrFieldType", "Kiểu dữ liệu")}
          required
        >
          <Combobox
            options={fieldTypeOptions}
            value={attrFieldType}
            onChange={(v) => setAttrFieldType(v as ModuleAttributeFieldType)}
            disabled={Boolean(
              editingAttr?.isSystem ||
              (editingAttr && (editingAttr.usageCount || 0) > 0),
            )}
            placeholder={t(
              "moduleConfig.selectTypePlaceholder",
              "Chọn kiểu dữ liệu",
            )}
            allowClear={false}
          />
        </DrawerField>

        <DrawerField label={t("moduleConfig.constraints", "Ràng buộc dữ liệu")}>
          <div className="flex items-center gap-4 h-10 px-3 bg-surface rounded-lg border border-border/60">
            <div className="flex items-center gap-2 select-none">
              <Checkbox
                id="attr-required-cb"
                checked={attrRequired}
                onCheckedChange={(c) => setAttrRequired(Boolean(c))}
              />
              <label
                htmlFor="attr-required-cb"
                className="text-xs text-foreground cursor-pointer font-medium"
              >
                {t("moduleConfig.isRequired", "Bắt buộc nhập dữ liệu")}
              </label>
            </div>
          </div>
        </DrawerField>
      </div>

      {attrFieldType === "SELECT" && (
        <div className="flex flex-col gap-2 p-3 bg-surface/50 rounded-lg border border-border/60 mt-1">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span>
              {t("moduleConfig.selectOptionsList", "Danh sách tùy chọn")}
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              {attrOptions.length} {t("moduleConfig.optionsCount", "tùy chọn")}
            </span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              className={inputCls}
              value={newOptionKey}
              onChange={(e) => setNewOptionKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
              placeholder={t(
                "moduleConfig.optionKeyPlaceholder",
                "Mã (VD: RED)",
              )}
            />
            <input
              type="text"
              className={inputCls}
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption();
                }
              }}
              placeholder={t(
                "moduleConfig.optionLabelPlaceholder",
                "Tên hiển thị (VD: Màu đỏ)",
              )}
            />
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={handleAddOption}
              className="shrink-0 text-xs flex items-center gap-1 px-3"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("common.add", "Thêm")}
            </Button>
          </div>

          {attrOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {attrOptions.map((opt, idx) => (
                <div
                  key={opt.value}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-border/80 text-xs shadow-2xs group hover:border-border transition-all"
                >
                  <span className="font-mono text-[10px] font-semibold px-1 py-0.5 rounded bg-muted text-foreground">
                    {opt.value}
                  </span>
                  <span className="text-foreground font-medium">
                    {opt.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded p-0.5 transition-colors ml-0.5 cursor-pointer"
                    title={t("common.delete", "Xóa")}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground italic py-1">
              {t(
                "moduleConfig.noOptionsHint",
                "Chưa có tùy chọn nào. Nhập Mã & Tên ở trên rồi bấm Thêm.",
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-1 pt-2 border-t border-border/40">
        <Button
          size="sm"
          variant="secondary"
          onClick={handleRequestCloseAttr}
          disabled={
            createAttrMutation.isPending || updateAttrMutation.isPending
          }
        >
          {t("common.cancel", "Hủy")}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSaveAttribute}
          disabled={
            createAttrMutation.isPending || updateAttrMutation.isPending
          }
        >
          {createAttrMutation.isPending || updateAttrMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
          ) : null}
          {editingAttr
            ? t("common.save", "Lưu")
            : t("common.create", "Tạo mới")}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-4 pb-6">
        {/* Group Sub-Tabs (PillTabs) */}
        {!hidePillTabs && domainMods.length > 1 && (
          <div className="flex items-center justify-start pb-0.5">
            <PillTabs
              className="w-full sm:w-auto shrink-0"
              listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
              triggerClassName="h-7 px-4 text-xs rounded-full"
              items={pillTabItems}
              value={activeModuleKey}
              onValueChange={handleSelectModuleWithGuard}
              hideBorder
            />
          </div>
        )}

        {/* Form Create / Edit Attribute */}
        {(isAddingAttr || editingAttr) && renderAttributeForm()}

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
              "Không thể tải danh sách cấu hình thuộc tính.",
            )}
          </div>
        )}

        {/* 1. System Default Attributes Section (Read-only / Edit options, Cannot delete) */}
        {!isLoading && !isError && systemDefs.length > 0 && (
          <DrawerSection
            title={
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span>
                  {t(
                    "moduleConfig.systemAttributesTitle",
                    "Thuộc tính mặc định (Hệ thống)",
                  )}
                </span>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono border-indigo-200 text-indigo-700 bg-indigo-50/50 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-950/40"
                >
                  {systemDefs.length}
                </Badge>
              </div>
            }
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-2">
              {systemDefs.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 rounded-xl text-xs transition-all group border border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    >
                      <ShieldCheck className="w-3 h-3 text-indigo-500" />
                      <span>
                        {t("moduleConfig.systemBadge", "Mặc định hệ thống")}
                      </span>
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-border/80"
                    >
                      {FIELD_TYPE_ICONS[attr.fieldType]}
                      <span>{getFieldTypeShortLabel(attr.fieldType, t)}</span>
                    </Badge>
                    <span className="font-semibold text-foreground truncate">
                      {resolveAttrName(attr, activeModuleKey, undefined, t)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                      ({attr.code})
                    </span>
                    {attr.fieldType === "SELECT" && attr.options && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 text-muted-foreground"
                      >
                        {attr.options.length}{" "}
                        {t("moduleConfig.optionsCount", "tùy chọn")}
                      </Badge>
                    )}
                    {attr.isRequired && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] px-1.5 py-0"
                      >
                        {t("moduleConfig.requiredBadge", "Bắt buộc *")}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip content={t("common.edit", "Chỉnh sửa tùy chọn")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-surface/80"
                        onClick={() => openEditAttr(attr)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </DrawerSection>
        )}

        {/* 2. Custom Attributes Section */}
        {!isLoading && !isError && (
          <DrawerSection
            title={
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                <span>
                  {t(
                    "moduleConfig.customAttributesTitle",
                    "Thuộc tính tùy chỉnh",
                  )}
                </span>
                <Badge variant="outline" className="text-[9px] font-mono">
                  {customDefs.length}
                </Badge>
              </div>
            }
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-2">
              {customDefs.length === 0 && !isAddingAttr && (
                <div className="py-6 text-center text-muted-foreground text-xs bg-muted/15 rounded-xl border border-dashed border-border/60 flex flex-col items-center gap-1.5">
                  <Tag className="w-5 h-5 opacity-40 text-muted-foreground" />
                  <p>
                    {t(
                      "moduleConfig.noCustomAttrsYet",
                      "Chưa có thuộc tính tùy chỉnh nào cho phân hệ này.",
                    )}
                  </p>
                </div>
              )}

              {customDefs.map((attr) => (
                <div
                  key={attr.id}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-surface/60 hover:bg-surface rounded-xl text-xs transition-all group border border-border/50 hover:border-border shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-border/80"
                    >
                      {FIELD_TYPE_ICONS[attr.fieldType]}
                      <span>{getFieldTypeShortLabel(attr.fieldType, t)}</span>
                    </Badge>
                    <span className="font-semibold text-foreground truncate">
                      {resolveAttrName(attr, activeModuleKey, undefined, t)}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                      ({attr.code})
                    </span>
                    {attr.isRequired && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] px-1.5 py-0"
                      >
                        {t("moduleConfig.requiredBadge", "Bắt buộc *")}
                      </Badge>
                    )}
                    {!attr.isActive && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 text-muted-foreground"
                      >
                        {t("common.inactive", "Ngừng dùng")}
                      </Badge>
                    )}
                    {(attr.usageCount || 0) > 0 && (
                      <Badge
                        variant="secondary"
                        className="text-[9px] px-1.5 py-0 text-muted-foreground"
                      >
                        {attr.usageCount} {t("moduleConfig.used", "đang dùng")}
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
                        className="w-7 h-7"
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
                        className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-surface/80"
                        onClick={() => openEditAttr(attr)}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                    <Tooltip content={t("common.delete", "Xóa thuộc tính")}>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-7 h-7 text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteAttrTarget(attr)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {/* Button Thêm thuộc tính nằm ngay bên dưới giữa hàng (bottom-center) */}
              {!isAddingAttr && !editingAttr && (
                <div className="flex justify-center pt-2 pb-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCreateAttr}
                    className="h-8 px-4 text-xs font-medium border-dashed border-primary/50 hover:border-primary text-primary bg-primary/5 hover:bg-primary/10 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      {t("moduleConfig.addAttrBtn", "Thêm thuộc tính")}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </DrawerSection>
        )}
      </div>

      {/* Discard confirmation modal */}
      <ConfirmModal
        open={cancelConfirmTarget !== null}
        title={t("common.confirmCancelTitle", "Xác nhận hủy thay đổi")}
        message={t(
          "common.confirmCancelDesc",
          "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?",
        )}
        confirmLabel={t("common.discardChanges", "Hủy thay đổi")}
        cancelLabel={t("common.continueEditing", "Tiếp tục sửa")}
        danger
        onConfirm={() => {
          if (!cancelConfirmTarget) return;
          if (cancelConfirmTarget === "attr") {
            closeAttrForm();
          } else if (
            typeof cancelConfirmTarget === "object" &&
            cancelConfirmTarget.type === "module"
          ) {
            closeAttrForm();
            onSelectModule(cancelConfirmTarget.nextKey);
          }
          setCancelConfirmTarget(null);
        }}
        onCancel={() => setCancelConfirmTarget(null)}
      />

      {/* Delete Attribute confirm modal */}
      <ConfirmModal
        open={deleteAttrTarget !== null}
        title={t("moduleConfig.deleteAttrTitle", "Xác nhận xóa thuộc tính")}
        message={
          deleteAttrTarget && (deleteAttrTarget.usageCount || 0) > 0
            ? t(
                "moduleConfig.deleteAttrWarningInUse",
                `Thuộc tính "${deleteAttrTarget.name}" đang được sử dụng (${deleteAttrTarget.usageCount} bản ghi). Nếu không muốn dùng nữa, hãy chuyển sang trạng thái Ngừng hoạt động (Deactivate).`,
              )
            : t(
                "moduleConfig.deleteAttrConfirmMsg",
                `Bạn có chắc chắn muốn xóa thuộc tính "${deleteAttrTarget?.name}"? Hành động này không thể hoàn tác.`,
              )
        }
        confirmLabel={t("common.delete", "Xóa")}
        cancelLabel={t("common.cancel", "Hủy")}
        danger
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
// 4. MAIN EXPORT: 2-COLUMN DRAWER WITH DOMAIN TABS + DIRECT ATTRIBUTES + PREVIEW
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

  // Dirty state tracking across the drawer content
  const [isContentDirty, setIsContentDirty] = useState(false);
  const [pendingDomainKey, setPendingDomainKey] = useState<string | null>(null);

  // Query ALL global attributes across the ERP ecosystem
  const { data: allGlobalDefs = [] } = useQuery({
    queryKey: ["module-config-all-global-defs"],
    queryFn: () => moduleConfigApi.getAttributeDefs(undefined, true),
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

    for (const gDef of allGlobalDefs) {
      if (gDef.isDeleted) continue;
      const mod = ERP_MODULE_REGISTRY.find(
        (m) => m.key === gDef.moduleKeyGlobal,
      );
      if (mod) {
        counts[mod.domain] += 1;
      }
    }

    return counts;
  }, [allGlobalDefs]);

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

  const executeDomainGroupChange = (domainKey: string) => {
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

  // When domain group tab changes, check if dirty before switching
  const handleDomainGroupChange = (domainKey: string) => {
    if (domainKey === activeDomain) return;
    if (isContentDirty) {
      setPendingDomainKey(domainKey);
      return;
    }
    executeDomainGroupChange(domainKey);
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
            onDirtyChange={setIsContentDirty}
          />
        ),
      };
    });
  }, [domainKeys, domainAttrCounts, activeModuleKey, open, t]);

  // Query global attribute defs for activeModuleKey (for right panel preview)
  const { data: currentModuleGlobalDefs = [] } = useQuery({
    queryKey: ["module-config-global-defs", activeModuleKey],
    queryFn: () => moduleConfigApi.getGlobalAttributeDefs(activeModuleKey),
    enabled: open && !!activeModuleKey,
  });

  const titleText =
    mode === "single" && moduleLabel
      ? `${t("moduleConfig.title", "Cấu hình trường tùy chỉnh")} — ${moduleLabel}`
      : t("moduleConfig.title", "Cấu hình trường tùy chỉnh");

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        confirmOnClose={isContentDirty}
        icon={<Settings className="w-5 h-5 text-primary" />}
        title={titleText}
        subtitle={t(
          "moduleConfig.subtitle",
          "Quản lý các thuộc tính động cấu hình theo từng phân hệ",
        )}
        layout="2-columns"
        size="xl"
        zIndex={400}
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
            attributes={currentModuleGlobalDefs}
            moduleKey={activeModuleKey}
          />
        }
      />

      {/* Discard confirmation modal when switching domain with unsaved changes */}
      <ConfirmModal
        open={pendingDomainKey !== null}
        title={t("common.confirmCancelTitle", "Xác nhận hủy thay đổi")}
        message={t(
          "common.confirmCancelDesc",
          "Bạn có thay đổi chưa được lưu. Nếu chuyển nhóm phân hệ khác bây giờ, các thay đổi sẽ bị mất. Bạn có chắc chắn muốn chuyển?",
        )}
        confirmLabel={t("common.discardChanges", "Chuyển nhóm")}
        cancelLabel={t("common.continueEditing", "Tiếp tục sửa")}
        danger
        onConfirm={() => {
          if (pendingDomainKey) {
            setIsContentDirty(false);
            executeDomainGroupChange(pendingDomainKey);
          }
          setPendingDomainKey(null);
        }}
        onCancel={() => setPendingDomainKey(null)}
      />
    </>
  );
}
