import { useState, useMemo } from "react";
import { PanelRightOpen, Check, Copy } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { StandardTable } from "@/shared/components/StandardTable";
import { money } from "@/shared/utils/format";
import {
  VinfastPartDashboardTableRow,
  useVinfastPartsDashboardTable,
} from "@/shared/hooks/useVinfastPartsDashboardTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

interface Props {
  filterState: any;
  vehicleType: "CAR" | "MOTORBIKE";
  title: string;
  onRowClick?: (row: VinfastPartDashboardTableRow) => void;
}

export function VinfastPartDashboardTable({
  filterState,
  vehicleType,
  title,
  onRowClick,
}: Props) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const CopyIconBtn = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded text-slate-500 ml-1"
        title="Copy"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-600" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    );
  };

  const tableState = useTableColumnState(
    `vinfast-parts-dashboard-${vehicleType}`,
  );

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
  };

  const renderHeaderFilter = (
    key: string,
    title: string,
    options?: { label: string; value: string }[],
  ) => (
    <TableColumnHeaderFilter
      title={title}
      align="center"
      sortState={getSortState(key)}
      onSortChange={(state) => handleSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => handleSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => handleFilterChange(key, vals)}
      filterOptions={options}
    />
  );

  const { data, isLoading } = useVinfastPartsDashboardTable(
    filterState,
    page,
    limit,
    vehicleType,
    tableState,
  );

  const itemCodeOptions = useMemo(() => {
    const options = new Set<string>();
    (data?.items || []).forEach((row: any) => {
      if (row.itemCode) options.add(row.itemCode);
    });
    return Array.from(options).map((o) => ({ label: o, value: o }));
  }, [data?.items]);

  const itemNameOptions = useMemo(() => {
    const options = new Set<string>();
    (data?.items || []).forEach((row: any) => {
      if (row.itemName) options.add(row.itemName);
    });
    return Array.from(options).map((o) => ({ label: o, value: o }));
  }, [data?.items]);

  const columns: any[] = useMemo(
    () => [
      {
        key: "itemCode",
        header: renderHeaderFilter("itemCode", "Mã phụ tùng", itemCodeOptions),
        className: "w-[150px] text-left",
        headerClassName: "w-[150px] text-left",
        cell: (row: any) => (
          <div className="flex items-center gap-1.5 group w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: any) => {
                e.stopPropagation();
                onRowClick?.(row);
              }}
              className="h-5 w-5 p-0 opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
              title="Mở chi tiết"
            >
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
            </Button>
            <div className="flex items-center text-slate-700 flex-1 min-w-0">
              <span className="truncate" title={row.itemCode}>
                {row.itemCode}
              </span>
              <CopyIconBtn text={row.itemCode} />
            </div>
          </div>
        ),
      },
      {
        key: "itemName",
        header: renderHeaderFilter("itemName", "Tên phụ tùng", itemNameOptions),
        className: "text-left w-full",
        headerClassName: "w-full text-left",
        cell: (row: any) => (
          <div className="text-left w-full truncate" title={row.itemName}>
            {row.itemName}
          </div>
        ),
      },
      {
        key: "qtyBought",
        header: renderHeaderFilter("qtyBought", "SL Mua"),
        className: "w-[100px] text-right",
        headerClassName: "w-[100px] text-right",
        cell: (row: any) => <div className="text-right">{row.qtyBought}</div>,
      },
      {
        key: "amountBought",
        header: renderHeaderFilter("amountBought", "Tiền Mua"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => (
          <div className="text-right text-[#ea580c]">
            {money(row.amountBought)} đ
          </div>
        ),
      },
      {
        key: "qtySold",
        header: renderHeaderFilter("qtySold", "SL Bán"),
        className: "w-[100px] text-right",
        headerClassName: "w-[100px] text-right",
        cell: (row: any) => <div className="text-right">{row.qtySold}</div>,
      },
      {
        key: "amountSold",
        header: renderHeaderFilter("amountSold", "Tiền Bán"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => (
          <div className="text-right text-[#059669]">
            {money(row.amountSold)} đ
          </div>
        ),
      },
      {
        key: "profit",
        header: renderHeaderFilter("profit", "Lợi nhuận"),
        className: "w-[150px] text-right",
        headerClassName: "w-[150px] text-right",
        cell: (row: any) => {
          const val = row.profit;
          return (
            <div
              className={`text-right font-semibold ${val < 0 ? "text-red-600" : "text-green-600"}`}
            >
              {money(val)} đ
            </div>
          );
        },
      },
    ],
    [itemCodeOptions, itemNameOptions, renderHeaderFilter],
  );

  const subTotalQtyBought = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.qtyBought) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalAmountBought = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.amountBought) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalQtySold = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.qtySold) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalAmountSold = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.amountSold) || 0),
      0,
    );
  }, [data?.items]);

  const subTotalProfit = useMemo(() => {
    return (data?.items || []).reduce(
      (acc: number, row: any) => acc + (Number(row.profit) || 0),
      0,
    );
  }, [data?.items]);

  return (
    <div className="flex flex-col h-full">
      <h4 className="font-semibold text-sm text-slate-700 mb-2">{title}</h4>
      <div className="flex-1">
        <StandardTable
          columns={columns}
          items={data?.items || []}
          getRowKey={(row: any) => row.itemCode}
          total={data?.total || 0}
          totalPages={data?.totalPages || 0}
          onPage={setPage}
          onPageSize={setLimit}
          page={page}
          pageSize={limit}
          loading={isLoading}
          minWidth={500}
          enableColumnResizing={false}
          variant="spreadsheet"
          summaryRow={{
            itemName: (
              <span className="font-semibold text-right block">Tổng</span>
            ),
            qtyBought: (
              <span className="font-semibold text-right block">
                {subTotalQtyBought}
              </span>
            ),
            amountBought: (
              <span className="text-[#ea580c] font-semibold text-right block">
                {money(subTotalAmountBought)} đ
              </span>
            ),
            qtySold: (
              <span className="font-semibold text-right block">
                {subTotalQtySold}
              </span>
            ),
            amountSold: (
              <span className="text-[#059669] font-semibold text-right block">
                {money(subTotalAmountSold)} đ
              </span>
            ),
            profit: (
              <span
                className={`text-right font-semibold block ${subTotalProfit < 0 ? "text-red-600" : "text-green-600"}`}
              >
                {money(subTotalProfit)} đ
              </span>
            ),
          }}
        />
      </div>
    </div>
  );
}
