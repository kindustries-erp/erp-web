import axiosInstance, { API_BASE_URL } from "@/core/api/axiosInstance";
import type { Employee } from "@/modules/auth/api/auth";
import type {
  BusinessPartner,
  BusinessPartnerBankAccount,
} from "@/modules/partners/api/partnerApi";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  type ListParams,
  type PaginatedResponse,
} from "@/shared/types/pagination";
import { dedupeRequest } from "@/shared/utils/requestCache";

// ─── CashFund ─────────────────────────────────────────────────────────────────

export interface CashFund {
  id: string;
  fund_code: string;
  fund_name: string;
  currency: string | null;
  accounting_account_id: string;
  responsible_user_id: string | null;
  is_active: boolean;
  note: string | null;
  branch_id: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateCashFundDto {
  fund_code: string;
  fund_name: string;
  accounting_account_id: string;
  currency?: string;
  responsible_user_id?: string;
  is_active?: boolean;
  note?: string;
  branch_id?: string;
}

export type UpdateCashFundDto = Partial<CreateCashFundDto>;

export async function getCashFundsApi(): Promise<CashFund[]> {
  return dedupeRequest("cash-funds:list", async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<CashFund>>(
      "/api/v1/cash-funds",
      { params: { page: 1, pageSize: 200, sort: "fund_code" } },
    );
    return data.items;
  });
}

export async function getCashFundsPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<CashFund>> {
  const { data } = await axiosInstance.get<PaginatedResponse<CashFund>>(
    "/api/v1/cash-funds",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? ["fund_code"]).join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function createCashFundApi(
  dto: CreateCashFundDto,
): Promise<CashFund> {
  const { data } = await axiosInstance.post<{ message: string; data: CashFund }>(
    "/api/v1/cash-funds",
    dto,
  );
  return data.data;
}

export async function updateCashFundApi(
  id: string,
  dto: UpdateCashFundDto,
): Promise<CashFund> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: CashFund;
  }>(`/api/v1/cash-funds/${id}`, dto);
  return data.data;
}

export async function deleteCashFundApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/cash-funds/${id}`);
}

// ─── OpeningBalance ───────────────────────────────────────────────────────────

export interface OpeningBalance {
  id: string;
  fiscal_period: string;
  balance_date: string;
  account_id: string;
  cash_fund_id: string | null;
  company_bank_account_id: string | null;
  debit_amount: number | null;
  credit_amount: number | null;
  currency: string | null;
  note: string | null;
  created_at: string;
  created_by: string | null;
}

export interface CreateOpeningBalanceDto {
  fiscal_period: string;
  balance_date: string;
  account_id: string;
  cash_fund_id?: string;
  company_bank_account_id?: string;
  debit_amount?: number;
  credit_amount?: number;
  currency?: string;
  note?: string;
}

export type UpdateOpeningBalanceDto = Partial<CreateOpeningBalanceDto>;

export async function getOpeningBalancesPagedApi(
  params: ListParams & { fiscal_period?: string } = {},
): Promise<PaginatedResponse<OpeningBalance>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = (params.sort ?? DEFAULT_SORT).join(",");
  const key = `opening-balances:${page}:${pageSize}:${sort}:${params.search ?? ""}:${params.fiscal_period ?? ""}`;

  return dedupeRequest(key, async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<OpeningBalance>>(
      "/api/v1/opening-balances",
      {
        params: {
          page,
          pageSize,
          sort,
          ...(params.search ? { search: params.search } : {}),
          ...(params.fiscal_period ? { fiscal_period: params.fiscal_period } : {}),
        },
      },
    );
    return data;
  });
}

export async function createOpeningBalanceApi(
  dto: CreateOpeningBalanceDto,
): Promise<OpeningBalance> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: OpeningBalance;
  }>("/api/v1/opening-balances", dto);
  return data.data;
}

export async function updateOpeningBalanceApi(
  id: string,
  dto: UpdateOpeningBalanceDto,
): Promise<OpeningBalance> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: OpeningBalance;
  }>(`/api/v1/opening-balances/${id}`, dto);
  return data.data;
}

export async function deleteOpeningBalanceApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/opening-balances/${id}`);
}

// ─── VoucherNumberingConfig ───────────────────────────────────────────────────

export type ResetPeriod = "NONE" | "YEARLY" | "MONTHLY";
export type VoucherType =
  | "CASH_RECEIPT"
  | "CASH_PAYMENT"
  | "BANK_RECEIPT"
  | "BANK_PAYMENT"
  | "EWALLET_RECEIPT"
  | "CUSTOMER_ADVANCE_RECEIPT";

export interface VoucherNumberingConfig {
  id: string;
  voucher_type: VoucherType;
  prefix: string;
  date_pattern: string | null;
  current_sequence: number | null;
  padding_length: number | null;
  reset_period: ResetPeriod;
  is_active: boolean;
  note: string | null;
  updated_at: string | null;
}

