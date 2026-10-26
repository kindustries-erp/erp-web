import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { ColumnValueType, TableColumnAlign } from "@/v2/shared/types/v2-table";
import { InvoiceDebtStatusBadge } from "../../molecules/invoice-debt-status-badge";
import type { InvoiceDebt } from "../../../domain/entities/invoiceDebt";

type Translate = (key: string, fallback?: string) => string;

const value = (text?: string | number | null) =>
  text === null || text === undefined || text === "" ? "—" : String(text);

/** Cột STT do V2StandardTable tự render (`__index`), không khai báo ở đây */
export const buildInvoiceDebtsColumns = (
  t: Translate,
  openDetail: (id: string) => void,
): V2Column<InvoiceDebt>[] => [
  {
    key: "search",
    label: t("v2.invoiceDebts.columns.search", "search"),
    size: 170,
    enableResizing: true,
    mobileSlot: "subtitle",
    filter: { valueType: ColumnValueType.TEXT },
    cell: (row) => (
      <V2TableText
        text={value(row.search)}
        enableCopy
        onDetailClick={() => openDetail(row.id)}
      />
    ),
  },
  {
    key: "partnerType",
    label: t("v2.invoiceDebts.columns.partnerType", "partnerType"),
    size: 125,
    enableResizing: true,

    align: TableColumnAlign.CENTER,
    mobileSlot: "meta",
    filter: {
      valueType: ColumnValueType.STATUS,
      filterOptions: [
        {
          value: "ACTIVE",
          label: t("v2.invoiceDebts.status.active", "Hoạt động"),
        },
        {
          value: "INACTIVE",
          label: t("v2.invoiceDebts.status.inactive", "Ngưng hoạt động"),
        },
      ],
    },
    cell: (row) => <InvoiceDebtStatusBadge status={row.partnerType ?? ""} />,
  },
  {
    key: "createdAt",
    label: t("v2.invoiceDebts.columns.createdAt", "createdAt"),
    size: 135,
    enableResizing: true,

    align: TableColumnAlign.RIGHT,
    mobileSlot: "hidden",
    filter: { valueType: ColumnValueType.DATE },
    cell: (row) =>
      row.createdAt
        ? new Intl.DateTimeFormat("vi-VN").format(new Date(row.createdAt))
        : "—",
  },
];
