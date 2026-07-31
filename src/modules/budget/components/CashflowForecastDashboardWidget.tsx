import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/shared/components/Panel";
import { budgetApi } from "../api/budgetApi";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { Button } from "@/shared/components/ui/Button";
import { ArrowRight, Target } from "lucide-react";

export function CashflowForecastDashboardWidget({
  onNavigate,
}: {
  onNavigate: (page: any) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-forecast"],
    queryFn: () => budgetApi.getRecurringItems({}),
  });

  const presentLiabilities = data?.presentLiabilities || [];
  const futureProjections = data?.futureProjections || [];

  // Calculate total unpaid
  const totalUnpaid = presentLiabilities.reduce(
    (acc: number, item: any) => acc + (item.total_amount || 0),
    0,
  );

  // A simple chart projection
  const labels = ["Tháng Này", "Tháng Sau", "Tháng Tới"];

  // We'll just mock the projection data from the recurring config for now
  const projectedAmount = futureProjections.reduce(
    (acc: number, item: any) => acc + (item.total_amount || 0),
    0,
  );

  const inData = [0, 0, 0];
  const outData = [
    totalUnpaid + projectedAmount,
    projectedAmount,
    projectedAmount,
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
      <Panel title="Dự báo Ngân sách (Budget Forecast)">
        <div className="relative h-[250px]">
          {isLoading ? (
            <ChartSkeleton type="bar" />
          ) : (
            <BarChart
              labels={labels}
              yCallback={(v) => money(Number(v))}
              datasets={[
                {
                  data: inData,
                  color: "#10b981",
                  label: "Thu dự kiến",
                },
                {
                  data: outData,
                  color: "#ef4444",
                  label: "Chi dự kiến",
                },
              ]}
            />
          )}
        </div>
      </Panel>
      <Panel title="Khoản chi sắp tới">
        <div className="flex flex-col h-full space-y-4">
          <div className="flex-1 overflow-y-auto space-y-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">
                Đang tải dữ liệu...
              </div>
            ) : futureProjections.length > 0 ? (
              futureProjections.slice(0, 5).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 border rounded-md"
                >
                  <div>
                    <div className="font-medium text-sm">
                      {item.title || item.expense_no || item.purchase_no}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Chu kỳ: {item.recurrence_interval} {item.recurrence_type}
                    </div>
                  </div>
                  <div className="font-semibold text-red-600">
                    -{money(item.total_amount || 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">
                Không có khoản chi định kỳ nào.
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onNavigate("budget")}
          >
            <Target className="w-4 h-4 mr-2" />
            Xem toàn bộ Kế hoạch Ngân sách (Budget)
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Panel>
    </div>
  );
}
