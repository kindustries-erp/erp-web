import type { BusinessPartnerFormValue } from "../entities/businessPartner";

export type BusinessPartnerFormError = "requiredName";

/** Trả về lỗi đầu tiên của form, hoặc null nếu hợp lệ */
export const validateBusinessPartnerForm = (
  form: BusinessPartnerFormValue,
): BusinessPartnerFormError | null =>
  form.name.trim() ? null : "requiredName";

export const isBusinessPartnerFormDirty = (
  form: BusinessPartnerFormValue,
  initial: BusinessPartnerFormValue,
): boolean => JSON.stringify(form) !== JSON.stringify(initial);

/** Mã đối tác chỉ được nhập khi tạo mới; sau đó khóa để không đổi mã đã phát sinh */
export const canEditBusinessPartnerCode = (isCreating: boolean): boolean =>
  isCreating;

export const isBusinessPartnerInactive = (status: string): boolean =>
  status === "INACTIVE";
