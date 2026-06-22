import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { FileUploadBox } from "@/shared/components/FileUploadBox";
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
  const {
    data: profile,
    isLoading,
    updateProfile,
    isUpdating,
  } = useCompanyProfile();

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

  const actions = [];
  if (mode === "edit") {
    actions.push(
      {
        key: "cancel",
        label: t("Hủy"),
        variant: "secondary" as const,
        onClick: () => {
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
        },
      },
      {
        key: "save",
        label: t("Lưu"),
        primary: true,
        loading: isUpdating,
        onClick: handleSave,
      },
    );
  }

  const leftPanel = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Tên công ty
          </label>
          <input
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            readOnly={mode === "view"}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Mã số thuế
          </label>
          <input
            name="tax_code"
            value={formData.tax_code}
            onChange={handleChange}
            readOnly={mode === "view"}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Địa chỉ
          </label>
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            readOnly={mode === "view"}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Số điện thoại
          </label>
          <input
            name="mobi_phone"
            value={formData.mobi_phone}
            onChange={handleChange}
            readOnly={mode === "view"}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Email
          </label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            readOnly={mode === "view"}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-1">
            Ghi chú
          </label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleChange}
            readOnly={mode === "view"}
            rows={3}
            className={`form-input w-full ${mode === "view" ? "readonly" : ""}`}
          />
        </div>
      </div>
    </div>
  );

  const rightPanel = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[color:var(--muted-fg)] mb-2">
          Logo công ty
        </label>
        {mode === "view" ? (
          <div className="w-full h-32 border border-border rounded-lg flex items-center justify-center bg-surface overflow-hidden">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Company Logo"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <span className="text-[color:var(--muted-fg)] text-xs">
                Chưa có logo
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <FileUploadBox
              file={null}
              onChange={async (file) => {
                if (!file) {
                  setFormData((prev) => ({ ...prev, logo: "" }));
                  return;
                }
                try {
                  const uploaded = await uploadFileApi(file);
                  const url = getFileViewUrl(uploaded.id);
                  setFormData((prev) => ({ ...prev, logo: url }));
                } catch (e) {
                  console.error("Failed to upload file", e);
                }
              }}
              accept="image/*"
              maxSizeMb={5}
            />
            {formData.logo && (
              <div className="w-full h-32 border border-border rounded-lg flex items-center justify-center bg-surface overflow-hidden mt-2 relative group">
                <img
                  src={formData.logo}
                  alt="Preview"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                  title="Xóa logo"
                >
                  <svg
                    className="w-4 h-4"
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
              </div>
            )}
            <p className="text-[10px] text-[color:var(--muted-fg)]">
              Nhập hoặc upload hình ảnh logo. Logo này sẽ hiển thị ở góc trên
              bên trái màn hình.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title="Hồ sơ công ty"
      actions={actions}
      loading={isLoading}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      hideRightPanel={false}
      rightPanelTitle="Thông tin thêm"
      panelClassName="xl:w-[900px] 2xl:w-[1000px]"
    />
  );
}
