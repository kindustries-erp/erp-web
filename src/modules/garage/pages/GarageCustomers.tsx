import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { ActionDropdown } from "@/shared/components/ActionDropdown";
import { useGarageStore } from "../store/garageStore";
import { GarageBranchSelector } from "../components/GarageBranchSelector";
import {
  useGarageCustomersList,
  type CustomerDebtItem,
} from "../hooks/useGarageCustomersList";
import { GarageCustomerDetailDrawer } from "../components/GarageCustomerDetailDrawer";
import { garageApi } from "../api/garageApi";
import { money } from "@/shared/utils/format";
import { Users, FilterX, RefreshCw, Eye } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function GarageCustomers() {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageCustomersList(selectedBranchId || undefined);

  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts.includes(key)) return "asc";
    if (listHook.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const columns: DataTableColumn<CustomerDebtItem>[] = useMemo(
    () => [
      // 1. STT
      {
        key: "index",
        header: <div className="text-center w-[40px] min-w-[40px]">#</div>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: CustomerDebtItem, idx: number) => <span>{idx}</span>,
      },
      // 2. Mã Khách Hàng
      {
        key: "customerCode",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.customerCode", "Mã KH")}
            columnKey="customerCode"
            queryKeyPrefix="garage-customer-code-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || "",
                "customerCode",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => ({
                  label: it,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("customerCode")}
            onSortChange={(s) => listHook.setSort("customerCode", s)}
            searchValue={listHook.columnSearch["customerCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("customerCode", v)}
            selectedFilters={listHook.columnFilters["customerCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("customerCode", v)}
            isActive={Boolean(
              listHook.columnFilters["customerCode"]?.length ||
              listHook.columnSearch["customerCode"],
            )}
            align="center"
          />
        ),
        size: 150,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableText
            text={row.customerCode || "NO_CODE"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            onDrawerClick={(e) => {
              e.stopPropagation();
              setSelectedCustomer({
                code: row.customerCode,
                name: row.customerName,
              });
            }}
          />
        ),
      },
      // 3. Tên Khách Hàng
      {
        key: "customerName",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.customerName", "Tên khách hàng")}
            columnKey="customerName"
            queryKeyPrefix="garage-customer-name-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || "",
                "customerName",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => ({
                  label: it,
                  value: it,
                })),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            sortState={getSortState("customerName")}
            onSortChange={(s) => listHook.setSort("customerName", s)}
            searchValue={listHook.columnSearch["customerName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("customerName", v)}
            selectedFilters={listHook.columnFilters["customerName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("customerName", v)}
            isActive={Boolean(
              listHook.columnFilters["customerName"]?.length ||
              listHook.columnSearch["customerName"],
            )}
            align="left"
          />
        ),
        size: 220,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <div
            className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() =>
              setSelectedCustomer({
                code: row.customerCode,
                name: row.customerName,
              })
            }
          >
            {row.customerName || "—"}
          </div>
        ),
      },
      // 4. Số Phiếu Dịch Vụ
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.caseCount", "Số phiếu")}
            sortState={getSortState("caseCount")}
            onSortChange={(s) => listHook.setSort("caseCount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 90,
        className: "text-center",
        cell: (row: CustomerDebtItem) => (
          <Badge variant="secondary" className="tabular-nums font-mono">
            {row.caseCount}
          </Badge>
        ),
      },
      // 5. Tổng Doanh Thu
      {
        key: "totalAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.totalAmount", "Tổng doanh thu")}
            sortState={getSortState("totalAmount")}
            onSortChange={(s) => listHook.setSort("totalAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="right"
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <span className="tabular-nums font-semibold text-foreground">
            {money(row.totalAmount)}
          </span>
        ),
      },
      // 6. Đã Thanh Toán
      {
        key: "paidAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.paidAmount", "Đã thu")}
            sortState={getSortState("paidAmount")}
            onSortChange={(s) => listHook.setSort("paidAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="right"
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
            {money(row.paidAmount)}
          </span>
        ),
      },
      // 7. Còn Phải Thu
      {
        key: "balanceAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.balanceAmount", "Còn phải thu")}
            sortState={getSortState("balanceAmount")}
            onSortChange={(s) => listHook.setSort("balanceAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="right"
          />
        ),
        size: 150,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <span
            className={`tabular-nums font-bold ${
              row.balanceAmount > 0
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {money(row.balanceAmount)}
          </span>
        ),
      },
      // 8. Tuổi Nợ (Aging)
      {
        key: "maxAgingDays",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.maxAgingDays", "Tuổi nợ")}
            sortState={getSortState("maxAgingDays")}
            onSortChange={(s) => listHook.setSort("maxAgingDays", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 110,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          if (row.balanceAmount <= 0) {
            return (
              <Badge
                variant="outline"
                className="text-[10px] text-muted-foreground font-normal"
              >
                0d
              </Badge>
            );
          }
          const aging = row.maxAgingDays;
          const variant =
            aging <= 30 ? "success" : aging <= 60 ? "warning" : "destructive";
          return (
            <Badge variant={variant} className="tabular-nums text-xs">
              {aging} {t("common.daysShort", "d")}
            </Badge>
          );
        },
      },
      // 9. Ngày Phát Sinh Gần Nhất
      {
        key: "latestDate",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.latestDate", "Ngày gần nhất")}
            sortState={getSortState("latestDate")}
            onSortChange={(s) => listHook.setSort("latestDate", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => listHook.setDateRange(from, to)}
                onClose={close}
              />
            )}
          />
        ),
        size: 130,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableDateCell
            date={row.latestDate || ""}
            className="justify-end w-full"
          />
        ),
      },
      // 10. Actions
      {
        key: "actions",
        header: <div className="w-[40px] min-w-[40px]" />,
        size: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px]",
        className: "w-[40px] min-w-[40px]",
        cell: (row: CustomerDebtItem) => (
          <ActionDropdown
            items={[
              {
                groupLabel: "TRA CỨU",
                items: [
                  {
                    label: t("customers.viewDetail", "Xem chi tiết công nợ"),
                    icon: <Eye className="w-4 h-4" />,
                    onClick: () =>
                      setSelectedCustomer({
                        code: row.customerCode,
                        name: row.customerName,
                      }),
                  },
                ],
              },
            ]}
          />
        ),
      },
    ],
    [
      listHook.sorts,
      listHook.columnFilters,
      listHook.columnSearch,
      listHook.dateFrom,
      listHook.dateTo,
      selectedBranchId,
      t,
    ],
  );

  return (
    <>
      <SpreadsheetPageTemplate<CustomerDebtItem>
        title={t("customers.title", "Công nợ khách hàng")}
        desc={t(
          "customers.desc",
          "Theo dõi tổng hợp công nợ phải thu, tuổi nợ và danh sách phiếu dịch vụ theo từng khách hàng",
        )}
        icon={<Users className="w-5 h-5 text-primary" />}
        tableId="garage-customers-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.customerCode}
        loading={listHook.isLoading}
        emptyLabel={t("customers.empty", "Không có dữ liệu khách hàng")}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        onRowClick={(row) =>
          setSelectedCustomer({
            code: row.customerCode,
            name: row.customerName,
          })
        }
        customActionsNode={
          <div className="flex items-center gap-2">
            <GarageBranchSelector />
            <Button
              variant="outline"
              size="sm"
              onClick={() => listHook.refetch()}
              disabled={listHook.isLoading}
              className="h-8 gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  listHook.isLoading ? "animate-spin" : ""
                }`}
              />
              {t("common.refresh", "Làm mới")}
            </Button>
            {listHook.activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={listHook.clearAllFilters}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8"
              >
                <FilterX className="w-3.5 h-3.5 text-destructive" />
                {t("customers.clearFilters", "Xóa bộ lọc")} (
                {listHook.activeFilterCount})
              </Button>
            )}
          </div>
        }
        summaryRow={{
          totalAmount: (
            <div className="text-right font-bold tabular-nums text-foreground">
              {money(listHook.summary.totalRevenue)}
            </div>
          ),
          paidAmount: (
            <div className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {money(listHook.summary.totalPaid)}
            </div>
          ),
          balanceAmount: (
            <div className="text-right font-bold tabular-nums text-destructive">
              {money(listHook.summary.totalBalance)}
            </div>
          ),
        }}
      />

      {/* Customer Detail Drawer */}
      <GarageCustomerDetailDrawer
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
        branchId={selectedBranchId || undefined}
      />
    </>
  );
}
