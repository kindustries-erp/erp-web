import axiosInstance from "@/core/api/axiosInstance";

export interface SinvoiceConfig {
  ok?: boolean;
  supplierTaxCode: string;
  username: string;
  password?: string;
  apiUrl: string;
  environment: string;
  taxPortalConfigured?: boolean;
  taxPortalApiUrl?: string | null;
  taxPortalTaxCode?: string | null;
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
  viettel_transaction_id?: string;
  error_message?: string;
  created_at?: string;
  synced_at?: string;
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
  const res = await axiosInstance.post("/api/v1/sinvoice/create", data);
  return res.data;
}

export async function syncSinvoiceApi(): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/sync");
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

export async function saveTaxPortalConfigApi(data: TaxPortalConfig): Promise<any> {
  const res = await axiosInstance.post("/api/v1/sinvoice/tax-portal/config", data);
  return res.data;
}

export async function resetTaxPortalConfigApi(): Promise<any> {
  const res = await axiosInstance.delete("/api/v1/sinvoice/tax-portal/config");
  return res.data;
}

export async function syncTaxPortalApi(params: {
  direction: "IN" | "OUT";
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  const res = await axiosInstance.get("/api/v1/sinvoice/tax-portal/sync", { params });
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
