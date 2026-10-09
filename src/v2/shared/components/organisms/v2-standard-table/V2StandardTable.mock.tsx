import { useMemo, useState } from "react";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { V2TableDateCell } from "@/v2/shared/components/atoms/v2-table-date-cell";
import { V2TableText } from "@/v2/shared/components/molecules/v2-table-text";
import { Badge } from "@/v2/shared/ui/badge";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2RowActionGroup } from "@/v2/shared/types/v2-table";
import { formatAmount } from "@/v2/shared/utils/v2TableFormat";
import { headerFilter } from "./v2HeaderFilterBuilder";
import type { MockOrder, MockStatus } from "./V2StandardTable.mock-server";
import type { V2Column } from "./V2StandardTable.type";

const STATUS_LABEL: Record<MockStatus, string> = {
  DRAFT: "Nháp",
  CONFIRMED: "Đã xác nhận",
  DONE: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const STATUS_VARIANT = {
  DRAFT: "secondary",
  CONFIRMED: "warning",
  DONE: "success",
  CANCELLED: "destructive",
} as const;

export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as MockStatus[]).map(
  (value) => ({ value, label: STATUS_LABEL[value] }),
);

export const createOrderColumns = (
  onOpen: (order: MockOrder) => void,
): V2Column<MockOrder>[] => [
  {
    key: "code",
    ...headerFilter("Mã đơn", { showBlankOption: true }),
    size: 190,
    cell: (row) => (
      <V2TableText
        text={row.code}
        enableCopy
        onDetailClick={() => onOpen(row)}
      />
    ),
  },
  {
    key: "customer",
    ...headerFilter("Khách hàng"),
    size: 220,
    cell: (row) => row.customer,
  },
  {
    key: "status",
    ...headerFilter.select("Trạng thái", STATUS_OPTIONS),
    size: 140,
    align: TableColumnAlign.CENTER,
    cell: (row) => (
      <Badge
        variant={STATUS_VARIANT[row.status]}
        className="inline-flex w-[80px] justify-center truncate"
      >
        {STATUS_LABEL[row.status]}
      </Badge>
    ),
  },
  {
    key: "qty",
    ...headerFilter.qty("Số lượng"),
    size: 120,
    align: TableColumnAlign.RIGHT,
    cell: (row) => row.qty,
  },
  {
    key: "amount",
    ...headerFilter.amount("Thành tiền"),
    size: 170,
    align: TableColumnAlign.RIGHT,
    cell: (row) => (
      <span className="font-semibold tabular-nums">
        {formatAmount(row.amount)}
      </span>
    ),
  },
  {
    key: "createdAt",
    ...headerFilter.date("Ngày tạo"),
    size: 150,
    align: TableColumnAlign.RIGHT,
    cell: (row) => <V2TableDateCell date={row.createdAt} />,
  },
];

export const createOrderRowActions =
  (onOpen: (order: MockOrder, mode: "view" | "edit") => void) =>
  (row: MockOrder): V2RowActionGroup[] => [
    {
      groupLabel: "TRA CỨU",
      items: [
        { label: "Xem chi tiết", onClick: () => onOpen(row, "view") },
        {
          label: "In phiếu",
          icon: <Printer className="h-3.5 w-3.5" />,
          onClick: () => onOpen(row, "view"),
        },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        {
          label: "Chỉnh sửa",
          icon: <Pencil className="h-3.5 w-3.5" />,
          onClick: () => onOpen(row, "edit"),
          disabled: row.status === "DONE" || row.status === "CANCELLED",
        },
        {
          label: "Xóa",
          icon: <Trash2 className="h-3.5 w-3.5" />,
          variant: "danger",
          onClick: () => onOpen(row, "edit"),
        },
      ],
    },
  ];

export const orderRowClassName = (row: MockOrder) =>
  row.status === "CANCELLED" ? "opacity-40" : undefined;

/** Cột, row actions và dòng log dùng chung cho các story demo */
export const useDemoActions = () => {
  const [log, setLog] = useState("");
  const columns = useMemo(
    () => createOrderColumns((order) => setLog(`Mở ${order.code}`)),
    [],
  );
  const rowActions = useMemo(
    () =>
      createOrderRowActions((order, mode) =>
        setLog(`${mode === "edit" ? "Sửa" : "Xem"} ${order.code}`),
      ),
    [],
  );
  const logLine = (
    <p className="text-xs text-muted-fg">
      {log || "Rê chuột vào dòng hoặc bấm chuột phải để thao tác."}
    </p>
  );
  return { columns, rowActions, logLine };
};
