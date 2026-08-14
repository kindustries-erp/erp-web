import React, { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/Button";
import { AppTabs, type TabItem } from "@/shared/components/AppTabs";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "react-hot-toast";

import { GdtPortalAuthForm } from "./GdtPortalAuthForm";
import {
  saveSinvoiceConfigApi,
  getSinvoiceConfigApi,
  type SinvoiceConfig,
} from "@/modules/accounting/api/sinvoiceDraftApi";

export interface InvoiceSettingsFormProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: "gdt" | "sinvoice";
  onPortalSuccess?: () => void;
  onSinvoiceSuccess?: () => void;
}

export function InvoiceSettingsForm({
  open,
  onClose,
  defaultTab = "gdt",
  onPortalSuccess,
  onSinvoiceSuccess,
}: InvoiceSettingsFormProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  // Sinvoice State
  const [sinvoiceForm, setSinvoiceForm] = useState<Partial<SinvoiceConfig>>({
    apiUrl: "https://api-vinvoice.viettel.vn/services/einvoiceapplication/api/",
    environment: "production",
  });
  const [isSavingSinvoice, setIsSavingSinvoice] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadConfigs = async () => {
    setIsLoading(true);
    try {
      const sinvoiceRes = await getSinvoiceConfigApi();
      if (sinvoiceRes) {
        setSinvoiceForm(sinvoiceRes);
      }
    } catch {
      toast.error("Không thể tải cấu hình hiện tại");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
      loadConfigs();
    }
  }, [open, defaultTab]);

  const handleSinvoiceChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setSinvoiceForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveSinvoice = async () => {
    setIsSavingSinvoice(true);
    try {
      await saveSinvoiceConfigApi(sinvoiceForm);
      toast.success("Lưu cấu hình Viettel SInvoice thành công!");
      onSinvoiceSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Lưu thất bại");
    } finally {
      setIsSavingSinvoice(false);
    }
  };

  const tabs: TabItem[] = [
    {
      key: "gdt",
      label: "Portal GDT",
      content: (
        <div className="flex flex-col mt-3">
          <GdtPortalAuthForm
            onSuccess={() => {
              onPortalSuccess?.();
              onClose();
            }}
          />
        </div>
      ),
    },
    {
      key: "sinvoice",
      label: "Viettel SInvoice",
      content: (
        <div className="flex flex-col mt-3">
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4 card-shadow">
            <div className="space-y-1">
              <label className="text-sm font-medium">API URL (*)</label>
              <input
                name="apiUrl"
                value={sinvoiceForm.apiUrl || ""}
                onChange={handleSinvoiceChange}
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Mã số thuế (*)</label>
              <input
                name="supplierTaxCode"
                value={sinvoiceForm.supplierTaxCode || ""}
                onChange={handleSinvoiceChange}
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
                placeholder="MST công ty..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Tài khoản (Username) (*)
              </label>
              <input
                name="username"
                value={sinvoiceForm.username || ""}
                onChange={handleSinvoiceChange}
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Mật khẩu (Password) (*)
              </label>
              <input
                type="password"
                name="password"
                value={sinvoiceForm.password || ""}
                onChange={handleSinvoiceChange}
                className="w-full h-9 rounded-md border border-border bg-surface px-3 text-sm"
                placeholder="Nhập mật khẩu..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveSinvoice}
              disabled={isSavingSinvoice || isLoading}
            >
              {isSavingSinvoice ? "Đang lưu..." : "Lưu cấu hình SInvoice"}
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <AppTabs
            tabs={tabs}
            value={activeTab}
            onValueChange={setActiveTab}
            variant="line"
          />
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Đóng mà không lưu?"
        message="Thay đổi của bạn sẽ không được lưu."
        confirmLabel="Đóng"
        cancelLabel="Tiếp tục chỉnh sửa"
        danger={true}
        zIndex={1000}
        onConfirm={() => {
          setShowConfirm(false);
          onClose();
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
