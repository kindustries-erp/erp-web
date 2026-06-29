import axiosInstance from "@/core/api/axiosInstance";

export interface SinvoiceConfig {
  ok?: boolean;
  supplierTaxCode?: string;
  username: string;
  password?: string;
  apiUrl: string;
  taxPortalConfigured?: boolean;
  taxPortalApiUrl?: string | null;
  taxPortalTaxCode?: string | null;
  provider?: string;
  draftOnly?: boolean;
  hasConfig?: boolean;
  surface?: string;
  legacyMode?: string;
  hiddenByDefault?: boolean;
}

export interface TaxPortalConfig {
  id?: string;
  taxCode?: string;
  username?: string;
  password?: string;
  providerName?: string;
  apiUrl?: string | null;
  gdtJwt?: string | null;
  gdtCookie?: string | null;
  isActive?: boolean;
}

export interface Einvoice {
  id: string;
  document_no: string;
  invoice_no?: string;
  invoiceNo?: string;
  invoice_date?: string;
  buyer_name?: string;
  buyer_tax_code?: string;
  buyer_address?: string;
  seller_name?: string;
  seller_tax_code?: string;
  seller_address?: string;
  total_amount: number;
  vat_amount: number;
  status: "DRAFT" | "ISSUED" | "CANCELLED" | "ERROR" | "SYNCED";
  source?: "SINVOICE" | "TAX_PORTAL";
  direction?: "IN" | "OUT";
  tax_status?: string;
  external_invoice_id?: string;
  externalId?: string;
  viettel_transaction_id?: string;
  error_message?: string;
  created_at?: string;
  synced_at?: string;
  response_payload?: Record<string, unknown>;
  xml_file_key?: string;
  xmlFileKey?: string;
}

export async function getSinvoiceHealthApi(): Promise<SinvoiceConfig> {
  const res = await axiosInstance.get("/api/v1/sinvoice/health");
  return res.data;
}

export interface EinvoiceListResponse {
  data: Einvoice[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    sum_total_amount?: number;
    sum_vat_amount?: number;
  };
}

export async function listLocalEinvoicesApi(params?: {
  source?: "SINVOICE" | "TAX_PORTAL";
  direction?: "IN" | "OUT";
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<EinvoiceListResponse> {
  const res = await axiosInstance.get("/api/v1/sinvoice/local", { params });
  return res.data;
}

export async function createSinvoiceApi(data: any = {}): Promise<any> {
  const res = await axiosInstance.post("/api/v1/viettel-v2/draft", data);
  return res.data;
}

export async function syncSinvoiceApi(): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/sync");
  return res.data;
}

export async function syncSinvoiceDraftApi(params?: {
  startDate?: string;
  endDate?: string;
  size?: number;
}): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/sync-draft", {
    params,
  });
  return res.data;
}

export async function syncSinvoiceIssuedApi(params?: {
  startDate?: string;
  endDate?: string;
  pageNum?: number;
  rowPerPage?: number;
}): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/sync-issued", {
    params,
    timeout: 120000,
  });
  return res.data;
}

export async function listLocalDraftEinvoicesApi(params?: {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<EinvoiceListResponse> {
  const res = await axiosInstance.get("/api/v1/sinvoice/local", {
    params: { ...params, status: "DRAFT" },
  });
  return res.data;
}

export async function listLocalIssuedEinvoicesApi(params?: {
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<EinvoiceListResponse> {
  const res = await axiosInstance.get("/api/v1/sinvoice/local", {
    params: { ...params, status: "ISSUED" },
  });
  return res.data;
}

export async function runSinvoiceDemoFlowApi(): Promise<any> {
  const res = await axiosInstance.post("/api/v1/sinvoice/demo-flow");
  return res.data;
}

export async function getConfigApi(): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/config");
  return res.data;
}

export async function saveConfigApi(data: any): Promise<any> {
  const res = await axiosInstance.post("/api/v1/sinvoice/config", data);
  return res.data;
}

export async function resetConfigApi(): Promise<any> {
  const res = await axiosInstance.delete("/api/v1/sinvoice/config");
  return res.data;
}

export async function getTaxPortalConfigApi(): Promise<TaxPortalConfig | null> {
  const res = await axiosInstance.get("/api/v1/sinvoice/tax-portal/config");
  return res.data;
}

export async function saveTaxPortalConfigApi(
  data: TaxPortalConfig,
): Promise<any> {
  const res = await axiosInstance.post(
    "/api/v1/sinvoice/tax-portal/config",
    data,
  );
  return res.data;
}

export async function resetTaxPortalConfigApi(): Promise<any> {
  const res = await axiosInstance.delete("/api/v1/sinvoice/tax-portal/config");
  return res.data;
}

export interface TaxPortalSyncResponse {
  ok: boolean;
  source: "TAX_PORTAL";
  direction: "IN" | "OUT";
  pageSize?: number;
  requested_range?: {
    startDate: string;
    endDate: string;
  };
  chunk_count?: number;
  chunks?: Array<{
    index: number;
    startDate: string;
    endDate: string;
    fetched: number;
    upserted: number;
  }>;
  count: number;
  synced_at: string;
  invoice_nos?: string[];
  note?: string;
}

export async function syncTaxPortalApi(params: {
  direction: "IN" | "OUT";
  startDate?: string;
  endDate?: string;
  pageSize?: 15 | 30 | 50;
}): Promise<TaxPortalSyncResponse> {
  const res = await axiosInstance.get("/api/v1/sinvoice/tax-portal/sync", {
    params,
    timeout: 60000,
  });
  return res.data;
}

export async function downloadSinvoiceApi(
  invoiceNo: string,
  pattern: string,
  fileType: string,
): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/download", {
    params: { invoiceNo, pattern, fileType },
  });
  return res.data;
}

export async function getViettelTemplatesApi(): Promise<any> {
  const res = await axiosInstance.get("/api/v1/viettel-v2/templates");
  return res.data;
}
