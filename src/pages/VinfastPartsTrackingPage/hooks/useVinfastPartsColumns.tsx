import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Eye, PanelRightOpen } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import { money } from "@/shared/utils/format";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Badge } from "@/shared/components/ui/badge";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type { useErpInvoiceForm } from "@/modules/erp-invoices-core/hooks/useErpInvoiceForm";

import type { VinfastPartTrackingRow } from "../types";
import { getVehicleTypeLabel, getVehicleTypeBadgeClass } from "../utils";
import { CopyIconBtn } from "../components/CopyIconBtn";
import { PriceWithInvoicePopover } from "../components/PriceWithInvoicePopover";

export interface UseVinfastPartsColumnsOptions {
  tableState: ReturnType<typeof useTableColumnState>;
  getSortState: (key: string) => "asc" | "desc" | "none";
  handleSortChange: (key: string, state: "asc" | "desc" | "none") => void;
  handleSearchChange: (key: string, val: string) => void;
  handleFilterChange: (key: string, vals: string[]) => void;
  filterState: { dateFrom?: string; dateTo?: string; search?: string };
  filterProps: {
    setDateFrom: (d: string) => void;
    setDateTo: (d: string) => void;
  };
  commonFilterProps: any;
  formHook: ReturnType<typeof useErpInvoiceForm>;
  setDetailRow: (row: VinfastPartTrackingRow | null) => void;
  setPage: (page: number) => void;
  data?: { data: VinfastPartTrackingRow[]; total: number };
}

