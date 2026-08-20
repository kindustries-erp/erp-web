import React, { useState } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { garageDashboardApi } from "../api/garageDashboardApi";
import { money } from "@/shared/utils/format";
import { KgaraCaseStatusBadge } from "./KgaraCaseStatusBadge";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { GarageCaseStandaloneDrawer } from "./GarageCaseStandaloneDrawer";

export interface GarageCheckpointDrawerProps {
  open: boolean;
  onClose: () => void;
  dateFrom: string;
  dateTo: string;
  periodLabel: string;
}

export function GarageCheckpointDrawer({
  open,
  onClose,
  dateFrom,
  dateTo,
  periodLabel,
}: GarageCheckpointDrawerProps) {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [selectedCaseCode, setSelectedCaseCode] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["garage", "checkpointCases", dateFrom, dateTo, page],
    queryFn: () =>
      garageDashboardApi.getCheckpointCases({
        date_from: dateFrom,
        date_to: dateTo,
        page,
        pageSize,
      }),
    enabled: open && !!dateFrom && !!dateTo,
  });

  const cases = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  const totalRevenue = cases.reduce((sum, c) => sum + (c.doanhThu || 0), 0);
  const totalProfit = cases.reduce((sum, c) => sum + (c.loiNhuan || 0), 0);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        layout="1-column"
        size="full"
        bodyClassName="p-0 overflow-hidden flex flex-col h-full min-h-0"
        title={`Vụ việc Dịch vụ Garage - ${periodLabel}`}
        subtitle={`Khoảng thời gian: ${dateFrom} đến ${dateTo} (${total} vụ việc)`}
        titleExtra={
          <Badge variant="default" className="bg-emerald-600">
            Tổng tiếp nhận: {total}
          </Badge>
        }
        actions={[
          {
            label: "Đóng",
            onClick: onClose,
          },
        ]}
        leftPanel={
          <div className="w-full flex flex-col flex-1 h-full min-h-0 bg-background">
            {/* Header summary row */}
            <div className="p-4 border-b bg-muted/20 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Doanh thu trang này
                  </span>
                  <span className="text-base font-semibold text-emerald-600">
                    {money(totalRevenue)}
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Lợi nhuận gộp trang này
                  </span>
                  <span className="text-base font-semibold text-blue-600">
                    {money(totalProfit)}
                  </span>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Trang {page} / {totalPages} (Tổng {total})
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[11px] font-semibold border-b sticky top-0 bg-background z-10">
                  <tr>
                    <th className="px-4 py-2.5">Số chứng từ</th>
                    <th className="px-4 py-2.5">Biển số xe</th>
                    <th className="px-4 py-2.5">Khách hàng</th>
                    <th className="px-4 py-2.5 text-center">Trạng thái</th>
                    <th className="px-4 py-2.5 text-right">Doanh thu</th>
                    <th className="px-4 py-2.5 text-right">Giá vốn</th>
                    <th className="px-4 py-2.5 text-right">Lãi gộp</th>
                    <th className="px-4 py-2.5 text-right">Đã thu</th>
                    <th className="px-4 py-2.5 text-right">Còn nợ</th>
                    <th className="px-4 py-2.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        Không có vụ việc nào trong khoảng thời gian này
                      </td>
                    </tr>
                  ) : (
                    cases.map((c) => (
                      <tr
                        key={c.id || c.soChungTu}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-2.5 font-medium text-primary cursor-pointer hover:underline">
                          <span
                            onClick={() => setSelectedCaseCode(c.soChungTu)}
                          >
                            {c.soChungTu}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-medium">
                          {c.bienSoXe || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {c.khachHangName || "-"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <div className="flex justify-center">
                            <KgaraCaseStatusBadge
                              status={c.tenTinhTrangDichVu || "Không rõ"}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-foreground">
                          {money(c.doanhThu)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {money(c.chiPhi)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium">
                          <span
                            className={
                              c.loiNhuan >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }
                          >
                            {money(c.loiNhuan)}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-muted-foreground">
                          {money(c.tienDaThanhToan)}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium">
                          {c.tienConPhaiThanhToan > 0 ? (
                            <span className="text-amber-600">
                              {money(c.tienConPhaiThanhToan)}
                            </span>
                          ) : (
                            <span className="text-emerald-600">0 ₫</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setSelectedCaseCode(c.soChungTu)}
                            title="Xem chi tiết phiếu"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />

      <GarageCaseStandaloneDrawer
        isOpen={!!selectedCaseCode}
        caseCode={selectedCaseCode}
        onClose={() => setSelectedCaseCode(null)}
        onSuccess={() => refetch()}
      />
    </>
  );
}
