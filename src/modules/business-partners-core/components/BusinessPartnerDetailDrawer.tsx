import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  DrawerSection,
  DrawerField,
  inputCls,
} from "@/shared/components/DrawerModal";
import { StatusBadge } from "@/shared/components/badges";
import { Combobox } from "@/shared/components/Combobox";
import { CopyButton } from "@/shared/components/CopyButton";
import { useUIStore } from "@/core/config/uiStore";
import { extractApiError } from "@/shared/utils/apiError";
import {
  businessPartnersCoreApi,
  type CreateBusinessPartnerCoreDto,
  type ErpBusinessPartner,
} from "../api/businessPartnersCoreApi";

interface PartnerFormState {
  code: string;
  name: string;
  displayName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  status: string;
  notes: string;
}

const emptyForm = (): PartnerFormState => ({
  code: "",
  name: "",
  displayName: "",
  taxCode: "",
  phone: "",
  email: "",
  address: "",
  contactName: "",
  status: "ACTIVE",
  notes: "",
});

export interface BusinessPartnerDetailDrawerProps {
  open: boolean;
  mode: "view" | "edit";
  setMode: (mode: "view" | "edit") => void;
  onClose: () => void;
  partnerId: string | null;
  partnerType: "CUSTOMER" | "VENDOR" | string;
  onSaved?: () => void;
}

