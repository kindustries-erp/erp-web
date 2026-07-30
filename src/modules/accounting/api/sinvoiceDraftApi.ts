import axiosInstance from "@/core/api/axiosInstance";

export interface SinvoiceConfig {
  id?: string;
  supplierTaxCode: string | null;
  username: string | null;
  password?: string | null;
  appKey: string | null;
  apiUrl: string | null;
  environment: string | null;
  isActive: boolean;
}

export interface SinvoiceDraft {
  id: string;
  documentNo: string;
  buyerName: string | null;
  buyerTaxCode: string | null;
  buyerAddress: string | null;
  description: string | null;
  totalAmount: number;
  vatAmount: number;
  status: string;
  requestPayload: any;
  responsePayload: any;
  createdAt: string;
}

export function listSinvoiceDraftsApi(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  filtersStr?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<{
  data: SinvoiceDraft[];
  meta: { total: number; totalPages: number; page: number; pageSize: number };
}> {
  return axiosInstance
    .get("/api/v1/sinvoice/draft", { params })
    .then((res) => res.data);
}

export function getSinvoiceDraftColumnOptionsApi(
  column: string,
  search: string,
  page: number = 1,
  pageSize: number = 20,
  filtersStr?: string,
) {
  return axiosInstance
    .get("/api/v1/sinvoice/draft/column-options", {
      params: {
        column,
        search,
        page,
        pageSize,
        column_filters: filtersStr,
      },
    })
    .then(
      (res) =>
        res.data as {
          items: string[];
          total: number;
          page: number;
          totalPages: number;
        },
    );
}

export function createSinvoiceDraftApi(body: any): Promise<any> {
  return axiosInstance
    .post("/api/v1/sinvoice/draft", body)
    .then((res) => res.data);
}

export function deleteSinvoiceDraftApi(id: string): Promise<any> {
  return axiosInstance
    .delete(`/api/v1/sinvoice/draft/${id}`)
    .then((res) => res.data);
}

export function syncSinvoiceDraftsApi(): Promise<{
  ok: boolean;
  synced: number;
}> {
  return axiosInstance
    .post("/api/v1/sinvoice/draft/sync")
    .then((res) => res.data);
}

export function getSinvoiceConfigApi(): Promise<SinvoiceConfig | null> {
  return axiosInstance.get("/api/v1/sinvoice/config").then((res) => res.data);
}

export function saveSinvoiceConfigApi(
  body: any,
): Promise<{ ok: boolean; data: SinvoiceConfig; connection: any }> {
  return axiosInstance
    .post("/api/v1/sinvoice/config", body)
    .then((res) => res.data);
}
