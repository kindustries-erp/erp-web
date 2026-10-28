import type {
  FakeInvoice,
  InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import type {
  InvoiceDto,
  InvoiceTotalsDto,
} from "@/v2/modules/finance-invoice/api/dtos/invoice.dto";
import { resolveBranchIds } from "@/shared/utils/branchIds";

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
    netOffAmount,
  };
}

/** Tổng server → map theo key cột tiền của bảng V2 */
export function invoiceTotalsToSummary(totals?: InvoiceTotalsDto) {
  return {
    preVatAmount: totals?.grandTotalPreVat ?? 0,
    vatAmount: totals?.grandTotalVat ?? 0,
    totalAmount: totals?.grandTotalAmount ?? 0,
    discountAmount: totals?.grandTotalDiscount ?? 0,
    netOffAmount: totals?.grandTotalNetOff ?? 0,
    remainingAmount: totals?.grandTotalRemaining ?? 0,
    total: totals?.grandTotalAmount ?? 0,
  };
}
