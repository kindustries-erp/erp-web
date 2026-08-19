import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Progress } from "@/shared/components/ui/progress";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCustomersList,
  type CustomerDebtItem,
} from "../hooks/useGarageCustomersList";
import { useGarageBranches } from "../hooks/useGarage";
import { GarageCustomerDetailDrawer } from "../components/GarageCustomerDetailDrawer";
import { garageApi } from "../api/garageApi";
import { money } from "@/shared/utils/format";
import { Users, Eye } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function GarageCustomers() {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();
  const { data: branches } = useGarageBranches();

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
      // 2. Mã Khách Hàng (Mở Drawer chi tiết khi click icon trên TableText)
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
                selectedBranchId || undefined,
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
        size: 200,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableText
            text={row.customerCode || "NO_CODE"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            onDrawerClick={(e) => {
              e?.stopPropagation();
              setSelectedCustomer({
                code: row.customerCode,
                name: row.customerName,
              });
            }}
          />
        ),
      },
      // 3. Tên Khách Hàng (Chỉ hiển thị text, không mở Drawer khi click tên)
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
                selectedBranchId || undefined,
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
          <div className="font-medium text-foreground truncate select-text">
            {row.customerName || "—"}
          </div>
        ),
      },
      // 4. SL Phiếu DV (Width 120px)
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.caseCount", "SL Phiếu DV")}
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
        size: 120,
        className: "text-center",
        cell: (row: CustomerDebtItem) => (
          <Badge variant="secondary" className="tabular-nums font-mono">
            {row.caseCount}
          </Badge>
        ),
      },
      // 5. Phải Thu
      {
        key: "totalAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.receivableAmount", "Phải thu")}
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
      // 6. Tiến Độ Thanh Toán (Gom gọn chuẩn xác trong 2 hàng, phong cách Neutral Business)
      {
        key: "paymentProgress",
        className: "text-left",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.paymentProgress", "Tiến độ thanh toán")}
            sortState={getSortState("paidAmount")}
            onSortChange={(s) => listHook.setSort("paidAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            align="center"
          />
        ),
        size: 210,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const total = Number(row.totalAmount) || 0;
          const paid = Number(row.paidAmount) || 0;
          const bal = Number(row.balanceAmount) || 0;

          if (total <= 0 && bal <= 0 && paid <= 0) {
            return (
              <span className="text-muted-foreground/60 font-normal select-none">
                —
              </span>
            );
          }

          const rate =
            total > 0
              ? Math.min(100, Math.round((paid / total) * 100))
              : bal <= 0 && paid > 0
                ? 100
                : 0;

          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && bal > 0;

          return (
            <div className="flex flex-col gap-1 w-full py-0.5 justify-center">
              {/* Hàng 1: Badge / % bên trái + Đã thu / Còn nợ bên phải */}
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {isAllPaid ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 font-medium border-slate-300 dark:border-slate-700 text-foreground"
                    >
                      Đã thu đủ
                    </Badge>
                  ) : isUnpaid ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground border-muted-foreground/30"
                    >
                      Chưa thu
                    </Badge>
                  ) : (
                    <span className="text-foreground font-semibold text-[11px]">
                      {rate}%
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                  <span className="text-foreground font-medium">
                    {money(paid)}
                  </span>
                  {bal > 0 && (
                    <>
                      <span className="text-muted-foreground/40">/</span>
                      <span className="text-muted-foreground font-normal">
                        {money(bal)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Hàng 2: Progress bar Neutral */}
              <Progress
                value={rate}
                className="h-1.5 bg-muted"
                indicatorClassName="bg-slate-700 dark:bg-slate-300"
              />
            </div>
          );
        },
      },
      // 7. Tuổi Nợ (Aging - Thể hiện số ngày và nhóm tuổi nợ rõ ràng)
      {
        key: "maxAgingDays",
        className: "text-left",
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
        size: 140,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const bal = Number(row.balanceAmount) || 0;
          const aging = row.maxAgingDays || 0;

          if (bal <= 0) {
            return (
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    0 ngày
                  </span>
                </div>
                <Progress value={0} className="h-1.5 bg-muted" />
              </div>
            );
          }

          const agingPercent = Math.min(100, Math.round((aging / 90) * 100));
          const bracket =
            aging <= 30
              ? "0-30 ngày"
              : aging <= 60
                ? "31-60 ngày"
                : aging <= 90
                  ? "61-90 ngày"
                  : ">90 ngày";

          return (
            <div className="flex flex-col gap-1 w-full py-0.5 justify-center">
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                <span className="text-[11px] font-semibold text-foreground font-mono">
                  {aging} ngày
                </span>
                <span className="text-[10px] text-muted-foreground font-sans">
                  {bracket}
                </span>
              </div>
              <Progress
                value={agingPercent}
                className="h-1.5 bg-muted"
                indicatorClassName={
                  aging > 90
                    ? "bg-rose-500/80"
                    : "bg-slate-700 dark:bg-slate-300"
                }
              />
            </div>
          );
        },
      },
      // 8. Ngày Phát Sinh Gần Nhất (Width 150px)
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
        size: 150,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <TableDateCell
            date={row.latestDate || ""}
            className="justify-end w-full"
          />
        ),
      },
      // 9. Chi Nhánh (Chuyển xuống cuối cùng)
      {
        key: "branchName",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.branchName", "Chi nhánh")}
            columnKey="branchName"
            queryKeyPrefix="garage-customer-branch-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getCustomersDebtColumnOptions(
                selectedBranchId || undefined,
                "branchName",
                search,
                pageParam,
                20,
                filtersStr,
              );
              return {
                items: res.items.map((it: string) => {
                  const b = branches?.find((br: any) => br.externalId === it);
                  return {
                    label: b?.name || it,
                    value: it,
                  };
                }),
                total: res.total,
                next: res.page < res.totalPages ? res.page + 1 : null,
              };
            }}
            formatOptionLabel={(val: string) => {
              const b = branches?.find((br: any) => br.externalId === val);
              return b?.name || val;
            }}
            sortState={getSortState("branchName")}
            onSortChange={(s) => listHook.setSort("branchName", s)}
            searchValue={listHook.columnSearch["branchName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("branchName", v)}
            selectedFilters={listHook.columnFilters["branchName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("branchName", v)}
            isActive={Boolean(
              listHook.columnFilters["branchName"]?.length ||
              listHook.columnSearch["branchName"],
            )}
            align="left"
          />
        ),
        size: 180,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const b = branches?.find(
            (br: any) => br.externalId === row.branchExternalId,
          );
          return (
            <span className="truncate text-muted-foreground text-xs font-medium">
              {b?.name || row.branchExternalId || "—"}
            </span>
          );
        },
      },
    ],
    [
      listHook.sorts,
      listHook.columnFilters,
      listHook.columnSearch,
      listHook.dateFrom,
      listHook.dateTo,
      selectedBranchId,
      branches,
      t,
    ],
  );

  return (
    <>
      <SpreadsheetPageTemplate<CustomerDebtItem>
        title={t("customers.title", "Công nợ khách hàng")}
        desc={t(
          "customers.desc",
          "Theo dõi tổng hợp công nợ phải thu, tuổi nợ và danh sách phiếu dịch vụ theo từng khách hàng (Dữ liệu công nợ ghi nhận từ tháng 07/2026)",
        )}
        icon={<Users className="w-5 h-5 text-primary" />}
        tableId="garage-customers-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) =>
          `${row.customerCode}_${row.branchExternalId || "all"}`
        }
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
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={(row: CustomerDebtItem) => [
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
        summaryRow={{
          totalAmount: (
            <div className="text-right font-bold tabular-nums text-foreground">
              {money(listHook.summary.totalRevenue)}
            </div>
          ),
          paymentProgress: (
            <div className="flex flex-col gap-0.5 text-right font-bold tabular-nums">
              <div className="text-emerald-600 dark:text-emerald-400 text-xs">
                Đã thu: {money(listHook.summary.totalPaid)}
              </div>
              <div className="text-destructive text-[11px]">
                Còn lại: {money(listHook.summary.totalBalance)}
              </div>
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
