import React, { useState, useEffect } from "react";
import { useT } from "@/core/i18n";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { Input } from "@/shared/components/ui/input";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";
import toast from "react-hot-toast";

interface AfterSalesDrawerProps {
  open: boolean;
  onClose: () => void;
  data: any;
  mode: "view" | "edit";
  onSaved: () => void;
  onToggleEdit?: () => void;
}

export function AfterSalesDrawer({
  open,
  onClose,
  data,
  mode,
  onSaved,
  onToggleEdit,
}: AfterSalesDrawerProps) {
  const t = useT();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (open && data) {
      setForm({
        customerPhone: data.customerPhone || "",
        customerAddress: data.customerAddress || "",
      });
    } else {
      setForm({});
    }
  }, [open, data]);

  const isEditing = mode === "edit";

  const handleSave = async () => {
    if (!data?.serialId) return;
    setSaving(true);
    try {
      // Send the updated phone and address, while keeping others unchanged
      await inventoryCoreApi.updateSerialLifecycle(data.serialId, {
        customerName: data.customerName,
        customerPhone: form.customerPhone,
        customerAddress: form.customerAddress,
        customerIdNumber: data.customerIdNumber,
        dealerName: data.dealerName,
        warrantyActivatedAt: data.warrantyActivatedAt
          ? data.warrantyActivatedAt.slice(0, 10)
          : undefined,
        warrantyMonths: data.warrantyMonths || undefined,
        notes: data.notes,
      });
      toast.success(t("Lưu thông tin thành công"));
      onSaved();
      if (onToggleEdit) onToggleEdit(); // switch back to view mode after save
    } catch (error) {
      console.error(error);
      toast.error(t("Lỗi khi lưu dữ liệu"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={onToggleEdit}
      title={
        data?.serialNo ? `${t("Hậu mãi")} - ${data.serialNo}` : t("Hậu mãi")
      }
      actions={[
        {
          label: isEditing ? t("Hủy") : t("Đóng"),
          onClick: isEditing && onToggleEdit ? onToggleEdit : onClose,
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
      rightPanelTitle={t("Thông tin khách hàng & Đại lý")}
      leftPanel={
        <div className="flex flex-col gap-6">
          {/* Product Info */}
          <DrawerSection title={t("Thông tin sản phẩm")}>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("Sản phẩm")}>
                <Input
                  className={inputCls}
                  value={data?.itemName || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Mã SP")}>
                <Input
                  className={inputCls}
                  value={data?.sku || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Serial / Số máy")}>
                <Input
                  className={inputCls}
                  value={data?.serialNo || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Số khung (VIN)")}>
                <Input
                  className={inputCls}
                  value={data?.vinNo || ""}
                  readOnly
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Ngày giao hàng")}>
                <Input
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

          {/* Warranty Info */}
          <DrawerSection title={t("Bảo hành")}>
            <div className="grid grid-cols-2 gap-4">
              <DrawerField label={t("Ngày kích hoạt")}>
                <DatePicker
                  className={inputCls}
                  value={
                    data?.warrantyActivatedAt
                      ? data.warrantyActivatedAt.slice(0, 10)
                      : ""
                  }
                  onChange={() => {}}
                  disabled
                />
              </DrawerField>
              <DrawerField label={t("Thời hạn (tháng)")}>
                <Input
                  type="number"
                  className={inputCls}
                  value={data?.warrantyMonths || 12}
                  readOnly
                  disabled
                />
              </DrawerField>
            </div>
          </DrawerSection>
        </div>
      }
      rightPanel={
        <div className="flex flex-col gap-3">
          <DrawerField label={t("Tên khách hàng")}>
            <Input
              className={inputCls}
              value={data?.customerName || ""}
              readOnly
              disabled={isEditing}
            />
          </DrawerField>
          <DrawerField label={t("Số điện thoại")}>
            <Input
              className={inputCls}
              value={isEditing ? form.customerPhone : data?.customerPhone || ""}
              onChange={(e) =>
                setForm({ ...form, customerPhone: e.target.value })
              }
              readOnly={!isEditing}
            />
          </DrawerField>
          <DrawerField label={t("CCCD / CMND")}>
            <Input
              className={inputCls}
              value={data?.customerIdNumber || ""}
              readOnly
              disabled={isEditing}
            />
          </DrawerField>
          <DrawerField label={t("Đại lý")}>
            <Input
              className={inputCls}
              value={data?.dealerName || ""}
              readOnly
              disabled={isEditing}
            />
          </DrawerField>
          <DrawerField label={t("Địa chỉ")}>
            <Input
              className={inputCls}
              value={
                isEditing ? form.customerAddress : data?.customerAddress || ""
              }
              onChange={(e) =>
                setForm({ ...form, customerAddress: e.target.value })
              }
              readOnly={!isEditing}
            />
          </DrawerField>
        </div>
      }
    />
  );
}
