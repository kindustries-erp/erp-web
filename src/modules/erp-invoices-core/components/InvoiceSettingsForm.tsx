import React, { useEffect, useState } from "react";

import { Button } from "@/shared/components/ui/Button";
import { AppTabs, type TabItem } from "@/shared/components/AppTabs";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "react-hot-toast";

import { erpInvoicesCoreApi } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
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

  // Portal GDT State
  const [token, setToken] = useState("");
  const [cookies, setCookies] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [isSavingPortal, setIsSavingPortal] = useState(false);

  // To track dirty state for confirm modal

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
      const [portalRes, sinvoiceRes] = await Promise.all([
        erpInvoicesCoreApi.getPortalConfig(),
        getSinvoiceConfigApi(),
      ]);
      const data = portalRes;
      if (data) {
        setToken(data.token || "");
        setCookies(data.cookies || "");
      }
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

  const handleSavePortal = async () => {
    setIsSavingPortal(true);
    try {
      await erpInvoicesCoreApi.savePortalConfig(token, cookies);
      toast.success("Đã lưu cấu hình GDT thành công!");
      onPortalSuccess?.();
      onClose();
    } catch {
      toast.error("Lưu cấu hình Portal GDT thất bại");
    } finally {
      setIsSavingPortal(false);
    }
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
          <div className="space-y-4 rounded-xl border border-border bg-surface p-4 card-shadow">
            <p className="text-sm text-muted-foreground">
              Nhập Bearer token và WAF Cookies (TS011...) đã đăng nhập vào hệ
              thống <span className="font-medium">hoadondientu.gdt.gov.vn</span>
              . Token được lưu trong trình duyệt và dùng để đồng bộ hóa đơn.
            </p>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Bearer Token
              </label>
              <div className="relative">
                {showToken ? (
                  <textarea
                    className="w-full h-32 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none pr-10"
                    placeholder="eyJhbGciOiJ..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                ) : (
                  <input
                    type="password"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 pr-10"
                    placeholder="eyJhbGciOiJ..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                  />
                )}
                <button
                  type="button"
                  className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {token && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Token đã nhập ({token.length} ký tự)
                </p>
              )}
            </div>

            <div className="space-y-1 mt-4">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                WAF Cookies (Tùy chọn)
              </label>
              <div className="relative">
                <textarea
                  className="w-full h-16 rounded-md border border-border bg-surface px-3 py-2 text-xs font-mono outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  placeholder="TS0114b13e=..."
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                />
              </div>
              {cookies && (
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Cookies đã nhập ({cookies.length} ký tự)
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSavePortal}
              disabled={isSavingPortal || isLoading}
            >
              {isSavingPortal ? "Đang lưu..." : "Lưu cấu hình GDT"}
            </Button>
          </div>
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
