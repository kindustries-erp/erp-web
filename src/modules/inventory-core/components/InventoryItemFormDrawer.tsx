import { useEffect, useState, useCallback, useMemo } from "react";
import { Layers, Check, BookOpen, Link2 } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
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
import { fmtQty } from "@/shared/utils/format";
import {
  moduleConfigApi,
  resolveOptionLabel,
} from "@/core/api/moduleConfigApi";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { InventoryStockLedgerSection } from "./InventoryStockLedgerSection";
import { InventoryItemTrendChart } from "./InventoryItemTrendChart";
import {
  buildInventoryLedgerRows,
  buildInventoryTrendData,
} from "../utils/inventoryLedgerTransform";

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

  const allMovements = useMemo(() => movData?.movements || [], [movData]);

  const inMovementsAll = useMemo(() => {
    return allMovements.filter((m) => Number(m.qtyIn || 0) > 0);
  }, [allMovements]);

  const outMovementsAll = useMemo(() => {
    return allMovements.filter((m) => Number(m.qtyOut || 0) > 0);
  }, [allMovements]);

  const totalInQty = useMemo(() => {
    return inMovementsAll.reduce((sum, m) => sum + Number(m.qtyIn || 0), 0);
  }, [inMovementsAll]);

  const totalOutQty = useMemo(() => {
    return outMovementsAll.reduce((sum, m) => sum + Number(m.qtyOut || 0), 0);
  }, [outMovementsAll]);

  const currentOnHand = movData?.currentOnHand ?? totalInQty - totalOutQty;

  const ledgerRows = useMemo(
    () => buildInventoryLedgerRows(allMovements),
    [allMovements],
  );

  const trendData = useMemo(
    () => buildInventoryTrendData(ledgerRows),
    [ledgerRows],
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
          title={t("inventoryMasters.drawer.sectionItem", "Thông tin item kho")}
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
          {/* 1. Item Master Information */}
          <DrawerSection
            title={t(
              "inventoryMasters.drawer.sectionItem",
              "Thông tin item kho",
            )}
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
              label={t("inventoryMasters.fields.itemName", "Tên item kho")}
              value={editing?.itemName || form.itemName || "—"}
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

            {/* 3 Metric Summary Cards */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center justify-center p-2.5 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <span className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-1">
                  {t("inventory.chart.totalIn", "Tổng Nhập")}
                </span>
                <span className="font-bold text-orange-700 dark:text-orange-300 text-base tabular-nums">
                  +{fmtQty(totalInQty)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                  {t("inventory.chart.totalOut", "Tổng Xuất")}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-base tabular-nums">
                  -{fmtQty(totalOutQty)}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">
                  {t("inventory.chart.balance", "Tồn Cuối")}
                </span>
                <span className="font-extrabold text-blue-700 dark:text-blue-300 text-lg tabular-nums">
                  {fmtQty(currentOnHand)}
                </span>
              </div>
            </div>
          </DrawerSection>

          {/* 2. Trend Chart */}
          <InventoryItemTrendChart
            trendData={trendData}
            chartHeight={180}
            uomName={uomName}
          />

          {/* 3. Trường tùy chỉnh mở rộng */}
          <ModuleEntityCustomFieldsSection
            moduleKey="INVENTORY_ITEM"
            entityId={editing?.id}
            editMode={false}
            hideCategorySection={true}
            attributes={form.customAttributes}
            globalAttributes={form.customAttributes}
            globalTitle={t("moduleConfig.customFields", "Trường tùy chỉnh")}
            globalCollapsible={true}
            globalDefaultCollapsed={false}
          />

          {/* 4. Ghi chú if any */}
          {form.note && (
            <DrawerSection title={t("inventoryMasters.fields.note", "Ghi chú")}>
              <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {form.note}
              </p>
            </DrawerSection>
          )}
        </div>
      ) : (
        <>
          <DrawerSection
            title={t(
              "inventoryMasters.drawer.sectionItem",
              "Thông tin item kho",
            )}
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
                  placeholder="Chọn chính sách tracking"
                />
                {editing?.hasSerials && !viewOnly && (
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 block">
                    {t(
                      "inventoryMasters.warnings.lockedPolicy",
                      "⚠️ Mặt hàng đã có số Serial trong kho, không thể thay đổi Tracking Policy.",
                    )}
                  </span>
                )}
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection
            title={
              <span className="inline-flex items-center gap-1.5 flex-wrap">
                <span>
                  {t("inventoryMasters.attributes.label", "Thuộc tính")}
                </span>
                <AttributeTypeBadge type="system" />
              </span>
            }
          >
            <div className="flex flex-wrap gap-2.5 mt-2">
              {featureOptions.map((attr) => {
                const isSelected = form.attributes.includes(attr.value);
                return (
                  <button
                    key={attr.value}
                    type="button"
                    disabled={viewOnly}
                    onClick={() => {
                      setForm((prev) => {
                        const newAttrs = isSelected
                          ? prev.attributes.filter((a) => a !== attr.value)
                          : [...prev.attributes, attr.value];
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
                    className={cn(
                      "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 select-none shadow-2xs",
                      isSelected
                        ? "bg-primary/10 border-primary text-primary dark:bg-primary/20 dark:border-primary/80 dark:text-primary font-bold shadow-xs"
                        : "bg-background border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300",
                      viewOnly && "cursor-default opacity-80",
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-sm border flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "bg-primary border-primary text-white"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900",
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </span>
                    <span className="leading-none">{attr.label}</span>
                  </button>
                );
              })}
            </div>
          </DrawerSection>

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
            globalTitle={t("moduleConfig.customFields", "Trường tùy chỉnh")}
            globalCollapsible={true}
            globalDefaultCollapsed={false}
          />

          <DrawerSection title={t("inventoryMasters.fields.note", "Ghi chú")}>
            <div className="mt-1">
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
            </div>
          </DrawerSection>
        </>
      )}
    </>
  );

  const drawerTabs: DrawerTopTabItem[] | undefined = useMemo(() => {
    if (isCreating || !itemId) return undefined;

    return [
      {
        key: "stock_ledger",
        label: t("inventoryMasters.drawer.tabLedger", "Sổ thẻ kho & Thông tin"),
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
      defaultTabKey="stock_ledger"
      leftPanel={isCreating ? formContent : undefined}
      rightPanel={undefined}
    />
  );
}
