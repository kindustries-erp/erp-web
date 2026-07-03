import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Barcode } from "lucide-react";
import { useT } from "@/core/i18n";
import { useUIStore } from "@/core/config/uiStore";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import {
  DrawerSection,
  DrawerRow,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { FormLoadingSkeleton } from "@/modules/operational/components/form/FormLoadingSkeleton";
import type { DrawerMode } from "@/shared/stores/useDrawerStore";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import type { InventorySerialRow } from "@/modules/inventory-core/api/inventoryCoreApi";
import { formatGMT7 } from "@/shared/utils/format";

// ── Types ──────────────────────────────────────────────────────────────────

interface AttributeEntry {
  key: string;
  value: string;
}

function attributesToEntries(attrs: any): AttributeEntry[] {
  if (!attrs) return [];
  if (Array.isArray(attrs)) return attrs;
  if (typeof attrs === "object") {
    return Object.entries(attrs).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  }
  return [];
}

function entriesToAttributes(
  entries: AttributeEntry[],
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const { key, value } of entries) {
    if (key.trim()) result[key.trim()] = value;
  }
  return result;
}

// ── Props ──────────────────────────────────────────────────────────────────

export interface TrackedGoodsDrawerProps {
  open: boolean;
  item: InventorySerialRow | null;
  onClose: () => void;
  onSaved: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export function TrackedGoodsDrawer({
  open,
  item,
  onClose,
  onSaved,
}: TrackedGoodsDrawerProps) {
  const t = useT();
  const showToast = useUIStore((s) => s.showToast);
  const canUpdate = useHasPermission("inventory_items", "update");

  const [mode, setMode] = useState<DrawerMode>("view");
  const [saving, setSaving] = useState(false);

  // Detail state
  const [loading, setLoading] = useState(false);
  const [detailItem, setDetailItem] = useState<InventorySerialRow | null>(null);

  // Edit state
  const [notes, setNotes] = useState("");
  const [attributes, setAttributes] = useState<AttributeEntry[]>([]);

  // Fetch detail when open
  useEffect(() => {
    let active = true;
    if (open && item?.id) {
      setLoading(true);
      inventoryCoreApi
        .getSerial(item.id)
        .then((data) => {
          if (active) {
            setDetailItem(data);
            setNotes(data.notes ?? "");
            setAttributes(attributesToEntries(data.attributes));
            setLoading(false);
          }
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    } else {
      setDetailItem(null);
    }
    return () => {
      active = false;
    };
  }, [item?.id, open]);

  // Reset mode when drawer closes
  useEffect(() => {
    if (!open) setMode("view");
  }, [open]);

  const handleToggleEdit = useCallback(() => {
    if (mode === "view") {
      setNotes(detailItem?.notes ?? "");
      setAttributes(attributesToEntries(detailItem?.attributes));
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [mode, detailItem]);

  const handleAddAttribute = useCallback(() => {
    setAttributes((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const handleRemoveAttribute = useCallback((idx: number) => {
    setAttributes((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleAttributeChange = useCallback(
    (idx: number, field: "key" | "value", val: string) => {
      setAttributes((prev) =>
        prev.map((entry, i) =>
          i === idx ? { ...entry, [field]: val } : entry,
        ),
      );
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!detailItem) return;
    setSaving(true);
    try {
      const attributesPayload = entriesToAttributes(attributes);
      await inventoryCoreApi.updateSerial(detailItem.id, {
        notes,
        attributes: attributesPayload,
      });
      showToast({ title: t("Lưu thành công"), variant: "success" });
      setMode("view");
      // Cập nhật lại state detail để show view mode mới
      setDetailItem({
        ...detailItem,
        notes,
        attributes: attributesPayload,
      });
      onSaved();
    } catch (e: any) {
      showToast({
        title: t("Lưu thất bại"),
        description: e.response?.data?.message || e.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [detailItem, notes, attributes, onSaved, showToast, t]);

  const handleClose = useCallback(() => {
    if (mode === "edit") setMode("view");
    onClose();
  }, [mode, onClose]);

  // ── Render helpers ────────────────────────────────────────────────────────

  const viewAttributesSection = (
    <DrawerSection title={t("Thuộc tính bổ sung")}>
      {detailItem?.attributes &&
      Object.keys(detailItem.attributes).length > 0 ? (
        Object.entries(detailItem.attributes).map(([k, v]) => (
          <DrawerRow key={k} label={k} value={v} />
        ))
      ) : (
        <p className="text-xs text-muted-foreground py-1">
          {t("Chưa có thuộc tính.")}
        </p>
      )}
    </DrawerSection>
  );

  const editAttributesSection = (
    <DrawerSection
      title={t("Thuộc tính bổ sung")}
      titleExtra={
        <button
          type="button"
          onClick={handleAddAttribute}
          disabled={saving}
          className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity"
        >
          <Plus className="w-3 h-3" />
          {t("Thêm")}
        </button>
      }
    >
      {attributes.length === 0 ? (
        <p className="text-xs text-muted-foreground py-1">
          {t('Nhấn "Thêm" để thêm thuộc tính.')}
        </p>
      ) : (
        <div className="space-y-2 mt-1">
          {attributes.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                className={inputCls}
                placeholder={t("Tên thuộc tính")}
                value={entry.key}
                disabled={saving}
                onChange={(e) =>
                  handleAttributeChange(idx, "key", e.target.value)
                }
              />
              <span className="text-muted-foreground text-xs shrink-0">:</span>
              <input
                className={inputCls}
                placeholder={t("Giá trị")}
                value={entry.value}
                disabled={saving}
                onChange={(e) =>
                  handleAttributeChange(idx, "value", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => handleRemoveAttribute(idx)}
                disabled={saving}
                className="shrink-0 p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                title={t("Xoá")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </DrawerSection>
  );

  // ── Left panel ────────────────────────────────────────────────────────────

  const leftPanel = (
    <div className="flex flex-col gap-4">
      {/* Core info — always read-only */}
      <DrawerSection title={t("Thông tin định danh")}>
        <DrawerRow
          label={t("Mã vật tư")}
          value={detailItem?.item?.sku ?? "—"}
        />
        <DrawerRow
          label={t("Tên vật tư")}
          value={detailItem?.item?.itemName ?? "—"}
        />
        <DrawerRow
          label={t("Chính sách Tracking")}
          value={detailItem?.item?.trackingPolicyName ?? "—"}
        />
        <DrawerRow label={t("Số Serial")} value={detailItem?.serialNo ?? "—"} />
        {detailItem?.vinNo && (
          <DrawerRow label={t("Số VIN")} value={detailItem.vinNo} />
        )}
        {detailItem?.engineNo && (
          <DrawerRow label={t("Số máy")} value={detailItem.engineNo} />
        )}
        {detailItem?.lotNo && (
          <DrawerRow label={t("Số lô")} value={detailItem.lotNo} />
        )}
        <DrawerRow
          label={t("Ngày ghi nhận")}
          value={
            detailItem?.createdAt
              ? formatGMT7(detailItem.createdAt, "datetime-sec")
              : "—"
          }
        />
      </DrawerSection>

      {/* Notes */}
      {mode === "view" ? (
        <DrawerSection title={t("Ghi chú")}>
          {detailItem?.notes ? (
            <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
              {detailItem.notes}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t("Không có ghi chú.")}
            </p>
          )}
        </DrawerSection>
      ) : (
        <DrawerSection title={t("Ghi chú")}>
          <DrawerField label={t("Ghi chú")}>
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              placeholder={t("Nhập ghi chú...")}
              value={notes}
              disabled={saving}
              onChange={(e) => setNotes(e.target.value)}
            />
          </DrawerField>
        </DrawerSection>
      )}

      {/* Attributes */}
      {mode === "view" ? viewAttributesSection : editAttributesSection}
    </div>
  );

  // ── Actions ────────────────────────────────────────────────────────────────

  const drawerActions =
    mode === "edit"
      ? [
          {
            label: t("Huỷ"),
            onClick: handleToggleEdit,
            disabled: saving,
            variant: "outline" as const,
          },
          {
            label: saving ? t("Đang lưu...") : t("Lưu"),
            onClick: handleSave,
            primary: true,
            disabled: saving,
            loading: saving,
          },
        ]
      : undefined;

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={handleClose}
      onToggleEdit={canUpdate ? handleToggleEdit : undefined}
      icon={<Barcode className="h-5 w-5" />}
      title={detailItem?.serialNo ?? t("Chi tiết tracking")}
      subtitle={detailItem?.item?.itemName}
      layout="1-column"
      size="md"
      confirmOnClose={mode === "edit"}
      leftPanel={
        loading ? (
          <div className="p-6">
            <FormLoadingSkeleton />
          </div>
        ) : detailItem ? (
          leftPanel
        ) : null
      }
      actions={drawerActions}
    />
  );
}