export function BusinessPartnerDetailDrawer({
  open,
  mode,
  setMode,
  onClose,
  partnerId,
  partnerType,
  onSaved,
}: BusinessPartnerDetailDrawerProps) {
  const { t } = useTranslation("doitac");
  const showToast = useUIStore((s) => s.showToast);

  const [form, setForm] = useState<PartnerFormState>(emptyForm());
  const [initialForm, setInitialForm] = useState<PartnerFormState>(emptyForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCreating = !partnerId;
  const isView = mode === "view" && !isCreating;

  const partnerLabel =
    partnerType === "VENDOR"
      ? t("Nhà cung cấp", "Nhà cung cấp")
      : t("Khách hàng", "Khách hàng");

  // Load partner details
  const loadPartner = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data: ErpBusinessPartner = await businessPartnersCoreApi.get(id);
        const loaded: PartnerFormState = {
          code: data.code || "",
          name: data.name || "",
          displayName: data.displayName || "",
          taxCode: data.taxCode || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          contactName: data.contactName || "",
          status: data.status || "ACTIVE",
          notes: data.notes || "",
        };
        setForm(loaded);
        setInitialForm(loaded);
      } catch (err) {
        showToast({
          variant: "destructive",
          title: t("Lỗi tải dữ liệu", "Lỗi tải dữ liệu"),
          description: extractApiError(
            err,
            t("Không thể tải thông tin đối tác"),
          ),
        });
      } finally {
        setLoading(false);
      }
    },
    [showToast, t],
  );

  useEffect(() => {
    if (open) {
      if (partnerId) {
        void loadPartner(partnerId);
      } else {
        const fresh = emptyForm();
        setForm(fresh);
        setInitialForm(fresh);
      }
    }
  }, [open, partnerId, loadPartner]);

  const isDirty = JSON.stringify(form) !== JSON.stringify(initialForm);

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim()) {
      showToast({
        variant: "destructive",
        title: t("Thiếu thông tin", "Thiếu thông tin"),
        description: t(
          "Mã và tên đối tác là bắt buộc",
          "Mã và tên đối tác là bắt buộc",
        ),
      });
      return;
    }

    setSaving(true);
    try {
      const payload: CreateBusinessPartnerCoreDto = {
        code: form.code.trim(),
        name: form.name.trim(),
        partnerType: partnerType as "VENDOR" | "CUSTOMER",
        ...(form.displayName.trim()
          ? { displayName: form.displayName.trim() }
          : {}),
        ...(form.taxCode.trim() ? { taxCode: form.taxCode.trim() } : {}),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.address.trim() ? { address: form.address.trim() } : {}),
        ...(form.contactName.trim()
          ? { contactName: form.contactName.trim() }
          : {}),
        status: form.status || "ACTIVE",
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };

      if (partnerId) {
        await businessPartnersCoreApi.update(partnerId, payload);
        showToast({
          title: t("Đã cập nhật thành công", "Đã cập nhật thành công"),
          variant: "success",
        });
      } else {
        await businessPartnersCoreApi.create(payload);
        showToast({
          title: t("Đã tạo mới thành công", "Đã tạo mới thành công"),
          variant: "success",
        });
      }

      onSaved?.();
      onClose();
    } catch (err) {
      showToast({
        variant: "destructive",
        title: partnerId
          ? t("Cập nhật thất bại", "Cập nhật thất bại")
          : t("Tạo mới thất bại", "Tạo mới thất bại"),
        description: extractApiError(err, t("Không thể lưu thông tin đối tác")),
      });
    } finally {
      setSaving(false);
    }
  };

  const title = isCreating
    ? `${t("Thêm", "Thêm")} ${partnerLabel} ${t("mới", "mới")}`
    : isView
      ? `${t("Chi tiết", "Chi tiết")} ${partnerLabel}`
      : `${t("Chỉnh sửa", "Chỉnh sửa")} ${partnerLabel}`;

  const subtitle = isCreating
    ? t("Điền thông tin bên dưới", "Điền thông tin bên dưới")
    : form.name || form.code;

  return (
    <StandardFormDrawer
      open={open}
      mode={isCreating ? "edit" : mode}
      onClose={onClose}
      onToggleEdit={!isCreating && isView ? () => setMode("edit") : undefined}
      title={title}
      subtitle={subtitle}
      titleExtra={
        !isCreating ? (
          <StatusBadge
            status={form.status}
            className="w-[88px] inline-flex items-center justify-center text-center truncate"
          />
        ) : undefined
      }
      layout="1-column"
      size="md"
      confirmOnClose={isDirty && !isView}
      actions={
        isView
          ? [
              {
                label: t("Đóng", "Đóng"),
                onClick: onClose,
                variant: "outline",
              },
            ]
          : [
              {
                label: t("Hủy", "Hủy"),
                onClick: onClose,
                disabled: saving,
                variant: "outline",
              },
              {
                label: saving
                  ? t("Đang lưu...", "Đang lưu...")
                  : isCreating
                    ? t("Thêm mới", "Thêm mới")
                    : t("Lưu thay đổi", "Lưu thay đổi"),
                primary: true,
                loading: saving,
                disabled: saving || loading,
                onClick: handleSave,
              },
            ]
      }
      leftPanel={
        <div className="space-y-6">
          <DrawerSection
            title={t("Thông tin định danh", "Thông tin định danh")}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DrawerField label={t("Mã đối tác", "Mã đối tác")} required>
                {isView ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 font-mono text-sm font-semibold">
                    <span>{form.code || "—"}</span>
                    {form.code && <CopyButton value={form.code} />}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.code}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, code: e.target.value }))
                    }
                    placeholder={
                      partnerType === "VENDOR" ? "VD: NCC-001" : "VD: KH-001"
                    }
                    disabled={!isCreating}
                  />
                )}
              </DrawerField>

              <DrawerField label={t("Tên pháp nhân", "Tên pháp nhân")} required>
                {isView ? (
                  <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm font-medium">
                    {form.name || "—"}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder={t("Tên đầy đủ", "Tên đầy đủ")}
                  />
                )}
              </DrawerField>

              <DrawerField
                label={t(
                  "Tên hiển thị / Giao dịch",
                  "Tên hiển thị / Giao dịch",
                )}
              >
                {isView ? (
                  <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm">
                    {form.displayName || "—"}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.displayName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, displayName: e.target.value }))
                    }
                    placeholder={t(
                      "Tên viết tắt / thương hiệu",
                      "Tên viết tắt / thương hiệu",
                    )}
                  />
                )}
              </DrawerField>

              <DrawerField label={t("Mã số thuế", "Mã số thuế")}>
                {isView ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 font-mono text-sm">
                    <span>{form.taxCode || "—"}</span>
                    {form.taxCode && <CopyButton value={form.taxCode} />}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.taxCode}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, taxCode: e.target.value }))
                    }
                    placeholder="0123456789"
                  />
                )}
              </DrawerField>
            </div>
          </DrawerSection>

          <DrawerSection
            title={t(
              "Thông tin liên hệ & Địa chỉ",
              "Thông tin liên hệ & Địa chỉ",
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <DrawerField label={t("Người liên hệ", "Người liên hệ")}>
                {isView ? (
                  <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm">
                    {form.contactName || "—"}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.contactName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contactName: e.target.value }))
                    }
                    placeholder={t(
                      "Họ tên người liên hệ",
                      "Họ tên người liên hệ",
                    )}
                  />
                )}
              </DrawerField>

              <DrawerField label={t("Số điện thoại", "Số điện thoại")}>
                {isView ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 font-mono text-sm">
                    <span>{form.phone || "—"}</span>
                    {form.phone && <CopyButton value={form.phone} />}
                  </div>
                ) : (
                  <input
                    type="text"
                    className={inputCls}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="0912 345 678"
                  />
                )}
              </DrawerField>

              <div className="sm:col-span-2">
                <DrawerField label={t("Email", "Email")}>
                  {isView ? (
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm">
                      <span>{form.email || "—"}</span>
                      {form.email && <CopyButton value={form.email} />}
                    </div>
                  ) : (
                    <input
                      type="email"
                      className={inputCls}
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="contact@company.com"
                    />
                  )}
                </DrawerField>
              </div>

              <div className="sm:col-span-2">
                <DrawerField
                  label={t("Địa chỉ trụ sở / Kho", "Địa chỉ trụ sở / Kho")}
                >
                  {isView ? (
                    <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm min-h-[50px] whitespace-pre-wrap">
                      {form.address || "—"}
                    </div>
                  ) : (
                    <textarea
                      className={`${inputCls} min-h-[70px]`}
                      value={form.address}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, address: e.target.value }))
                      }
                      placeholder={t(
                        "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành",
                        "Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành",
                      )}
                    />
                  )}
                </DrawerField>
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title={t("Cấu hình & Ghi chú", "Cấu hình & Ghi chú")}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DrawerField label={t("Trạng thái", "Trạng thái")}>
                {isView ? (
                  <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 flex items-center">
                    <StatusBadge
                      status={form.status}
                      className="w-[88px] inline-flex items-center justify-center text-center truncate"
                    />
                  </div>
                ) : (
                  <Combobox
                    options={[
                      { value: "ACTIVE", label: t("Hoạt động", "Hoạt động") },
                      {
                        value: "INACTIVE",
                        label: t("Ngưng hoạt động", "Ngưng hoạt động"),
                      },
                    ]}
                    value={form.status}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, status: v || "ACTIVE" }))
                    }
                    allowClear={false}
                  />
                )}
              </DrawerField>

              <div className="sm:col-span-2">
                <DrawerField label={t("Ghi chú", "Ghi chú")}>
                  {isView ? (
                    <div className="p-2.5 rounded-lg bg-surface-muted/50 border border-border/40 text-sm min-h-[50px] whitespace-pre-wrap">
                      {form.notes || "—"}
                    </div>
                  ) : (
                    <textarea
                      className={`${inputCls} min-h-[60px]`}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, notes: e.target.value }))
                      }
                      placeholder={t(
                        "Ghi chú bổ sung...",
                        "Ghi chú bổ sung...",
                      )}
                    />
                  )}
                </DrawerField>
              </div>
            </div>
          </DrawerSection>
        </div>
      }
    />
  );
}