export interface CreateVoucherNumberingConfigDto {
  voucher_type: VoucherType;
  prefix: string;
  reset_period: ResetPeriod;
  date_pattern?: string;
  current_sequence?: number;
  padding_length?: number;
  is_active?: boolean;
  note?: string;
}

export type UpdateVoucherNumberingConfigDto =
  Partial<CreateVoucherNumberingConfigDto>;

export async function getVoucherNumberingConfigsApi(): Promise<
  VoucherNumberingConfig[]
> {
  const { data } = await axiosInstance.get<PaginatedResponse<VoucherNumberingConfig>>(
    "/api/v1/voucher-numbering-configs",
    { params: { page: 1, pageSize: 50 } },
  );
  return data.items;
}

export async function createVoucherNumberingConfigApi(
  dto: CreateVoucherNumberingConfigDto,
): Promise<VoucherNumberingConfig> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: VoucherNumberingConfig;
  }>("/api/v1/voucher-numbering-configs", dto);
  return data.data;
}

export async function updateVoucherNumberingConfigApi(
  id: string,
  dto: UpdateVoucherNumberingConfigDto,
): Promise<VoucherNumberingConfig> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: VoucherNumberingConfig;
  }>(`/api/v1/voucher-numbering-configs/${id}`, dto);
  return data.data;
}

// ─── PaymentVoucher ───────────────────────────────────────────────────────────

export type VoucherChannel = "CASH" | "BANK" | "MANUAL";
export type VoucherDirection = "IN" | "OUT" | "RECEIPT" | "PAYMENT";
export type VoucherStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "POSTED"
  | "REJECTED"
  | "CANCELLED";
export type CounterpartyRole =
  | "CUSTOMER"
  | "VENDOR"
  | "EMPLOYEE"
  | "BANK"
  | "GOVERNMENT"
  | "INTERNAL"
  | "SHAREHOLDER"
  | "OTHER";
export type CounterpartySource = "INTERNAL" | "EXTERNAL";

export type CashBankRelatedDocumentType = "payment_vouchers" | "ar_documents" | "ap_documents" | "sales_invoices" | "purchase_invoices" | "manual";

export interface CashBankRelatedDocumentInput {
  payment_voucher_id?: string | PaymentVoucher | null;
  related_type: CashBankRelatedDocumentType | string;
  related_id: string;
  related_no?: string | null;
  related_date?: string | null;
  amount?: number | null;
  note?: string | null;
}

export interface CashBankTagPreset {
  id: string;
  code: string;
  label: string;
  description?: string | null;
  voucher_channel?: VoucherChannel | null;
  voucher_direction?: "IN" | "OUT" | null;
  debit_account_id?: string | null;
  credit_account_id?: string | null;
  sort?: number | null;
}

export interface PaymentVoucher {
  id: string;
  voucher_no: string;
  voucher_channel: VoucherChannel;
  voucher_direction: VoucherDirection;
  voucher_type: VoucherType;
  document_date: string;
  posting_date: string;
  counterparty_id: string | null;
  actual_person_name: string | null;
  actual_person_id_no: string | null;
  actual_person_phone: string | null;
  description: string;
  debit_account_id: string;
  credit_account_id: string;
  cash_fund_id: string | null;
  company_bank_account_id: string | null;
  beneficiary_bank_account_id: string | null;
  amount: number;
  currency: string | null;
  amount_in_words: string | null;
  status: VoucherStatus;
  counterparty_name_snapshot: string;
  counterparty_tax_code_snapshot: string | null;
  counterparty_address_snapshot: string | null;
  created_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  posted_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string | null;
  // --- Fields mới từ backend counterparty redesign ---
  counterparty_source: CounterpartySource | null;
  employee_id:
    | string
    | {
        id: string;
        employee_code?: string | null;
        full_name?: string | null;
        phone?: string | null;
        identity_no?: string | null;
      }
    | null;
  counterparty_phone_snapshot: string | null;
  counterparty_identity_no_snapshot: string | null;
  beneficiary_bank_name_snapshot: string | null;
  beneficiary_bank_account_snapshot: string | null;
  beneficiary_account_holder_snapshot: string | null;
  ar_advance_original_amount?: number | string | null;
  ar_advance_applied_amount?: number | string | null;
  ar_advance_remaining_amount?: number | string | null;
  ar_advance_status?: "NONE" | "UNAPPLIED" | "PARTIALLY_APPLIED" | "FULLY_APPLIED" | "REVERSED" | null;
  cash_bank_tag_preset_id?: string | null;
  related_documents?: CashBankRelatedDocumentInput[];
}