export function useVinfastPartsColumns({
  tableState,
  getSortState,
  handleSortChange,
  handleSearchChange,
  handleFilterChange,
  filterState,
  filterProps,
  commonFilterProps,
  formHook,
  setDetailRow,
  setPage,
  data,
}: UseVinfastPartsColumnsOptions) {
  const { t } = useTranslation("vinfast");

  const columns: DataTableColumn<VinfastPartTrackingRow>[] = useMemo(
    () => [
      {
        key: "actions",
        header: "",
        size: 48,
        cell: (row) => (
          <ActionDropdown
            items={[
              {
                label: t("actionDetail", "Xem chi tiết"),
                icon: <Eye className="w-3.5 h-3.5" />,
                onClick: () => {
                  setDetailRow(row);
                },
              },
            ]}
          />
        ),
      },
      {
        key: "month",
        header: (
          <TableColumnHeaderFilter
            title={t("month", "Tháng")}
            sortState={getSortState("month")}
            onSortChange={(state) => handleSortChange("month", state)}
            searchValue={tableState.columnSearch["month"] || ""}
            onSearchChange={(val) => handleSearchChange("month", val)}
            selectedFilters={tableState.columnFilters["month"] || []}
            onFilterChange={(vals) => handleFilterChange("month", vals)}
            align="center"
            columnKey="month"
            hideFilter={true}
            hideFooter={true}
            isActive={!!(filterState.dateFrom || filterState.dateTo)}
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={filterState.dateFrom || ""}
                dateTo={filterState.dateTo || ""}
                onChange={(from, to) => {
                  filterProps.setDateFrom(from);
                  filterProps.setDateTo(to);
                  setPage(1);
                }}
                onClose={close}
              />
            )}
          />
        ),
        size: 100,
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => row.month,
      },
      {
        key: "itemCode",
        header: (
          <TableColumnHeaderFilter
            title={t("itemCode", "Mã phụ tùng")}
            sortState={getSortState("itemCode")}
            onSortChange={(state) => handleSortChange("itemCode", state)}
            searchValue={tableState.columnSearch["itemCode"] || ""}
            onSearchChange={(val) => handleSearchChange("itemCode", val)}
            selectedFilters={tableState.columnFilters["itemCode"] || []}
            onFilterChange={(vals) => handleFilterChange("itemCode", vals)}
            align="center"
            columnKey="itemCode"
            {...commonFilterProps}
          />
        ),
        size: 200,
        headerClassName: "text-center",
        cell: (row) => (
          <div className="group flex items-center justify-between w-full pr-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailRow(row);
                }}
                className="h-5 w-5 p-0 flex items-center justify-center rounded opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
                title={t("actionDetail", "Xem chi tiết")}
              >
                <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
              </button>
              <span className="truncate text-slate-700">{row.itemCode}</span>
              <CopyIconBtn text={row.itemCode} />
            </div>
          </div>
        ),
      },
      {
        key: "itemName",
        header: (
          <TableColumnHeaderFilter
            title={t("itemName", "Tên phụ tùng")}
            sortState={getSortState("itemName")}
            onSortChange={(state) => handleSortChange("itemName", state)}
            searchValue={tableState.columnSearch["itemName"] || ""}
            onSearchChange={(val) => handleSearchChange("itemName", val)}
            selectedFilters={tableState.columnFilters["itemName"] || []}
            onFilterChange={(vals) => handleFilterChange("itemName", vals)}
            align="center"
            columnKey="itemName"
            {...commonFilterProps}
          />
        ),
        size: 250,
        headerClassName: "text-center",
        cell: (row) => (
          <Tooltip content={row.itemName || ""}>
            <div
              className="whitespace-normal break-words w-full truncate max-w-[200px]"
              title={row.itemName || ""}
            >
              {row.itemName}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "vehicleType",
        header: (
          <TableColumnHeaderFilter
            title={t("vehicleType", "Loại xe")}
            sortState={getSortState("vehicleType")}
            onSortChange={(state) => handleSortChange("vehicleType", state)}
            searchValue={tableState.columnSearch["vehicleType"] || ""}
            onSearchChange={(val) => handleSearchChange("vehicleType", val)}
            selectedFilters={tableState.columnFilters["vehicleType"] || []}
            onFilterChange={(vals) => handleFilterChange("vehicleType", vals)}
            align="center"
            columnKey="vehicleType"
            {...commonFilterProps}
            formatOptionLabel={(label) =>
              label === "CAR"
                ? t("car", "Ô tô")
                : label === "MOTORBIKE"
                  ? t("motorbike", "Xe máy")
                  : label
            }
          />
        ),
        size: 120,
        headerClassName: "text-center",
        className: "text-center",
        cell: (row) => (
          <Tooltip content={getVehicleTypeLabel(row.vehicleType)}>
            <Badge
              variant="ghost"
              className={`border ${getVehicleTypeBadgeClass(row.vehicleType)}`}
            >
              <span className="truncate block max-w-full">
                {getVehicleTypeLabel(row.vehicleType)}
              </span>
            </Badge>
          </Tooltip>
        ),
      },
      {
        key: "qtyBought",
        header: (
          <TableColumnHeaderFilter
            title={t("qtyBought", "SL Mua (VINFAST)")}
            sortState={getSortState("qtyBought")}
            onSortChange={(state) => handleSortChange("qtyBought", state)}
            searchValue={tableState.columnSearch["qtyBought"] || ""}
            onSearchChange={(val) => handleSearchChange("qtyBought", val)}
            selectedFilters={tableState.columnFilters["qtyBought"] || []}
            onFilterChange={(vals) => handleFilterChange("qtyBought", vals)}
            align="center"
            columnKey="qtyBought"
            {...commonFilterProps}
            formatOptionLabel={(label) => {
              const num = Number(label);
              return isNaN(num)
                ? label
                : num.toLocaleString("vi-VN", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });
            }}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <span className="font-semibold text-slate-700">
            {Number(row.qtyBought).toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
        ),
      },
      {
        key: "avgBuyPrice",
        header: (
          <TableColumnHeaderFilter
            title={t("avgBuyPrice", "Giá mua TB")}
            sortState={getSortState("avgBuyPrice")}
            onSortChange={(state) => handleSortChange("avgBuyPrice", state)}
            searchValue={tableState.columnSearch["avgBuyPrice"] || ""}
            onSearchChange={(val) => handleSearchChange("avgBuyPrice", val)}
            selectedFilters={tableState.columnFilters["avgBuyPrice"] || []}
            onFilterChange={(vals) => handleFilterChange("avgBuyPrice", vals)}
            align="center"
            columnKey="avgBuyPrice"
            {...commonFilterProps}
            formatOptionLabel={(label) => {
              const num = Number(label);
              return isNaN(num) ? label : money(num);
            }}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <PriceWithInvoicePopover
            price={row.avgBuyPrice}
            itemCode={row.itemCode}
            month={row.month}
            direction="IN"
            onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
          />
        ),
      },
      {
        key: "qtySold",
        header: (
          <TableColumnHeaderFilter
            title={t("qtySold", "SL Bán ra")}
            sortState={getSortState("qtySold")}
            onSortChange={(state) => handleSortChange("qtySold", state)}
            searchValue={tableState.columnSearch["qtySold"] || ""}
            onSearchChange={(val) => handleSearchChange("qtySold", val)}
            selectedFilters={tableState.columnFilters["qtySold"] || []}
            onFilterChange={(vals) => handleFilterChange("qtySold", vals)}
            align="center"
            columnKey="qtySold"
            {...commonFilterProps}
            formatOptionLabel={(label) => {
              const num = Number(label);
              return isNaN(num)
                ? label
                : num.toLocaleString("vi-VN", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  });
            }}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <span className="font-semibold text-slate-700">
            {Number(row.qtySold).toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </span>
        ),
      },
      {
        key: "avgSellPrice",
        header: (
          <TableColumnHeaderFilter
            title={t("avgSellPrice", "Giá bán TB")}
            sortState={getSortState("avgSellPrice")}
            onSortChange={(state) => handleSortChange("avgSellPrice", state)}
            searchValue={tableState.columnSearch["avgSellPrice"] || ""}
            onSearchChange={(val) => handleSearchChange("avgSellPrice", val)}
            selectedFilters={tableState.columnFilters["avgSellPrice"] || []}
            onFilterChange={(vals) => handleFilterChange("avgSellPrice", vals)}
            align="center"
            columnKey="avgSellPrice"
            {...commonFilterProps}
            formatOptionLabel={(label) => {
              const num = Number(label);
              return isNaN(num) ? label : money(num);
            }}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <PriceWithInvoicePopover
            price={row.avgSellPrice}
            itemCode={row.itemCode}
            month={row.month}
            direction="OUT"
            onOpenInvoice={(id) => formHook.openDetail({ id } as any)}
          />
        ),
      },
      {
        key: "margin",
        header: (
          <TableColumnHeaderFilter
            title={t("margin", "Biên LN")}
            sortState={getSortState("margin")}
            onSortChange={(state) => handleSortChange("margin", state)}
            searchValue={tableState.columnSearch["margin"] || ""}
            onSearchChange={(val) => handleSearchChange("margin", val)}
            selectedFilters={tableState.columnFilters["margin"] || []}
            onFilterChange={(vals) => handleFilterChange("margin", vals)}
            align="center"
            columnKey="margin"
            {...commonFilterProps}
            formatOptionLabel={(label) => {
              const num = Number(label);
              return isNaN(num) ? label : money(num);
            }}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <span className="font-semibold text-slate-700">
            {row.qtySold > 0 && row.margin != null ? money(row.margin) : ""}
          </span>
        ),
      },
      {
        key: "marginPct",
        header: (
          <TableColumnHeaderFilter
            title={t("marginPct", "Biên LN (%)")}
            sortState={getSortState("marginPct")}
            onSortChange={(state) => handleSortChange("marginPct", state)}
            searchValue={tableState.columnSearch["marginPct"] || ""}
            onSearchChange={(val) => handleSearchChange("marginPct", val)}
            selectedFilters={tableState.columnFilters["marginPct"] || []}
            onFilterChange={(vals) => handleFilterChange("marginPct", vals)}
            align="center"
            columnKey="marginPct"
            {...commonFilterProps}
          />
        ),
        headerClassName: "text-center",
        className: "text-right",
        cell: (row) => (
          <span className="text-gray-600">
            {row.qtySold > 0 ? row.marginPct : ""}
          </span>
        ),
      },
    ],
    [
      t,
      getSortState,
      handleSortChange,
      handleSearchChange,
      handleFilterChange,
      tableState.columnSearch,
      tableState.columnFilters,
      filterState.dateFrom,
      filterState.dateTo,
      filterProps,
      commonFilterProps,
      formHook,
      setDetailRow,
      setPage,
    ],
  );

  const summaryRow = useMemo(() => {
    if (!data?.data || data.data.length === 0) return undefined;

    const totalQtyBought = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtyBought) || 0),
      0,
    );
    const totalQtySold = data.data.reduce(
      (acc, curr) => acc + (Number(curr.qtySold) || 0),
      0,
    );
    const totalMargin = data.data.reduce(
      (acc, curr) => acc + (Number(curr.margin) || 0),
      0,
    );
    const totalAvgBuyPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgBuyPrice) || 0),
      0,
    );
    const totalAvgSellPrice = data.data.reduce(
      (acc, curr) => acc + (Number(curr.avgSellPrice) || 0),
      0,
    );

    return {
      qtyBought: (
        <span className="font-semibold text-slate-700">
          {totalQtyBought.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      qtySold: (
        <span className="font-semibold text-slate-700">
          {totalQtySold.toLocaleString("vi-VN", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}
        </span>
      ),
      avgBuyPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgBuyPrice)}
        </span>
      ),
      avgSellPrice: (
        <span className="font-semibold text-slate-700">
          {money(totalAvgSellPrice)}
        </span>
      ),
      margin: (
        <span className="font-semibold text-slate-700">
          {money(totalMargin)}
        </span>
      ),
    };
  }, [data]);

  return {
    columns,
    summaryRow,
  };
}
