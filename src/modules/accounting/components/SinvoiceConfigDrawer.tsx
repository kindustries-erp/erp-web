import React, { useEffect, useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("erpInvoices");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Partial<SinvoiceConfig>>({
    apiUrl: "https://api-vinvoice.viettel.vn/services/einvoiceapplication/api/",
    environment: "production",
  });

  useEffect(() => {
    if (open) {
      getSinvoiceConfigApi()
        .then((data) => {
          if (data) setForm(data);
        })
        .catch(() => {
          toast.error(
            t("sinvoiceConfig.loadError", "Không thể tải cấu hình hiện tại"),
          );
        });
    }
  }, [open, t]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.apiUrl?.trim()) {
      toast.error(t("sinvoiceConfig.missingApiUrl", "Vui lòng nhập API URL"));
      return;
    }
    if (!form.supplierTaxCode?.trim()) {
      toast.error(
        t("sinvoiceConfig.missingTaxCode", "Vui lòng nhập Mã số thuế"),
      );
      return;
    }
    if (!form.username?.trim()) {
      toast.error(
        t("sinvoiceConfig.missingUsername", "Vui lòng nhập Tài khoản"),
      );
      return;
    }

    setLoading(true);
    try {
      await saveSinvoiceConfigApi(form);
      toast.success(
        t(
          "sinvoiceConfig.saveSuccess",
          "Lưu cấu hình Viettel SInvoice thành công!",
        ),
      );
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          t("sinvoiceConfig.saveError", "Lưu cấu hình thất bại"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StandardFormDrawer
      open={open}
      mode="edit"
      onClose={onClose}
      title={t("sinvoiceConfig.title", "Cấu hình Viettel SInvoice")}
      layout="1-column"
      size="sm"
      confirmOnClose={true}
      actions={[
        {
          label: t("common.cancel", "Hủy"),
          onClick: onClose,
          disabled: loading,
        },
        {
          label: loading
            ? t("common.saving", "Đang lưu...")
            : t("common.save", "Lưu cấu hình"),
          primary: true,
          onClick: handleSave,
          loading,
          disabled: loading,
        },
      ]}
      leftPanel={
        <div className="flex flex-col gap-4">
          <DrawerSection
            title={t("sinvoiceConfig.connectionInfo", "Thông tin kết nối API")}
          >
            <DrawerField label={t("sinvoiceConfig.apiUrl", "API URL (*)")}>
              <input
                name="apiUrl"
                value={form.apiUrl || ""}
                onChange={handleChange}
                className={inputCls}
                placeholder="https://api-vinvoice.viettel.vn/..."
                disabled={loading}
              />
            </DrawerField>

            <DrawerField label={t("sinvoiceConfig.taxCode", "Mã số thuế (*)")}>
              <input
                name="supplierTaxCode"
                value={form.supplierTaxCode || ""}
                onChange={handleChange}
                className={inputCls}
                placeholder="0318334886..."
                disabled={loading}
              />
            </DrawerField>

            <DrawerField
              label={t("sinvoiceConfig.username", "Tài khoản (Username) (*)")}
            >
              <input
                name="username"
                value={form.username || ""}
                onChange={handleChange}
                className={inputCls}
                placeholder="Nhập tên đăng nhập SInvoice..."
                disabled={loading}
              />
            </DrawerField>

            <DrawerField
              label={t("sinvoiceConfig.password", "Mật khẩu (Password) (*)")}
            >
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password || ""}
                  onChange={handleChange}
                  className={`${inputCls} pr-10`}
                  placeholder="Nhập mật khẩu..."
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </DrawerField>
          </DrawerSection>
        </div>
      }
    />
  );
}
