import type { V2FetchOptions, V2TableQuery } from "@/v2/shared/types/v2-table";
import {
  extractUniqueOptions,
  paginateClientItems,
  paginateOptions,
  sortClientItems,
} from "./v2TableClient";
import { filterClientItems } from "./v2TableFilter";
import type { V2ClientFilterColumn } from "./v2TableFilter";
import { ColumnValueType } from "@/v2/shared/types/v2-table";

export type MockStatus = "DRAFT" | "CONFIRMED" | "DONE" | "CANCELLED";

export interface MockOrder {
  id: string;
  code: string;
  customer: string;
  status: MockStatus;
  qty: number;
  amount: number;
  createdAt: string;
}

const CUSTOMERS = [
  "Công ty An Phát",
  "Garage Minh Khôi",
  "Đại lý Hà Nội",
  "Showroom Sài Gòn",
];
const STATUSES: MockStatus[] = ["DRAFT", "CONFIRMED", "DONE", "CANCELLED"];

export const MOCK_ORDERS: MockOrder[] = Array.from({ length: 240 }, (_, i) => {
  const n = i + 1;
  return {
    id: `order-${n}`,
    code: `SO-${String(n).padStart(4, "0")}`,
    customer: CUSTOMERS[i % CUSTOMERS.length],
    status: STATUSES[i % STATUSES.length],
    qty: ((i * 7) % 50) + 1,
    amount: (((i * 13) % 90) + 10) * 100000,
    createdAt: new Date(
      2026,
      i % 12,
      (i % 27) + 1,
      (i * 3) % 24,
      (i * 7) % 60,
    ).toISOString(),
  };
});

export const MOCK_COLUMNS: V2ClientFilterColumn<MockOrder>[] = [
  { key: "code", valueType: ColumnValueType.TEXT, getValue: (r) => r.code },
  {
    key: "customer",
    valueType: ColumnValueType.TEXT,
    getValue: (r) => r.customer,
  },
  {
    key: "status",
    valueType: ColumnValueType.SELECT,
    getValue: (r) => r.status,
  },
  { key: "qty", valueType: ColumnValueType.NUMBER, getValue: (r) => r.qty },
  {
    key: "amount",
    valueType: ColumnValueType.NUMBER,
    getValue: (r) => r.amount,
  },
  {
    key: "createdAt",
    valueType: ColumnValueType.DATE,
    getValue: (r) => r.createdAt,
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Giả lập API danh sách: lọc, sắp xếp và phân trang phía "server" */
export const fetchMockOrders = async (query: V2TableQuery, delayMs = 400) => {
  await wait(delayMs);
  const filtered = filterClientItems(MOCK_ORDERS, MOCK_COLUMNS, query);
  const sorted = sortClientItems(filtered, MOCK_COLUMNS, query.sorts);
  return {
    items: paginateClientItems(sorted, query.page, query.pageSize),
    total: sorted.length,
  };
};

/** Giả lập API `getColumnOptions` có phân trang vô hạn (`next`) */
export const fetchMockOptions: V2FetchOptions = async ({
  columnKey,
  search,
  pageParam,
}) => {
  await wait(250);
  const column = MOCK_COLUMNS.find((c) => c.key === columnKey);
  if (!column) return { items: [], total: 0, next: null };
  return paginateOptions(
    extractUniqueOptions(MOCK_ORDERS, column.getValue, { search }),
    pageParam,
    20,
  );
};
