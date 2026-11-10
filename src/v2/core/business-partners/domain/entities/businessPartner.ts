export type BusinessPartnerType = "CUSTOMER" | "VENDOR";
export type BusinessPartnerStatus = "ACTIVE" | "INACTIVE";

export interface BusinessPartner {
  id: string;
  code: string;
  name: string;
  displayName?: string | null;
  partnerType: BusinessPartnerType | string;
  taxCode?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  contactName?: string | null;
  status: BusinessPartnerStatus | string;
  notes?: string | null;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessPartnerFormValue {
  code: string;
  name: string;
  displayName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
  status: BusinessPartnerStatus;
  notes: string;
}

export const emptyBusinessPartnerForm = (): BusinessPartnerFormValue => ({
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
