import React from "react";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { GarageCaseCodeCell } from "../../molecules/garage-case-code-cell";
import { GarageCaseCustomerCell } from "../../molecules/garage-case-customer-cell";
import { buildFinancialColumns } from "./GarageCasesTable.financial-columns";
import type { ColumnContext } from "./GarageCasesTable.type";

export function buildGarageCasesColumns(ctx: ColumnContext) {
  const {
    t,
    tableState,
    dateRanges,
    onDateRangeChange,
    onSortChange,
    onSearchChange,
    onFilterChange,
    fetchCaseColumnOptions,
    onOpenDetail,
    onOpenFinancials,
  } = ctx;

  const commonOptionProps = {
    queryKeyPrefix: "garage-case-column-options",
    fetchOptions: fetchCaseColumnOptions,
    allFilters: tableState.columnFilters,
    enableSelectAllMatching: true,
  };

  const getSort = (key: string) =>
    tableState.sorts.includes(key)
      ? "asc"
      : tableState.sorts.includes(`-${key}`)
        ? "desc"
        : "none";

  const makeHdr = (
    key: string,
    title: string,
    opts: {
      align?: "left" | "center" | "right";
      hideFilter?: boolean;
      formatOptionLabel?: (val: string) => string;
      showBlankOption?: boolean;
      dateRangeSlot?: (props: { close: () => void }) => React.ReactNode;
      isActive?: boolean;
    } = {},
  ) => (
    <TableColumnHeaderFilter
      title={title}
      columnKey={key}
      sortState={getSort(key)}
      onSortChange={(state) => onSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => onSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => onFilterChange(key, vals)}
      align={opts.align || "center"}
      hideFilter={opts.hideFilter}
      formatOptionLabel={opts.formatOptionLabel}
      showBlankOption={opts.showBlankOption}
      dateRangeSlot={opts.dateRangeSlot}
      isActive={opts.isActive}
      {...(!opts.hideFilter ? commonOptionProps : {})}
    />
  );

  const coreColumns = [
    {
      key: "index",
      label: "#",
      header: <span className="w-full block text-center">#</span>,
      size: 50,
      enableResizing: false,
      hideable: false,
      className: "text-center font-mono text-xs text-muted-foreground",
      cell: (_: any, idx: number) => <span>{idx}</span>,
    },
    {
      key: "caseDate",
      label: t("cases.columns.caseDate", "Ngày tiếp nhận"),
      header: makeHdr(
        "caseDate",
        t("cases.columns.caseDate", "Ngày tiếp nhận"),
        {
          hideFilter: true,
          isActive: !!(dateRanges.caseDate?.from || dateRanges.caseDate?.to),
          dateRangeSlot: ({ close }) => (
            <DateRangeColumnSlot
              dateFrom={dateRanges.caseDate?.from}
              dateTo={dateRanges.caseDate?.to}
              onChange={(f, to) => {
                onDateRangeChange("caseDate", f, to);
                close();
              }}
              onClose={close}
            />
          ),
        },
      ),
      size: 150,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell
          date={item.ngayTiepNhan || item.ngayPhatSinh}
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "ngayHoanThanhCongViec",
      label: t("cases.columns.completionDate", "Ngày kết thúc"),
      header: makeHdr(
        "ngayHoanThanhCongViec",
        t("cases.columns.completionDate", "Ngày kết thúc"),
        {
          hideFilter: true,
          isActive: !!(
            dateRanges.ngayHoanThanhCongViec?.from ||
            dateRanges.ngayHoanThanhCongViec?.to
          ),
          dateRangeSlot: ({ close }) => (
            <DateRangeColumnSlot
              dateFrom={dateRanges.ngayHoanThanhCongViec?.from}
              dateTo={dateRanges.ngayHoanThanhCongViec?.to}
              onChange={(f, to) => {
                onDateRangeChange("ngayHoanThanhCongViec", f, to);
                close();
              }}
              onClose={close}
            />
          ),
        },
      ),
      size: 150,
      className: "text-right",
      cell: (item: any) => (
        <TableDateCell
          date={item.ngayHoanThanhCongViec}
          className="justify-end w-full"
        />
      ),
    },
    {
      key: "caseCode",
      label: t("cases.columns.caseCode", "Số chứng từ"),
      header: makeHdr("caseCode", t("cases.columns.caseCode", "Số chứng từ"), {
        isActive: !!tableState.columnFilters.caseCode?.length,
      }),
      size: 220,
      cell: (item: any) => (
        <GarageCaseCodeCell
          item={item}
          onOpenDetail={(c) => onOpenDetail(c)}
          onOpenFinancials={(c) => onOpenFinancials(c)}
        />
      ),
    },
    {
      key: "customer",
      label: t("cases.columns.customer", "Khách hàng"),
      header: makeHdr("customer", t("cases.columns.customer", "Khách hàng"), {
        align: "left",
        showBlankOption: true,
      }),
      size: 240,
      cell: (item: any) => <GarageCaseCustomerCell item={item} />,
    },
  ];

  return [...coreColumns, ...buildFinancialColumns(ctx, makeHdr)];
}
