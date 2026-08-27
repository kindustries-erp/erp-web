import { useMemo } from "react";
import { type ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { fmtAmt } from "../utils";

export function useInvoiceSummary(invoices?: ErpInvoice[]) {
  return useMemo(() => {
    if (!invoices || invoices.length === 0) return undefined;

    const totalPreVatAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.preVatAmount) || 0),
      0,
    );
    const totalVatAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.vatAmount) || 0),
      0,
    );
    const totalDiscountAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.discountAmount) || 0),
      0,
    );
    const totalTotalAmount = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.totalAmount) || 0),
      0,
    );
    const totalNetOff = invoices.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = invoices.reduce(
      (acc: number, curr: any) =>
        acc +
        ((parseFloat(curr.totalAmount) || 0) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      preVatAmount:
        totalPreVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalPreVatAmount.toString())}
          </span>
        ),
      vatAmount:
        totalVatAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalVatAmount.toString())}
          </span>
        ),
      discountAmount:
        totalDiscountAmount === 0 ? (
          "--"
        ) : (
          <span className="font-medium">
            {fmtAmt(totalDiscountAmount.toString())}
          </span>
        ),
      totalAmount:
        totalTotalAmount === 0 ? (
          "--"
        ) : (
          <span className="font-semibold">
            {fmtAmt(totalTotalAmount.toString())}
          </span>
        ),
      netOffAmount:
        totalNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {fmtAmt(totalNetOff.toString())}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-orange-600 font-medium">
            {fmtAmt(totalRemaining.toString())}
          </span>
        ),
    };
  }, [invoices]);
}
