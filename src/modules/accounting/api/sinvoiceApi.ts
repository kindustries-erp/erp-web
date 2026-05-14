import axiosInstance from "@/core/api/axiosInstance";

export interface SinvoiceConfig {
  id: string;
  supplierTaxCode: string;
  username: string;
  apiUrl: string;
}

export interface Einvoice {
  id: string;
  document_no: string;
  invoice_no?: string;
  invoice_date?: string;
  total_amount: number;
  status: 'DRAFT' | 'ISSUED' | 'CANCELLED';
  pdf_url?: string;
}

export async function getSinvoiceConfigApi(): Promise<SinvoiceConfig> {
  const res = await axiosInstance.get('/sinvoice/config');
  return res.data;
}

export async function createSinvoiceApi(data: any): Promise<any> {
  const res = await axiosInstance.post('/sinvoice/create', data);
  return res.data;
}

export async function downloadSinvoiceApi(invoiceNo: string, pattern: string, fileType: string): Promise<any> {
  const res = await axiosInstance.get(`/sinvoice/download`, {
    params: { invoiceNo, pattern, fileType }
  });
  return res.data;
}
