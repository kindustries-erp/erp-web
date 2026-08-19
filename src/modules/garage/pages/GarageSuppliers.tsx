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
  useGarageSuppliersList,
  type SupplierDebtItem,
} from "../hooks/useGarageSuppliersList";
import { GarageSupplierDetailDrawer } from "../components/GarageSupplierDetailDrawer";
import { garageApi } from "../api/garageApi";
import { money } from "@/shared/utils/format";
import { Building2, FilterX, RefreshCw, Eye } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";

export function GarageSuppliers() {
  const { t } = useTranslation("garage");
  const { selectedBranchId } = useGarageStore();

  const listHook = useGarageSuppliersList(selectedBranchId || undefined);

  const [selectedSupplier, setSelectedSupplier] = useState<{
    id: string;
    code: string;
    name: string;
  } | null>(null);

  const getSortState = (key: string): "asc" | "desc" | "none" => {
    if (listHook.sorts.includes(key)) return "asc";
    if (listHook.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };

  const columns: DataTableColumn<SupplierDebtItem>[] = useMemo(
    () => [
      // 1. STT
      {
        key: "index",
        header: <div className="text-center w-[40px] min-w-[40px]">#</div>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: SupplierDebtItem, idx: number) => <span>{idx}</span>,
      },
      // 2. Mã Nhà Cung Cấp
      {
        key: "supplierCode",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.supplierCode", "Mã NCC")}
            columnKey="supplierCode"
            queryKeyPrefix="garage-supplier-code-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getSuppliersDebtColumnOptions(
                selectedBranchId || "",
                "supplierCode",
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
            sortState={getSortState("supplierCode")}
            onSortChange={(s) => listHook.setSort("supplierCode", s)}
            searchValue={listHook.columnSearch["supplierCode"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("supplierCode", v)}
            selectedFilters={listHook.columnFilters["supplierCode"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("supplierCode", v)}
            isActive={Boolean(
              listHook.columnFilters["supplierCode"]?.length ||
              listHook.columnSearch["supplierCode"],
            )}
            align="center"
          />
        ),
        size: 150,
        enableResizing: true,
        cell: (row: SupplierDebtItem) => (
          <TableText
            text={row.supplierCode || row.supplierId || "NO_CODE"}
            enableCopy={true}
            tooltip={true}
            className="font-mono text-primary font-medium"
            onDrawerClick={(e) => {
              e.stopPropagation();
              setSelectedSupplier({
                id: row.supplierId,
                code: row.supplierCode,
                name: row.supplierName,
              });
            }}
          />
        ),
      },
      // 3. Tên Nhà Cung Cấp
      {
        key: "supplierName",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.supplierName", "Tên nhà cung cấp")}
            columnKey="supplierName"
            queryKeyPrefix="garage-supplier-name-options"
            allFilters={listHook.columnFilters}
            fetchOptions={async ({ search, pageParam, filtersStr }) => {
              const res = await garageApi.getSuppliersDebtColumnOptions(
                selectedBranchId || "",
                "supplierName",
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
            sortState={getSortState("supplierName")}
            onSortChange={(s) => listHook.setSort("supplierName", s)}
            searchValue={listHook.columnSearch["supplierName"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("supplierName", v)}
            selectedFilters={listHook.columnFilters["supplierName"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("supplierName", v)}
            isActive={Boolean(
              listHook.columnFilters["supplierName"]?.length ||
              listHook.columnSearch["supplierName"],
            )}
            align="left"
          />
        ),
        size: 220,
        enableResizing: true,
        cell: (row: SupplierDebtItem) => (
          <div
            className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
            onClick={() =>
              setSelectedSupplier({
                id: row.supplierId,
                code: row.supplierCode,
                name: row.supplierName,
              })
            }
          >
            {row.supplierName || "—"}
          </div>
        ),
      },
      // 4. Tài Khoản
      {
        key: "accountCode",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.accountCode", "Tài khoản")}
            sortState={getSortState("accountCode")}
            onSortChange={(s) => listHook.setSort("accountCode", s)}
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
        cell: (row: SupplierDebtItem) => (
          <Badge variant="outline" className="font-mono text-xs">
            {row.accountCode || "331"}
          </Badge>
        ),
      },
      // 5. Số Vụ Việc
      {
        key: "caseCount",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.caseCount", "Vụ việc")}
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
        size: 80,
        className: "text-center",
        cell: (row: SupplierDebtItem) => (
          <Badge variant="secondary" className="tabular-nums font-mono">
            {row.caseCount}
          </Badge>
        ),
      },
      // 6. Phát Sinh Nợ (Đã thanh toán)
      {
        key: "psNo",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.psNo", "PS Nợ (Đã trả)")}
            sortState={getSortState("psNo")}
            onSortChange={(s) => listHook.setSort("psNo", s)}
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
        cell: (row: SupplierDebtItem) => (
          <span className="tabular-nums font-medium text-emerald-600 dark:text-emerald-400">
            {money(row.psNo)}
          </span>
        ),
      },
      // 7. Phát Sinh Có (Mua phát sinh)
      {
        key: "psCo",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.psCo", "PS Có (Mua vào)")}
            sortState={getSortState("psCo")}
            onSortChange={(s) => listHook.setSort("psCo", s)}
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
        cell: (row: SupplierDebtItem) => (
          <span className="tabular-nums font-semibold text-foreground">
            {money(row.psCo)}
          </span>
        ),
      },
      // 8. Dư Nợ Còn Phải Trả
      {
        key: "balanceAmount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.balanceAmount", "Còn phải trả")}
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
        cell: (row: SupplierDebtItem) => (
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
      // 9. Tuổi Nợ (Aging)
      {
        key: "maxAgingDays",
        className: "text-center",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.maxAgingDays", "Tuổi nợ")}
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
        cell: (row: SupplierDebtItem) => {
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
      // 10. Kỳ Báo Cáo
      {
        key: "periodTo",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("suppliers.columns.periodTo", "Kỳ báo cáo")}
            sortState={getSortState("periodTo")}
            onSortChange={(s) => listHook.setSort("periodTo", s)}
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
        cell: (row: SupplierDebtItem) => (
          <TableDateCell
            date={row.periodTo || row.periodFrom || ""}
            className="justify-end w-full"
          />
        ),
      },
      // 11. Actions
      {
        key: "actions",
        header: <div className="w-[40px] min-w-[40px]" />,
        size: 40,
        enableResizing: false,
        headerClassName: "w-[40px] min-w-[40px]",
        className: "w-[40px] min-w-[40px]",
        cell: (row: SupplierDebtItem) => (
          <ActionDropdown
            items={[
              {
                groupLabel: "TRA CỨU",
                items: [
                  {
                    label: t("suppliers.viewDetail", "Xem chi tiết công nợ"),
                    icon: <Eye className="w-4 h-4" />,
                    onClick: () =>
                      setSelectedSupplier({
                        id: row.supplierId,
                        code: row.supplierCode,
                        name: row.supplierName,
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
      <SpreadsheetPageTemplate<SupplierDebtItem>
        title={t("suppliers.title", "Công nợ nhà cung cấp")}
        desc={t(
          "suppliers.desc",
          "Theo dõi tổng hợp công nợ phải trả (TK 331), tuổi nợ và các vụ việc phát sinh theo từng nhà cung cấp",
        )}
        icon={<Building2 className="w-5 h-5 text-primary" />}
        tableId="garage-suppliers-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.supplierId || row.supplierCode}
        loading={listHook.isLoading}
        emptyLabel={t("suppliers.empty", "Không có dữ liệu nhà cung cấp")}
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
          setSelectedSupplier({
            id: row.supplierId,
            code: row.supplierCode,
            name: row.supplierName,
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
                {t("suppliers.clearFilters", "Xóa bộ lọc")} (
                {listHook.activeFilterCount})
              </Button>
            )}
          </div>
        }
        summaryRow={{
          psNo: (
            <div className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {money(listHook.summary.totalPsNo)}
            </div>
          ),
          psCo: (
            <div className="text-right font-bold tabular-nums text-foreground">
              {money(listHook.summary.totalPsCo)}
            </div>
          ),
          balanceAmount: (
            <div className="text-right font-bold tabular-nums text-destructive">
              {money(listHook.summary.totalBalance)}
            </div>
          ),
        }}
      />

      {/* Supplier Detail Drawer */}
      <GarageSupplierDetailDrawer
        open={!!selectedSupplier}
        onClose={() => setSelectedSupplier(null)}
        supplierId={selectedSupplier?.id || null}
        supplierCode={selectedSupplier?.code}
        supplierName={selectedSupplier?.name}
        branchId={selectedBranchId || undefined}
      />
    </>
  );
}
