import axiosInstance from "@/core/api/axiosInstance";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  type ListParams,
  type PaginatedResponse,
} from "@/shared/types/pagination";
import { dedupeRequest } from "@/shared/utils/requestCache";

// ── Company Bank Accounts ──────────────────────────────────────────────────

export interface CompanyBankAccount {
  id: string;
  bank_account_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  accounting_account_id: string;
  currency: string;
  branch_id?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateCompanyBankAccountDto {
  bank_account_code: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  accounting_account_id: string;
  currency?: string;
  branch_id?: string | null;
}
export type UpdateCompanyBankAccountDto = Partial<CreateCompanyBankAccountDto>;

// ── Chart of Accounts ──────────────────────────────────────────────────────

export interface ChartOfAccount {
  id: string;
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  parent_account_id: string | null;
  level: number | null;
  is_cash_account?: boolean;
  is_receivable_account?: boolean;
  is_payable_account?: boolean;
  is_active?: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreateChartOfAccountDto {
  account_code: string;
  account_name: string;
  account_type: string;
  normal_balance: string;
  parent_account_id?: string | null;
  level?: number | null;
  is_cash_account?: boolean;
}
export type UpdateChartOfAccountDto = Partial<CreateChartOfAccountDto>;

// ── Company Bank Account API ───────────────────────────────────────────────

// ── Company Bank Account API ───────────────────────────────────────────────

/** Server-side paginated list for table views. */
export async function getCompanyBankAccountsPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<CompanyBankAccount>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? DEFAULT_SORT;
  const { data } = await axiosInstance.get<
    PaginatedResponse<CompanyBankAccount>
  >("/api/v1/company-bank-accounts", {
    params: {
      page,
      pageSize,
      sort: sort.join(","),
      ...(params.search ? { search: params.search } : {}),
    },
  });
  return data;
}

export async function getCompanyBankAccountsApi(): Promise<
  CompanyBankAccount[]
> {
  return dedupeRequest("company-bank-accounts:list", async () => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<CompanyBankAccount>
    >("/api/v1/company-bank-accounts", {
      params: { page: 1, pageSize: 500, sort: "bank_account_code" },
    });
    return data.items;
  });
}

export async function createCompanyBankAccountApi(
  dto: CreateCompanyBankAccountDto,
): Promise<CompanyBankAccount> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: CompanyBankAccount;
  }>("/api/v1/company-bank-accounts", dto);
  return data.data;
}

export async function updateCompanyBankAccountApi(
  id: string,
  dto: UpdateCompanyBankAccountDto,
): Promise<CompanyBankAccount> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: CompanyBankAccount;
  }>(`/api/v1/company-bank-accounts/${id}`, dto);
  return data.data;
}

export async function deleteCompanyBankAccountApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/company-bank-accounts/${id}`);
}

// ── Chart of Accounts API ──────────────────────────────────────────────────

/** Flat list for select/dropdown use (up to 500 records, sorted by account_code). */
export async function getChartOfAccountsApi(): Promise<ChartOfAccount[]> {
  return dedupeRequest("chart-of-accounts:list", async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<ChartOfAccount>>(
      "/api/v1/chart-of-accounts",
      { params: { page: 1, pageSize: 500, sort: "account_code" } },
    );
    return data.items;
  });
}

/** Server-side paginated list for table views. */
export async function getChartOfAccountsPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<ChartOfAccount>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? ["account_code"]; // sort by code, not created_at
  const { data } = await axiosInstance.get<PaginatedResponse<ChartOfAccount>>(
    "/api/v1/chart-of-accounts",
    {
      params: {
        page,
        pageSize,
        sort: sort.join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function createChartOfAccountApi(
  dto: CreateChartOfAccountDto,
): Promise<ChartOfAccount> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: ChartOfAccount;
  }>("/api/v1/chart-of-accounts", dto);
  return data.data;
}

export async function updateChartOfAccountApi(
  id: string,
  dto: UpdateChartOfAccountDto,
): Promise<ChartOfAccount> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: ChartOfAccount;
  }>(`/api/v1/chart-of-accounts/${id}`, dto);
  return data.data;
}

export async function deleteChartOfAccountApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/chart-of-accounts/${id}`);
}

// ── Business Partner Roles ─────────────────────────────────────────────────

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

export async function getBusinessPartnerRolesApi(): Promise<
  BusinessPartnerRole[]
> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<BusinessPartnerRole>
  >("/api/v1/business-partner-roles", {
    params: { page: 1, pageSize: 500, sort: "-created_at" },
  });
  return data.items;
}

export async function getBusinessPartnerRolesPagedApi(
  params: ListParams = {},
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
