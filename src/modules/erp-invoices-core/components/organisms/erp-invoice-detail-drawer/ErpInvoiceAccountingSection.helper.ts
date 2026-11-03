import { resolvePurchaseDebitAccountCode } from "@/modules/erp-invoices-core/utils/invoiceTaxCodeAccounting";
import { createClientId } from "./ErpInvoiceDetailDrawer.state";
import type { PostingLineData } from "@/shared/components/accounting/PostingSection";
import type {
  ErpInvoice,
  CreateErpInvoicePayload,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface AccountOption {
  value: string;
  label: string;
}

export interface BuildDefaultAccountingLinesParams {
  detailInvoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  direction?: "IN" | "OUT";
  accountOptions: AccountOption[];
  defaultDescriptionPrefix?: string;
  vatDescriptionPrefix?: string;
}

export function buildDefaultAccountingLines({
  detailInvoice,
  form,
  direction = "IN",
  accountOptions,
  defaultDescriptionPrefix = "Hạch toán hóa đơn",
  vatDescriptionPrefix = "Thuế GTGT",
}: BuildDefaultAccountingLinesParams): PostingLineData[] {
  const findAccount = (prefix: string) =>
    accountOptions.find((a) => a.label.split(" - ")[0]?.startsWith(prefix))
      ?.value || "";

  const preVat = Number(detailInvoice?.preVatAmount || form?.preVatAmount) || 0;
  const vat = Number(detailInvoice?.vatAmount || form?.vatAmount) || 0;
  const total = Number(detailInvoice?.totalAmount || form?.totalAmount) || 0;
  const invoiceNumber = detailInvoice?.invoiceNo || form?.invoiceNo || "";
  const baseDesc =
    detailInvoice?.description ||
    `${defaultDescriptionPrefix} ${invoiceNumber}`.trim();

  const lines: PostingLineData[] = [];

  if (direction === "IN") {
    const sellerTaxCode =
      detailInvoice?.sellerTaxCode || form?.sellerTaxCode || "";
    const debitCode = resolvePurchaseDebitAccountCode(sellerTaxCode);
    const debitAccountId =
      debitCode === "642"
        ? findAccount("642") || findAccount("632")
        : findAccount("632") || findAccount("642");

    if (preVat > 0) {
      lines.push({
        id: createClientId(),
        accountId: debitAccountId || findAccount("152") || findAccount("156"),
        debit: preVat,
        credit: 0,
        description: baseDesc,
      });
    }

    if (vat > 0) {
      lines.push({
        id: createClientId(),
        accountId: findAccount("133"),
        debit: vat,
        credit: 0,
        description: `${vatDescriptionPrefix} ${invoiceNumber}`.trim(),
      });
    }

    if (total > 0) {
      lines.push({
        id: createClientId(),
        accountId: findAccount("331"),
        debit: 0,
        credit: total,
        description: baseDesc,
      });
    }
  } else {
    if (total > 0) {
      lines.push({
        id: createClientId(),
        accountId: findAccount("131"),
        debit: total,
        credit: 0,
        description: baseDesc,
      });
    }

    if (preVat > 0) {
      lines.push({
        id: createClientId(),
        accountId: findAccount("511") || findAccount("711"),
        debit: 0,
        credit: preVat,
        description: baseDesc,
      });
    }

    if (vat > 0) {
      lines.push({
        id: createClientId(),
        accountId: findAccount("3331") || findAccount("333"),
        debit: 0,
        credit: vat,
        description: `${vatDescriptionPrefix} ${invoiceNumber}`.trim(),
      });
    }
  }

  return lines;
}
