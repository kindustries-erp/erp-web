import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useGarageStore } from "../store/garageStore";
import {
  useGarageCustomersList,
  type CustomerDebtItem,
} from "../hooks/useGarageCustomersList";
import { useGarageBranches } from "../hooks/useGarage";
import { GarageCustomerDetailDrawer } from "../components/GarageCustomerDetailDrawer";
import { garageApi } from "../api/garageApi";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
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
        header: <span className="w-full block text-center">#</span>,
        size: 50,
        enableResizing: false,
        headerClassName: "text-center",
        className: "text-center font-mono text-xs text-muted-foreground",
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
            enableSelectAllMatching={true}
            showBlankOption={true}
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
            onDetailClick={(e) => {
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            align="center"
          />
        ),
        size: 250,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => (
          <Tooltip content={row.customerName || "—"}>
            <div className="font-medium text-foreground truncate select-text">
              {row.customerName || "—"}
            </div>
          </Tooltip>
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
            align="center"
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
      // 6. Tiến Độ Thanh Toán (Fintech Neutral Progress Bar)
      {
        key: "paymentProgress",
        className: "text-left",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.paymentProgress", "Tiến độ thanh toán")}
            columnKey="paymentProgress"
            sortState={getSortState("paidAmount")}
            onSortChange={(s) => listHook.setSort("paidAmount", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["paymentProgress"] || []}
            onFilterChange={(v) =>
              listHook.setColumnFilter("paymentProgress", v)
            }
            isActive={Boolean(
              listHook.columnFilters["paymentProgress"]?.length,
            )}
            align="center"
            enableSelectAllMatching={true}
            formatOptionLabel={(val: string) => {
              if (val === "PAID")
                return t("customers.filter.paid", "Đã thu đủ");
              if (val === "PARTIAL")
                return t("customers.filter.partial", "Thu một phần");
              if (val === "UNPAID")
                return t("customers.filter.unpaid", "Chưa thu");
              return val;
            }}
            fetchOptions={async () => ({
              items: [
                {
                  label: t("customers.filter.paid", "Đã thu đủ"),
                  value: "PAID",
                },
                {
                  label: t("customers.filter.partial", "Thu một phần"),
                  value: "PARTIAL",
                },
                {
                  label: t("customers.filter.unpaid", "Chưa thu"),
                  value: "UNPAID",
                },
              ],
              total: 3,
              next: null,
            })}
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const total = Number(row.totalAmount) || 0;
          const paid = Number(row.paidAmount) || 0;
          const bal = Number(row.balanceAmount) || 0;

          if (total <= 0 && bal <= 0 && paid <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }

          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && bal > 0;
          const rate =
            total > 0
              ? Math.min(100, Math.round((paid / total) * 100))
              : isAllPaid
                ? 100
                : 0;

          return (
            <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
              {/* Row 1: Left badge + Right amount */}
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                {isAllPaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Đã thu đủ
                  </span>
                ) : isUnpaid ? (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    Chưa thu
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-bold font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                    {rate}%
                  </span>
                )}

                <div className="flex items-center gap-1 font-mono text-[11px] truncate">
                  {isAllPaid ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      {money(paid)}
                    </span>
                  ) : isUnpaid ? (
                    <span className="text-muted-foreground font-normal">
                      {money(bal)}
                    </span>
                  ) : (
                    <>
                      <span className="text-foreground font-medium">
                        {money(paid)}
                      </span>
                      <span className="text-muted-foreground/40">/</span>
                      <span className="text-muted-foreground font-normal">
                        {money(bal)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Row 2: Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    isAllPaid
                      ? "bg-emerald-500 dark:bg-emerald-400"
                      : isUnpaid
                        ? "bg-transparent"
                        : "bg-emerald-600 dark:bg-emerald-500",
                  )}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          );
        },
      },
      // 7. Tuổi Nợ (Aging - Fintech Progress Bar)
      {
        key: "maxAgingDays",
        className: "text-left",
        header: (
          <TableColumnHeaderFilter
            title={t("customers.columns.maxAgingDays", "Tuổi nợ")}
            columnKey="maxAgingDays"
            sortState={getSortState("maxAgingDays")}
            onSortChange={(s) => listHook.setSort("maxAgingDays", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={listHook.columnFilters["maxAgingDays"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("maxAgingDays", v)}
            isActive={Boolean(listHook.columnFilters["maxAgingDays"]?.length)}
            enableSelectAllMatching={true}
            align="center"
            formatOptionLabel={(val: string) => {
              if (val === "0-30")
                return t("customers.filter.aging0_30", "0-30 ngày (Trong hạn)");
              if (val === "31-60")
                return t(
                  "customers.filter.aging31_60",
                  "31-60 ngày (Cần theo dõi)",
                );
              if (val === "61-90")
                return t("customers.filter.aging61_90", "61-90 ngày (Quá hạn)");
              if (val === ">90")
                return t("customers.filter.agingOver90", ">90 ngày (Quá hạn)");
              return val;
            }}
            fetchOptions={async () => ({
              items: [
                {
                  label: t(
                    "customers.filter.aging0_30",
                    "0-30 ngày (Trong hạn)",
                  ),
                  value: "0-30",
                },
                {
                  label: t(
                    "customers.filter.aging31_60",
                    "31-60 ngày (Cần theo dõi)",
                  ),
                  value: "31-60",
                },
                {
                  label: t(
                    "customers.filter.aging61_90",
                    "61-90 ngày (Quá hạn)",
                  ),
                  value: "61-90",
                },
                {
                  label: t(
                    "customers.filter.agingOver90",
                    ">90 ngày (Quá hạn)",
                  ),
                  value: ">90",
                },
              ],
              total: 4,
              next: null,
            })}
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row: CustomerDebtItem) => {
          const bal = Number(row.balanceAmount) || 0;
          const aging = row.maxAgingDays || 0;

          if (bal <= 0) {
            return (
              <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
                <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                  <span className="font-mono text-xs text-muted-foreground/60">
                    0 ngày
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-sans border font-normal bg-slate-50 dark:bg-slate-800/40 text-muted-foreground/70 border-slate-200/60 dark:border-slate-700/40">
                    Đã tất toán
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden" />
              </div>
            );
          }

          const agingPercent = Math.min(100, Math.round((aging / 90) * 100));
          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;

          const bracketLabel = isOver90
            ? ">90 ngày"
            : is61to90
              ? "61-90 ngày"
              : is31to60
                ? "31-60 ngày"
                : "0-30 ngày";

          const tagCls = isOver90
            ? "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50"
            : is61to90
              ? "bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border-orange-200/80 dark:border-orange-800/50"
              : is31to60
                ? "bg-amber-50/90 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/40"
                : "bg-emerald-50/90 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200/70 dark:border-emerald-800/40";

          const dayTextCls = isOver90
            ? "text-rose-700 dark:text-rose-400 font-bold"
            : is61to90
              ? "text-orange-700 dark:text-orange-400 font-semibold"
              : is31to60
                ? "text-amber-800 dark:text-amber-300 font-semibold"
                : "text-emerald-700 dark:text-emerald-400 font-medium";

          const barColorCls = isOver90
            ? "bg-rose-500 dark:bg-rose-400"
            : is61to90
              ? "bg-orange-500 dark:bg-orange-400"
              : is31to60
                ? "bg-amber-500 dark:bg-amber-400"
                : "bg-emerald-500 dark:bg-emerald-400";

          return (
            <div className="flex flex-col gap-1.5 w-full py-1 justify-center">
              <div className="flex items-center justify-between text-xs tabular-nums leading-none">
                <span className={cn("font-mono text-xs", dayTextCls)}>
                  {aging} ngày
                </span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded font-sans shrink-0 border leading-none font-medium",
                    tagCls,
                  )}
                >
                  {bracketLabel}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    barColorCls,
                  )}
                  style={{ width: `${agingPercent}%` }}
                />
              </div>
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
            enableSelectAllMatching={true}
            showBlankOption={true}
            align="center"
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
