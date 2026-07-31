import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/shared/components/Panel";
import { budgetApi } from "../api/budgetApi";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { ForecastDetailDrawer } from "./ForecastDetailDrawer";

export function CashflowForecastDashboardWidget() {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(
    null,
  );
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-forecast"],
    queryFn: () => budgetApi.getRecurringItems({}),
  });

  const presentLiabilities = data?.presentLiabilities || [];
  const futureProjections = data?.futureProjections || [];

  // Calculate total unpaid
  const totalUnpaid = presentLiabilities.reduce(
    (acc: number, item: any) => acc + (Number(item.totalAmount) || 0),
    0,
  );

  // Generate 6 month labels
  const labels = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(1); // Tránh lỗi nhảy tháng khi cộng vào ngày 31
    d.setMonth(new Date().getMonth() + i);
    return i === 0 ? "Tháng Này" : `Tháng ${d.getMonth() + 1}`;
  });

  const inData = [0, 0, 0, 0, 0, 0];
  const outData = [0, 0, 0, 0, 0, 0];
  const monthDetails: any[][] = Array.from({ length: 6 }, () => []);

  outData[0] += totalUnpaid;
  if (totalUnpaid > 0) {
    // Add present liabilities to month 0
    presentLiabilities.forEach((item: any) => {
      monthDetails[0].push({ ...item, type: "OUT" });
    });
  }

  futureProjections.forEach((item: any) => {
    const amount = Number(item.totalAmount) || 0;
    const interval = Number(item.recurrenceInterval) || 1;

    let startMonthOffset = 0;
    if (item.nextDueDate) {
      const nextD = new Date(item.nextDueDate);
      const currD = new Date();
      const monthDiff =
        (nextD.getFullYear() - currD.getFullYear()) * 12 +
        (nextD.getMonth() - currD.getMonth());
      if (monthDiff > 0) {
        startMonthOffset = monthDiff;
      }
    }

    for (let i = startMonthOffset; i < 6; i += interval) {
      outData[i] += amount;
      monthDetails[i].push({ ...item, type: "OUT" });
    }
  });

  return (
    <div className="mt-6">
      <Panel title="Dự báo Ngân sách (Budget Forecast)">
        <div className="relative h-[250px]">
          {isLoading ? (
            <ChartSkeleton type="bar" />
          ) : (
            <BarChart
              labels={labels}
              yCallback={(v) => money(Number(v))}
              onClick={(datasetIndex, index) => {
                setSelectedMonthIndex(index);
              }}
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

      <ForecastDetailDrawer
        open={selectedMonthIndex !== null}
        onClose={() => setSelectedMonthIndex(null)}
        monthLabel={
          selectedMonthIndex !== null ? labels[selectedMonthIndex] : ""
        }
        items={
          selectedMonthIndex !== null ? monthDetails[selectedMonthIndex] : []
        }
      />
    </div>
  );
}
