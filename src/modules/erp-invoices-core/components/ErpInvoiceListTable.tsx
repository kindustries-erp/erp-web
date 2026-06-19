import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Eye, Trash, Ban } from "lucide-react";
import { useTranslation } from "react-i18next";
import { money } from "@/shared/utils/format";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  direction: "IN" | "OUT";
  invoices: ErpInvoice[];
  loading: boolean;
  page: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onPage: (page: number) => void;
  onSort: (key: string) => void;
  openDetail: (inv: ErpInvoice) => void;
  onDeleteConfirm: (inv: ErpInvoice) => void;
  onCancelConfirm: (inv: ErpInvoice) => void;
}

export function ErpInvoiceListTable({
  direction,
  invoices,
  loading,
  page,
  total,
  totalPages,
  sortBy,
  sortOrder,
  onPage,
  onSort,
  openDetail,
  onDeleteConfirm,
  onCancelConfirm,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  function fmtAmt(val: string | null | undefined) {
    if (val == null) return "—";
    const n = Number(val);
    return isNaN(n) ? "—" : money(n);
  }

  const columns: DataTableColumn<ErpInvoice>[] = [
    {
      key: "invoiceDate",
      header: t("invoiceDate", "Ngày HĐ"),
      sortable: true,
      headerClassName: "w-[100px]",
      className: "w-[100px]",
      cell: (inv) => inv.invoiceDate,
    },
    {
      key: "serialNo",
      header: t("serialNo", "Ký hiệu"),
      headerClassName: "w-[100px]",
      className: "text-muted-foreground w-[100px]",
      cell: (inv) => inv.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: t("invoiceNo", "Số HĐ"),
      sortable: true,
      headerClassName: "w-[130px]",
      className: "font-medium text-primary w-[130px]",
      cell: (inv) => (
        <div className="flex items-center gap-2">
          <span>{inv.invoiceNo}</span>
          {inv.status !== "CONFIRMED" && (
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
                inv.status === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {inv.status === "CANCELLED"
                ? t("statusCancelled", "Đã hủy")
                : t("statusDraft", "Nháp")}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "partner",
      header:
        direction === "IN" ? t("seller", "Bên bán") : t("buyer", "Bên mua"),
      sortable: true,
      sortKey: direction === "IN" ? "sellerName" : "buyerName",
      headerClassName: "w-[320px]",
      className: "w-[320px]",
      cell: (inv) => {
        const text =
          direction === "IN" ? inv.sellerName || "—" : inv.buyerName || "—";
        return (
          <Tooltip content={text !== "—" ? text : ""}>
            <div className="truncate w-full cursor-pointer">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      key: "taxCode",
      header: t("taxCode", "MST"),
      headerClassName: "w-[110px]",
      className: "text-muted-foreground text-xs w-[110px]",
      cell: (inv) =>
        direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—",
    },
    {
      key: "preVatAmount",
      header: t("preVatAmount", "Trước VAT"),
      headerClassName: "text-right w-[110px]",
      className: "text-right w-[110px]",
      cell: (inv) => fmtAmt(inv.preVatAmount),
    },
    {
      key: "vatAmount",
      header: t("vatAmount", "Thuế VAT"),
      headerClassName: "text-right w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.vatAmount),
    },
    {
      key: "discountAmount",
      header: t("discountAmount", "Chiết khấu"),
      headerClassName: "text-right w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.discountAmount),
    },
    {
      key: "totalAmount",
      header: t("totalAmount", "Thành tiền"),
      sortable: true,
      headerClassName: "text-right w-[120px]",
      className: "text-right font-semibold w-[120px]",
      cell: (inv) => fmtAmt(inv.totalAmount),
    },
  ];

  return (
    <StandardTable<ErpInvoice>
      minWidth={1200}
      items={invoices}
      columns={columns}
      getRowKey={(inv) => inv.id}
      onRowClick={(inv) => openDetail(inv)}
      actions={(inv) => [
        ...(inv.status === "DRAFT"
          ? [
              {
                label: t("actionDelete", "Xóa"),
                icon: <Trash className="w-4 h-4 text-red-600" />,
                variant: "danger" as const,
                onClick: () => {
                  onDeleteConfirm(inv);
                },
              },
            ]
          : []),
        ...(inv.status === "CONFIRMED"
          ? [
              {
                label: t("actionCancel", "Hủy"),
                icon: <Ban className="w-4 h-4 text-red-600" />,
                variant: "danger" as const,
                onClick: () => {
                  onCancelConfirm(inv);
                },
              },
            ]
          : []),
      ]}
      loading={loading}
      emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
      page={page}
      pageSize={40}
      total={total}
      totalPages={totalPages}
      onPage={onPage}
      onPageSize={() => {}}
      sortArray={
        sortBy ? [sortOrder === "desc" ? `-${sortBy}` : sortBy] : undefined
      }
      onSort={onSort}
    />
  );
}