export interface CreatePaymentVoucherDto {
  voucher_no: string;
  voucher_channel: VoucherChannel;
  voucher_direction: VoucherDirection;
  voucher_type: VoucherType;
  document_date: string;
  posting_date: string;
  counterparty_id?: string;
  description: string;
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  counterparty_name_snapshot: string;
  actual_person_name?: string;
  actual_person_id_no?: string;
  actual_person_phone?: string;
  cash_fund_id?: string;
  company_bank_account_id?: string;
  beneficiary_bank_account_id?: string;
  currency?: string;
  amount_in_words?: string;
  counterparty_tax_code_snapshot?: string;
  counterparty_address_snapshot?: string;
  status?: VoucherStatus;
  // --- Fields mới ---
  counterparty_source?: CounterpartySource;
  employee_id?: string;
  counterparty_phone_snapshot?: string;
  counterparty_identity_no_snapshot?: string;
  beneficiary_bank_name_snapshot?: string;
  beneficiary_bank_account_snapshot?: string;
  beneficiary_account_holder_snapshot?: string;
  cash_bank_tag_preset_id?: string;
  cash_bank_tag_code?: string;
  related_documents?: CashBankRelatedDocumentInput[];
}

export type UpdatePaymentVoucherDto = Partial<CreatePaymentVoucherDto>;

export async function getPaymentVouchersPagedApi(
  params: ListParams & {
    voucher_channel?: VoucherChannel;
    voucher_type?: VoucherType;
    status?: VoucherStatus;
    cash_fund_id?: string;
    company_bank_account_id?: string;
    posting_date_from?: string;
    posting_date_to?: string;
    amount?: number;
    amount_min?: number;
    amount_max?: number;
    counterparty_source?: CounterpartySource;
    employee_id?: string;
    /** Filter by counterparty (business partner / employee) ID */
    counterparty_id?: string;
    /** Filter by voucher direction (IN or OUT) */
    voucher_direction?: VoucherDirection;
  } = {},
): Promise<PaginatedResponse<PaymentVoucher>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = (params.sort ?? ["-document_date"]).join(",");
  const key = [
    "payment-vouchers",
    page,
    pageSize,
    sort,
    params.search ?? "",
    params.voucher_channel ?? "",
    params.voucher_type ?? "",
    params.status ?? "",
    params.posting_date_from ?? "",
    params.posting_date_to ?? "",
    params.amount ?? "",
    params.amount_min ?? "",
    params.amount_max ?? "",
    params.counterparty_source ?? "",
    params.employee_id ?? "",
    params.counterparty_id ?? "",
    params.voucher_direction ?? "",
  ].join(":");

  return dedupeRequest(key, async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<PaymentVoucher>>(
      "/api/v1/payment-vouchers",
      {
        params: {
          page,
          pageSize,
          sort,
          ...(params.search ? { search: params.search } : {}),
          ...(params.voucher_channel ? { voucher_channel: params.voucher_channel } : {}),
          ...(params.voucher_type ? { voucher_type: params.voucher_type } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.posting_date_from ? { posting_date_from: params.posting_date_from } : {}),
          ...(params.posting_date_to ? { posting_date_to: params.posting_date_to } : {}),
          ...(params.amount != null ? { amount: params.amount } : {}),
          ...(params.amount_min != null ? { amount_min: params.amount_min } : {}),
          ...(params.amount_max != null ? { amount_max: params.amount_max } : {}),
          ...(params.counterparty_source ? { counterparty_source: params.counterparty_source } : {}),
          ...(params.employee_id ? { employee_id: params.employee_id } : {}),
          ...(params.counterparty_id ? { counterparty_id: params.counterparty_id } : {}),
          ...(params.voucher_direction ? { voucher_direction: params.voucher_direction } : {}),
        },
      },
    );
    return data;
  });
}

// ─── PaymentVoucher Lookup ───────────────────────────────────────────────────

