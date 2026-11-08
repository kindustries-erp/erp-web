import type {
  FakeInvoice,
  InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type {
  InvoiceDto,
  InvoiceSummariesDto,
} from "@/v2/modules/finance-invoice/api/dtos/invoice.dto";
import { resolveBranchIds } from "@/v2/shared/utils/branchIds";

const toAmount = (value?: number | string | null) => Number(value ?? 0) || 0;

/** Chuyển một dòng API sang shape cột V2 (`FakeInvoice`) */
export function toInvoiceRow(
  inv: InvoiceDto,
  direction: InvoiceDirection,
): FakeInvoice {
  const isIn = (inv.direction ?? direction) === "IN";
  const preVatAmount = toAmount(inv.preVatAmount);
  const vatAmount = toAmount(inv.vatAmount);
  const totalAmount = toAmount(inv.totalAmount);
  const netOffAmount = toAmount(inv.netOffAmount);
  return {
    id: inv.id,
    direction: inv.direction ?? direction,
    invoiceNo: inv.invoiceNo ?? "",
    serialNo: inv.serialNo ?? "",
    invoiceDate: inv.invoiceDate ? inv.invoiceDate.split("T")[0] : "",
    partner: (isIn ? inv.sellerName : inv.buyerName) ?? inv.partner ?? "",
    taxCode: (isIn ? inv.sellerTaxCode : inv.buyerTaxCode) ?? inv.taxCode ?? "",
    taxTab: (inv.taxTab ?? "new") as FakeInvoice["taxTab"],
    branchId: inv.branchId ?? "",
    branchIds: resolveBranchIds(inv),
    preVat: preVatAmount,
    vat: vatAmount,
    total: totalAmount,
    paid: netOffAmount,
    posting: inv.postingStatus === "POSTED" ? "POSTED" : "UNPOSTED",
    note: inv.notes ?? inv.description ?? "",
    sellerName: inv.sellerName,
    sellerTaxCode: inv.sellerTaxCode,
    buyerName: inv.buyerName,
    buyerTaxCode: inv.buyerTaxCode,
    taxInvoiceStatus: inv.taxInvoiceStatus,
    postingStatus: inv.postingStatus,
    preVatAmount,
    vatAmount,
    totalAmount,
    vatRate: inv.vatRate == null ? null : Number(inv.vatRate),
    discountAmount: toAmount(inv.discountAmount),
    netOffAmount,
    remainingAmount: toAmount(inv.remainingAmount),
    settlementOrder: inv.settlementOrder ?? null,
    licensePlate: inv.licensePlate ?? null,
  };
}

/**
 * `summaries` của API v2 → giữ đúng các key API đã trả (kể cả `null`).
 * Key không có trong kết quả không được điền: bảng tự tính, không hiện 0 giả.
 */
export function toInvoiceSummary(
  summaries?: InvoiceSummariesDto,
): InvoiceSummariesDto {
  return { ...summaries };
}
