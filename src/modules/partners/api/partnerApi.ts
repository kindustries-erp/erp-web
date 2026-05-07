import axiosInstance from "@/core/api/axiosInstance";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  type ListParams,
  type PaginatedResponse,
} from "@/shared/types/pagination";
import { dedupeRequest } from "@/shared/utils/requestCache";

// ─── BusinessPartner ──────────────────────────────────────────────────────────

export interface BusinessPartner {
  id: string;
  code: string;
  name: string;
  display_name: string | null;
  partner_kind: "ORGANIZATION" | "INDIVIDUAL";
  tax_code: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  ward: string | null;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
  updated_by: string | null;
}

export interface CreateBusinessPartnerDto {
  code: string;
  name: string;
  partner_kind: "ORGANIZATION" | "INDIVIDUAL";
  display_name?: string;
  tax_code?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  province?: string;
  district?: string;
  ward?: string;
  is_active?: boolean;
  note?: string;
}

export type UpdateBusinessPartnerDto = Partial<CreateBusinessPartnerDto>;

export async function getBusinessPartnersApi(): Promise<BusinessPartner[]> {
  return dedupeRequest("business-partners:list", async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<BusinessPartner>>(
      "/api/v1/business-partners",
      { params: { page: 1, pageSize: 200, sort: "name" } },
    );
    return data.items;
  });
}

export async function getBusinessPartnersPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<BusinessPartner>> {
  const { data } = await axiosInstance.get<PaginatedResponse<BusinessPartner>>(
    "/api/v1/business-partners",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? DEFAULT_SORT).join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function createBusinessPartnerApi(
  dto: CreateBusinessPartnerDto,
): Promise<BusinessPartner> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: BusinessPartner;
  }>("/api/v1/business-partners", dto);
  return data.data;
}

export async function updateBusinessPartnerApi(
  id: string,
  dto: UpdateBusinessPartnerDto,
): Promise<BusinessPartner> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: BusinessPartner;
  }>(`/api/v1/business-partners/${id}`, dto);
  return data.data;
}

export async function deleteBusinessPartnerApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/business-partners/${id}`);
}

// ─── BusinessPartnerContact ───────────────────────────────────────────────────

export interface BusinessPartnerContact {
  id: string;
  business_partner_id: string;
  full_name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  identity_no: string | null;
  address: string | null;
  is_default_receiver: boolean;
  is_default_payer: boolean;
  is_active: boolean;
  note: string | null;
  created_at: string;
}

export interface CreateBusinessPartnerContactDto {
  business_partner_id: string;
  full_name: string;
  position?: string;
  phone?: string;
  email?: string;
  identity_no?: string;
  address?: string;
  is_default_receiver?: boolean;
  is_default_payer?: boolean;
  is_active?: boolean;
  note?: string;
}

export type UpdateBusinessPartnerContactDto =
  Partial<CreateBusinessPartnerContactDto>;

export async function getBusinessPartnerContactsPagedApi(
  params: ListParams & { business_partner_id?: string } = {},
): Promise<PaginatedResponse<BusinessPartnerContact>> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<BusinessPartnerContact>
  >("/api/v1/business-partner-contacts", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      sort: (params.sort ?? DEFAULT_SORT).join(","),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export async function createBusinessPartnerContactApi(
  dto: CreateBusinessPartnerContactDto,
): Promise<BusinessPartnerContact> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: BusinessPartnerContact;
  }>("/api/v1/business-partner-contacts", dto);
  return data.data;
}

export async function updateBusinessPartnerContactApi(
  id: string,
  dto: UpdateBusinessPartnerContactDto,
): Promise<BusinessPartnerContact> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: BusinessPartnerContact;
  }>(`/api/v1/business-partner-contacts/${id}`, dto);
  return data.data;
}

export async function deleteBusinessPartnerContactApi(
  id: string,
): Promise<void> {
  await axiosInstance.delete(`/api/v1/business-partner-contacts/${id}`);
}

// ─── BusinessPartnerBankAccount ───────────────────────────────────────────────

export interface BusinessPartnerBankAccount {
  id: string;
  business_partner_id: string;
  bank_name: string;
  bank_branch: string | null;
  account_number: string;
  account_holder: string;
  currency: string | null;
  is_default: boolean;
  is_active: boolean;
  note: string | null;
  created_at: string;
}

export interface CreateBusinessPartnerBankAccountDto {
  business_partner_id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  bank_branch?: string;
  currency?: string;
  is_default?: boolean;
  is_active?: boolean;
  note?: string;
}

export type UpdateBusinessPartnerBankAccountDto =
  Partial<CreateBusinessPartnerBankAccountDto>;

export async function getBusinessPartnerBankAccountsPagedApi(
  params: ListParams & { business_partner_id?: string } = {},
): Promise<PaginatedResponse<BusinessPartnerBankAccount>> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<BusinessPartnerBankAccount>
  >("/api/v1/business-partner-bank-accounts", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      sort: (params.sort ?? DEFAULT_SORT).join(","),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export async function createBusinessPartnerBankAccountApi(
  dto: CreateBusinessPartnerBankAccountDto,
): Promise<BusinessPartnerBankAccount> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: BusinessPartnerBankAccount;
  }>("/api/v1/business-partner-bank-accounts", dto);
  return data.data;
}

export async function updateBusinessPartnerBankAccountApi(
  id: string,
  dto: UpdateBusinessPartnerBankAccountDto,
): Promise<BusinessPartnerBankAccount> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: BusinessPartnerBankAccount;
  }>(`/api/v1/business-partner-bank-accounts/${id}`, dto);
  return data.data;
}

export async function deleteBusinessPartnerBankAccountApi(
  id: string,
): Promise<void> {
  await axiosInstance.delete(`/api/v1/business-partner-bank-accounts/${id}`);
}

// ─── BusinessPartnerRole ─────────────────────────────────────────────────────

export interface BusinessPartnerRole {
  id: string;
  business_partner_id: string;
  role: "CUSTOMER" | "VENDOR" | "SERVICE_PROVIDER" | string;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface CreateBusinessPartnerRoleDto {
  business_partner_id: string;
  role: "CUSTOMER" | "VENDOR" | "SERVICE_PROVIDER" | string;
  is_active?: boolean;
}

export type UpdateBusinessPartnerRoleDto =
  Partial<CreateBusinessPartnerRoleDto>;

export async function getBusinessPartnerRolesPagedApi(
  params: ListParams & { business_partner_id?: string } = {},
): Promise<PaginatedResponse<BusinessPartnerRole>> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<BusinessPartnerRole>
  >("/api/v1/business-partner-roles", {
    params: {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
      sort: (params.sort ?? DEFAULT_SORT).join(","),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export async function createBusinessPartnerRoleApi(
  dto: CreateBusinessPartnerRoleDto,
): Promise<BusinessPartnerRole> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: BusinessPartnerRole;
  }>("/api/v1/business-partner-roles", dto);
  return data.data;
}

export async function updateBusinessPartnerRoleApi(
  id: string,
  dto: UpdateBusinessPartnerRoleDto,
): Promise<BusinessPartnerRole> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: BusinessPartnerRole;
  }>(`/api/v1/business-partner-roles/${id}`, dto);
  return data.data;
}

export async function deleteBusinessPartnerRoleApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/business-partner-roles/${id}`);
}