export async function getPaymentVoucherLookupEmployeesApi(
  params: Pick<ListParams, "page" | "pageSize" | "search"> = {},
): Promise<Employee[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<Employee>>(
    "/api/v1/payment-vouchers/lookup/employees",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 200,
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data.items;
}

export async function getPaymentVoucherLookupBusinessPartnersApi(
  params: Pick<ListParams, "page" | "pageSize" | "search"> = {},
): Promise<BusinessPartner[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<BusinessPartner>>(
    "/api/v1/payment-vouchers/lookup/business-partners",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 200,
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data.items;
}


export async function getCashBankTagPresetsApi(params: {
  voucher_channel?: VoucherChannel;
  voucher_direction?: "IN" | "OUT";
} = {}): Promise<CashBankTagPreset[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<CashBankTagPreset>>(
    "/api/v1/payment-vouchers/lookup/cash-bank-tag-presets",
    { params: { page: 1, pageSize: 100, ...params } },
  );
  return data.items;
}

export async function getPaymentVoucherLookupBusinessPartnerBankAccountsApi(
  counterpartyId: string,
  params: Pick<ListParams, "page" | "pageSize"> = {},
): Promise<BusinessPartnerBankAccount[]> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<BusinessPartnerBankAccount>
  >("/api/v1/payment-vouchers/lookup/business-partner-bank-accounts", {
    params: {
      counterparty_id: counterpartyId,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    },
  });
  return data.items;
}

// ─── PaymentVoucher Summary ───────────────────────────────────────────────────

export interface VoucherSummaryResponse {
  total_receipt: number;
  total_payment: number;
  net: number;
  total_count: number;
  breakdown: Array<{
    voucher_type: string;
    voucher_direction: VoucherDirection;
    status: VoucherStatus;
    sum: { amount: number };
    count: { id: number };
  }>;
}

export async function getPaymentVouchersSummaryApi(params: {
  voucher_channel?: VoucherChannel;
  cash_fund_id?: string;
  company_bank_account_id?: string;
  status?: VoucherStatus;
  posting_date_from?: string;
  posting_date_to?: string;
}): Promise<VoucherSummaryResponse> {
  const key = [
    "payment-vouchers-summary",
    params.voucher_channel ?? "",
    params.cash_fund_id ?? "",
    params.company_bank_account_id ?? "",
    params.status ?? "",
    params.posting_date_from ?? "",
    params.posting_date_to ?? "",
  ].join(":");

  return dedupeRequest(key, async () => {
    const { data } = await axiosInstance.get<VoucherSummaryResponse>(
      "/api/v1/payment-vouchers/summary",
      { params },
    );
    return data;
  });
}

export async function createPaymentVoucherApi(
  dto: CreatePaymentVoucherDto,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PaymentVoucher;
  }>("/api/v1/payment-vouchers", dto);
  return data.data;
}

export async function updatePaymentVoucherApi(
  id: string,
  dto: UpdatePaymentVoucherDto,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: PaymentVoucher;
  }>(`/api/v1/payment-vouchers/${id}`, dto);
  return data.data;
}

export async function deletePaymentVoucherApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/payment-vouchers/${id}`);
}

export async function getPaymentVoucherApi(id: string): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.get<{
    data?: PaymentVoucher;
  } | PaymentVoucher>(`/api/v1/payment-vouchers/${id}`);
  return "data" in data && data.data ? data.data : (data as PaymentVoucher);
}

// ─── PaymentVoucher Status Transitions ───────────────────────────────────────

export async function submitPaymentVoucherApi(id: string): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    `/api/v1/payment-vouchers/${id}/submit`,
  );
  return data.data;
}

export async function approvePaymentVoucherApi(id: string): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    `/api/v1/payment-vouchers/${id}/approve`,
  );
  return data.data;
}

export async function rejectPaymentVoucherApi(
  id: string,
  note?: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    `/api/v1/payment-vouchers/${id}/reject`,
    note ? { note } : undefined,
  );
  return data.data;
}

export async function postPaymentVoucherApi(id: string): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    `/api/v1/payment-vouchers/${id}/post`,
  );
  return data.data;
}

export async function cancelPaymentVoucherApi(
  id: string,
  cancel_reason?: string,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    `/api/v1/payment-vouchers/${id}/cancel`,
    cancel_reason ? { cancel_reason } : undefined,
  );
  return data.data;
}

// ─── PaymentVoucherAttachment ─────────────────────────────────────────────────

export type AttachmentType =
  | "INVOICE"
  | "RECEIPT"
  | "CONTRACT"
  | "PAYMENT_REQUEST"
  | "BANK_STATEMENT"
  | "OTHER";

export interface PaymentVoucherAttachment {
  id: string;
  payment_voucher_id: string | PaymentVoucher;
  file: string | { id: string; filename_download?: string; filename_disk?: string; type?: string; filesize?: number };
  attachment_type: AttachmentType | null;
  note: string | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export interface CreatePaymentVoucherAttachmentDto {
  payment_voucher_id: string;
  file: string;
  attachment_type: AttachmentType;
  note?: string;
}

export async function uploadFileApi(file: File): Promise<{ id: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post<{ id: string }>(
    "/api/v1/files/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export function getFileViewUrl(fileId: string) {
  return `${API_BASE_URL}/api/v1/files/${encodeURIComponent(fileId)}`;
}

export interface FileMeta {
  id: string;
  filename_download?: string;
  filename_disk?: string;
  type?: string;
  filesize?: number;
}

export async function getFileMetaApi(fileId: string): Promise<FileMeta> {
  const { data } = await axiosInstance.get<{ data?: FileMeta } | FileMeta>(
    `/api/v1/files/${encodeURIComponent(fileId)}/metadata`,
  );
  return "data" in data && data.data ? data.data : (data as FileMeta);
}

export async function getFileBlobApi(fileId: string): Promise<Blob> {
  const { data } = await axiosInstance.get(
    `/api/v1/files/${encodeURIComponent(fileId)}`,
    { responseType: "blob" },
  );
  return data;
}

export async function createVoucherAttachmentApi(
  dto: CreatePaymentVoucherAttachmentDto,
): Promise<PaymentVoucherAttachment> {
  const { data } = await axiosInstance.post<{
    message?: string;
    data?: PaymentVoucherAttachment;
  } | PaymentVoucherAttachment>("/api/v1/payment-voucher-attachments", dto);
  return "data" in data && data.data ? data.data : (data as PaymentVoucherAttachment);
}

export async function deleteVoucherAttachmentApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/payment-voucher-attachments/${id}`);
}

