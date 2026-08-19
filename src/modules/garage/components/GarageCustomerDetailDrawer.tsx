import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection, DrawerField } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { money, formatGMT7 } from "@/shared/utils/format";
import { garageApi } from "../api/garageApi";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import {
  User,
  Car,
  Clock,
  ExternalLink,
  Receipt,
  CheckCircle2,
  AlertCircle,
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
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

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
                <span className="text-xs text-muted-foreground font-normal">
                  {cases.length} {t("cases.title", "phiếu")}
                </span>
              }
              fitViewportHeight={true}
            >
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("common.loading", "Đang tải dữ liệu...")}
                </div>
              ) : cases.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("customers.empty", "Không có phiếu dịch vụ nào")}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/80">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/60 text-muted-foreground border-b border-border/80">
                        <th className="py-2.5 px-3 font-medium">#</th>
                        <th className="py-2.5 px-3 font-medium">
                          {t("customers.drawer.caseCode", "Số chứng từ")}
                        </th>
                        <th className="py-2.5 px-3 font-medium">
                          {t("customers.drawer.licensePlate", "Biển số xe")}
                        </th>
                        <th className="py-2.5 px-3 font-medium">
                          {t("customers.drawer.caseDate", "Ngày tiếp nhận")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t("customers.drawer.totalAmount", "Tổng tiền")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t("customers.drawer.paidAmount", "Đã thu")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t("customers.drawer.balanceAmount", "Còn nợ")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-center">
                          {t("customers.drawer.agingDays", "Tuổi nợ")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-center">
                          {t("customers.drawer.status", "Trạng thái")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-center">
                          {t("common.action", "Thao tác")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {cases.map((c: any, idx: number) => {
                        const bal = Number(c.tienConPhaiThanhToan) || 0;
                        const aging = Number(c.agingDays) || 0;
                        return (
                          <tr
                            key={c.id || idx}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 tabular-nums text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium">
                              <button
                                type="button"
                                onClick={() => setSelectedCaseCode(c.soChungTu)}
                                className="text-primary hover:underline flex items-center gap-1 text-left"
                              >
                                {c.soChungTu || "N/A"}
                                <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
                              </button>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="inline-flex items-center gap-1 font-mono font-medium text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[11px]">
                                <Car className="w-3 h-3 text-muted-foreground" />
                                {c.bienSoXe || "—"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                              {c.ngayPhatSinh
                                ? formatGMT7(c.ngayPhatSinh, "date")
                                : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium tabular-nums">
                              {money(c.tienCoThue)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
                              {money(c.tienDaThanhToan)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold tabular-nums text-destructive">
                              {money(c.tienConPhaiThanhToan)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {bal > 0 ? (
                                <Badge
                                  variant={
                                    aging <= 30
                                      ? "success"
                                      : aging <= 60
                                        ? "warning"
                                        : "destructive"
                                  }
                                  className="text-[10px] px-1.5 py-0 h-4"
                                >
                                  {aging}d
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <KgaraCaseStatusBadge
                                status={c.tenTinhTrangDichVu || ""}
                              />
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCaseCode(c.soChungTu)}
                                className="h-7 text-xs px-2 gap-1"
                              >
                                <Receipt className="w-3 h-3" />
                                {t(
                                  "customers.drawer.openCaseDetail",
                                  "Cấn trừ",
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
          onClose={() => setSelectedCaseCode(null)}
        />
      )}
    </>
  );
}
