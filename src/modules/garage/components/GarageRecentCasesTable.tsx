import React from "react";
import { money } from "@/shared/utils/format";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { EmptyState } from "@/shared/components/EmptyState";
import { useTranslation } from "react-i18next";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";

interface GarageRecentCasesTableProps {
  cases: any[];
  onSelectCase: (caseCode: string) => void;
  onViewAll: () => void;
  loading?: boolean;
}

export function GarageRecentCasesTable({
  cases,
  onSelectCase,
  onViewAll,
  loading,
}: GarageRecentCasesTableProps) {
  const { t } = useTranslation("garage");

  if (!loading && (!cases || cases.length === 0)) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm p-6 flex flex-col justify-center items-center">
        <EmptyState
          message={t(
            "dashboard.recentCases.empty",
            "Không có phiếu dịch vụ nào gần đây",
          )}
          size="sm"
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {t("dashboard.recentCases.title", "Phiếu dịch vụ gần đây")}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "dashboard.recentCases.desc",
              "Danh sách 10 phiếu dịch vụ cập nhật mới nhất",
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="text-xs gap-1.5 h-8"
        >
          {t("dashboard.recentCases.viewAll", "Xem tất cả")}
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold border-b">
            <tr>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.caseCode", "Số chứng từ")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.licensePlate", "Biển số xe")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.customer", "Khách hàng")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.status", "Trạng thái")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.revenue", "Doanh thu")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.profit", "Lãi gộp")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.margin", "Biên LN")}
              </th>
              <th className="px-4 py-2.5 text-center">
                {t("dashboard.recentCases.viewDetail", "Thao tác")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c: any) => {
              const rev = Number(c.doanhThu ?? c.rawData?.DoanhThu ?? 0);
              const profit = Number(c.loiNhuan ?? c.rawData?.LoiNhuan ?? 0);
              const margin = rev > 0 ? (profit / rev) * 100 : null;

              return (
                <tr
                  key={c.id || c.soChungTu}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-primary cursor-pointer hover:underline text-left">
                    <span onClick={() => onSelectCase(c.soChungTu)}>
                      {c.soChungTu}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-left">
                    {c.bienSoXe || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-left">
                    {c.khachHangName || "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="w-full flex justify-center">
                      <KgaraCaseStatusBadge
                        status={c.tenTinhTrangDichVu || "Không rõ"}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {rev > 0 ? money(rev) : "-"}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {profit !== 0 ? (
                      <span
                        className={
                          profit >= 0 ? "text-emerald-600" : "text-rose-600"
                        }
                      >
                        {money(profit)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {margin != null ? (
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          margin >= 20
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : margin >= 0
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                        }`}
                      >
                        {margin > 0
                          ? `+${margin.toFixed(1)}%`
                          : `${margin.toFixed(1)}%`}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onSelectCase(c.soChungTu)}
                      title={t(
                        "dashboard.recentCases.viewDetail",
                        "Xem chi tiết",
                      )}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
