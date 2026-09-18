import { useEffect, useState, useCallback, useMemo } from "react";
import { Layers, BookOpen, Link2, LayoutDashboard } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { AttributeTypeBadge } from "@/shared/components/AttributeTypeBadge";
import {
  StandardFormDrawer,
  DrawerDocumentTraceability,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { Combobox } from "@/shared/components/Combobox";
import { cn } from "@/shared/utils";
import { ModuleEntityCustomFieldsSection } from "@/shared/components/ModuleEntityCustomFieldsSection";
import {
  DrawerAction,
  DrawerField,
  DrawerSection,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { useUIStore } from "@/core/config/uiStore";
import { useAppStore } from "@/core/config/appStore";
import { useT } from "@/core/i18n";
import {
  moduleConfigApi,
  resolveOptionLabel,
} from "@/core/api/moduleConfigApi";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { InventoryStockLedgerSection } from "./InventoryStockLedgerSection";
import {
  InventoryItemOverviewSection,
  InventoryDocTypeBreakdownSection,
  computeDocTypeStats,
} from "./InventoryItemOverviewSection";

interface ItemForm {
  sku: string;
  itemName: string;
  uomId: string;
  itemTypeId: string;
  categoryId: string | null;
  status: string;
  note: string;
  trackingPolicyId: string;
  attributes: string[];
  customAttributes: Record<string, any>;
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uomId: "",
  itemTypeId: "",
  categoryId: null,
  status: "ACTIVE",
  note: "",
  trackingPolicyId: "",
  attributes: [],
  customAttributes: {},
});

const normalizeItemTypeCode = (val?: string | null): string => {
  if (!val) return "";
  const upper = val.toUpperCase().trim();
  if (upper === "RAW" || upper === "RAW_MATERIAL") return "RAW_MATERIAL";
  if (upper === "FG" || upper === "FINISHED" || upper === "FINISHED_GOODS")
    return "FINISHED_GOODS";
  if (upper === "PART" || upper === "SPARE_PART") return "SPARE_PART";
  if (upper === "SERVICE") return "SERVICE";
  if (upper === "SEMI_FINISHED") return "SEMI_FINISHED";
  if (upper === "CONSUMABLE") return "CONSUMABLE";
  return val;
};

function buildForm(item: ErpInventoryItem): ItemForm {
  let attrsArray: string[] = [];

  // 1. Ưu tiên customAttributes.item_features
  if (Array.isArray(item.customAttributes?.item_features)) {
    attrsArray = item.customAttributes.item_features;
  } else if (typeof item.customAttributes?.item_features === "string") {
    try {
      const parsed = JSON.parse(item.customAttributes.item_features);
      if (Array.isArray(parsed)) attrsArray = parsed;
      else
        attrsArray = item.customAttributes.item_features
          .split(",")
          .map((s) => s.trim());
    } catch {
      attrsArray = item.customAttributes.item_features
        .split(",")
        .map((s) => s.trim());
    }
  }
  // 2. Tiếp theo kiểm tra attributeValues EAV array
  else if (item.attributeValues && Array.isArray(item.attributeValues)) {
    const featVal = item.attributeValues.find((v) =>
      ["item_features", "item_attributes", "business_features"].includes(
        v.attrCode?.toLowerCase() || "",
      ),
    )?.valueText;
    if (featVal) {
      try {
        const parsed = JSON.parse(featVal);
        if (Array.isArray(parsed)) attrsArray = parsed;
        else
          attrsArray = String(featVal)
            .split(",")
            .map((s: string) => s.trim());
      } catch {
        attrsArray = String(featVal)
          .split(",")
          .map((s: string) => s.trim());
      }
    }
  }
  // 3. Fallback sang attributes từ entity DB
  if (attrsArray.length === 0) {
    if (Array.isArray(item.attributes)) {
      attrsArray = item.attributes;
    } else if (typeof (item as any).attributes === "string") {
      try {
        const parsed = JSON.parse((item as any).attributes);
        if (Array.isArray(parsed)) attrsArray = parsed;
      } catch {
        attrsArray = (item as any).attributes
          .split(",")
          .map((s: string) => s.trim());
      }
    }
  }

  const customAttrs = item.customAttributes ? { ...item.customAttributes } : {};
  if (attrsArray.length > 0 && !customAttrs.item_features) {
    customAttrs.item_features = attrsArray;
  }

  const uomVal =
    item.customAttributes?.uom ||
    item.uom?.code ||
    item.uom?.name ||
    item.uomId ||
    "";
  const rawItemType =
    item.customAttributes?.item_type ||
    item.itemType?.code ||
    item.itemType?.name ||
    item.itemTypeId ||
    "";
  const itemTypeVal = normalizeItemTypeCode(rawItemType);

  const trackingPolicyVal =
    item.customAttributes?.tracking_policy ||
    item.trackingPolicy?.code ||
    item.trackingPolicy?.name ||
    item.trackingPolicyId ||
    "";

  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uomId: uomVal,
    itemTypeId: itemTypeVal,
    categoryId: item.categoryId ?? null,
    status: item.status ?? "ACTIVE",
    note: item.note ?? "",
    trackingPolicyId: trackingPolicyVal,
    attributes: attrsArray,
    customAttributes: customAttrs,
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  const customAttrs = { ...form.customAttributes };
  if (form.attributes.length > 0) {
    customAttrs.item_features = form.attributes;
  }
  if (form.uomId) {
    customAttrs.uom = form.uomId;
  }
  if (form.itemTypeId) {
    customAttrs.item_type = form.itemTypeId;
  }
  if (form.trackingPolicyId) {
    customAttrs.tracking_policy = form.trackingPolicyId;
  }

  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uomId: form.uomId,
    itemTypeId: form.itemTypeId,
    categoryId: form.categoryId || undefined,
    status: form.status || "ACTIVE",
    note: form.note.trim() || undefined,
    trackingPolicyId: form.trackingPolicyId || undefined,
    attributes: form.attributes.length > 0 ? form.attributes : undefined,
    customAttributes:
      Object.keys(customAttrs).length > 0 ? customAttrs : undefined,
  };
}

