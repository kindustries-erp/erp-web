import React, { useMemo } from "react";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { money } from "@/shared/utils/format";

interface ForecastDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  monthLabel: string;
  items: any[];
}

export function ForecastDetailDrawer({
  open,
  onClose,
  monthLabel,
  items,
}: ForecastDetailDrawerProps) {
  const translateRecurrence = (type: string) => {
    switch (type) {
      case "DAILY":
        return "Hàng ngày";
      case "WEEKLY":
        return "Hàng tuần";
      case "MONTHLY":
        return "Hàng tháng";
      case "YEARLY":
        return "Hàng năm";
      default:
        return type || "Một lần";
    }
  };

  const columns = useMemo(() => {
    return [
      {
        key: "type",
        header: "Loại",
        size: 100,
        className: "text-center",
        cell: (item: any) => (
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              item.type === "IN"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {item.type === "IN" ? "Thu" : "Chi"}
          </span>
        ),
      },
      {
        key: "title",
        header: "Chứng từ / Diễn giải",
        size: 300,
        className: "text-left",
        cell: (item: any) => (
          <div className="font-medium text-sm">
            {item.title || item.expenseNo || item.poNo || "Chưa xác định"}
          </div>
        ),
      },
      {
        key: "recurrence",
        header: "Chu kỳ lặp lại",
        size: 150,
        className: "text-center text-muted-foreground",
        cell: (item: any) => {
          if (!item.recurrenceType) return "Không lặp lại";
          return `Mỗi ${item.recurrenceInterval || 1} ${translateRecurrence(
            item.recurrenceType,
          ).toLowerCase()}`;
        },
      },
      {
        key: "amount",
        header: "Số tiền dự kiến",
        size: 150,
        className: "text-right font-semibold",
        cell: (item: any) => (
          <span
            className={item.type === "IN" ? "text-emerald-600" : "text-red-600"}
          >
            {item.type === "IN" ? "+" : "-"}
            {money(Number(item.totalAmount) || 0)}
          </span>
        ),
      },
    ];
  }, []);

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      title={`Chi tiết dự báo ngân sách - ${monthLabel}`}
      panelClassName="min-[1024px]:w-[calc(100vw-280px)] w-full max-w-[90vw]"
      bodyClassName="flex flex-col p-4"
    >
      <div className="flex flex-col gap-6 h-full min-h-0">
        <div className="flex-1 min-h-0 flex flex-col">
          <StandardTable
            items={items}
            columns={columns}
            getRowKey={(r: any) =>
              r.id || r.expenseNo || r.poNo || Math.random().toString()
            }
            variant="spreadsheet"
            minWidth={700}
            enableColumnResizing={true}
          />
        </div>
      </div>
    </DrawerModal>
  );
}
