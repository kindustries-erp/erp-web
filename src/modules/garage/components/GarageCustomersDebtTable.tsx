import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  garageDashboardApi,
  type GarageCustomerDebtInfo,
} from "../api/garageDashboardApi";
import { money } from "@/shared/utils/format";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/input";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { GarageCustomerDetailDrawer } from "./GarageCustomerDetailDrawer";

interface GarageCustomersDebtTableProps {
  dateFrom?: string;
  dateTo?: string;
}

export function GarageCustomersDebtTable({
  dateFrom,
  dateTo,
}: GarageCustomersDebtTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [
      "garage-customers-debt",
      page,
      pageSize,
      search,
      dateFrom,
      dateTo,
    ],
    queryFn: () =>
      garageDashboardApi.getCustomers({
        page,
        pageSize,
        search: search.trim() || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        sortBy: "receivableAmount",
        sortOrder: "DESC",
      }),
  });

  const items: GarageCustomerDebtInfo[] = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-lg border shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Phân tích Khách hàng & Công nợ Phải thu Garage
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Danh sách khách hàng, doanh thu dịch vụ và dư nợ công nợ chưa thu
              (Tổng {total} khách hàng)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm mã, tên khách, biển số..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 pl-8 text-xs bg-muted/40"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] font-semibold border-b">
              <tr>
                <th className="px-4 py-2.5">Mã KH</th>
                <th className="px-4 py-2.5">Tên khách hàng</th>
                <th className="px-4 py-2.5">Biển số gần nhất</th>
                <th className="px-4 py-2.5 text-right">Tổng doanh thu</th>
                <th className="px-4 py-2.5 text-right">Lãi gộp</th>
                <th className="px-4 py-2.5 text-right">Biên LN</th>
                <th className="px-4 py-2.5 text-right">Đã thanh toán</th>
                <th className="px-4 py-2.5 text-right">Dư nợ phải thu</th>
                <th className="px-4 py-2.5 text-center">Lượt xe</th>
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
                    Đang tải danh sách khách hàng...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Không tìm thấy khách hàng nào
                  </td>
                </tr>
              ) : (
                items.map((cust) => (
                  <tr
                    key={cust.customerCode}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-primary cursor-pointer hover:underline">
                      <span
                        onClick={() =>
                          setSelectedCustomer({
                            code: cust.customerCode,
                            name: cust.customerName,
                          })
                        }
                      >
                        {cust.customerCode}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {cust.customerName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono">
                      {cust.latestLicensePlate}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">
                      {money(cust.totalRevenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <span
                        className={
                          cust.totalGrossProfit >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }
                      >
                        {money(cust.totalGrossProfit)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          cust.margin >= 20
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : cust.margin >= 0
                              ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                        }`}
                      >
                        {cust.margin > 0
                          ? `+${cust.margin.toFixed(1)}%`
                          : `${cust.margin.toFixed(1)}%`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {money(cust.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {cust.receivableAmount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertCircle className="w-3 h-3 flex-shrink-0" />
                          {money(cust.receivableAmount)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          0 ₫
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {cust.caseCount}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          setSelectedCustomer({
                            code: cust.customerCode,
                            name: cust.customerName,
                          })
                        }
                        title="Xem lịch sử khách hàng"
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

        {/* Footer pagination */}
        <div className="px-5 py-3 border-t bg-muted/10 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Hiển thị {items.length} trên tổng {total} khách hàng (Trang {page} /{" "}
            {totalPages})
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Sau
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <GarageCustomerDetailDrawer
        open={!!selectedCustomer}
        customerCode={selectedCustomer?.code || null}
        customerName={selectedCustomer?.name}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
}
