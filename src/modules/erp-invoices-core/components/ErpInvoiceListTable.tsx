import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { Tooltip } from "@/core/components/ui/Tooltip";
import {
  Trash,
  Ban,
  Eye,
  Download,
  RefreshCw,
  FileCode,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { money } from "@/shared/utils/format";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  direction: "IN" | "OUT";
  invoices: ErpInvoice[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
  onSort: (key: string) => void;
  openDetail: (inv: ErpInvoice) => void;
  onDeleteConfirm: (inv: ErpInvoice) => void;
  onCancelConfirm: (inv: ErpInvoice) => void;
  onDownload: (id: string, type: "pdf" | "xml") => void;
  onReparseXml: (inv: ErpInvoice) => void;
}

export function ErpInvoiceListTable({
  direction,
  invoices,
  loading,
  page,
  pageSize,
  total,
  totalPages,
  sortBy,
  sortOrder,
  onPage,
  onPageSize,
  onSort,
  openDetail,
  onDeleteConfirm,
  onCancelConfirm,
  onDownload,
  onReparseXml,
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
      headerClassName: "text-center w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => inv.invoiceDate,
    },
    {
      key: "serialNo",
      header: t("serialNo", "Ký hiệu"),
      headerClassName: "text-center w-[100px]",
      className: "text-muted-foreground w-[100px] text-left",
      cell: (inv) => inv.serialNo || "—",
    },
    {
      key: "invoiceNo",
      header: t("invoiceNo", "Số HĐ"),
      sortable: true,
      headerClassName: "text-center w-[130px]",
      className: "font-medium text-primary w-[130px] text-left",
      cell: (inv) => (
        <div className="flex flex-col gap-1">
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
          <div className="flex items-center gap-1.5">
            {inv.xmlFileKey ? (
              <Tooltip content={t("hasXml", "Đã có file XML/ZIP")}>
                <FileCode className="w-3.5 h-3.5 text-blue-500" />
              </Tooltip>
            ) : (
              <Tooltip content={t("noXml", "Chưa có file XML/ZIP")}>
                <FileCode className="w-3.5 h-3.5 text-gray-300" />
              </Tooltip>
            )}
            {inv.pdfFileKey ? (
              <Tooltip content={t("hasPdf", "Đã có file PDF")}>
                <FileText className="w-3.5 h-3.5 text-red-500" />
              </Tooltip>
            ) : (
              <Tooltip content={t("noPdf", "Chưa có file PDF")}>
                <FileText className="w-3.5 h-3.5 text-gray-300" />
              </Tooltip>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "partner",
      header:
        direction === "IN" ? t("seller", "Bên bán") : t("buyer", "Bên mua"),
      sortable: true,
      sortKey: direction === "IN" ? "sellerName" : "buyerName",
      headerClassName: "text-center w-[320px]",
      className: "w-[320px] text-left",
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
      headerClassName: "text-center w-[110px]",
      className: "text-muted-foreground text-xs w-[110px] text-left",
      cell: (inv) =>
        direction === "IN" ? inv.sellerTaxCode || "—" : inv.buyerTaxCode || "—",
    },
    {
      key: "description",
      header: t("description", "Diễn giải"),
      sortable: true,
      className: "text-left",
      headerClassName: "text-center",
      cell: (row) => (
        <div className="max-w-[200px] truncate" title={row.description || ""}>
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "preVatAmount",
      header: t("preVatAmount", "Trước VAT"),
      sortable: true,
      headerClassName: "text-center w-[110px]",
      className: "text-right w-[110px]",
      cell: (row) => fmtAmt(row.preVatAmount),
    },
    {
      key: "vatAmount",
      header: t("vatAmount", "Thuế VAT"),
      headerClassName: "text-center w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.vatAmount),
    },
    {
      key: "discountAmount",
      header: t("discountAmount", "Chiết khấu"),
      headerClassName: "text-center w-[100px]",
      className: "text-right w-[100px]",
      cell: (inv) => fmtAmt(inv.discountAmount),
    },
    {
      key: "totalAmount",
      header: t("totalAmount", "Thành tiền"),
      sortable: true,
      headerClassName: "text-center w-[120px]",
      className: "text-right font-semibold w-[120px]",
      cell: (inv) => fmtAmt(inv.totalAmount),
    },
  ];

  return (
    <StandardTable<ErpInvoice>
      tableId="erp-invoices-table"
      minWidth={1200}
      items={invoices}
      columns={columns}
      getRowKey={(inv) => inv.id}
      actions={(inv) => {
        const items = [];
        items.push({
          label: t("actionDetail", "Chi tiết"),
          icon: <Eye className="w-4 h-4 text-blue-600" />,
          onClick: () => openDetail(inv),
        });

        if (inv.xmlFileKey) {
          items.push({
            label: t("actionDownloadXml", "Tải XML"),
            icon: <Download className="w-4 h-4 text-blue-600" />,
            onClick: () => onDownload(inv.id, "xml"),
          });
        }

        items.push({
          label: t("actionReparseXml", "Đồng bộ lại từ XML"),
          icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
          onClick: () => onReparseXml(inv),
        });

        if (inv.pdfFileKey) {
          items.push({
            label: t("actionDownloadPdf", "Tải PDF"),
            icon: <Download className="w-4 h-4 text-blue-600" />,
            onClick: () => onDownload(inv.id, "pdf"),
          });
        }

        if (inv.status === "DRAFT") {
          items.push({
            label: t("actionDelete", "Xóa"),
            icon: <Trash className="w-4 h-4 text-red-600" />,
            variant: "danger" as const,
            onClick: () => {
              onDeleteConfirm(inv);
            },
          });
        }

        if (inv.status === "CONFIRMED") {
          items.push({
            label: t("actionCancel", "Hủy"),
            icon: <Ban className="w-4 h-4 text-red-600" />,
            variant: "danger" as const,
            onClick: () => {
              onCancelConfirm(inv);
            },
          });
        }

        return [
          {
            groupLabel: t("Thao tác", "Thao tác"),
            items,
          },
        ];
      }}
      loading={loading}
      emptyLabel={t("emptyData", "Chưa có hóa đơn nào.")}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPage={onPage}
      onPageSize={onPageSize}
      sortArray={
        sortBy ? [sortOrder === "desc" ? `-${sortBy}` : sortBy] : undefined
      }
      onSort={onSort}
    />
  );
}
