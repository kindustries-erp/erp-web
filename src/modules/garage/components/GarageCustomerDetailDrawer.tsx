import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { garageApi } from "../api/garageApi";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { GarageCaseSettlementDrawerModal } from "./GarageCaseSettlementDrawerModal";
import { InvoiceSelectionDrawer } from "./InvoiceSelectionDrawer";
import { useSyncGarageCaseDetail } from "../hooks/useGarage";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import {
  DataTable,
  type DataTableColumn,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { TableText } from "@/shared/components/DataTable/TableText";
import { Button } from "@/shared/components/ui/Button";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { toast } from "react-hot-toast";
import {
  User,
  Car,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Pencil,
  Scale,
  Link2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

interface GarageCustomerDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  customerCode: string | null;
  customerName?: string;
  branchId?: string;
}

export function GarageCustomerDetailDrawer({
  open,
  onClose,
  customerCode,
  customerName,
  branchId,
}: GarageCustomerDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const queryClient = useQueryClient();
  const { mutate: syncCaseDetail } = useSyncGarageCaseDetail();
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);
  const [drawerEditMode, setDrawerEditMode] = useState<boolean>(false);
  const [settlementCase, setSettlementCase] = useState<any | null>(null);
  const [invoiceLinkingCase, setInvoiceLinkingCase] = useState<any | null>(
    null,
  );

  // Table client state hook
  const tableState = useTableColumnState("garage-customer-cases-detail");

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ["garage-cases-by-customer", branchId, customerCode],
    queryFn: () => {
      if (!customerCode) return Promise.resolve([]);
      return garageApi.getCasesByCustomer(branchId || "", customerCode);
    },
    enabled: open && !!customerCode,
  });

  const totals = useMemo(() => {
    let totalRevenue = 0;
    let totalPaid = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    cases.forEach((c: any) => {
      const rev = Number(c.tienCoThue) || 0;
      const paid = Number(c.tienDaThanhToan) || 0;
      const bal = Number(c.tienConPhaiThanhToan) || 0;
      const aging = Number(c.agingDays) || 0;

      totalRevenue += rev;
      totalPaid += paid;
      totalBalance += bal;
      if (bal > 0 && aging > maxAging) maxAging = aging;

      if (bal > 0) {
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    });

    return {
      totalRevenue,
      totalPaid,
      totalBalance,
      maxAging,
      aging0_30,
      aging31_60,
      aging61_90,
      agingOver90,
      recoveryRate:
        totalRevenue > 0
          ? Math.round((totalPaid / totalRevenue) * 100)
          : totalBalance === 0
            ? 100
            : 0,
    };
  }, [cases]);

  const resolvedName =
    customerName ||
    cases[0]?.khachHangName ||
    customerCode ||
    t("customers.drawer.title", "Hồ sơ khách hàng");

  // Aging bucket extractor helper
  const getAgingBucket = (item: any) => {
    const bal = Number(item.tienConPhaiThanhToan) || 0;
    if (bal <= 0) return "PAID";
    const aging = Number(item.agingDays) || 0;
    if (aging <= 30) return "0-30";
    if (aging <= 60) return "31-60";
    if (aging <= 90) return "61-90";
    return ">90";
  };

  // Universal client-side filter and sorter
  const filteredCases = useMemo(() => {
    return filterClientItems(cases, tableState, {
      dateField: "ngayPhatSinh",
      customExtractors: {
        agingDays: getAgingBucket,
      },
    });
  }, [cases, tableState]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(tableState.columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(tableState.columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (tableState.dateFrom || tableState.dateTo) count += 1;
    return count;
  }, [
    tableState.columnFilters,
    tableState.columnSearch,
    tableState.dateFrom,
    tableState.dateTo,
  ]);

  // Column Header Filter Builder
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableState,
        items: cases,
        defaultAlign: "center",
      }),
    [tableState, cases],
  );

  // Columns definition following /standardize-table
  const columns = useMemo<DataTableColumn<any>[]>(() => {
    return [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        minSize: 40,
        enableResizing: false,
        className: "text-center w-[40px] min-w-[40px]",
        headerClassName: "text-center w-[40px] min-w-[40px]",
        cell: (_, idx) => <span>{idx}</span>,
      },
      {
        key: "soChungTu",
        header: headerFilter(
          "soChungTu",
          t("customers.drawer.caseCode", "Số chứng từ"),
        ),
        size: 190,
        minSize: 175,
        enableResizing: true,
        cell: (row: any) => (
          <TableText
            text={row.soChungTu || "N/A"}
            enableCopy={true}
            tooltip={true}
            onDetailClick={(e) => {
              e?.stopPropagation();
              setDrawerEditMode(false);
              setSelectedCaseCode(row.soChungTu);
            }}
          />
        ),
      },
      {
        key: "bienSoXe",
        header: headerFilter(
          "bienSoXe",
          t("customers.drawer.licensePlate", "Biển số xe"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap">
            <Car className="w-3 h-3 text-muted-foreground shrink-0" />
            {row.bienSoXe || "—"}
          </span>
        ),
      },
      {
        key: "ngayPhatSinh",
        className: "text-right",
        header: headerFilter.date(
          "ngayPhatSinh",
          t("customers.drawer.caseDate", "Ngày tiếp nhận"),
        ),
        size: 140,
        minSize: 135,
        enableResizing: true,
        cell: (row: any) => (
          <TableDateCell
            date={row.ngayPhatSinh}
            className="justify-end w-full"
          />
        ),
      },
      {
        key: "tienCoThue",
        className: "text-right",
        header: headerFilter.amount(
          "tienCoThue",
          t("customers.drawer.totalAmount", "Tổng tiền"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-semibold text-foreground">
            {money(row.tienCoThue)}
          </span>
        ),
      },
      {
        key: "tienDaThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienDaThanhToan",
          t("customers.drawer.paidAmount", "Đã thu"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
            {money(row.tienDaThanhToan)}
          </span>
        ),
      },
      {
        key: "tienConPhaiThanhToan",
        className: "text-right",
        header: headerFilter.amount(
          "tienConPhaiThanhToan",
          t("customers.drawer.balanceAmount", "Còn nợ"),
        ),
        size: 130,
        minSize: 120,
        enableResizing: true,
        cell: (row: any) => (
          <span className="tabular-nums font-bold text-destructive">
            {money(row.tienConPhaiThanhToan)}
          </span>
        ),
      },
      {
        key: "agingDays",
        className: "text-left",
        header: headerFilter(
          "agingDays",
          t("customers.drawer.agingDays", "Tuổi nợ"),
          {
            filterOptions: [
              { label: "0-30 ngày (Trong hạn)", value: "0-30" },
              { label: "31-60 ngày (Cần theo dõi)", value: "31-60" },
              { label: "61-90 ngày (Quá hạn)", value: "61-90" },
              { label: ">90 ngày (Quá hạn sâu)", value: ">90" },
              { label: "Đã tất toán", value: "PAID" },
            ],
          },
        ),
        size: 210,
        minSize: 200,
        enableResizing: true,
        cell: (row: any) => {
          const bal = Number(row.tienConPhaiThanhToan) || 0;
          const aging = Number(row.agingDays) || 0;

          if (bal <= 0) {
            return (
              <Badge
                variant="outline"
                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              >
                {t("customers.drawer.settled", "Đã tất toán")}
              </Badge>
            );
          }

          const isOver90 = aging > 90;
          const is61to90 = aging > 60 && aging <= 90;
          const is31to60 = aging > 30 && aging <= 60;

          const agingPercent = Math.min(100, Math.round((aging / 90) * 100));
          const bracketLabel = isOver90
            ? ">90 ngày"
            : is61to90
              ? "61-90 ngày"
              : is31to60
                ? "31-60 ngày"
                : "0-30 ngày";

          const tagCls = isOver90
            ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
            : is61to90
              ? "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900"
              : is31to60
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";

          const dayTextCls = isOver90
            ? "text-rose-600 font-bold"
            : is61to90
              ? "text-orange-600 font-semibold"
              : is31to60
                ? "text-amber-600 font-semibold"
                : "text-foreground font-medium";

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
      {
        key: "tenTinhTrangDichVu",
        header: headerFilter(
          "tenTinhTrangDichVu",
          t("customers.drawer.status", "Trạng thái"),
        ),
        size: 120,
        minSize: 110,
        enableResizing: true,
        className: "text-center",
        cell: (row: any) => (
          <div className="w-full flex justify-center">
            <KgaraCaseStatusBadge status={row.tenTinhTrangDichVu || ""} />
          </div>
        ),
      },
    ];
  }, [headerFilter, t]);

  const summaryRow = useMemo(() => {
    if (!filteredCases || filteredCases.length === 0) return undefined;
    let rev = 0;
    let paid = 0;
    let bal = 0;

    filteredCases.forEach((c: any) => {
      rev += Number(c.tienCoThue) || 0;
      paid += Number(c.tienDaThanhToan) || 0;
      bal += Number(c.tienConPhaiThanhToan) || 0;
    });

    return {
      ngayPhatSinh: (
        <div className="text-right w-full font-bold text-xs uppercase text-muted-foreground pr-2">
          {t("customers.drawer.total", "Tổng")}:
        </div>
      ),
      tienCoThue: (
        <div className="text-right font-bold tabular-nums text-foreground">
          {money(rev)}
        </div>
      ),
      tienDaThanhToan: (
        <div className="text-right font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
          {money(paid)}
        </div>
      ),
      tienConPhaiThanhToan: (
        <div className="text-right font-bold tabular-nums text-destructive">
          {money(bal)}
        </div>
      ),
    };
  }, [filteredCases, t]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("customers.drawer.title", "Hồ sơ công nợ")}: ${resolvedName}`}
        subtitle={`${t("customers.columns.customerCode", "Mã KH")}: ${customerCode || "N/A"}`}
        titleExtra={
          <Badge
            variant={totals.totalBalance === 0 ? "success" : "destructive"}
            className="font-medium"
          >
            {totals.totalBalance === 0
              ? t("common.allPaid", "Đã tất toán")
              : `${t("customers.drawer.totalBalance", "Còn nợ")}: ${money(totals.totalBalance)}`}
          </Badge>
        }
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        actions={[{ label: t("common.close", "Đóng"), onClick: onClose }]}
        leftPanel={
          <div className="flex flex-col gap-4">
            {/* 1. Thông tin chung */}
            <DrawerSection
              title={t("customers.drawer.generalInfo", "Thông tin khách hàng")}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t("customers.columns.customerCode", "Mã khách hàng")}
                >
                  <div className="flex items-center gap-2 font-mono font-medium text-primary">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{customerCode || "N/A"}</span>
                  </div>
                </DrawerField>
                <DrawerField
                  label={t("customers.columns.customerName", "Tên khách hàng")}
                >
                  <span className="font-semibold text-foreground">
                    {resolvedName}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t(
                    "customers.drawer.totalReceivable",
                    "Tổng doanh thu phát sinh",
                  )}
                >
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(totals.totalRevenue)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t("customers.drawer.totalPaid", "Đã thanh toán")}
                >
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {money(totals.totalPaid)}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t("customers.drawer.totalBalance", "Dư nợ còn lại")}
                >
                  <span className="text-base font-bold tabular-nums text-destructive">
                    {money(totals.totalBalance)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t("customers.drawer.avgAging", "Tuổi nợ lớn nhất")}
                >
                  <Badge
                    variant={
                      totals.maxAging <= 30
                        ? "success"
                        : totals.maxAging <= 60
                          ? "warning"
                          : "destructive"
                    }
                    className="tabular-nums"
                  >
                    {totals.maxAging} {t("common.days", "ngày")}
                  </Badge>
                </DrawerField>
              </div>
            </DrawerSection>

            {/* 2. Danh sách Phiếu dịch vụ */}
            <DrawerSection
              title={t(
                "customers.drawer.caseList",
                "Danh sách Phiếu dịch vụ liên quan",
              )}
              titleExtra={
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-normal">
                    {filteredCases.length}/{cases.length}{" "}
                    {t("cases.title", "phiếu")}
                  </span>
                  {activeFilterCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => tableState.resetFilters()}
                      className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-1.5"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      {t("common.clearFilters", "Bỏ lọc")}
                    </Button>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="w-full">
                <DataTable
                  tableId="garage-customer-cases-detail"
                  variant="spreadsheet"
                  items={filteredCases}
                  columns={columns}
                  loading={isLoading}
                  summaryRow={summaryRow}
                  minWidth={1210}
                  enableColumnResizing={true}
                  emptyLabel={t(
                    "customers.empty",
                    "Không có phiếu dịch vụ nào",
                  )}
                  containerClassName="max-h-[380px] md:max-h-[440px] overflow-y-auto overflow-x-auto rounded-lg border border-border/80"
                  rowHoverActions={(row: any) => [
                    {
                      groupLabel: "TRA CỨU",
                      items: [
                        {
                          label: t("cases.actions.viewDetail", "Xem chi tiết"),
                          icon: <Eye className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setDrawerEditMode(false);
                            setSelectedCaseCode(row.soChungTu || row.id);
                          },
                          quickAction: true,
                        },
                      ],
                    },
                    {
                      groupLabel: "THAO TÁC",
                      items: [
                        {
                          label: t("cases.actions.editCase", "Chỉnh sửa"),
                          icon: <Pencil className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setDrawerEditMode(true);
                            setSelectedCaseCode(row.soChungTu || row.id);
                          },
                          quickAction: true,
                        },
                        {
                          label: t(
                            "cases.actions.syncDetails",
                            "Đồng bộ từ KGara",
                          ),
                          icon: <RefreshCw className="w-3.5 h-3.5" />,
                          onClick: () => {
                            const targetBranch =
                              branchId || row.branchExternalId;
                            if (targetBranch && row.hdPhieuDichVuId) {
                              syncCaseDetail({
                                branchId: targetBranch,
                                caseId: row.hdPhieuDichVuId,
                              });
                            } else {
                              toast.error(
                                t(
                                  "cases.missingBranch",
                                  "Không xác định được chi nhánh để đồng bộ",
                                ),
                              );
                            }
                          },
                        },
                        {
                          label: t(
                            "cases.actions.netOffSettlement",
                            "Cấn trừ sao kê",
                          ),
                          icon: <Scale className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setSettlementCase(row);
                          },
                        },
                        {
                          label: t(
                            "cases.actions.linkInvoice",
                            "Liên kết hóa đơn",
                          ),
                          icon: <Link2 className="w-3.5 h-3.5" />,
                          onClick: () => {
                            setInvoiceLinkingCase(row);
                          },
                        },
                      ],
                    },
                  ]}
                />
              </div>
            </DrawerSection>
          </div>
        }
        rightPanel={
          <div className="flex flex-col gap-4">
            {/* Aging Breakdown */}
            <DrawerSection
              title={t(
                "customers.drawer.debtSummary",
                "Phân tích tuổi nợ (Aging)",
              )}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-3">
                {/* 0 - 30 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />0 - 30{" "}
                      {t("common.days", "ngày")} (Trong hạn)
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging0_30)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging0_30 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 31 - 60 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                      <Clock className="w-3.5 h-3.5" />
                      31 - 60 {t("common.days", "ngày")}
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging31_60)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging31_60 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 61 - 90 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-orange-600 dark:text-orange-400">
                      <Clock className="w-3.5 h-3.5" />
                      61 - 90 {t("common.days", "ngày")}
                    </span>
                    <span className="font-bold tabular-nums">
                      {money(totals.aging61_90)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.aging61_90 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>

                {/* > 90 days */}
                <div className="p-3 rounded-lg border border-border/80 bg-background/50 flex flex-col gap-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-destructive">
                      <AlertCircle className="w-3.5 h-3.5" />
                      &gt; 90 {t("common.days", "ngày")} (Quá hạn sâu)
                    </span>
                    <span className="font-bold tabular-nums text-destructive">
                      {money(totals.agingOver90)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-destructive h-1.5 rounded-full transition-all"
                      style={{
                        width: `${totals.totalBalance > 0 ? Math.min(100, (totals.agingOver90 / totals.totalBalance) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* Recovery Rate KPI */}
            <DrawerSection
              title={t("customers.drawer.recoveryRate", "Tỷ lệ thu hồi")}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="flex flex-col gap-2 p-2">
                <div className="flex justify-between items-center text-sm font-semibold">
                  <span>
                    {t("customers.drawer.progress", "Tiến độ thanh toán")}
                  </span>
                  <span className="text-primary">{totals.recoveryRate}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${totals.recoveryRate}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {t(
                    "customers.drawer.recoveryNote",
                    "Tỷ lệ giữa tổng tiền đã thu thực tế và tổng giá trị đơn dịch vụ.",
                  )}
                </p>
              </div>
            </DrawerSection>
          </div>
        }
      />

      {/* Standalone Case Detail Drawer for Net-off & Traceability */}
      {selectedCaseCode && (
        <GarageCaseStandaloneDrawer
          isOpen={!!selectedCaseCode}
          caseCode={selectedCaseCode}
          initialEditMode={drawerEditMode}
          onClose={() => {
            setSelectedCaseCode(null);
            setDrawerEditMode(false);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({
              queryKey: ["garage-cases-by-customer", branchId, customerCode],
            });
            queryClient.invalidateQueries({
              queryKey: ["garage-customers-debt"],
            });
          }}
        />
      )}

      {/* Cấn trừ sao kê modal */}
      {settlementCase && (
        <GarageCaseSettlementDrawerModal
          open={!!settlementCase}
          onClose={() => setSettlementCase(null)}
          caseId={settlementCase.id}
          caseCode={settlementCase.soChungTu || settlementCase.hdPhieuDichVuId}
          defaultType="RECEIPT"
          suggestedAmount={Number(
            settlementCase.tienConPhaiThanhToan ||
              settlementCase.tienCoThue ||
              0,
          )}
          onSubmit={async (items) => {
            try {
              for (const item of items) {
                await garageApi.addCaseSettlement(settlementCase.id, item);
              }
              toast.success(
                t(
                  "cases.settlementSuccess",
                  "Đã ghi nhận cấn trừ sao kê thành công",
                ),
              );
              setSettlementCase(null);
              queryClient.invalidateQueries({
                queryKey: ["garage-cases-by-customer", branchId, customerCode],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-customers-debt"],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-financial-summary", settlementCase.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-settlements", settlementCase.id],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-case-traceability-graph", settlementCase.id],
              });
            } catch (err: any) {
              toast.error(
                err.response?.data?.message ||
                  t("cases.settlementError", "Lỗi ghi nhận cấn trừ sao kê"),
              );
            }
          }}
        />
      )}

      {/* Liên kết hóa đơn modal */}
      {invoiceLinkingCase && (
        <InvoiceSelectionDrawer
          open={!!invoiceLinkingCase}
          onClose={() => setInvoiceLinkingCase(null)}
          caseId={invoiceLinkingCase.id}
          caseCode={
            invoiceLinkingCase.soChungTu || invoiceLinkingCase.hdPhieuDichVuId
          }
          defaultLinkType="OUT"
          onSubmit={async (payloads) => {
            const items = Array.isArray(payloads) ? payloads : [payloads];
            try {
              if (items.length === 1) {
                await garageApi.addCaseLinkedInvoice(
                  invoiceLinkingCase.id,
                  items[0].invoiceId,
                  items[0].linkType,
                  items[0].note,
                );
              } else if (items.length > 1) {
                await garageApi.addCaseLinkedInvoices(
                  invoiceLinkingCase.id,
                  items.map((i) => ({
                    invoiceId: i.invoiceId,
                    linkType: i.linkType,
                    note: i.note,
                  })),
                );
              }
              toast.success(
                items.length > 1
                  ? `Đã liên kết thành công ${items.length} hóa đơn`
                  : t(
                      "cases.linkInvoiceSuccess",
                      "Đã liên kết hóa đơn thành công",
                    ),
              );
              setInvoiceLinkingCase(null);
              queryClient.invalidateQueries({
                queryKey: ["garage-cases-by-customer", branchId, customerCode],
              });
              queryClient.invalidateQueries({
                queryKey: ["garage-customers-debt"],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  "garage-case-financial-summary",
                  invoiceLinkingCase.id,
                ],
              });
              queryClient.invalidateQueries({
                queryKey: [
                  "garage-case-traceability-graph",
                  invoiceLinkingCase.id,
                ],
              });
            } catch (err: any) {
              toast.error(
                err?.response?.data?.message ||
                  t("cases.linkInvoiceError", "Lỗi liên kết hóa đơn"),
              );
            }
          }}
        />
      )}
    </>
  );
}
