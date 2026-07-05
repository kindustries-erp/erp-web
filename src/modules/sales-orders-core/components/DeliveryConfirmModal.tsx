import { useState } from "react";
import { useT } from "@/core/i18n";
import {
  DrawerModal,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

interface DeliveryConfirmModalProps {
  open: boolean;
  onClose: () => void;
  serialIds: string[];
  onConfirmSuccess?: () => void;
}

export function DeliveryConfirmModal({
  open,
  onClose,
  serialIds,
  onConfirmSuccess,
}: DeliveryConfirmModalProps) {
  const t = useT();
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!deliveryDate) {
      setError(t("Vui lòng chọn ngày giao hàng"));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        serialIds.map((id) =>
          inventoryCoreApi.confirmDelivery(id, {
            deliveryDate,
            notes: notes.trim() || undefined,
          }),
        ),
      );
      if (onConfirmSuccess) onConfirmSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          t("Có lỗi xảy ra khi xác nhận giao hàng"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={t("Xác nhận giao hàng thực tế")}
      subtitle={`${t("Cập nhật ngày giao hàng cho")} ${serialIds.length} ${t("serial")}`}
      panelClassName="max-w-md w-full"
      actions={[
        {
          label: t("Hủy"),
          onClick: onClose,
          variant: "outline",
          disabled: saving,
        },
        {
          label: t("Xác nhận"),
          primary: true,
          onClick: handleConfirm,
          disabled: saving || serialIds.length === 0,
        },
      ]}
    >
      <div className="flex flex-col gap-4 pt-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800 border border-red-200">
            {error}
          </div>
        )}
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800 border border-amber-200">
          {t(
            "Lưu ý: Chỉ cập nhật ngày giao hàng thực tế, các thông tin khách hàng sẽ được cập nhật trong phân hệ Hậu mãi.",
          )}
        </div>

        <DrawerField label={t("Ngày giao hàng")} required>
          <DatePicker
            className={inputCls}
            value={deliveryDate}
            onChange={(v) => setDeliveryDate(v)}
            disabled={saving}
          />
        </DrawerField>

        <DrawerField label={t("Ghi chú")}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`${inputCls} min-h-[88px]`}
            placeholder={t("Ghi chú thêm (nếu có)")}
            disabled={saving}
          />
        </DrawerField>
      </div>
    </DrawerModal>
  );
}
