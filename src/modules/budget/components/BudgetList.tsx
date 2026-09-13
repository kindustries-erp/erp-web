import React from "react";
import { DataTable } from "@/shared/components/DataTable";
import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "../api/budgetApi";
import { Badge } from "@/shared/components/ui/badge";

export function BudgetList() {
  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-forecast"],
    queryFn: () => budgetApi.getRecurringItems({}),
  });

  const recurringDocs = data?.futureProjections || [];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-1 overflow-hidden border rounded-md">
        <DataTable
          items={recurringDocs}
          loading={isLoading}
          emptyLabel="Không có khoản chi định kỳ nào."
          getRowKey={(item: any) => item.id || Math.random().toString()}
          columns={[
            {
              key: "doc_no",
              header: "Mã CT",
              cell: (item: any) => item.purchase_no || item.expense_no,
            },
            {
              key: "title",
              header: "Nội dung",
              cell: (item: any) => item.title || "(Không có tiêu đề)",
            },
            {
              key: "collection",
              header: "Loại khoản chi",
              cell: (item: any) => {
                const isPO = item.collection === "purchase_orders";
                return (
                  <Badge variant={isPO ? "default" : "secondary"}>
                    {isPO ? "Hóa đơn NCC" : "Chi phí nội bộ"}
                  </Badge>
                );
              },
            },
            {
              key: "recurrence",
              header: "Chu kỳ",
              cell: (item: any) => {
                return (
                  <div className="text-sm">
                    {item.recurrence_interval} {item.recurrence_type}
                  </div>
                );
              },
            },
            {
              key: "amount",
              header: "Số tiền",
              className: "text-right",
              headerClassName: "text-right",
              cell: (item: any) => {
                const amt = item.total_amount;
                return amt ? Number(amt).toLocaleString() : "-";
              },
            },
          ]}
        />
      </div>
    </div>
  );
}