export async function getPaymentVoucherAttachmentsPagedApi(
  params: ListParams & {
    payment_voucher_id?: string;
    attachment_type?: AttachmentType | "";
  } = {},
): Promise<PaginatedResponse<PaymentVoucherAttachment>> {
  const { data } = await axiosInstance.get<PaginatedResponse<PaymentVoucherAttachment>>(
    "/api/v1/payment-voucher-attachments",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? ["-uploaded_at"]).join(","),
        ...(params.search ? { search: params.search } : {}),
        ...(params.payment_voucher_id
          ? { payment_voucher_id: params.payment_voucher_id }
          : {}),
        ...(params.attachment_type
          ? { attachment_type: params.attachment_type }
          : {}),
      },
    },
  );
  return data;
}

export async function getVoucherAttachmentsApi(
  voucherId: string,
): Promise<PaymentVoucherAttachment[]> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<PaymentVoucherAttachment>
  >("/api/v1/payment-voucher-attachments", {
    params: {
      payment_voucher_id: voucherId,
      pageSize: 50,
      sort: "-uploaded_at",
    },
  });
  return data.items;
}

// ─── PaymentVoucherApprovalLog (read-only) ────────────────────────────────────

export type ApprovalAction = "SUBMIT" | "APPROVE" | "REJECT" | "POST" | "CANCEL";

export interface PaymentVoucherApprovalLog {
  id: string;
  payment_voucher_id: string;
  action: ApprovalAction;
  action_by: string | null;
  action_by_name?: string | null;
  action_at: string;
  note: string | null;
  from_status: string | null;
  to_status: string | null;
}

export async function getVoucherApprovalLogsApi(
  voucherId: string,
): Promise<PaymentVoucherApprovalLog[]> {
  const { data } = await axiosInstance.get<
    PaginatedResponse<PaymentVoucherApprovalLog>
  >("/api/v1/payment-voucher-approval-logs", {
    params: { payment_voucher_id: voucherId, pageSize: 50 },
  });
  return data.items;
}

// ─── PartnerLedger ────────────────────────────────────────────────────────────

export type PartnerLedgerItemType = "RECEIVABLE" | "PAYABLE";
export type PartnerLedgerSourceType =
  | "OPENING"
  | "MANUAL"
  | "SALES_DOC"
  | "PURCHASE_DOC"
  | "ADJUSTMENT";
export type PartnerLedgerStatus = "OPEN" | "PARTIAL" | "SETTLED" | "CANCELLED";

export interface PartnerLedgerItem {
  id: string;
  item_no: string;
  item_type: PartnerLedgerItemType;
  source_type: PartnerLedgerSourceType;
  business_partner_id: string;
  accounting_account_id: string;
  document_date: string;
  posting_date: string;
  due_date: string | null;
  reference_no: string | null;
  description: string;
  currency: string;
  original_amount: number;
  settled_amount: number;
  open_amount: number;
  status: PartnerLedgerStatus;
  note: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePartnerLedgerItemDto {
  item_no: string;
  item_type: PartnerLedgerItemType;
  source_type?: PartnerLedgerSourceType;
  business_partner_id: string;
  accounting_account_id: string;
  document_date: string;
  posting_date: string;
  due_date?: string;
  reference_no?: string;
  description: string;
  currency?: string;
  original_amount: number;
  note?: string;
}

export type UpdatePartnerLedgerItemDto = Partial<CreatePartnerLedgerItemDto>;

export interface PartnerLedgerSummary {
  total_open: number;
  total_overdue: number;
  total_settled: number;
  total_count: number;
  buckets: {
    current: number;
    days_1_30: number;
    days_31_60: number;
    days_61_90: number;
    days_90_plus: number;
  };
}

export interface PartnerLedgerSettlement {
  id: string;
  partner_ledger_item_id: string;
  payment_voucher_id: string;
  settlement_date: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface CreatePartnerLedgerSettlementDto {
  partner_ledger_item_id: string;
  payment_voucher_id: string;
  settlement_date: string;
  amount: number;
  note?: string;
}

export interface PartnerLedgerListParams extends ListParams {
  item_type?: PartnerLedgerItemType;
  business_partner_id?: string;
  accounting_account_id?: string;
  status?: PartnerLedgerStatus;
  due_from?: string;
  due_to?: string;
  overdue?: boolean;
}

export interface PartnerLedgerSettlementListParams extends ListParams {
  partner_ledger_item_id?: string;
  payment_voucher_id?: string;
}

export async function getPartnerLedgerItemsApi(
  params: PartnerLedgerListParams = {},
): Promise<PaginatedResponse<PartnerLedgerItem>> {
  const { data } = await axiosInstance.get<PaginatedResponse<PartnerLedgerItem>>(
    "/api/v1/partner-ledger-items",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? ["-document_date"]).join(","),
        ...(params.search ? { search: params.search } : {}),
        ...(params.item_type ? { item_type: params.item_type } : {}),
        ...(params.business_partner_id ? { business_partner_id: params.business_partner_id } : {}),
        ...(params.accounting_account_id ? { accounting_account_id: params.accounting_account_id } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.due_from ? { due_from: params.due_from } : {}),
        ...(params.due_to ? { due_to: params.due_to } : {}),
        ...(params.overdue ? { overdue: true } : {}),
      },
    },
  );
  return data;
}

