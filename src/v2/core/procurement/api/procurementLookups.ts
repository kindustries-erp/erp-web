import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";
import type { V2ComboboxOption } from "@/v2/shared/components/molecules/v2-combobox";

interface BranchRowDto {
  id: string;
  code: string;
  name: string;
}

interface SupplierRowDto {
  id: string;
  code?: string | null;
  name: string;
  taxCode?: string | null;
}

/** Chi nhánh cho ô chọn; API trả `items` hoặc `data` tùy bản. */
export async function listBranchOptions(): Promise<V2ComboboxOption[]> {
  const { data } = await v2HttpClient.get<{
    items?: BranchRowDto[];
    data?: BranchRowDto[];
  }>("/api/v1/branches", {
    params: { page: 1, pageSize: 500, sort: "code" },
  });
  return (data.items ?? data.data ?? []).map((b) => ({
    value: b.id,
    label: `${b.code} — ${b.name}`,
  }));
}

/** NCC có mã thật (đối tác loại VENDOR) để gán `supplierId`; tìm trên server. */
export async function listSupplierOptions(
  search: string,
): Promise<V2ComboboxOption[]> {
  const { data } = await v2HttpClient.get<{ items: SupplierRowDto[] }>(
    "/api/v2/business-partners",
    {
      params: {
        partnerType: "VENDOR",
        search: search.trim() || undefined,
        page: 1,
        pageSize: 20,
      },
    },
  );
  return data.items.map((s) => ({
    value: s.id,
    label: s.name,
    description: [s.code, s.taxCode].filter(Boolean).join(" · ") || undefined,
  }));
}

/** Hóa đơn mua vào (chiều IN) cho ô chọn số hóa đơn đơn mua Garage. */
export interface PurchaseInvoiceRow {
  invoiceNo: string;
  serialNo: string;
  invoiceDate: string;
  sellerName: string;
  sellerTaxCode: string;
}

interface PurchaseInvoiceRowDto {
  invoiceNo?: string | null;
  serialNo?: string | null;
  invoiceDate?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
}

/**
 * Một trang hóa đơn mua vào; `next` là trang kế hoặc null khi hết.
 * `sellerTaxCode` lọc theo MST người bán (API `partner_tax_code` với chiều IN).
 */
export async function listPurchaseInvoicePage(params: {
  search: string;
  page: number;
  pageSize: number;
  sellerTaxCode?: string;
}): Promise<{ rows: PurchaseInvoiceRow[]; next: number | null }> {
  const { data } = await v2HttpClient.get<{
    items: PurchaseInvoiceRowDto[];
    page: number;
    totalPages: number;
  }>("/api/v2/invoices", {
    params: {
      direction: "IN",
      search: params.search.trim() || undefined,
      partner_tax_code: params.sellerTaxCode || undefined,
      page: params.page,
      pageSize: params.pageSize,
    },
  });
  const rows = data.items
    .filter((r) => Boolean(r.invoiceNo))
    .map((r) => ({
      invoiceNo: r.invoiceNo ?? "",
      serialNo: r.serialNo ?? "",
      invoiceDate: r.invoiceDate ?? "",
      sellerName: r.sellerName ?? "",
      sellerTaxCode: r.sellerTaxCode ?? "",
    }));
  return {
    rows,
    next: data.page < data.totalPages ? data.page + 1 : null,
  };
}

/**
 * NCC (VENDOR) có đúng mã số thuế đã cho, để tự điền khi chọn hóa đơn.
 * Trả null nếu không có NCC nào khớp chính xác MST.
 */
export async function findSupplierByTaxCode(
  taxCode: string,
): Promise<{ id: string; name: string } | null> {
  const tax = taxCode.trim();
  if (!tax) return null;
  const { data } = await v2HttpClient.get<{ items: SupplierRowDto[] }>(
    "/api/v2/business-partners",
    {
      params: { partnerType: "VENDOR", search: tax, page: 1, pageSize: 20 },
    },
  );
  const match = data.items.find((s) => (s.taxCode ?? "").trim() === tax);
  return match ? { id: match.id, name: match.name } : null;
}
