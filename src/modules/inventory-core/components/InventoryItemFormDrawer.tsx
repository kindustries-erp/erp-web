import { useEffect, useState, useCallback, useMemo } from "react";
import { Layers } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Badge } from "@/shared/components/ui/badge";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerAction,
  DrawerField,
  DrawerSection,
  DrawerRow,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import { fmtQty } from "@/shared/utils/format";
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
  status: string;
  note: string;
  trackingPolicyId: string;
  trackingCategoryId: string;
  attributes: string[];
}

const emptyForm = (): ItemForm => ({
  sku: "",
  itemName: "",
  uomId: "",
  itemTypeId: "",
  status: "ACTIVE",
  note: "",
  trackingPolicyId: "",
  trackingCategoryId: "",
  attributes: [],
});

function buildForm(item: ErpInventoryItem): ItemForm {
  return {
    sku: item.sku ?? "",
    itemName: item.itemName ?? "",
    uomId: item.uomId ?? "",
    itemTypeId: item.itemTypeId ?? "",
    status: item.status ?? "ACTIVE",
    note: item.note ?? "",
    trackingPolicyId: item.trackingPolicyId ?? "",
    trackingCategoryId: item.trackingCategoryId ?? "",
    attributes: item.attributes ?? [],
  };
}

function toPayload(form: ItemForm): CreateInventoryItemPayload {
  return {
    sku: form.sku.trim(),
    itemName: form.itemName.trim(),
    uomId: form.uomId,
    itemTypeId: form.itemTypeId,
    status: form.status || "ACTIVE",
    note: form.note.trim() || undefined,
    trackingPolicyId: form.trackingPolicyId || undefined,
    trackingCategoryId: form.trackingCategoryId || undefined,
    attributes: form.attributes.length > 0 ? form.attributes : undefined,
  };
}

function buildMasterOptions(
  items: InventoryMasterOption[],
  useCodeAsValue = false,
) {
  return items
    .filter((item) => item.isActive)
    .map((item) => ({
      value: useCodeAsValue ? item.code : item.id,
      label: `${item.code} — ${item.name}`,
    }));
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
  const [trackingCategoryOptions, setTrackingCategoryOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [trackingPolicyOptions, setTrackingPolicyOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const loadMasters = useCallback(async () => {
    try {
      const [uoms, itemTypes, trackingCategories, trackingPolicies] =
        await Promise.all([
          inventoryCoreApi.listUoms({ page: 1, pageSize: 500, isActive: true }),
          inventoryCoreApi.listItemTypes({
            page: 1,
            pageSize: 500,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingCategories({
            page: 1,
            pageSize: 500,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingPolicies({ page: 1, pageSize: 50 }),
        ]);
      setUomOptions(buildMasterOptions(uoms.items));
      setItemTypeOptions(buildMasterOptions(itemTypes.items));
      setTrackingCategoryOptions(
        buildMasterOptions(trackingCategories.items, true),
      );
      setTrackingPolicyOptions(
        trackingPolicies.items
          .filter((p) => p.isActive)
          .map((p) => ({
            value: p.id,
            label: `${p.code} — ${p.name}`,
          })),
      );
    } catch {
      // silent
    }
  }, []);

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
              label={t("inventoryMasters.fields.uom", "Đơn vị tính (ĐVT)")}
              value={uomName || "—"}
            />
            <DrawerRow
              label={t("inventoryMasters.fields.itemName", "Tên item kho")}
              value={editing?.itemName || form.itemName || "—"}
            />
            <DrawerRow
              label={t("inventoryMasters.fields.itemType", "Loại item")}
              value={
                editing?.itemType?.name ||
                itemTypeOptions
                  .find((t) => t.value === form.itemTypeId)
                  ?.label?.split(" — ")[1] ||
                "—"
              }
            />
            <DrawerRow
              label={t(
                "inventoryMasters.fields.trackingPolicy",
                "Tracking policy",
              )}
              value={
                editing?.trackingPolicy?.name ||
                trackingPolicyOptions
                  .find((p) => p.value === form.trackingPolicyId)
                  ?.label?.split(" — ")[1] ||
                "Không"
              }
            />

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

          {/* Notes if any */}
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
                label={t("inventoryMasters.fields.uom", "Đơn vị tính (ĐVT)")}
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
                label={t("inventoryMasters.fields.itemType", "Loại item")}
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
                label={t(
                  "inventoryMasters.fields.trackingPolicy",
                  "Tracking policy",
                )}
              >
                <Combobox
                  value={form.trackingPolicyId}
                  disabled={viewOnly || !!editing?.hasSerials}
                  allowClear
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      trackingPolicyId: value || "",
                      trackingCategoryId: value ? prev.trackingCategoryId : "",
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

              <DrawerField
                label={t(
                  "inventoryMasters.fields.trackingCategory",
                  "Tracking category",
                )}
              >
                <Combobox
                  value={form.trackingCategoryId}
                  disabled={viewOnly || !!editing?.hasSerials}
                  allowClear
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      trackingCategoryId: value || "",
                    }))
                  }
                  options={trackingCategoryOptions}
                  placeholder="Chọn nhóm tracking"
                />
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection
            title={t("inventoryMasters.attributes.label", "Thuộc tính")}
          >
            <div className="flex flex-wrap gap-4 mt-2">
              {[
                {
                  value: "CAN_BE_SOLD",
                  label: t(
                    "inventoryMasters.attributes.CAN_BE_SOLD",
                    "Có thể bán",
                  ),
                },
                {
                  value: "CAN_BE_PURCHASED",
                  label: t(
                    "inventoryMasters.attributes.CAN_BE_PURCHASED",
                    "Có thể mua",
                  ),
                },
                {
                  value: "CAN_BE_MANUFACTURED",
                  label: t(
                    "inventoryMasters.attributes.CAN_BE_MANUFACTURED",
                    "Có thể sản xuất",
                  ),
                },
              ].map((attr) => (
                <label
                  key={attr.value}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={form.attributes.includes(attr.value)}
                    disabled={viewOnly}
                    onCheckedChange={(checked) => {
                      setForm((prev) => ({
                        ...prev,
                        attributes: checked
                          ? [...prev.attributes, attr.value]
                          : prev.attributes.filter((a) => a !== attr.value),
                      }));
                    }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    {attr.label}
                  </span>
                </label>
              ))}
            </div>
          </DrawerSection>

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
      leftPanel={
        isCreating ? (
          formContent
        ) : (
          <div className="flex flex-col gap-6 w-full">
            <InventoryStockLedgerSection
              itemId={itemId || "new"}
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
        )
      }
      rightPanel={!isCreating ? formContent : undefined}
    />
  );
}
