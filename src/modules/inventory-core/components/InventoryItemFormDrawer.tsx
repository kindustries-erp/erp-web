import { useEffect, useState, useCallback } from "react";
import { Layers } from "lucide-react";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { Combobox } from "@/shared/components/Combobox";
import {
  DrawerAction,
  DrawerField,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { useUIStore } from "@/core/config/uiStore";
import { useT } from "@/core/i18n";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
  type InventoryMovementsPayload,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import { InventoryTimelineBlock } from "@/modules/operational/components/list/InventoryTimelineBlock";

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
}: {
  open: boolean;
  onClose: () => void;
  itemId?: string | null;
  onSuccess?: () => void;
  viewOnly?: boolean;
  onToggleEdit?: () => void;
  onOpenDocument?: (docId: string, docType: string) => void;
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
      setTrackingCategoryOptions(buildMasterOptions(trackingCategories.items));
      setTrackingPolicyOptions(
        trackingPolicies.items
          .filter((p) => p.isActive)
          .map((p) => ({ value: p.id, label: `${p.code} — ${p.name}` })),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    if (open) {
      void loadMasters();
    }
  }, [open, loadMasters]);

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
    if (itemId) {
      setLoading(true);
      inventoryCoreApi
        .get(itemId)
        .then((detail) => {
          setEditing(detail);
          setForm(buildForm(detail));
        })
        .catch((e) => {
          setSaveError(
            e instanceof Error ? e.message : "Không thể tải chi tiết",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEditing(null);
      setForm(emptyForm());
      setMovData(undefined);
      setMovError(null);
    }
  }, [open, itemId]);

  useEffect(() => {
    if (!open || !itemId) return;
    setMovLoading(true);
    setMovError(null);
    inventoryCoreApi
      .movements(itemId)
      .then((data) => setMovData(data))
      .catch((e) =>
        setMovError(e instanceof Error ? e.message : "Lỗi tải lịch sử"),
      )
      .finally(() => setMovLoading(false));
  }, [open, itemId]);

  async function handleSave() {
    if (!form.sku.trim()) {
      setSaveError("SKU là bắt buộc");
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
      if (editing) {
        await inventoryCoreApi.update(editing.id, payload);
      } else {
        await inventoryCoreApi.create(payload);
      }
      showToast({
        title: editing ? "Cập nhật thành công" : "Tạo mới thành công",
        variant: "success",
      });
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setSaveError(e?.response?.data?.message || e?.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  }

  const mode: DrawerMode = viewOnly ? "view" : editing ? "edit" : "create";
  const drawerActions: DrawerAction[] = viewOnly
    ? [{ label: "Đóng", onClick: onClose, variant: "outline" }]
    : [
        { label: "Hủy", onClick: onClose, variant: "outline" },
        {
          label: editing ? "Lưu thay đổi" : "Tạo mới",
          onClick: handleSave,
          primary: true,
          loading: saving || loading,
          disabled: loading,
        },
      ];

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
          ? "Chi tiết item kho"
          : editing
            ? "Cập nhật item kho"
            : "Tạo item kho mới"
      }
      subtitle={editing ? editing.sku : "Danh mục item kho dùng chung"}
      actions={drawerActions}
      layout="2-columns"
      size="xl"
      collapsibleRightPanel={true}
      leftPanel={
        <div className="flex flex-col h-full rounded-lg overflow-hidden">
          <InventoryTimelineBlock
            itemId={itemId || "new"}
            loadingId={movLoading && itemId ? itemId : null}
            error={movError}
            data={
              itemId
                ? movData
                : {
                    item: {} as any,
                    currentOnHand: 0,
                    movements: [],
                  }
            }
            onOpenDocument={onOpenDocument}
            containerClassName="max-h-[calc(100vh-140px)] overflow-y-auto"
          />
        </div>
      }
      rightPanel={
        <>
          {saveError && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {saveError}
            </div>
          )}

          {loading ? (
            <DrawerSection title="Thông tin item kho">
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
          ) : (
            <>
              <DrawerSection title="Thông tin item kho">
                <div className="flex flex-col gap-3">
                  <DrawerField label="SKU" required>
                    <input
                      value={form.sku}
                      disabled={viewOnly || !!editing}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, sku: e.target.value }))
                      }
                      className={inputCls}
                      placeholder="VD: FG-001"
                    />
                  </DrawerField>

                  <DrawerField label="Tên item kho" required>
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
                      placeholder="Tên đầy đủ của item kho"
                    />
                  </DrawerField>

                  <DrawerField label="Đơn vị tính (ĐVT)" required>
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
                      placeholder="Chọn ĐVT"
                    />
                  </DrawerField>

                  <DrawerField label="Loại item">
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
                      placeholder="Chọn loại"
                    />
                  </DrawerField>

                  <DrawerField label="Tracking policy">
                    <Combobox
                      value={form.trackingPolicyId}
                      disabled={viewOnly}
                      allowClear
                      onChange={(value) =>
                        setForm((prev) => ({
                          ...prev,
                          trackingPolicyId: value || "",
                          // Clear category when policy changes
                          trackingCategoryId: value
                            ? prev.trackingCategoryId
                            : "",
                        }))
                      }
                      options={trackingPolicyOptions}
                      placeholder="Chọn chính sách tracking"
                    />
                  </DrawerField>

                  <DrawerField label="Tracking category">
                    <Combobox
                      value={form.trackingCategoryId}
                      disabled={viewOnly}
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

              {viewOnly ? (
                <DrawerSection title="Ghi chú">
                  {form.note ? (
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {form.note}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Không có ghi chú.
                    </p>
                  )}
                </DrawerSection>
              ) : (
                <DrawerSection title="Ghi chú">
                  <div className="mt-1">
                    <textarea
                      value={form.note}
                      disabled={viewOnly}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, note: e.target.value }))
                      }
                      className={`${inputCls} min-h-[80px] resize-y`}
                      placeholder="Ghi chú thêm về item kho này..."
                    />
                  </div>
                </DrawerSection>
              )}
            </>
          )}
        </>
      }
    />
  );
}
