import type {
  BusinessPartner,
  BusinessPartnerContact,
  BusinessPartnerBankAccount,
} from "@/modules/partners/api/partnerApi";

export type ActiveTab = "partners" | "contacts" | "bankaccounts" | "roles";

// ── Partner form ───────────────────────────────────────────────────────────────

export interface PartnerForm {
  code: string;
  name: string;
  display_name: string;
  partner_kind: string;
  tax_code: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
  note: string;
  contact_id: string;
  contact_full_name: string;
  contact_position: string;
  contact_phone: string;
  contact_email: string;
  contact_is_default_receiver: boolean;
  contact_is_default_payer: boolean;
  contact_is_active: boolean;
  bank_id: string;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  bank_account_holder: string;
  bank_currency: string;
  bank_is_default: boolean;
  bank_is_active: boolean;
  role_id: string;
  role_enabled: boolean;
  role: string;
  role_is_active: boolean;
}

export const emptyPartnerForm: PartnerForm = {
  code: "",
  name: "",
  display_name: "",
  partner_kind: "ORGANIZATION",
  tax_code: "",
  phone: "",
  email: "",
  address: "",
  is_active: true,
  note: "",
  contact_id: "",
  contact_full_name: "",
  contact_position: "",
  contact_phone: "",
  contact_email: "",
  contact_is_default_receiver: true,
  contact_is_default_payer: false,
  contact_is_active: true,
  bank_id: "",
  bank_name: "",
  bank_branch: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_currency: "VND",
  bank_is_default: true,
  bank_is_active: true,
  role_id: "",
  role_enabled: true,
  role: "CUSTOMER",
  role_is_active: true,
};

export function buildPartnerForm(p: BusinessPartner): PartnerForm {
  return {
    ...emptyPartnerForm,
    code: p.code,
    name: p.name,
    display_name: p.display_name ?? "",
    partner_kind: p.partner_kind,
    tax_code: p.tax_code ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    address: p.address ?? "",
    is_active: p.is_active,
    note: p.note ?? "",
  };
}

// ── Contact draft ──────────────────────────────────────────────────────────────

export interface PartnerContactDraft {
  id: string;
  tempId: string;
  full_name: string;
  position: string;
  phone: string;
  email: string;
  is_default_receiver: boolean;
  is_default_payer: boolean;
  is_active: boolean;
}

export const newTempId = () => `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function emptyPartnerContactDraft(): PartnerContactDraft {
  return {
    id: "",
    tempId: newTempId(),
    full_name: "",
    position: "",
    phone: "",
    email: "",
    is_default_receiver: true,
    is_default_payer: false,
    is_active: true,
  };
}

export function contactDraftFromApi(c: BusinessPartnerContact): PartnerContactDraft {
  return {
    id: c.id,
    tempId: c.id,
    full_name: c.full_name,
    position: c.position ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    is_default_receiver: c.is_default_receiver,
    is_default_payer: c.is_default_payer,
    is_active: c.is_active,
  };
}

export function contactHasData(row: PartnerContactDraft): boolean {
  return !!row.full_name.trim() || !!row.position.trim() || !!row.phone.trim() || !!row.email.trim();
}

// ── Bank draft ─────────────────────────────────────────────────────────────────

export interface PartnerBankDraft {
  id: string;
  tempId: string;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  account_holder: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
}

export function emptyPartnerBankDraft(): PartnerBankDraft {
  return {
    id: "",
    tempId: newTempId(),
    bank_name: "",
    bank_branch: "",
    account_number: "",
    account_holder: "",
    currency: "VND",
    is_default: true,
    is_active: true,
  };
}

export function bankDraftFromApi(b: BusinessPartnerBankAccount): PartnerBankDraft {
  return {
    id: b.id,
    tempId: b.id,
    bank_name: b.bank_name,
    bank_branch: b.bank_branch ?? "",
    account_number: b.account_number,
    account_holder: b.account_holder,
    currency: b.currency ?? "VND",
    is_default: b.is_default,
    is_active: b.is_active,
  };
}

export function bankHasData(row: PartnerBankDraft): boolean {
  return !!row.bank_name.trim() || !!row.bank_branch.trim() || !!row.account_number.trim() || !!row.account_holder.trim();
}

// ── Contact form (standalone tab) ─────────────────────────────────────────────

export interface ContactForm {
  business_partner_id: string;
  full_name: string;
  position: string;
  phone: string;
  email: string;
  identity_no: string;
  address: string;
  is_default_receiver: boolean;
  is_default_payer: boolean;
  is_active: boolean;
  note: string;
}

export const emptyContactForm: ContactForm = {
  business_partner_id: "",
  full_name: "",
  position: "",
  phone: "",
  email: "",
  identity_no: "",
  address: "",
  is_default_receiver: false,
  is_default_payer: false,
  is_active: true,
  note: "",
};

export function buildContactForm(c: BusinessPartnerContact): ContactForm {
  return {
    business_partner_id: c.business_partner_id,
    full_name: c.full_name,
    position: c.position ?? "",
    phone: c.phone ?? "",
    email: c.email ?? "",
    identity_no: c.identity_no ?? "",
    address: c.address ?? "",
    is_default_receiver: c.is_default_receiver,
    is_default_payer: c.is_default_payer,
    is_active: c.is_active,
    note: c.note ?? "",
  };
}

// ── Bank form (standalone tab) ─────────────────────────────────────────────────

export interface PartnerBankForm {
  business_partner_id: string;
  bank_name: string;
  bank_branch: string;
  account_number: string;
  account_holder: string;
  currency: string;
  is_default: boolean;
  is_active: boolean;
  note: string;
}

export const emptyBankForm: PartnerBankForm = {
  business_partner_id: "",
  bank_name: "",
  bank_branch: "",
  account_number: "",
  account_holder: "",
  currency: "VND",
  is_default: false,
  is_active: true,
  note: "",
};

export function buildBankForm(b: BusinessPartnerBankAccount): PartnerBankForm {
  return {
    business_partner_id: b.business_partner_id,
    bank_name: b.bank_name,
    bank_branch: b.bank_branch ?? "",
    account_number: b.account_number,
    account_holder: b.account_holder,
    currency: b.currency ?? "VND",
    is_default: b.is_default,
    is_active: b.is_active,
    note: b.note ?? "",
  };
}

// ── Role form ──────────────────────────────────────────────────────────────────

export interface PartnerRoleForm {
  business_partner_id: string;
  role: string;
  is_active: boolean;
}

export const emptyRoleForm: PartnerRoleForm = {
  business_partner_id: "",
  role: "CUSTOMER",
  is_active: true,
};