export async function getPartnerLedgerItemApi(
  id: string,
): Promise<PartnerLedgerItem> {
  const { data } = await axiosInstance.get<
    { data?: PartnerLedgerItem } | PartnerLedgerItem
  >(`/api/v1/partner-ledger-items/${id}`);
  return "data" in data && data.data ? data.data : (data as PartnerLedgerItem);
}

export async function getPartnerLedgerSummaryApi(
  params: {
    item_type?: PartnerLedgerItemType;
    business_partner_id?: string;
    accounting_account_id?: string;
  } = {},
): Promise<PartnerLedgerSummary> {
  const { data } = await axiosInstance.get<PartnerLedgerSummary>(
    "/api/v1/partner-ledger-items/summary",
    { params },
  );
  return data;
}

export async function createPartnerLedgerItemApi(
  dto: CreatePartnerLedgerItemDto,
): Promise<PartnerLedgerItem> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PartnerLedgerItem;
  }>("/api/v1/partner-ledger-items", dto);
  return data.data;
}

export async function updatePartnerLedgerItemApi(
  id: string,
  dto: UpdatePartnerLedgerItemDto,
): Promise<PartnerLedgerItem> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: PartnerLedgerItem;
  }>(`/api/v1/partner-ledger-items/${id}`, dto);
  return data.data;
}

export async function deletePartnerLedgerItemApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/partner-ledger-items/${id}`);
}

export async function getPartnerLedgerSettlementsApi(
  params: PartnerLedgerSettlementListParams = {},
): Promise<PaginatedResponse<PartnerLedgerSettlement>> {
  const { data } = await axiosInstance.get<PaginatedResponse<PartnerLedgerSettlement>>(
    "/api/v1/partner-ledger-settlements",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? ["-settlement_date"]).join(","),
        ...(params.partner_ledger_item_id
          ? { partner_ledger_item_id: params.partner_ledger_item_id }
          : {}),
        ...(params.payment_voucher_id
          ? { payment_voucher_id: params.payment_voucher_id }
          : {}),
      },
    },
  );
  return data;
}

export async function createPartnerLedgerSettlementApi(
  dto: CreatePartnerLedgerSettlementDto,
): Promise<PartnerLedgerSettlement> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: PartnerLedgerSettlement;
  }>("/api/v1/partner-ledger-settlements", dto);
  return data.data;
}

export async function deletePartnerLedgerSettlementApi(
  id: string,
): Promise<void> {
  await axiosInstance.delete(`/api/v1/partner-ledger-settlements/${id}`);
}


// ─── AR Workbench ─────────────────────────────────────────────────────────────

export type ArDocumentType =
  | "INVOICE"
  | "IMMEDIATE_SALE"
  | "ADVANCE"
  | "CREDIT_NOTE"
  | "SALES_RETURN"
  | "REFUND"
  | "WRITE_OFF"
  | "SUSPENSE"
  | "FX_REVALUATION"
  | "RETENTION"
  | "COD"
  | "GATEWAY"
  | "INTERCOMPANY"
  | "CONTRACT_MILESTONE"
  | "ADJUSTMENT";

export type ArDocumentStatus =
  | "DRAFT"
  | "POSTED"
  | "PARTIAL"
  | "SETTLED"
  | "DISPUTED"
  | "REVERSED"
  | "CANCELLED";

export interface ArDocument {
  id: string;
  document_no: string;
  document_type: ArDocumentType;
  business_partner_id: string | null;
  business_partner_name_snapshot?: string | null;
  can_delete?: boolean;
  related_documents?: CashBankRelatedDocumentInput[];
  accounting_account_id: string | null;
  document_date: string;
  posting_date: string;
  due_date: string | null;
  currency: string;
  exchange_rate: number;
  total_amount: number;
  settled_amount: number;
  open_amount: number;
  status: ArDocumentStatus;
  source_type: string | null;
  source_id: string | null;
  reference_no: string | null;
  description: string;
  risk_status: "NORMAL" | "OVERDUE" | "BAD_DEBT_RISK" | "LEGAL";
  dispute_status: "NONE" | "DISPUTED" | "RESOLVED";
  collection_status: "NOT_STARTED" | "REMINDER_SENT" | "PROMISED" | "ESCALATED" | "LEGAL";
  promise_to_pay_date: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateArDocumentDto {
  document_no: string;
  document_type: ArDocumentType;
  business_partner_id?: string;
  accounting_account_id?: string;
  document_date: string;
  posting_date: string;
  due_date?: string;
  currency?: string;
  exchange_rate?: number;
  total_amount: number;
  status?: ArDocumentStatus;
  reference_no?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateArSalesInvoiceLineDto {
  line_no?: number;
  item_code?: string;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  revenue_account_id?: string;
  tax_account_id?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateArSalesInvoiceDto {
  document_no: string;
  business_partner_id: string;
  accounting_account_id?: string;
  document_date: string;
  posting_date: string;
  due_date?: string;
  currency?: string;
  exchange_rate?: number;
  reference_no?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  lines: CreateArSalesInvoiceLineDto[];
}

export type UpdateArDocumentDto = Partial<CreateArDocumentDto>;


export interface ArCoverageItem {
  id: number;
  use_case: string;
  status: "phase1_supported" | "phase1_foundation" | "phase2a_supported" | "existing_supported";
  route: string;
}

export interface ArSummary {
  totals: {
    count: number;
    total_amount: number;
    settled_amount: number;
    open_amount: number;
    overdue_amount: number;
  };
  by_type: Record<string, { count: number; open_amount: number; total_amount: number }>;
  coverage: ArCoverageItem[];
}

export interface ArDocumentListParams extends ListParams {
  business_partner_id?: string;
  document_type?: ArDocumentType;
  status?: ArDocumentStatus;
  risk_status?: string;
  open_only?: boolean;
  overdue?: boolean;
}

export async function getArDocumentsApi(
  params: ArDocumentListParams = {},
): Promise<PaginatedResponse<ArDocument>> {
  const { data } = await axiosInstance.get<PaginatedResponse<ArDocument>>(
    "/api/v1/ar-workbench/documents",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        sort: (params.sort ?? ["-posting_date"]).join(","),
        ...(params.search ? { search: params.search } : {}),
        ...(params.business_partner_id ? { business_partner_id: params.business_partner_id } : {}),
        ...(params.document_type ? { document_type: params.document_type } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.risk_status ? { risk_status: params.risk_status } : {}),
        ...(params.open_only ? { open_only: true } : {}),
        ...(params.overdue ? { overdue: true } : {}),
      },
    },
  );
  return data;
}

export async function createArDocumentApi(dto: CreateArDocumentDto): Promise<ArDocument> {
  const { data } = await axiosInstance.post<{ message: string; data: ArDocument }>(
    "/api/v1/ar-workbench/documents",
    dto,
  );
  return data.data;
}

export async function updateArDocumentApi(id: string, dto: UpdateArDocumentDto): Promise<ArDocument> {
  const { data } = await axiosInstance.patch<{ message: string; data: ArDocument }>(`/api/v1/ar-workbench/documents/${id}`, dto);
  return data.data;
}

export async function deleteArDocumentApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/ar-workbench/documents/${id}`);
}

export async function createArSalesInvoiceApi(
  dto: CreateArSalesInvoiceDto,
): Promise<{ document: ArDocument }> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: { document: ArDocument };
  }>("/api/v1/ar-workbench/sales-invoices", dto);
  return data.data;
}

export async function postArDocumentApi(
  id: string,
): Promise<{ document: ArDocument; journal_entry: unknown }> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: { document: ArDocument; journal_entry: unknown };
  }>(`/api/v1/ar-workbench/documents/${id}/post`);
  return data.data;
}


export async function getArSummaryApi(
  params: ArDocumentListParams = {},
): Promise<ArSummary> {
  const { data } = await axiosInstance.get<ArSummary>("/api/v1/ar-workbench/summary", {
    params: {
      ...(params.business_partner_id ? { business_partner_id: params.business_partner_id } : {}),
      ...(params.document_type ? { document_type: params.document_type } : {}),
      ...(params.status ? { status: params.status } : {}),
      ...(params.open_only ? { open_only: true } : {}),
      ...(params.overdue ? { overdue: true } : {}),
    },
  });
  return data;
}

export async function getArCoverageApi(): Promise<{ items: ArCoverageItem[]; total: number }> {
  const { data } = await axiosInstance.get<{ items: ArCoverageItem[]; total: number }>(
    "/api/v1/ar-workbench/coverage",
  );
  return data;
}

// ─── Payment Voucher / Receipt (AR Workbench) ─────────────────────────────────

export type PaymentMethod = "CASH" | "BANK" | "EWALLET";

export interface PaymentAllocationLine {
  target_document_id: string;
  amount: number;
  writeoff_amount?: number;
  writeoff_account_id?: string;
  reason?: string;
}

