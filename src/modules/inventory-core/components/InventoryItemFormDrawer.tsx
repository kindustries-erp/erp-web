import { useEffect, useState, useCallback } from "react";
import { Layers } from "lucide-react";
import {
  DrawerAction,
  DrawerField,
  DrawerModal,
  DrawerSection,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Skeleton } from "@/shared/components/Skeleton";
import { Combobox } from "@/shared/components/Combobox";
import { useUIStore } from "@/core/config/uiStore";
import {
  inventoryCoreApi,
  type CreateInventoryItemPayload,
  type ErpInventoryItem,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ACTIVE" },
  { value: "INACTIVE", label: "INACTIVE" },
];

interface ItemForm {
  sku: string;
  itemName: string;
  uomId: string;
  itemTypeId: string;
  status: string;
  note: string;
  trackingPolicyId: string;
  trackingCategoryId: string;
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
}: {
  open: boolean;
  onClose: () => void;
  itemId?: string | null;
  onSuccess?: () => void;
}) {
  const showToast = useUIStore((s) => s.showToast);

  const [editing, setEditing] = useState<ErpInventoryItem | null>(null);
  const [form, setForm] = useState<ItemForm>(emptyForm);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

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
          inventoryCoreApi.listUoms({ page: 1, pageSize: 200, isActive: true }),
          inventoryCoreApi.listItemTypes({
            page: 1,
            pageSize: 200,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingCategories({
            page: 1,
            pageSize: 200,
            isActive: true,
          }),
          inventoryCoreApi.listTrackingPolicies({ page: 1, pageSize: 20 }),
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
      return;
    }
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
    }
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

  const drawerActions: DrawerAction[] = [
    { label: "Hủy", onClick: onClose, variant: "outline" },
    {
      label: editing ? "Cập nhật" : "Tạo mới",
      onClick: handleSave,
      primary: true,
      loading: saving || loading,
      disabled: loading,
    },
  ];

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      icon={<Layers className="h-4 w-4" />}
      title={editing ? "Cập nhật item kho" : "Tạo item kho mới"}
      subtitle={editing ? editing.sku : "Danh mục item kho dùng chung"}
      actions={drawerActions}
      panelClassName="min-[1024px]:min-w-[620px]"
    >
      {saveError && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {saveError}
        </div>
      )}

      {loading ? (
        <DrawerSection title="Thông tin item kho">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="md:col-span-2">
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </DrawerSection>
      ) : (
        <DrawerSection title="Thông tin item kho">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DrawerField label="SKU" required>
              <input
                value={form.sku}
                disabled={!!editing}
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
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, itemName: e.target.value }))
                }
                className={inputCls}
                placeholder="Tên đầy đủ của item kho"
              />
            </DrawerField>

            <DrawerField label="Đơn vị tính (ĐVT)" required>
              <Combobox
                value={form.uomId}
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
                allowClear
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    trackingPolicyId: value || "",
                    // Clear category when policy changes
                    trackingCategoryId: value ? prev.trackingCategoryId : "",
                  }))
                }
                options={trackingPolicyOptions}
                placeholder="Chọn chính sách tracking"
              />
            </DrawerField>

            <DrawerField label="Tracking category">
              <Combobox
                value={form.trackingCategoryId}
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

            <DrawerField label="Trạng thái">
              <Combobox
                value={form.status}
                allowClear={false}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value || "ACTIVE" }))
                }
                options={STATUS_OPTIONS}
              />
            </DrawerField>

            <div className="md:col-span-2">
              <DrawerField label="Ghi chú">
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className={`${inputCls} min-h-[80px] resize-y`}
                  placeholder="Ghi chú thêm về item kho này..."
                />
              </DrawerField>
            </div>
          </div>
        </DrawerSection>
      )}
    </DrawerModal>
  );
}
