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
  RotateCcw,
  Settings,
  AlertCircle,
  Check,
  Pencil,
  Database,
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
import { MultilingualInput } from "@/shared/components/MultilingualInput";
import { MultilingualBadge } from "@/shared/components/MultilingualBadge";
import { useT } from "@/core/i18n";
import { useAppStore } from "@/core/config/appStore";
import { cn } from "@/shared/utils";
import {
  moduleConfigApi,
  resolveAttrName,
  resolveOptionLabel,
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
// 1.1 NEUTRAL COUNT BADGE (Business Standard)
// ============================================================================

export function NeutralCountBadge({
  count,
  className,
}: {
  count: number | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 rounded text-[11px] font-mono font-medium text-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs",
        className,
      )}
    >
      {count}
    </span>
  );
}

// ============================================================================
// 2. LIVE PREVIEW PANEL (Interactive Form Simulator)
// ============================================================================

export interface ModuleLivePreviewPanelProps {
  attributes?: ModuleAttributeDef[];
  globalDefs?: ModuleAttributeDef[];
  moduleKey?: string;
  resetKey?: number;
}

export function ModuleLivePreviewPanel({
  attributes,
  globalDefs = [],
  moduleKey,
  resetKey,
}: ModuleLivePreviewPanelProps) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);
  const [mockValues, setMockValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setMockValues({});
  }, [resetKey, moduleKey]);

  const allDefs = useMemo(
    () => attributes || globalDefs || [],
    [attributes, globalDefs],
  );
  const activeAttrs = useMemo(
    () => allDefs.filter((d) => !d.isDeleted && d.isActive !== false),
    [allDefs],
  );

  const systemAttrs = useMemo(
    () => activeAttrs.filter((d) => Boolean(d.isSystem)),
    [activeAttrs],
  );
  const customAttrs = useMemo(
    () => activeAttrs.filter((d) => !d.isSystem),
    [activeAttrs],
  );

  const handleFieldChange = (code: string, val: any) => {
    setMockValues((prev) => ({ ...prev, [code]: val }));
  };

  const renderAttributeInputs = (attrs: ModuleAttributeDef[]) => (
    <div className="flex flex-col gap-2.5 pt-1">
      {attrs.map((attr) => {
        const val = mockValues[attr.code];
        const displayName = resolveAttrName(attr, moduleKey || "", locale, t);

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
          const opts: ComboboxOption[] = (attr.options || []).map((o) => ({
            value: o.value,
            label: `${resolveOptionLabel(o, locale, t)} (${o.value})`,
          }));
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
              onChange={(e) => handleFieldChange(attr.code, e.target.value)}
              placeholder={`${t("common.enter", "Nhập")} ${displayName}...`}
            />
          </DrawerField>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-3.5 text-xs">
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        {t(
          "moduleConfig.livePreviewDesc",
          "Mô phỏng trực tiếp cách các trường tùy chỉnh sẽ hiển thị trên Drawer chứng từ thực tế.",
        )}
      </p>

      {/* 1. Thuộc tính mặc định (Hệ thống) Preview */}
      {systemAttrs.length > 0 && (
        <div className="flex flex-col gap-2 pt-1 pb-3.5 border-b border-border/40">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
              <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span>
                {t(
                  "moduleConfig.systemFieldsPreviewTitle",
                  "Thuộc tính mặc định",
                )}
              </span>
            </div>
            <NeutralCountBadge count={systemAttrs.length} />
          </div>

          {renderAttributeInputs(systemAttrs)}
        </div>
      )}

      {/* 2. Thuộc tính tùy chỉnh Preview */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] text-foreground">
            <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span>
              {t(
                "moduleConfig.customFieldsPreviewTitle",
                "Thuộc tính tùy chỉnh",
              )}
            </span>
          </div>
          <NeutralCountBadge count={customAttrs.length} />
        </div>

        {customAttrs.length === 0 ? (
          <div className="py-4 text-center text-muted-foreground text-[11px] opacity-70 italic">
            {t(
              "moduleConfig.noCustomAttributes",
              "Chưa có trường tùy chỉnh nào cho phân hệ này.",
            )}
          </div>
        ) : (
          renderAttributeInputs(customAttrs)
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
  const locale = useAppStore((s) => s.locale);
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
  const [attrNameEn, setAttrNameEn] = useState("");
  const [attrNames, setAttrNames] = useState<Record<string, string>>({
    vi: "",
    en: "",
  });
  const [attrFieldType, setAttrFieldType] =
    useState<ModuleAttributeFieldType>("TEXT");
  const [attrRequired, setAttrRequired] = useState(false);
  const [attrOptions, setAttrOptions] = useState<ModuleAttributeOption[]>([]);
  const [newOptionKey, setNewOptionKey] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionLabelEn, setNewOptionLabelEn] = useState("");
  const [newOptionLabels, setNewOptionLabels] = useState<
    Record<string, string>
  >({ vi: "", en: "" });
  const [deleteAttrTarget, setDeleteAttrTarget] =
    useState<ModuleAttributeDef | null>(null);

  // State: Option display name inline editing (value/key is immutable)
  const [editingOptionIdx, setEditingOptionIdx] = useState<number | null>(null);
  const [editingOptionLabel, setEditingOptionLabel] = useState("");
  const [editingOptionLabelEn, setEditingOptionLabelEn] = useState("");
  const [editingOptionLabels, setEditingOptionLabels] = useState<
    Record<string, string>
  >({});
  const [editingOptionOriginalLabels, setEditingOptionOriginalLabels] =
    useState<Record<string, string>>({});
  const [editingOptionOriginalLabel, setEditingOptionOriginalLabel] =
    useState("");
  const [editingOptionOriginalLabelEn, setEditingOptionOriginalLabelEn] =
    useState("");

  // State: Discard / Cancel Confirm Modal
  const [cancelConfirmTarget, setCancelConfirmTarget] = useState<
    "attr" | { type: "module"; nextKey: string } | null
  >(null);

  // Computed Dirty State
  const isAttrDirty = useMemo(() => {
    if (isAddingAttr) {
      const hasAnyAttrName = Object.values(attrNames).some(
        (v) => v.trim() !== "",
      );
      const hasAnyNewOptLabel = Object.values(newOptionLabels).some(
        (v) => v.trim() !== "",
      );
      return Boolean(
        attrCode.trim() !== "" ||
        attrName.trim() !== "" ||
        attrNameEn.trim() !== "" ||
        hasAnyAttrName ||
        attrRequired ||
        attrFieldType !== "TEXT" ||
        attrOptions.length > 0 ||
        newOptionKey.trim() !== "" ||
        newOptionLabel.trim() !== "" ||
        newOptionLabelEn.trim() !== "" ||
        hasAnyNewOptLabel,
      );
    }
    if (editingAttr) {
      const origOpts = editingAttr.options || [];
      const optsChanged =
        JSON.stringify(attrOptions) !== JSON.stringify(origOpts);
      const hasAnyNewOptLabel = Object.values(newOptionLabels).some(
        (v) => v.trim() !== "",
      );
      return (
        attrCode.trim() !== (editingAttr.code || "") ||
        attrName.trim() !== (editingAttr.name || "") ||
        attrNameEn.trim() !== (editingAttr.nameEn || "") ||
        attrNames.vi?.trim() !== (editingAttr.name || "") ||
        (attrNames.en?.trim() || "") !== (editingAttr.nameEn || "") ||
        attrFieldType !== (editingAttr.fieldType || "TEXT") ||
        attrRequired !== Boolean(editingAttr.isRequired) ||
        optsChanged ||
        editingOptionIdx !== null ||
        Boolean(
          newOptionKey.trim() !== "" ||
          newOptionLabel.trim() !== "" ||
          newOptionLabelEn.trim() !== "" ||
          hasAnyNewOptLabel,
        )
      );
    }
    return false;
  }, [
    isAddingAttr,
    editingAttr,
    attrCode,
    attrName,
    attrNameEn,
    attrNames,
    attrFieldType,
    attrRequired,
    attrOptions,
    editingOptionIdx,
    newOptionKey,
    newOptionLabel,
    newOptionLabelEn,
    newOptionLabels,
  ]);

  useEffect(() => {
    onDirtyChange?.(isAttrDirty);
  }, [isAttrDirty, onDirtyChange]);

  // Option inline edit helpers
  const handleStartEditOption = (index: number, opt: ModuleAttributeOption) => {
    setEditingOptionIdx(index);
    const curLabelVi = opt.label || opt.labels?.vi || "";
    const curLabelEn = opt.labelEn || opt.labels?.en || "";
    const currentLabels: Record<string, string> = {
      ...(opt.labels || {}),
      vi: curLabelVi,
      en: curLabelEn,
    };
    setEditingOptionLabel(curLabelVi);
    setEditingOptionLabelEn(curLabelEn);
    setEditingOptionLabels(currentLabels);
    setEditingOptionOriginalLabels(currentLabels);
    setEditingOptionOriginalLabel(curLabelVi);
    setEditingOptionOriginalLabelEn(curLabelEn);
  };

  const handleSaveOptionLabel = (index: number) => {
    const trimmedVi = (editingOptionLabels.vi || editingOptionLabel).trim();
    const trimmedEn = (editingOptionLabels.en || editingOptionLabelEn).trim();
    const anyFilledVal = Object.values(editingOptionLabels).find(
      (v) => v && v.trim(),
    );
    if (!trimmedVi && !trimmedEn && !anyFilledVal) {
      toast.error(
        t(
          "moduleConfig.optionLabelRequired",
          "Tên hiển thị không được để trống",
        ),
      );
      return;
    }
    const finalVi = trimmedVi || anyFilledVal || trimmedEn;
    const finalEn = trimmedEn || finalVi;
    const nextLabels: Record<string, string> = {
      ...editingOptionLabels,
      vi: finalVi,
      en: finalEn,
    };
    setAttrOptions((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              label: finalVi,
              labelEn: finalEn,
              labels: nextLabels,
            }
          : item,
      ),
    );
    setEditingOptionIdx(null);
    setEditingOptionLabel("");
    setEditingOptionLabelEn("");
    setEditingOptionLabels({});
    setEditingOptionOriginalLabels({});
    setEditingOptionOriginalLabel("");
    setEditingOptionOriginalLabelEn("");
  };

  const handleCancelEditOption = () => {
    if (editingOptionIdx !== null) {
      if (
        Object.keys(editingOptionOriginalLabels).length > 0 ||
        editingOptionOriginalLabel ||
        editingOptionOriginalLabelEn
      ) {
        setAttrOptions((prev) =>
          prev.map((item, i) =>
            i === editingOptionIdx
              ? {
                  ...item,
                  label:
                    editingOptionOriginalLabels.vi ||
                    editingOptionOriginalLabel ||
                    item.label,
                  labelEn:
                    editingOptionOriginalLabels.en ||
                    editingOptionOriginalLabelEn ||
                    item.labelEn,
                  labels: {
                    ...(item.labels || {}),
                    ...editingOptionOriginalLabels,
                  },
                }
              : item,
          ),
        );
      }
    }
    setEditingOptionIdx(null);
    setEditingOptionLabel("");
    setEditingOptionLabelEn("");
    setEditingOptionLabels({});
    setEditingOptionOriginalLabels({});
    setEditingOptionOriginalLabel("");
    setEditingOptionOriginalLabelEn("");
  };

  // Open Create Attribute form
  const openCreateAttr = () => {
    setIsAddingAttr(true);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
    setNewOptionLabelEn("");
    setNewOptionLabels({ vi: "", en: "" });
    handleCancelEditOption();
  };

  // Open Edit Attribute form
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
    setAttrFieldType(attr.fieldType);
    setAttrRequired(Boolean(attr.isRequired));
    setAttrOptions(attr.options || []);
    setNewOptionKey("");
    setNewOptionLabel("");
    setNewOptionLabelEn("");
    setNewOptionLabels({ vi: "", en: "" });
    handleCancelEditOption();
  };

  const closeAttrForm = () => {
    setIsAddingAttr(false);
    setEditingAttr(null);
    setAttrCode("");
    setAttrName("");
    setAttrNameEn("");
    setAttrNames({ vi: "", en: "" });
    setAttrFieldType("TEXT");
    setAttrRequired(false);
    setAttrOptions([]);
    setNewOptionKey("");
    setNewOptionLabel("");
    setNewOptionLabelEn("");
    setNewOptionLabels({ vi: "", en: "" });
    handleCancelEditOption();
  };

  // Reset attribute form when active module changes
  useEffect(() => {
    closeAttrForm();
  }, [activeModuleKey]);

  // Query options usage for the currently editing attribute (for SELECT type)
  const { data: optionsUsage = {} } = useQuery<Record<string, number>>({
    queryKey: ["module-config-options-usage", editingAttr?.id],
    queryFn: () =>
      editingAttr?.id
        ? moduleConfigApi.getAttributeOptionsUsage(editingAttr.id)
        : Promise.resolve({}),
    enabled: isOpen && !!editingAttr?.id && attrFieldType === "SELECT",
    staleTime: 5000,
  });

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

  // Option builder helpers
  const handleAddOption = () => {
    const rawK = newOptionKey.trim();
    const rawLVi = (newOptionLabels.vi || newOptionLabel).trim();
    const rawLEn = (newOptionLabels.en || newOptionLabelEn).trim();
    const anyFilledVal = Object.values(newOptionLabels).find(
      (v) => v && v.trim(),
    );
    if (!rawK && !rawLVi && !rawLEn && !anyFilledVal) return;
    const finalK = (rawK || rawLVi || rawLEn || anyFilledVal || "")
      .toUpperCase()
      .replace(/\s+/g, "_");
    const finalLVi = rawLVi || anyFilledVal || rawLEn || rawK;
    const finalLEn = rawLEn || finalLVi;
    if (attrOptions.some((o) => o.value === finalK)) {
      toast.error(
        t("moduleConfig.duplicateOptionKey", "Mã tùy chọn đã tồn tại"),
      );
      return;
    }
    const nextLabels: Record<string, string> = {
      ...newOptionLabels,
      vi: finalLVi,
      en: finalLEn,
    };
    setAttrOptions((prev) => [
      ...prev,
      {
        value: finalK,
        label: finalLVi,
        labelEn: finalLEn,
        labels: nextLabels,
      },
    ]);
    setNewOptionKey("");
    setNewOptionLabel("");
    setNewOptionLabelEn("");
    setNewOptionLabels({ vi: "", en: "" });
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
      nameEn?: string;
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
    onSuccess: (updated: any) => {
      queryClient.invalidateQueries({
        queryKey: ["module-config-global-defs", activeModuleKey],
      });
      queryClient.invalidateQueries({
        queryKey: ["module-config-all-global-defs"],
      });
      if (updated?.id) {
        queryClient.setQueryData(
          ["module-config-global-defs", activeModuleKey],
          (old: ModuleAttributeDef[] | undefined) => {
            if (!old) return old;
            return old.map((d) =>
              d.id === updated.id ? { ...d, ...updated } : d,
            );
          },
        );
      }
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
    const trimmedName =
      (attrNames.vi || attrName).trim() ||
      Object.values(attrNames).find((v) => v.trim()) ||
      "";
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

    // Auto-commit active inline option edit if in progress
    const finalOptions = [...attrOptions];
    if (
      editingOptionIdx !== null &&
      editingOptionIdx >= 0 &&
      editingOptionIdx < finalOptions.length
    ) {
      const trimmedOptVi = (
        editingOptionLabels.vi || editingOptionLabel
      ).trim();
      const trimmedOptEn = (
        editingOptionLabels.en || editingOptionLabelEn
      ).trim();
      const anyFilledOpt = Object.values(editingOptionLabels).find(
        (v) => v && v.trim(),
      );
      if (trimmedOptVi || trimmedOptEn || anyFilledOpt) {
        const finalOptVi = trimmedOptVi || anyFilledOpt || trimmedOptEn;
        const finalOptEn = trimmedOptEn || finalOptVi;
        finalOptions[editingOptionIdx] = {
          ...finalOptions[editingOptionIdx],
          label: finalOptVi,
          labelEn: finalOptEn,
          labels: {
            ...editingOptionLabels,
            vi: finalOptVi,
            en: finalOptEn,
          },
        };
      }
    }

    // Auto-commit top pending new option if user typed it
    const rawK = newOptionKey.trim();
    const rawLVi = (newOptionLabels.vi || newOptionLabel).trim();
    const rawLEn = (newOptionLabels.en || newOptionLabelEn).trim();
    const anyFilledNewOpt = Object.values(newOptionLabels).find(
      (v) => v && v.trim(),
    );
    if (rawK || rawLVi || rawLEn || anyFilledNewOpt) {
      const finalK = (rawK || rawLVi || rawLEn || anyFilledNewOpt || "")
        .toUpperCase()
        .replace(/\s+/g, "_");
      const finalLVi = rawLVi || anyFilledNewOpt || rawLEn || rawK;
      const finalLEn = rawLEn || finalLVi;
      if (!finalOptions.some((o) => o.value === finalK)) {
        finalOptions.push({
          value: finalK,
          label: finalLVi,
          labelEn: finalLEn,
          labels: {
            ...newOptionLabels,
            vi: finalLVi,
            en: finalLEn,
          },
        });
      }
    }

    if (attrFieldType === "SELECT" && finalOptions.length === 0) {
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
          nameEn: trimmedNameEn || undefined,
          fieldType: editingAttr.isSystem
            ? editingAttr.fieldType
            : attrFieldType,
          isRequired: attrRequired,
          options:
            (editingAttr.isSystem ? editingAttr.fieldType : attrFieldType) ===
            "SELECT"
              ? finalOptions
              : undefined,
        },
      });
    } else {
      await createAttrMutation.mutateAsync({
        isGlobal: true,
        moduleKeyGlobal: activeModuleKey,
        code: trimmedCode,
        name: trimmedName,
        nameEn: trimmedNameEn || undefined,
        fieldType: attrFieldType,
        isRequired: attrRequired,
        options: attrFieldType === "SELECT" ? finalOptions : undefined,
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
    <div className="p-3.5 bg-muted/25 dark:bg-muted/10 rounded-xl flex flex-col gap-3 transition-all">
      <div className="flex items-center justify-between pb-1 border-b border-border/30">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {editingAttr
              ? editingAttr.isSystem
                ? t(
                    "moduleConfig.editSystemAttr",
                    "Chỉnh sửa thuộc tính mặc định",
                  )
                : t("moduleConfig.editAttr", "Chỉnh sửa thuộc tính")
              : t("moduleConfig.addAttr", "Thêm thuộc tính tùy chỉnh")}
          </span>
          {editingAttr?.isSystem && (
            <Tooltip
              content={t(
                "moduleConfig.systemAttrNotice",
                "Thuộc tính mặc định: Mã và Kiểu dữ liệu được cố định để bảo vệ tính toàn vẹn dữ liệu. Bạn có thể tùy chỉnh Tên hiển thị, Ràng buộc bắt buộc và Danh sách các lựa chọn (Options).",
              )}
            >
              <span className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground cursor-help ml-0.5 p-0.5 rounded">
                <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </span>
            </Tooltip>
          )}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="w-6 h-6 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          onClick={handleRequestCloseAttr}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
        <div className="sm:col-span-3">
          <DrawerField
            label={t("moduleConfig.attrCode", "Mã thuộc tính")}
            required
          >
            <input
              type="text"
              className={cn(
                "w-full text-xs rounded-lg px-3 py-2 outline-none transition-all",
                editingAttr?.isSystem ||
                  (editingAttr && (editingAttr.usageCount || 0) > 0)
                  ? "bg-muted/50 text-muted-foreground border border-border/40 cursor-not-allowed font-mono text-[11px]"
                  : "text-foreground bg-background border border-border/60 focus:border-primary focus:ring-1 focus:ring-primary/20",
              )}
              value={attrCode}
              onChange={(e) => setAttrCode(e.target.value)}
              placeholder={t(
                "moduleConfig.attrCodePlaceholder",
                "VD: color, payment_status",
              )}
              disabled={Boolean(
                editingAttr?.isSystem ||
                (editingAttr && (editingAttr.usageCount || 0) > 0),
              )}
            />
          </DrawerField>
        </div>

        <div className="sm:col-span-5">
          <DrawerField
            label={t("moduleConfig.attrName", "Tên hiển thị")}
            required
          >
            <MultilingualInput
              values={attrNames}
              onChange={(newValues) => {
                setAttrNames(newValues);
                setAttrName(newValues.vi || "");
                setAttrNameEn(newValues.en || "");
              }}
              placeholder={t(
                "moduleConfig.attrNamePlaceholder",
                "VD: Màu sắc, Loại nhập...",
              )}
            />
          </DrawerField>
        </div>

        <div className="sm:col-span-2">
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
        </div>

        <div className="sm:col-span-2">
          <DrawerField label={t("moduleConfig.attrConstraint", "Ràng buộc")}>
            <div className="flex items-center gap-1.5 h-9 select-none">
              <Checkbox
                id="attr-required-cb"
                checked={attrRequired}
                onCheckedChange={(c) => setAttrRequired(Boolean(c))}
              />
              <label
                htmlFor="attr-required-cb"
                className="text-xs text-foreground font-medium cursor-pointer whitespace-nowrap"
              >
                {t("moduleConfig.requiredBadge", "Bắt buộc")}
              </label>
            </div>
          </DrawerField>
        </div>
      </div>

      {attrFieldType === "SELECT" && (
        <div className="flex flex-col gap-2 pt-1 border-t border-border/30 mt-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                {t(
                  "moduleConfig.selectOptionsTitle",
                  "Danh sách tùy chọn (Dropdown Options)",
                )}
              </span>
            </label>
            <NeutralCountBadge count={attrOptions.length} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end bg-background/60 dark:bg-background/40 p-2.5 rounded-lg border border-border/40">
            <div>
              <DrawerField
                label={t("moduleConfig.optionKey", "Mã tùy chọn (Key)")}
                required
              >
                <input
                  type="text"
                  className="w-full text-xs text-foreground bg-background border border-border/60 rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all font-mono placeholder:font-sans"
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
                    "Mã (VD: PO, SALE)",
                  )}
                />
              </DrawerField>
            </div>

            <div>
              <DrawerField
                label={t("moduleConfig.optionLabel", "Tên tùy chọn")}
                required
              >
                <MultilingualInput
                  values={newOptionLabels}
                  onChange={(newValues) => {
                    setNewOptionLabels(newValues);
                    setNewOptionLabel(newValues.vi || "");
                    setNewOptionLabelEn(newValues.en || "");
                  }}
                  placeholder={t(
                    "moduleConfig.optionLabelViPlaceholder",
                    "Tên tùy chọn (VD: Nhập từ PO)...",
                  )}
                />
              </DrawerField>
            </div>

            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleAddOption}
              className="h-9 px-3 text-xs shrink-0 flex items-center gap-1 mb-0.5"
            >
              <Plus className="w-3.5 h-3.5" />
              {t("common.add", "Thêm")}
            </Button>
          </div>

          {attrOptions.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {attrOptions.map((opt, idx) => {
                const usedCount = optionsUsage[opt.value] || 0;
                const isOptionInUse = Boolean(editingAttr && usedCount > 0);
                const isEditingThisOption = editingOptionIdx === idx;
                const optionLabelCurrent = resolveOptionLabel(opt, locale, t);

                if (isEditingThisOption) {
                  return (
                    <div
                      key={opt.value}
                      className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 sm:p-2 text-xs bg-muted/40 text-foreground border border-border/70 shadow-2xs rounded-lg w-full sm:w-auto"
                    >
                      <span className="font-mono text-[10px] font-semibold text-muted-foreground self-start sm:self-center px-1">
                        {opt.value}
                      </span>
                      <div className="min-w-[220px] sm:min-w-[260px] flex-1">
                        <MultilingualInput
                          mode="popover"
                          values={editingOptionLabels}
                          onChange={(newValues) => {
                            setEditingOptionLabels(newValues);
                            setEditingOptionLabel(newValues.vi || "");
                            setEditingOptionLabelEn(newValues.en || "");
                          }}
                          placeholder={t(
                            "moduleConfig.optionLabel",
                            "Tên tùy chọn...",
                          )}
                          inputClassName="py-1.5 text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-1 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleSaveOptionLabel(idx)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 p-1 rounded cursor-pointer transition-colors"
                          title={t("common.save", "Lưu")}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditOption}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded cursor-pointer transition-colors"
                          title={t("common.cancel", "Hủy")}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-normal bg-muted/60 hover:bg-muted text-foreground border border-border/40 shadow-2xs group/opt transition-all"
                  >
                    <span className="font-mono text-[10px] font-semibold text-foreground">
                      {opt.value}
                    </span>
                    <span className="text-muted-foreground text-[10px]">•</span>
                    <span className="text-foreground font-medium">
                      {optionLabelCurrent}
                    </span>

                    {/* Reusable Multilingual Translation Preview Badge */}
                    <MultilingualBadge
                      labels={opt.labels}
                      fallbackText={opt.label}
                      fallbackEnText={opt.labelEn}
                      itemKey={opt.value}
                      title={t(
                        "moduleConfig.previewAllTranslations",
                        "Bản dịch tùy chọn",
                      )}
                    />

                    {/* In-Use Badge with Neutral Style & App Tooltip */}
                    {isOptionInUse && (
                      <Tooltip
                        content={t(
                          "moduleConfig.optionInUseTooltip",
                          "Đang có {{count}} bản ghi sử dụng tùy chọn này, không thể xóa",
                        ).replace("{{count}}", String(usedCount))}
                      >
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded font-normal text-muted-foreground bg-black/5 dark:bg-white/5 border border-border/40 cursor-help hover:text-foreground transition-colors">
                          <Database className="w-2.5 h-2.5 text-muted-foreground/80 shrink-0" />
                          <span>{usedCount}</span>
                        </span>
                      </Tooltip>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartEditOption(idx, opt)}
                      className="text-muted-foreground/60 group-hover/opt:text-muted-foreground hover:!text-foreground hover:bg-muted rounded p-0.5 transition-colors ml-0.5 cursor-pointer"
                      title={t("common.edit", "Sửa tên hiển thị")}
                    >
                      <Pencil className="w-2.5 h-2.5" />
                    </button>

                    {isOptionInUse ? (
                      <Tooltip
                        content={t(
                          "moduleConfig.optionInUseTooltip",
                          "Đang có {{count}} bản ghi sử dụng tùy chọn này, không thể xóa",
                        ).replace("{{count}}", String(usedCount))}
                      >
                        <span className="text-muted-foreground/30 p-0.5 ml-0.5 cursor-not-allowed inline-flex items-center">
                          <X className="w-3 h-3" />
                        </span>
                      </Tooltip>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="text-muted-foreground/60 group-hover/opt:text-muted-foreground hover:!text-destructive hover:!bg-destructive/10 rounded p-0.5 transition-colors ml-0.5 cursor-pointer"
                        title={t("common.delete", "Xóa")}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground italic px-1">
              {t(
                "moduleConfig.noOptionsHint",
                "Chưa có tùy chọn nào. Nhập Mã & Tên ở trên rồi bấm Thêm.",
              )}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/30 mt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRequestCloseAttr}
          className="text-xs h-8"
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
                <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {t(
                    "moduleConfig.systemAttributesTitle",
                    "Thuộc tính mặc định",
                  )}
                </span>
                <NeutralCountBadge count={systemDefs.length} />
              </div>
            }
            collapsible
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-2">
              {systemDefs.map((attr) =>
                editingAttr?.id === attr.id ? (
                  <div key={attr.id} className="w-full">
                    {renderAttributeForm()}
                  </div>
                ) : (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-muted/20 hover:bg-muted/40 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-xl text-xs transition-all group border border-border/60 hover:border-border shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-border/80 text-muted-foreground"
                      >
                        <ShieldCheck className="w-3 h-3 text-muted-foreground" />
                        <span>{t("moduleConfig.systemBadge", "Mặc định")}</span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-border/80 text-foreground"
                      >
                        {FIELD_TYPE_ICONS[attr.fieldType]}
                        <span>{getFieldTypeShortLabel(attr.fieldType, t)}</span>
                      </Badge>
                      <span className="font-semibold text-foreground truncate">
                        {resolveAttrName(attr, activeModuleKey, locale, t)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        ({attr.code})
                      </span>
                      {attr.fieldType === "SELECT" && attr.options && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                          {attr.options.length}{" "}
                          {t("moduleConfig.optionsCount", "tùy chọn")}
                        </span>
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
                          className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-surface"
                          onClick={() => openEditAttr(attr)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                ),
              )}
            </div>
          </DrawerSection>
        )}

        {/* 2. Custom Attributes Section */}
        {!isLoading && !isError && (
          <DrawerSection
            title={
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                <span>
                  {t(
                    "moduleConfig.customAttributesTitle",
                    "Thuộc tính tùy chỉnh",
                  )}
                </span>
                <NeutralCountBadge count={customDefs.length} />
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

              {customDefs.map((attr) =>
                editingAttr?.id === attr.id ? (
                  <div key={attr.id} className="w-full">
                    {renderAttributeForm()}
                  </div>
                ) : (
                  <div
                    key={attr.id}
                    className="flex items-center justify-between px-3.5 py-2.5 bg-muted/20 hover:bg-muted/40 dark:bg-muted/10 dark:hover:bg-muted/20 rounded-xl text-xs transition-all group border border-border/60 hover:border-border shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-[10px] gap-1 shrink-0 flex items-center font-medium bg-surface border-border/80 text-foreground"
                      >
                        {FIELD_TYPE_ICONS[attr.fieldType]}
                        <span>{getFieldTypeShortLabel(attr.fieldType, t)}</span>
                      </Badge>
                      <span className="font-semibold text-foreground truncate">
                        {resolveAttrName(attr, activeModuleKey, locale, t)}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        ({attr.code})
                      </span>
                      {attr.fieldType === "SELECT" && attr.options && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                          {attr.options.length}{" "}
                          {t("moduleConfig.optionsCount", "tùy chọn")}
                        </span>
                      )}
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
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-foreground bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                          {attr.usageCount}{" "}
                          {t("moduleConfig.used", "đang dùng")}
                        </span>
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
                          className="w-7 h-7 text-muted-foreground hover:text-foreground hover:bg-surface"
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
                ),
              )}

              {/* Form Thêm thuộc tính mới hiển thị inline */}
              {isAddingAttr && (
                <div className="w-full pt-1">{renderAttributeForm()}</div>
              )}

              {/* Button Thêm thuộc tính nằm ngay bên dưới giữa hàng (bottom-center) */}
              {!isAddingAttr && !editingAttr && (
                <div className="flex justify-center pt-2 pb-0.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openCreateAttr}
                    className="h-8 px-4 text-xs font-medium border-dashed border-border/80 hover:border-foreground/40 text-foreground bg-muted/30 hover:bg-muted/60 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-muted-foreground" />
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

  // State for triggering reset in preview simulator
  const [previewResetKey, setPreviewResetKey] = useState(0);

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
        rightPanelTitleExtra={
          <Tooltip content={t("common.reset", "Làm mới")}>
            <button
              type="button"
              onClick={() => setPreviewResetKey((k) => k + 1)}
              className="p-1 -mr-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer inline-flex items-center justify-center"
              aria-label={t("common.reset", "Làm mới")}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        }
        rightPanelDefaultCollapsed={false}
        stickyRightPanel={true}
        rightPanel={
          <ModuleLivePreviewPanel
            attributes={currentModuleGlobalDefs}
            moduleKey={activeModuleKey}
            resetKey={previewResetKey}
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
