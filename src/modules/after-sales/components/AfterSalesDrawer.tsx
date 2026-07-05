import React, { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

interface AfterSalesDrawerProps {
  open: boolean;
  onClose: () => void;
  mode: "view" | "edit";
  data: any;
  onSaved: () => void;
}

export function AfterSalesDrawer({
  open,
  onClose,
  mode,
  data,
  onSaved,
}: AfterSalesDrawerProps) {
  const t = useT();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open && data) {
      setForm({
        customerName: data.customerName || "",
        customerPhone: data.customerPhone || "",
        customerAddress: data.customerAddress || "",
        customerIdNumber: data.customerIdNumber || "",
        warrantyActivatedAt: data.warrantyActivatedAt
          ? data.warrantyActivatedAt.slice(0, 10)
          : "",
        warrantyMonths: data.warrantyMonths || 12,
        notes: data.notes || "",
      });
    } else {
      setForm({});
    }
  }, [open, data]);

  const handleSave = async () => {
    if (!data?.serialId) return;
    setSaving(true);
    try {
      await inventoryCoreApi.updateSerialLifecycle(data.serialId, {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        customerIdNumber: form.customerIdNumber,
        warrantyActivatedAt: form.warrantyActivatedAt || undefined,
        warrantyMonths: Number(form.warrantyMonths),
        notes: form.notes,
      });
      onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      alert(t("Lỗi khi lưu dữ liệu"));
    } finally {
      setSaving(false);
    }
  };

  const isEditing = mode === "edit";

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      title={
        data?.serialNo ? `${t("Hậu mãi")} - ${data.serialNo}` : t("Hậu mãi")
      }
      actions={[
        {
          label: t("Hủy"),
          onClick: onClose,
          variant: "outline",
          disabled: saving,
        },
        ...(isEditing
          ? [
              {
                label: t("Lưu thay đổi"),
                primary: true,
                onClick: handleSave,
                disabled: saving,
              },
            ]
          : []),
      ]}
      leftPanel={
        <div className="flex flex-col gap-6 pt-4">
          {/* Product Info */}
          <DrawerSection title={t("Thông tin sản phẩm")}>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("Sản phẩm")}>
                <input
                  className={inputCls}
                  value={data?.itemName || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Mã SP")}>
                <input
                  className={inputCls}
                  value={data?.sku || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Serial / Số máy")}>
                <input
                  className={inputCls}
                  value={data?.serialNo || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Số khung (VIN)")}>
                <input
                  className={inputCls}
                  value={data?.vinNo || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Ngày giao hàng")}>
                <input
                  className={inputCls}
                  value={
                    data?.deliveryDate ? data.deliveryDate.slice(0, 10) : ""
                  }
                  readOnly
                  disabled
                />
              </DrawerField>
            </div>
          </DrawerSection>

          {/* Customer Info */}
          <DrawerSection title={t("Thông tin khách hàng")}>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("Tên khách hàng")}>
                <input
                  className={inputCls}
                  value={form.customerName || ""}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  readOnly={!isEditing}
                  disabled={saving}
                />
              </DrawerField>
              <DrawerField label={t("Số điện thoại")}>
                <input
                  className={inputCls}
                  value={form.customerPhone || ""}
                  onChange={(e) =>
                    setForm({ ...form, customerPhone: e.target.value })
                  }
                  readOnly={!isEditing}
                  disabled={saving}
                />
              </DrawerField>
              <DrawerField label={t("CCCD / CMND")}>
                <input
                  className={inputCls}
                  value={form.customerIdNumber || ""}
                  onChange={(e) =>
                    setForm({ ...form, customerIdNumber: e.target.value })
                  }
                  readOnly={!isEditing}
                  disabled={saving}
                />
              </DrawerField>
              <div className="col-span-2">
                <DrawerField label={t("Địa chỉ")}>
                  <input
                    className={inputCls}
                    value={form.customerAddress || ""}
                    onChange={(e) =>
                      setForm({ ...form, customerAddress: e.target.value })
                    }
                    readOnly={!isEditing}
                    disabled={saving}
                  />
                </DrawerField>
              </div>
            </div>
          </DrawerSection>

          {/* Warranty Info */}
          <DrawerSection title={t("Bảo hành")}>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("Ngày kích hoạt")}>
                <DatePicker
                  className={inputCls}
                  value={form.warrantyActivatedAt || ""}
                  onChange={(v) => setForm({ ...form, warrantyActivatedAt: v })}
                  disabled={saving || !isEditing}
                />
              </DrawerField>
              <DrawerField label={t("Thời hạn (tháng)")}>
                <input
                  type="number"
                  className={inputCls}
                  value={form.warrantyMonths || ""}
                  onChange={(e) =>
                    setForm({ ...form, warrantyMonths: e.target.value })
                  }
                  readOnly={!isEditing}
                  disabled={saving}
                  min={1}
                />
              </DrawerField>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
