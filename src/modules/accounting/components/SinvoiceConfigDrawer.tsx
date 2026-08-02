import React, { useEffect, useState } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import {
  saveSinvoiceConfigApi,
  getSinvoiceConfigApi,
  type SinvoiceConfig,
} from "../api/sinvoiceDraftApi";

export interface SinvoiceConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SinvoiceConfigDrawer({
  open,
  onClose,
  onSuccess,
}: SinvoiceConfigDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<SinvoiceConfig>>({
    apiUrl: "https://api-vinvoice.viettel.vn/services/einvoiceapplication/api/",
    environment: "production",
  });

  useEffect(() => {
    if (open) {
      getSinvoiceConfigApi().then((data) => {
        if (data) setForm(data);
      });
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveSinvoiceConfigApi(form);
      alert("Lưu cấu hình SInvoice thành công.");
      onClose();
      onSuccess?.();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title="Cấu hình Viettel SInvoice v2.49"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">API URL (*)</label>
            <input
              name="apiUrl"
              value={form.apiUrl || ""}
              onChange={handleChange}
              className="w-full h-9 rounded-md border px-3 text-sm"
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mã số thuế (*)</label>
            <input
              name="supplierTaxCode"
              value={form.supplierTaxCode || ""}
              onChange={handleChange}
              className="w-full h-9 rounded-md border px-3 text-sm"
              placeholder="MST công ty..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Tài khoản (Username) (*)
            </label>
            <input
              name="username"
              value={form.username || ""}
              onChange={handleChange}
              className="w-full h-9 rounded-md border px-3 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Mật khẩu (Password) (*)
            </label>
            <input
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              className="w-full h-9 rounded-md border px-3 text-sm"
              placeholder="Nhập mật khẩu..."
            />
          </div>
        </div>
        <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </div>
    </DrawerModal>
  );
}
