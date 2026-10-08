import { vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { V2TableDateCell } from "@/v2/shared/components/atoms/v2-table-date-cell";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { V2FetchOptions } from "@/v2/shared/types/v2-table";
import { headerFilter } from "./v2HeaderFilterBuilder";
import type {
  V2Column,
  V2ColumnPreferences,
  V2ColumnPreferencesStorage,
  V2StandardTableProps,
} from "./V2StandardTable.type";

export interface DemoRow {
  id: string;
  code: string;
  name: string;
  qty: number;
  createdAt: string;
}

export const makeRows = (count: number, offset = 0): DemoRow[] =>
  Array.from({ length: count }, (_, i) => {
    const n = offset + i + 1;
    return {
      id: `r${n}`,
      code: `HD-${String(n).padStart(3, "0")}`,
      name: n % 2 === 1 ? "Alpha" : "Beta",
      qty: n * 10,
      createdAt: `2026-01-${String(((n - 1) % 28) + 1).padStart(2, "0")}`,
    };
  });

export const makeColumns = (): V2Column<DemoRow>[] => [
  { key: "code", ...headerFilter("Mã"), cell: (row) => row.code, size: 160 },
  { key: "name", ...headerFilter("Tên"), cell: (row) => row.name },
  {
    key: "qty",
    ...headerFilter.qty("Số lượng"),
    cell: (row) => row.qty,
    align: TableColumnAlign.RIGHT,
  },
  {
    key: "createdAt",
    ...headerFilter.date("Ngày"),
    cell: (row) => <V2TableDateCell date={row.createdAt} />,
  },
];

export const COLUMNS = makeColumns();

export const memoryStorage = (
  initial: V2ColumnPreferences | null = null,
): V2ColumnPreferencesStorage => ({
  load: () => initial,
  save: vi.fn(),
  clear: vi.fn(),
});

export const demoFetchOptions: V2FetchOptions = vi.fn(async () => ({
  items: [
    { value: "HD-001", label: "HD-001" },
    { value: "HD-002", label: "HD-002" },
  ],
  total: 2,
  next: null,
}));

export const mockViewport = (isMobile: boolean) =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: isMobile ? 375 : 1280,
    height: isMobile ? 667 : 800,
    isMobile,
    isTablet: false,
    isDesktop: !isMobile,
  });

type TableComponent = (props: V2StandardTableProps<DemoRow>) => JSX.Element;

export const renderTable = (
  Component: TableComponent,
  overrides: Partial<V2StandardTableProps<DemoRow>> = {},
) => {
  useAppStore.setState({ locale: "vi" });
  const props: V2StandardTableProps<DemoRow> = {
    tableId: "t-test",
    columns: COLUMNS,
    items: makeRows(20),
    total: 100,
    getRowKey: (row) => row.id,
    fetchOptions: demoFetchOptions,
    preferencesStorage: memoryStorage(),
    initialQuery: { pageSize: 20 },
    ...overrides,
  };
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const utils = render(
    <QueryClientProvider client={client}>
      <Component {...props} />
    </QueryClientProvider>,
  );
  return { props, ...utils };
};
