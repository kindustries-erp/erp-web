import React, { useState, useEffect } from "react";
import {
  DrawerModal,
  DrawerSection,
  DrawerRow,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { Building2, Camera } from "lucide-react";
import { cn } from "@/shared/utils";
import {
  uploadFileApi,
  getFileViewUrl,
} from "@/modules/finance/api/financeApi";
import { useCompanyProfile } from "../api/companyProfileApi";
import { useT } from "@/core/i18n";

export interface CompanyProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CompanyProfileDrawer({
  open,
  onClose,
}: CompanyProfileDrawerProps) {
  const t = useT();
  const { data: profile, updateProfile, isUpdating } = useCompanyProfile();

  const [mode, setMode] = useState<"view" | "edit">("view");
  const [formData, setFormData] = useState({
    company_name: "",
    tax_code: "",
    address: "",
    mobi_phone: "",
    email: "",
    note: "",
    logo: "",
  });

  useEffect(() => {
    if (profile && open) {
      setFormData({
        company_name: profile.company_name || "",
        tax_code: profile.tax_code || "",
        address: profile.address || "",
        mobi_phone: profile.mobi_phone || "",
        email: profile.email || "",
        note: profile.note || "",
        logo: profile.logo || "",
      });
      setMode("view");
    }
  }, [profile, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setMode("view");
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploaded = await uploadFileApi(file);
      const url = getFileViewUrl(uploaded.id);
      setFormData((prev) => ({ ...prev, logo: url }));
    } catch (error) {
      console.error("Failed to upload file", error);
    }
    e.target.value = "";
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || "",
        tax_code: profile.tax_code || "",
        address: profile.address || "",
        mobi_phone: profile.mobi_phone || "",
        email: profile.email || "",
        note: profile.note || "",
        logo: profile.logo || "",
      });
    }
    setMode("view");
  };

  const logoIcon = formData.logo ? (
    <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center bg-white shrink-0">
      <img
        src={formData.logo}
        alt="Company Logo"
        className="w-full h-full object-contain"
      />
    </div>
  ) : (
    <div className="w-[30px] h-[30px] rounded-full bg-primary flex items-center justify-center text-primary-fg shrink-0">
      <Building2 className="w-4 h-4" />
    </div>
  );

  const editToggle = (
    <button
      onClick={() => {
        if (mode === "edit") {
          handleCancel();
        } else {
          setMode("edit");
        }
      }}
      className={cn(
        "px-3 py-[5px] rounded-lg text-xs font-medium border transition-colors",
        mode === "edit"
          ? "border-[color:var(--border)] text-[color:var(--muted-fg)] bg-[color:var(--muted)] hover:bg-surface-hover"
          : "border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-fg",
      )}
    >
      {mode === "edit" ? t("Hủy") : t("Chỉnh sửa")}
    </button>
  );

  return (
    <DrawerModal
      open={open}
      onClose={() => {
        handleCancel();
        onClose();
      }}
      confirmOnClose={mode === "edit"}
      icon={logoIcon}
      title={profile?.company_name || t("Hồ sơ công ty")}
      subtitle={profile?.tax_code || t("Cập nhật thông tin công ty")}
      headerExtra={editToggle}
      actions={
        mode === "edit"
          ? [
              {
                label: t("Hủy"),
                onClick: handleCancel,
              },
              {
                label: t("Lưu thay đổi"),
                primary: true,
                loading: isUpdating,
                onClick: handleSave,
              },
            ]
          : [{ label: t("Đóng"), onClick: onClose }]
      }
    >
      {mode === "edit" ? (
        <>
          <DrawerSection title={t("Logo công ty")}>
            <div className="flex flex-col items-center justify-center pb-2">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full border-2 border-border overflow-hidden bg-surface flex items-center justify-center relative">
                  {formData.logo ? (
                    <img
                      src={formData.logo}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-10 h-10 text-[color:var(--muted-fg)] opacity-50" />
                  )}

                  <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      {t("Tải lên")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                </div>
                {formData.logo && (
                  <button
                    type="button"
                    className="absolute top-0 right-0 p-1.5 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/4 -translate-y-1/4"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, logo: "" }))
                    }
                    title={t("Xóa logo")}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-[10px] text-[color:var(--muted-fg)] mt-3 text-center max-w-[200px]">
                {t("Nhập hoặc upload hình ảnh logo dạng vuông.")}
              </p>
            </div>
          </DrawerSection>

          <DrawerSection title={t("Thông tin chung")}>
            <DrawerField label={t("Tên công ty")}>
              <input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label={t("Mã số thuế")}>
              <input
                name="tax_code"
                value={formData.tax_code}
                onChange={handleChange}
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label={t("Địa chỉ")}>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={inputCls}
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title={t("Liên hệ")}>
            <DrawerField label={t("Số điện thoại")}>
              <input
                name="mobi_phone"
                value={formData.mobi_phone}
                onChange={handleChange}
                className={inputCls}
              />
            </DrawerField>
            <DrawerField label={t("Email")}>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={inputCls}
              />
            </DrawerField>
          </DrawerSection>

          <DrawerSection title={t("Ghi chú")}>
            <DrawerField label={t("Ghi chú")}>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                className={cn(inputCls, "min-h-[80px] resize-none")}
              />
            </DrawerField>
          </DrawerSection>
        </>
      ) : (
        <>
          <DrawerSection title={t("Thông tin chung")}>
            <DrawerRow label={t("Tên công ty")} value={formData.company_name} />
            <DrawerRow label={t("Mã số thuế")} value={formData.tax_code} />
            <DrawerRow label={t("Địa chỉ")} value={formData.address} />
          </DrawerSection>

          <DrawerSection title={t("Liên hệ")}>
            <DrawerRow label={t("Số điện thoại")} value={formData.mobi_phone} />
            <DrawerRow label={t("Email")} value={formData.email} />
          </DrawerSection>

          {formData.note && (
            <DrawerSection title={t("Ghi chú")}>
              <DrawerRow label={t("Ghi chú")} value={formData.note} />
            </DrawerSection>
          )}
        </>
      )}
    </DrawerModal>
  );
}
