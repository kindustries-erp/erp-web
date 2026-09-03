import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Wallet, Receipt, FileCheck2, AlertCircle, Eye } from "lucide-react";
import { purchaseOrdersCoreApi } from "../api/purchaseOrdersCoreApi";
import type { OperationalDocument } from "@/modules/operational/api/operationalApi";
import type { ErpPurchaseOrder } from "../api/purchaseOrdersCoreApi";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";

export interface PurchaseOrderFinancialsTabProps {
  purchaseOrder?: OperationalDocument | ErpPurchaseOrder | null;
  onOpenInvoiceDetail?: (invoice: ErpInvoice) => void;
}

export const PurchaseOrderFinancialsTab = React.memo(
  function PurchaseOrderFinancialsTab({
    purchaseOrder,
    onOpenInvoiceDetail,
  }: PurchaseOrderFinancialsTabProps) {
    const { t } = useTranslation("purchaseOrders");

    const poId = purchaseOrder?.id;

    const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
      queryKey: ["purchase-order-linked-invoices", poId],
      queryFn: () => purchaseOrdersCoreApi.getLinkedInvoices(poId!),
      enabled: !!poId,
    });

    const totalPoAmount = useMemo(() => {
      if (!purchaseOrder) return 0;
      if (
        "total_amount" in purchaseOrder &&
        purchaseOrder.total_amount != null
      ) {
        return Number(purchaseOrder.total_amount);
      }
      return (
        (purchaseOrder as any).lines?.reduce(
          (sum: number, line: any) => sum + Number(line.amount || 0),
          0,
        ) || 0
      );
    }, [purchaseOrder]);

    const totalInvoicedAmount = useMemo(() => {
      return invoices.reduce(
        (sum, inv) => sum + Number(inv.totalAmount || 0),
        0,
      );
    }, [invoices]);

    const uninvoicedAmount = Math.max(0, totalPoAmount - totalInvoicedAmount);

    const columns: DataTableColumn<ErpInvoice>[] = useMemo(() => {
      return [
        {
          key: "index",
          header: <span className="w-full block text-center">#</span>,
          size: 40,
          enableResizing: false,
          headerClassName: "text-center w-[40px] min-w-[40px]",
          className: "text-center w-[40px] min-w-[40px]",
          cell: (_: any, idx: number) => (
            <span className="w-full block text-center text-muted-foreground font-medium">
              {idx}
            </span>
          ),
        },
        {
          key: "invoiceNo",
          size: 140,
          enableResizing: true,
          header: t("Số hóa đơn"),
          cell: (inv: ErpInvoice) => (
            <button
              type="button"
              onClick={() => onOpenInvoiceDetail?.(inv)}
              className="font-mono font-semibold text-primary hover:underline flex items-center gap-1.5"
            >
              <span>{inv.invoiceNo}</span>
              <Eye className="w-3 h-3 text-muted-foreground opacity-60 hover:opacity-100" />
            </button>
          ),
        },
        {
          key: "invoiceDate",
          size: 120,
          enableResizing: true,
          header: t("Ngày hóa đơn"),
          className: "text-right",
          cell: (inv: ErpInvoice) => (
            <TableDateCell
              date={inv.invoiceDate}
              className="justify-end w-full"
            />
          ),
        },
        {
          key: "sellerName",
          size: 220,
          enableResizing: true,
          header: t("Đơn vị phát hành"),
          cell: (inv: ErpInvoice) => (
            <span
              className="font-medium text-foreground truncate max-w-[220px]"
              title={inv.sellerName || undefined}
            >
              {inv.sellerName || "—"}
            </span>
          ),
        },
        {
          key: "preVatAmount",
          size: 130,
          enableResizing: true,
          header: t("Trước thuế"),
          className: "text-right",
          cell: (inv: ErpInvoice) => (
            <span className="font-mono tabular-nums text-foreground">
              {money(Number(inv.preVatAmount || 0))}
            </span>
          ),
        },
        {
          key: "vatAmount",
          size: 110,
          enableResizing: true,
          header: t("Tiền VAT"),
          className: "text-right",
          cell: (inv: ErpInvoice) => (
            <span className="font-mono tabular-nums text-foreground">
              {money(Number(inv.vatAmount || 0))}
            </span>
          ),
        },
        {
          key: "totalAmount",
          size: 140,
          enableResizing: true,
          header: t("Tổng thanh toán"),
          className: "text-right",
          cell: (inv: ErpInvoice) => (
            <span className="font-mono tabular-nums font-bold text-foreground">
              {money(Number(inv.totalAmount || 0))}
            </span>
          ),
        },
        {
          key: "status",
          size: 120,
          enableResizing: true,
          header: t("Trạng thái"),
          cell: (inv: ErpInvoice) => (
            <Badge
              variant={inv.status === "CONFIRMED" ? "default" : "secondary"}
              className="text-[10.5px]"
            >
              {inv.status === "CONFIRMED"
                ? t("Đã xác nhận")
                : inv.status || t("Nháp")}
            </Badge>
          ),
        },
      ];
    }, [t, onOpenInvoiceDetail]);

    return (
      <div className="flex flex-col h-full space-y-4">
        {/* ── 1. Financial Summary Cards ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Tổng giá trị đơn đặt hàng */}
          <div className="p-4 bg-surface rounded-xl border border-border/70 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>{t("Tổng giá trị đơn đặt (PO)")}</span>
              <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="font-mono font-bold text-lg text-foreground mt-2">
              {money(totalPoAmount)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {t("Giá trị hàng hóa theo hợp đồng/đơn")}
            </div>
          </div>

          {/* Card 2: Giá trị đã có Hóa đơn VAT */}
          <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300 font-medium">
              <span>{t("Đã xuất Hóa đơn VAT")}</span>
              <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="font-mono font-bold text-lg text-emerald-700 dark:text-emerald-300 mt-2">
              {money(totalInvoicedAmount)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {invoices.length} {t("hóa đơn điện tử liên kết")}
            </div>
          </div>

          {/* Card 3: Chưa xuất hóa đơn */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-100/80 dark:border-amber-900/40 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between text-xs text-amber-900 dark:text-amber-300 font-medium">
              <span>{t("Chưa có Hóa đơn VAT")}</span>
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="font-mono font-bold text-lg text-amber-700 dark:text-amber-300 mt-2">
              {money(uninvoicedAmount)}
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {uninvoicedAmount === 0
                ? t("Đã đủ hóa đơn 100%")
                : t("Chờ nhà cung cấp xuất VAT")}
            </div>
          </div>
        </div>

        {/* ── 2. Linked Invoices Table (No Border Wrapper Rule) ──────────────── */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                {t("Danh sách Hóa đơn Điện tử Liên kết")}
              </h4>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 font-mono"
              >
                {invoices.length}
              </Badge>
            </div>
          </div>

          <div className="min-h-[260px]">
            <StandardTable<ErpInvoice>
              variant="spreadsheet"
              items={invoices}
              columns={columns}
              loading={isLoadingInvoices}
              total={invoices.length}
              totalPages={1}
              page={1}
              pageSize={50}
              getRowKey={(inv) => inv.id}
            />
          </div>
        </div>
      </div>
    );
  },
);
