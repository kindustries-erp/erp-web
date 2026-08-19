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
import {
  Building2,
  ExternalLink,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

interface GarageSupplierDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  supplierId: string | null;
  supplierCode?: string;
  supplierName?: string;
  branchId?: string;
}

export function GarageSupplierDetailDrawer({
  open,
  onClose,
  supplierId,
  supplierCode,
  supplierName,
  branchId,
}: GarageSupplierDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["garage-cases-by-supplier", branchId, supplierId],
    queryFn: () => {
      if (!supplierId)
        return Promise.resolve({ payables: [], linkedCases: [] });
      return garageApi.getCasesBySupplier(branchId || "", supplierId);
    },
    enabled: open && !!supplierId,
  });

  const payables = data?.payables || [];

  const totals = useMemo(() => {
    let totalPsNo = 0;
    let totalPsCo = 0;
    let totalCkCo = 0;
    let totalCkNo = 0;
    let totalBalance = 0;
    let maxAging = 0;
    let aging0_30 = 0;
    let aging31_60 = 0;
    let aging61_90 = 0;
    let agingOver90 = 0;

    payables.forEach((p: any) => {
      const psNo = Number(p.psNo) || 0;
      const psCo = Number(p.psCo) || 0;
      const ckCo = Number(p.ckCo) || 0;
      const ckNo = Number(p.ckNo) || 0;
      const bal = Number(p.balance) || 0;

      totalPsNo += psNo;
      totalPsCo += psCo;
      totalCkCo += ckCo;
      totalCkNo += ckNo;
      totalBalance += bal;

      const pDate = p.periodTo || p.periodFrom;
      let aging = 0;
      if (pDate) {
        const diff = Math.abs(new Date().getTime() - new Date(pDate).getTime());
        aging = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      if (bal > 0 && aging > maxAging) maxAging = aging;

      if (bal > 0) {
        if (aging <= 30) aging0_30 += bal;
        else if (aging <= 60) aging31_60 += bal;
        else if (aging <= 90) aging61_90 += bal;
        else agingOver90 += bal;
      }
    });

    return {
      totalPsNo,
      totalPsCo,
      totalCkCo,
      totalCkNo,
      totalBalance,
      maxAging,
      aging0_30,
      aging31_60,
      aging61_90,
      agingOver90,
    };
  }, [payables]);

  const resolvedName =
    supplierName ||
    payables[0]?.tenDoiTac ||
    supplierCode ||
    t("suppliers.drawer.title", "Hồ sơ nhà cung cấp");

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={`${t("suppliers.drawer.title", "Hồ sơ công nợ")}: ${resolvedName}`}
        subtitle={`${t("suppliers.columns.supplierCode", "Mã NCC")}: ${supplierCode || supplierId || "N/A"}`}
        titleExtra={
          <Badge
            variant={totals.totalBalance === 0 ? "success" : "destructive"}
            className="font-medium"
          >
            {totals.totalBalance === 0
              ? t("common.allPaid", "Đã thanh toán hết")
              : `${t("suppliers.columns.balanceAmount", "Còn phải trả")}: ${money(totals.totalBalance)}`}
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
              title={t(
                "suppliers.drawer.generalInfo",
                "Thông tin nhà cung cấp",
              )}
            >
              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t("suppliers.columns.supplierCode", "Mã nhà cung cấp")}
                >
                  <div className="flex items-center gap-2 font-mono font-medium text-primary">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>{supplierCode || supplierId || "N/A"}</span>
                  </div>
                </DrawerField>
                <DrawerField
                  label={t(
                    "suppliers.columns.supplierName",
                    "Tên nhà cung cấp",
                  )}
                >
                  <span className="font-semibold text-foreground">
                    {resolvedName}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t(
                    "suppliers.columns.accountCode",
                    "Tài khoản theo dõi",
                  )}
                >
                  <Badge variant="outline" className="font-mono">
                    {payables[0]?.maSoTaiKhoan || "331"} -{" "}
                    {payables[0]?.tenTaiKhoan || "Phải trả người bán"}
                  </Badge>
                </DrawerField>
                <DrawerField
                  label={t("suppliers.columns.currency", "Loại tiền")}
                >
                  <Badge variant="secondary" className="font-mono">
                    {payables[0]?.maSoTienTe || "VND"}
                  </Badge>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t(
                    "suppliers.columns.psNo",
                    "Phát sinh Nợ (Đã thanh toán)",
                  )}
                >
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {money(totals.totalPsNo)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t(
                    "suppliers.columns.psCo",
                    "Phát sinh Có (Mua hàng/Dịch vụ)",
                  )}
                >
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(totals.totalPsCo)}
                  </span>
                </DrawerField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DrawerField
                  label={t(
                    "suppliers.columns.balanceAmount",
                    "Dư nợ còn phải trả",
                  )}
                >
                  <span className="text-base font-bold tabular-nums text-destructive">
                    {money(totals.totalBalance)}
                  </span>
                </DrawerField>
                <DrawerField
                  label={t(
                    "suppliers.columns.maxAgingDays",
                    "Tuổi nợ lớn nhất",
                  )}
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

            {/* 2. Danh sách Vụ việc & Bút toán */}
            <DrawerSection
              title={t(
                "suppliers.drawer.caseList",
                "Danh sách Vụ việc & Bút toán phát sinh",
              )}
              titleExtra={
                <span className="text-xs text-muted-foreground font-normal">
                  {payables.length} {t("common.records", "bản ghi")}
                </span>
              }
              fitViewportHeight={true}
            >
              {isLoading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("common.loading", "Đang tải dữ liệu...")}
                </div>
              ) : payables.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {t("suppliers.empty", "Không có dữ liệu chi tiết")}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/80">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/60 text-muted-foreground border-b border-border/80">
                        <th className="py-2.5 px-3 font-medium">#</th>
                        <th className="py-2.5 px-3 font-medium">
                          {t("suppliers.drawer.caseCode", "Mã vụ việc / CT")}
                        </th>
                        <th className="py-2.5 px-3 font-medium">
                          {t(
                            "suppliers.drawer.serviceName",
                            "Tên vụ việc / Hạng mục",
                          )}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t("suppliers.columns.psNo", "PS Nợ")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t("suppliers.columns.psCo", "PS Có")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-right">
                          {t(
                            "suppliers.columns.balanceAmount",
                            "Dư Có (Phải trả)",
                          )}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-center">
                          {t("suppliers.drawer.period", "Kỳ")}
                        </th>
                        <th className="py-2.5 px-3 font-medium text-center">
                          {t("common.action", "Thao tác")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {payables.map((p: any, idx: number) => {
                        const hasLinkedCase = !!p.maSoVuViec;
                        return (
                          <tr
                            key={p.id || idx}
                            className="hover:bg-muted/40 transition-colors"
                          >
                            <td className="py-2.5 px-3 tabular-nums text-muted-foreground">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-medium">
                              {p.maSoVuViec ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedCaseCode(p.maSoVuViec)
                                  }
                                  className="text-primary hover:underline flex items-center gap-1 text-left"
                                >
                                  {p.maSoVuViec}
                                  <ExternalLink className="w-3 h-3 text-muted-foreground opacity-60" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground italic">
                                  {t("common.generalEntry", "Bút toán sổ cái")}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 max-w-[200px] truncate">
                              <span className="text-foreground">
                                {p.tenVuViec || p.ghiChuDoiTac || "—"}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                              {money(p.psNo)}
                            </td>
                            <td className="py-2.5 px-3 text-right tabular-nums text-foreground">
                              {money(p.psCo)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold tabular-nums text-destructive">
                              {money(p.balance ?? p.ckCo)}
                            </td>
                            <td className="py-2.5 px-3 text-center text-muted-foreground whitespace-nowrap">
                              {p.periodTo
                                ? formatGMT7(p.periodTo, "date")
                                : "—"}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {hasLinkedCase ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setSelectedCaseCode(p.maSoVuViec)
                                  }
                                  className="h-7 text-xs px-2 gap-1"
                                >
                                  <Receipt className="w-3 h-3" />
                                  {t(
                                    "suppliers.drawer.openCaseDetail",
                                    "Phiếu DV",
                                  )}
                                </Button>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px]"
                                >
                                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                                  GL
                                </Badge>
                              )}
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
                "suppliers.drawer.debtSummary",
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

            {/* Account 331 summary card */}
            <DrawerSection
              title={t(
                "suppliers.drawer.closingBalance",
                "Cân đối tài khoản 331",
              )}
            >
              <div className="flex flex-col gap-2 p-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">
                    {t("suppliers.drawer.psNoTotal", "Tổng phát sinh Nợ")}:
                  </span>
                  <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {money(totals.totalPsNo)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">
                    {t("suppliers.drawer.psCoTotal", "Tổng phát sinh Có")}:
                  </span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {money(totals.totalPsCo)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 font-bold text-sm">
                  <span>
                    {t("suppliers.columns.balanceAmount", "Dư Có cuối kỳ")}:
                  </span>
                  <span className="text-destructive tabular-nums">
                    {money(totals.totalBalance)}
                  </span>
                </div>
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