export interface CreatePaymentReceiptDto {
  voucher_no?: string;
  payment_method: PaymentMethod;
  document_date: string;
  posting_date?: string;
  counterparty_id: string;
  counterparty_name_snapshot?: string;
  debit_account_id?: string;
  credit_account_id?: string;
  amount: number;
  currency?: string;
  description?: string;
  allocations?: PaymentAllocationLine[];
}

export interface CreateCustomerAdvanceDto {
  voucher_no?: string;
  payment_method: PaymentMethod;
  document_date: string;
  posting_date?: string;
  counterparty_id: string;
  counterparty_name_snapshot?: string;
  debit_account_id?: string;
  credit_account_id?: string;
  amount: number;
  currency?: string;
  description?: string;
}

export async function getPaymentVouchersApi(
  params: ArDocumentListParams = {},
): Promise<PaginatedResponse<PaymentVoucher>> {
  const { data } = await axiosInstance.get<PaginatedResponse<PaymentVoucher>>(
    "/api/v1/ar-workbench/payment-vouchers",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        ...(params.business_partner_id ? { business_partner_id: params.business_partner_id } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data;
}

export async function createPaymentReceiptApi(
  dto: CreatePaymentReceiptDto,
): Promise<{ voucher: PaymentVoucher; applications: unknown[] }> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: { voucher: PaymentVoucher; applications: unknown[] };
  }>("/api/v1/ar-workbench/payment-vouchers", dto);
  return data.data;
}

export async function postArPaymentVoucherApi(
  id: string,
): Promise<{ voucher: PaymentVoucher; journal_entry: unknown }> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: { voucher: PaymentVoucher; journal_entry: unknown };
  }>(`/api/v1/ar-workbench/payment-vouchers/${id}/post`);
  return data.data;
}

export async function allocatePaymentApi(
  voucherId: string,
  allocations: PaymentAllocationLine[],
): Promise<unknown[]> {
  const { data } = await axiosInstance.post<{ message: string; data: unknown[] }>(
    `/api/v1/ar-workbench/payment-vouchers/${voucherId}/allocate`,
    { allocations },
  );
  return data.data;
}


export async function getCustomerAdvancesApi(
  params: ArDocumentListParams = {},
): Promise<PaginatedResponse<PaymentVoucher>> {
  const { data } = await axiosInstance.get<PaginatedResponse<PaymentVoucher>>(
    "/api/v1/ar-workbench/customer-advances",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? DEFAULT_PAGE_SIZE,
        ...(params.business_partner_id ? { business_partner_id: params.business_partner_id } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    },
  );
  return data;
}

export async function createCustomerAdvanceApi(
  dto: CreateCustomerAdvanceDto,
): Promise<PaymentVoucher> {
  const { data } = await axiosInstance.post<{ message: string; data: PaymentVoucher }>(
    "/api/v1/ar-workbench/customer-advances",
    dto,
  );
  return data.data;
}

export async function postCustomerAdvanceApi(
  id: string,
): Promise<{ voucher: PaymentVoucher; journal_entry: unknown }> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: { voucher: PaymentVoucher; journal_entry: unknown };
  }>(`/api/v1/ar-workbench/customer-advances/${id}/post`);
  return data.data;
}


// ─── UC#4 Apply Advance to Invoice / Cấn trừ cọc ────────────────────────────

export interface ApplyAdvanceToInvoiceDto {
  advance_voucher_id: string;
  ar_document_id: string;
  amount: number;
  application_date: string;
  application_no?: string;
  reason?: string;
}

export interface AdvanceApplication {
  id: string;
  application_no: string;
  application_type: "ADVANCE_APPLICATION";
  payment_voucher_id: string;
  source_document_id?: string | null;
  target_document_id: string;
  application_date: string;
  amount: number;
  status: "POSTED" | "REVERSED";
  reason?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface ApplyAdvanceResult {
  application: AdvanceApplication;
  advance_after: {
    id: string;
    voucher_no: string;
    ar_advance_remaining_amount: number;
    ar_advance_status: string;
  };
  invoice_after: {
    id: string;
    document_no: string;
    open_amount: number;
    settled_amount: number;
    status: string;
  };
}

export async function getAdvanceApplicationsApi(params: {
  advance_voucher_id?: string;
  ar_document_id?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AdvanceApplication>> {
  const { data } = await axiosInstance.get<PaginatedResponse<AdvanceApplication>>(
    "/api/v1/ar-workbench/advance-applications",
    { params },
  );
  return data;
}

export async function applyAdvanceToInvoiceApi(
  dto: ApplyAdvanceToInvoiceDto,
): Promise<ApplyAdvanceResult> {
  const { data } = await axiosInstance.post<{ message: string; data: ApplyAdvanceResult }>(
    "/api/v1/ar-workbench/advance-applications",
    dto,
  );
  return data.data;
}