export function InventoryItemFormDrawer({
  open,
  onClose,
  itemId,
  onSuccess,
  viewOnly: initialViewOnly = false,
  onToggleEdit,
  onOpenDocument,
  zIndex,
}: {
  open: boolean;
  onClose: () => void;
  itemId?: string | null;
  onSuccess?: (createdItem?: ErpInventoryItem) => void;
  viewOnly?: boolean;
  onToggleEdit?: () => void;
  onOpenDocument?: (docId: string, docType: string) => void;
  zIndex?: number;
}) {
  const t = useT();
  const locale = useAppStore((s) => s.locale);
  const showToast = useUIStore((s) => s.showToast);

  const [viewOnly, setViewOnly] = useState(initialViewOnly);
  const [activeTabKey, setActiveTabKey] = useState("overview");
  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [movData, setMovData] = useState<InventoryMovementsPayload | undefined>(
    undefined,
  );
  const [movLoading, setMovLoading] = useState(false);
  const [movError, setMovError] = useState<string | null>(null);

  const [uomOptions, setUomOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [itemTypeOptions, setItemTypeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [trackingPolicyOptions, setTrackingPolicyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [featureOptions, setFeatureOptions] = useState<
    Array<{ value: string; label: string }>
  >([
    {
      value: "CAN_BE_SOLD",
      label: t("inventoryMasters.attributes.CAN_BE_SOLD", "Có thể bán"),
    },
    {
      value: "CAN_BE_PURCHASED",
      label: t("inventoryMasters.attributes.CAN_BE_PURCHASED", "Có thể mua"),
    },
    {
      value: "CAN_BE_MANUFACTURED",
      label: t(
        "inventoryMasters.attributes.CAN_BE_MANUFACTURED",
        "Có thể sản xuất",
      ),
    },
  ]);

  const loadMasters = useCallback(async () => {
    try {
      const globalDefs = await moduleConfigApi
        .getGlobalAttributeDefs("INVENTORY_ITEM")
        .catch(() => []);

      // 1. UOM Options từ Module Config
      const uomDef = globalDefs.find(
        (d: any) =>
          !d.isDeleted &&
          d.isActive !== false &&
          ["uom", "type_inventory_uom", "inventory_uom", "unit"].includes(
            d.code?.toLowerCase(),
          ),
      );
      if (uomDef?.options && uomDef.options.length > 0) {
        setUomOptions(
          uomDef.options.map((opt: any) => ({
            value: opt.value,
            label: `${opt.value} — ${resolveOptionLabel(opt, locale, t)}`,
          })),
        );
      }

      // 2. Item Type Options từ Module Config
      const itemTypeDef = globalDefs.find(
        (d: any) =>
          !d.isDeleted &&
          d.isActive !== false &&
          [
            "item_type",
            "type_inventory_item_type",
            "inventory_item_type",
            "item_category",
          ].includes(d.code?.toLowerCase()),
      );
      if (itemTypeDef?.options && itemTypeDef.options.length > 0) {
        setItemTypeOptions(
          itemTypeDef.options.map((opt: any) => ({
            value: opt.value,
            label: `${opt.value} — ${resolveOptionLabel(opt, locale, t)}`,
          })),
        );
      }

      // 3. Tracking Policy Options từ Module Config
      const trackingPolicyDef = globalDefs.find(
        (d: any) =>
          !d.isDeleted &&
          d.isActive !== false &&
          ["tracking_policy", "tracking_policy_type"].includes(
            d.code?.toLowerCase(),
          ),
      );
      if (trackingPolicyDef?.options && trackingPolicyDef.options.length > 0) {
        setTrackingPolicyOptions(
          trackingPolicyDef.options.map((opt: any) => ({
            value: opt.value,
            label: `${opt.value} — ${resolveOptionLabel(opt, locale, t)}`,
          })),
        );
      }

      // 4. Item Features Options từ Module Config
      const featuresDef = globalDefs.find(
        (d: any) =>
          !d.isDeleted &&
          d.isActive !== false &&
          ["item_features", "item_attributes", "business_features"].includes(
            d.code?.toLowerCase(),
          ),
      );
      if (
        featuresDef &&
        featuresDef.options &&
        featuresDef.options.length > 0
      ) {
        setFeatureOptions(
          featuresDef.options.map((opt: any) => ({
            value: opt.value,
            label: resolveOptionLabel(opt, locale, t),
          })),
        );
      }
    } catch {
      // silent
    }
  }, [locale, t]);

  const loadItem = useCallback(async (id: string) => {
    setLoading(true);
    setSaveError(null);
    try {
      const item = await inventoryCoreApi.get(id);
      setEditing(item);
      setForm(buildForm(item));
    } catch (e: any) {
      setSaveError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải thông tin item kho",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMovements = useCallback(async (id: string) => {
    setMovLoading(true);
    setMovError(null);
    try {
      const data = await inventoryCoreApi.movements(id);
      setMovData(data);
    } catch (e: any) {
      setMovError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể tải lịch sử chuyển động kho",
      );
    } finally {
      setMovLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setEditing(null);
      setForm(emptyForm());
      setSaveError(null);
      setMovData(undefined);
      setMovError(null);
      return;
    }
    setViewOnly(initialViewOnly);
    setActiveTabKey("overview");
    void loadMasters();
    if (itemId) {
      void loadItem(itemId);
      void loadMovements(itemId);
    } else {
      setEditing(null);
      setForm(emptyForm());
    }
  }, [open, itemId, initialViewOnly, loadMasters, loadItem, loadMovements]);

  async function handleSave() {
    if (!form.sku.trim()) {
      setSaveError("Mã SKU là bắt buộc");
      return;
    }
    if (!form.itemName.trim()) {
      setSaveError("Tên item kho là bắt buộc");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const payload = toPayload(form);
      let savedItem: ErpInventoryItem | undefined;
      if (editing) {
        savedItem = await inventoryCoreApi.update(editing.id, payload);
      } else {
        savedItem = await inventoryCoreApi.create(payload);
      }
      showToast({
        title: editing ? "Cập nhật thành công" : "Tạo mới thành công",
        variant: "success",
      });
      onSuccess?.(savedItem);
      onClose();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  const docTypeStats = useMemo(
    () => computeDocTypeStats(movData?.movements || []),
    [movData?.movements],
  );

  const uomName =
    editing?.uom?.name ||
    editing?.uom?.code ||
    uomOptions.find((u) => u.value === form.uomId)?.label?.split(" — ")[1] ||
    "";

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";
  const isCreating = !itemId && !editing;

  const drawerActions: DrawerAction[] = viewOnly
    ? [
        {
          label: t("common.close", "Đóng"),
          onClick: onClose,
          variant: "outline",
        },
      ]
    : [
        {
          label: t("common.cancel", "Hủy"),
          onClick: onClose,
          variant: "outline",
        },
        {
          label: editing
            ? t("common.save", "Lưu thay đổi")
            : t("common.create", "Tạo mới"),
          onClick: handleSave,
          primary: true,
          loading: saving || loading,
          disabled: loading,
        },
      ];

  const inputCls =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-60";

  const formContent = (
    <>
      {saveError && (
        <div className="mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {saveError}
        </div>
      )}

      {loading ? (
        <DrawerSection
          title={t("common.generalInfo", "THÔNG TIN CHUNG")}
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="w-full">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </DrawerSection>
      ) : viewOnly ? (
        <div className="flex flex-col gap-4">
          {/* 1. THÔNG TIN CHUNG */}
          <DrawerSection
            title={t("common.generalInfo", "THÔNG TIN CHUNG")}
            collapsible={true}
            defaultCollapsed={false}
          >
            <DrawerRow
              label={t("inventoryMasters.fields.sku", "Mã SKU")}
              value={
                <span className="font-bold text-foreground">
                  {editing?.sku || form.sku}
                </span>
              }
            />
            <DrawerRow
              label={t("inventoryMasters.fields.itemName", "Tên item kho")}
              value={editing?.itemName || form.itemName || "—"}
            />
            {form.note && (
              <DrawerRow
                label={t("inventoryMasters.fields.note", "Ghi chú")}
                value={
                  <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                    {form.note}
                  </p>
                }
              />
            )}
          </DrawerSection>

          {/* 2. CƠ CẤU CHỨNG TỪ (RIGHT PANEL) */}
          <InventoryDocTypeBreakdownSection stats={docTypeStats} />

          {/* 2. THUỘC TÍNH MẶC ĐỊNH */}
          <DrawerSection
            title={t("defaultAttributes", "THUỘC TÍNH MẶC ĐỊNH")}
            collapsible={true}
            defaultCollapsed={false}
          >
            <DrawerRow
              label={
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <span>
                    {t("inventoryMasters.fields.uom", "Đơn vị tính (ĐVT)")}
                  </span>
                  <AttributeTypeBadge type="system" />
                </span>
              }
              value={uomName || "—"}
            />
            <DrawerRow
              label={
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <span>
                    {t("inventoryMasters.fields.itemType", "Loại item")}
                  </span>
                  <AttributeTypeBadge type="system" />
                </span>
              }
              value={
                editing?.itemType?.name ||
                itemTypeOptions
                  .find((t) => t.value === form.itemTypeId)
                  ?.label?.split(" — ")[1] ||
                "—"
              }
            />
            <DrawerRow
              label={
                <span className="inline-flex items-center gap-1.5 flex-wrap">
                  <span>
                    {t(
                      "inventoryMasters.fields.trackingPolicy",
                      "Tracking policy",
                    )}
                  </span>
                  <AttributeTypeBadge type="system" />
                </span>
              }
              value={
                editing?.trackingPolicy?.name ||
                trackingPolicyOptions
                  .find((p) => p.value === form.trackingPolicyId)
                  ?.label?.split(" — ")[1] ||
                "Không"
              }
            />
            {form.attributes && form.attributes.length > 0 && (
              <DrawerRow
                label={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {t("inventoryMasters.attributes.label", "Thuộc tính")}
                    </span>
                    <AttributeTypeBadge type="system" />
                  </span>
                }
                value={
                  <div className="flex flex-wrap gap-1.5 py-0.5">
                    {form.attributes.map((attrKey) => {
                      const opt = featureOptions.find(
                        (o) => o.value === attrKey,
                      );
                      return (
                        <Badge
                          key={attrKey}
                          variant="secondary"
                          className="text-[11px] font-normal"
                        >
                          {opt?.label || attrKey}
                        </Badge>
                      );
                    })}
                  </div>
                }
              />
            )}
          </DrawerSection>

          {/* 3. THUỘC TÍNH TÙY CHỈNH */}
          <ModuleEntityCustomFieldsSection
            moduleKey="INVENTORY_ITEM"
            entityId={editing?.id}
            editMode={false}
            hideCategorySection={true}
            attributes={form.customAttributes}
            globalAttributes={form.customAttributes}
            globalTitle={t(
              "inventoryMasters.drawer.customAttributes",
              "THUỘC TÍNH TÙY CHỈNH",
            )}
            globalCollapsible={true}
            globalDefaultCollapsed={false}
          />
        </div>
      ) : (
        <>
          {/* 1. THÔNG TIN CHUNG */}
          <DrawerSection
            title={t("inventoryMasters.drawer.generalInfo", "THÔNG TIN CHUNG")}
            collapsible={true}
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-3">
              <DrawerField
                label={t("inventoryMasters.fields.sku", "SKU")}
                required
              >
                <input
                  value={form.sku}
                  disabled={viewOnly || !!editing}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, sku: e.target.value }))
                  }
                  className={inputCls}
                  placeholder={t(
                    "inventoryMasters.fields.skuPlaceholder",
                    "VD: FG-001",
                  )}
                />
              </DrawerField>

              <DrawerField
                label={t("inventoryMasters.fields.itemName", "Tên item kho")}
                required
              >
                <input
                  value={form.itemName}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      itemName: e.target.value,
                    }))
                  }
                  className={inputCls}
                  placeholder={t(
                    "inventoryMasters.fields.itemNamePlaceholder",
                    "Tên đầy đủ của item kho",
                  )}
                />
              </DrawerField>

              <DrawerField label={t("inventoryMasters.fields.note", "Ghi chú")}>
                <textarea
                  value={form.note}
                  disabled={viewOnly}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder={t(
                    "inventoryMasters.fields.notePlaceholder",
                    "Ghi chú thêm về item kho này...",
                  )}
                />
              </DrawerField>
            </div>
          </DrawerSection>

          {/* 2. THUỘC TÍNH MẶC ĐỊNH */}
          <DrawerSection
            title={t(
              "inventoryMasters.drawer.defaultAttributes",
              "THUỘC TÍNH MẶC ĐỊNH",
            )}
            collapsible={true}
            defaultCollapsed={false}
          >
            <div className="flex flex-col gap-3">
              <DrawerField
                label={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {t("inventoryMasters.fields.uom", "Đơn vị tính (ĐVT)")}
                    </span>
                    <AttributeTypeBadge type="system" />
                  </span>
                }
                required
              >
                <Combobox
                  value={form.uomId}
                  disabled={viewOnly}
                  allowClear={false}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      uomId: value || form.uomId,
                    }))
                  }
                  options={uomOptions}
                  placeholder={t(
                    "inventoryMasters.fields.uomPlaceholder",
                    "Chọn ĐVT",
                  )}
                />
              </DrawerField>

              <DrawerField
                label={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {t("inventoryMasters.fields.itemType", "Loại item")}
                    </span>
                    <AttributeTypeBadge type="system" />
                  </span>
                }
              >
                <Combobox
                  value={form.itemTypeId}
                  disabled={viewOnly}
                  allowClear={false}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      itemTypeId: value || form.itemTypeId,
                    }))
                  }
                  options={itemTypeOptions}
                  placeholder={t(
                    "inventoryMasters.fields.itemTypePlaceholder",
                    "Chọn loại",
                  )}
                />
              </DrawerField>

              <DrawerField
                label={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {t(
                        "inventoryMasters.fields.trackingPolicy",
                        "Tracking policy",
                      )}
                    </span>
                    <AttributeTypeBadge type="system" />
                  </span>
                }
              >
                <Combobox
                  value={form.trackingPolicyId}
                  disabled={viewOnly || !!editing?.hasSerials}
                  allowClear
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      trackingPolicyId: value || "",
                    }))
                  }
                  options={trackingPolicyOptions}
                  placeholder={t(
                    "inventoryMasters.fields.trackingPolicyPlaceholder",
                    "Chọn tracking policy",
                  )}
                />
                {editing?.hasSerials && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {t(
                      "inventoryMasters.fields.trackingPolicyLocked",
                      "⚠️ Mặt hàng đã có số Serial trong kho, không thể thay đổi Tracking Policy.",
                    )}
                  </span>
                )}
              </DrawerField>

              <DrawerField
                label={
                  <span className="inline-flex items-center gap-1.5 flex-wrap">
                    <span>
                      {t("inventoryMasters.attributes.label", "Thuộc tính")}
                    </span>
                    <AttributeTypeBadge type="system" />
                  </span>
                }
              >
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1.5 pb-1">
                  {featureOptions.map((attr) => {
                    const isSelected = form.attributes.includes(attr.value);
                    const checkboxId = `item-attr-${attr.value}`;
                    return (
                      <div key={attr.value} className="flex items-center gap-2">
                        <Checkbox
                          id={checkboxId}
                          checked={isSelected}
                          disabled={viewOnly}
                          onCheckedChange={(checked) => {
                            if (viewOnly) return;
                            setForm((prev) => {
                              const newAttrs = checked
                                ? [
                                    ...prev.attributes.filter(
                                      (a) => a !== attr.value,
                                    ),
                                    attr.value,
                                  ]
                                : prev.attributes.filter(
                                    (a) => a !== attr.value,
                                  );
                              return {
                                ...prev,
                                attributes: newAttrs,
                                customAttributes: {
                                  ...prev.customAttributes,
                                  item_features: newAttrs,
                                },
                              };
                            });
                          }}
                        />
                        <label
                          htmlFor={checkboxId}
                          className={cn(
                            "text-xs font-medium select-none transition-colors",
                            viewOnly
                              ? "cursor-default opacity-80"
                              : "cursor-pointer hover:text-foreground",
                            isSelected
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground",
                          )}
                        >
                          {attr.label}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </DrawerField>
            </div>
          </DrawerSection>

          {/* 3. THUỘC TÍNH TÙY CHỈNH */}
          <ModuleEntityCustomFieldsSection
            moduleKey="INVENTORY_ITEM"
            entityId={editing?.id}
            editMode={true}
            hideCategorySection={true}
            attributes={form.customAttributes}
            onAttributesChange={(attrs) =>
              setForm((prev) => ({
                ...prev,
                customAttributes: { ...prev.customAttributes, ...attrs },
              }))
            }
            globalAttributes={form.customAttributes}
            onGlobalAttributesChange={(attrs) =>
              setForm((prev) => ({
                ...prev,
                customAttributes: { ...prev.customAttributes, ...attrs },
              }))
            }
            categoryId={form.categoryId}
            onCategoryChange={(catId) =>
              setForm((prev) => ({ ...prev, categoryId: catId }))
            }
            globalTitle={t(
              "inventoryMasters.drawer.customAttributes",
              "THUỘC TÍNH TÙY CHỈNH",
            )}
            globalCollapsible={true}
            globalDefaultCollapsed={false}
          />
        </>
      )}
    </>
  );

  const drawerTabs: DrawerTopTabItem[] | undefined = useMemo(() => {
    if (isCreating || !itemId) return undefined;

    return [
      {
        key: "overview",
        label: t("inventoryMasters.drawer.tabOverview", "Tổng quan"),
        icon: <LayoutDashboard className="w-3.5 h-3.5" />,
        content: (
          <div className="flex flex-col gap-6 w-full">
            <InventoryItemOverviewSection
              itemId={itemId}
              loading={movLoading && !!itemId}
              error={movError}
              movements={movData?.movements || []}
              itemInfo={{
                sku: editing?.sku || form.sku || "",
                itemName: editing?.itemName || form.itemName || "",
                uom: uomName,
              }}
              onOpenDocument={onOpenDocument}
              onNavigateToLedger={() => setActiveTabKey("stock_ledger")}
            />
          </div>
        ),
        rightPanel: formContent,
      },
      {
        key: "stock_ledger",
        label: t("inventoryMasters.drawer.tabLedger", "Sổ thẻ kho"),
        icon: <BookOpen className="w-3.5 h-3.5" />,
        content: (
          <div className="flex flex-col gap-6 w-full">
            <InventoryStockLedgerSection
              itemId={itemId}
              loading={movLoading && !!itemId}
              error={movError}
              movements={movData?.movements || []}
              itemInfo={{
                sku: editing?.sku || form.sku || "",
                itemName: editing?.itemName || form.itemName || "",
                uom: uomName,
              }}
              onOpenDocument={onOpenDocument}
            />
          </div>
        ),
        rightPanel: formContent,
      },
      {
        key: "traceability_graph",
        label: t(
          "inventoryMasters.drawer.tabTraceability",
          "Chứng từ liên kết",
        ),
        icon: <Link2 className="w-3.5 h-3.5" />,
        hideRightPanel: true,
        content: (
          <DrawerDocumentTraceability
            rootId={itemId}
            rootType="INVENTORY_ITEM"
            fetchGraph={inventoryCoreApi.getTraceabilityGraph}
            editMode={false}
            allowedDocTypes={[
              "GOODS_RECEIPT",
              "GOODS_ISSUE",
              "PRODUCTION_ORDER",
              "PURCHASE_ORDER",
              "SALES_ORDER",
              "BOM",
            ]}
          />
        ),
      },
    ];
  }, [
    isCreating,
    itemId,
    movLoading,
    movError,
    movData,
    editing,
    form,
    uomName,
    onOpenDocument,
    formContent,
    t,
  ]);

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      confirmOnClose={!viewOnly}
      onToggleEdit={onToggleEdit ? onToggleEdit : () => setViewOnly(false)}
      icon={<Layers className="h-4 w-4" />}
      title={
        viewOnly
          ? t("inventoryMasters.drawer.viewItem", "Chi tiết item kho")
          : editing
            ? t("inventoryMasters.drawer.editItem", "Cập nhật item kho")
            : t("inventoryMasters.drawer.createItem", "Tạo item kho mới")
      }
      subtitle={
        editing
          ? `${editing.sku}${editing.itemName ? ` — ${editing.itemName}` : ""}`
          : t(
              "inventoryMasters.drawer.subtitleItem",
              "Danh mục item kho dùng chung",
            )
      }
      titleExtra={
        editing ? (
          <Badge
            variant={editing.status === "ACTIVE" ? "default" : "secondary"}
          >
            {editing.status === "ACTIVE"
              ? t("inventoryMasters.status.active", "ACTIVE")
              : t("inventoryMasters.status.inactive", "INACTIVE")}
          </Badge>
        ) : undefined
      }
      actions={drawerActions}
      zIndex={zIndex}
      layout={isCreating ? "1-column" : "2-columns"}
      size={isCreating ? "md" : "full"}
      panelClassName={
        isCreating ? "w-full max-w-[620px]" : "w-full lg:w-[calc(100vw-208px)]"
      }
      collapsibleRightPanel={!isCreating}
      tabs={drawerTabs}
      activeTabKey={activeTabKey}
      onTabChange={setActiveTabKey}
      defaultTabKey="overview"
      leftPanel={isCreating ? formContent : undefined}
      rightPanel={undefined}
    />
  );
}
