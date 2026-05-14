import axiosInstance from "@/core/api/axiosInstance";

export interface SinvoiceConfig {
  ok: boolean;
  supplierTaxCode: string;
  username: string;
  apiUrl: string;
  environment: string;
}

export interface Einvoice {
  id: string;
  document_no: string;
  invoice_no?: string;
  invoice_date?: string;
  buyer_name?: string;
  buyer_tax_code?: string;
  total_amount: number;
  vat_amount: number;
  status: "DRAFT" | "ISSUED" | "CANCELLED" | "ERROR" | "SYNCED";
  viettel_transaction_id?: string;
  error_message?: string;
  created_at?: string;
}

export async function getSinvoiceHealthApi(): Promise<SinvoiceConfig> {
  const res = await axiosInstance.get("/sinvoice/health");
  return res.data;
}

export async function listLocalEinvoicesApi(): Promise<Einvoice[]> {
  const res = await axiosInstance.get("/sinvoice/local");
  return res.data;
}

export async function createSinvoiceApi(data: any = {}): Promise<any> {
  const res = await axiosInstance.post("/sinvoice/create", data);
  return res.data;
}

export async function syncSinvoiceApi(): Promise<any> {
  const res = await axiosInstance.get("/sinvoice/sync");
  return res.data;
}

export async function runSinvoiceDemoFlowApi(): Promise<any> {
  const res = await axiosInstance.post("/sinvoice/demo-flow");
  return res.data;
}

export async function downloadSinvoiceApi(
  invoiceNo: string,
  pattern: string,
  fileType: string,
): Promise<any> {
  const res = await axiosInstance.get("/sinvoice/download", {
    params: { invoiceNo, pattern, fileType },
  });
  return res.data;
}
