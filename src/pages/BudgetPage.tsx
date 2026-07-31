import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "../modules/budget/api/budgetApi";
import { Badge } from "@/shared/components/ui/badge";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Target, Eye } from "lucide-react";
import { BudgetDrawer } from "../modules/budget/components/BudgetDrawer";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";

export function BudgetPage() {
  const t = useT();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const filterPanel = useFilterPanel({
    search: {
      placeholder: t(
        "nav.searchPlaceholder",
        "Tìm kiếm mã chứng từ, nội dung...",
      ),
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["cashflow-forecast"],
    queryFn: () => budgetApi.getRecurringItems({}),
  });

  const recurringDocs = data?.futureProjections || [];

  const searchTerm = filterPanel.state.search;

  const filtered = recurringDocs.filter((doc: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (doc.title || doc.expenseNo || doc.poNo || "").toLowerCase();
    return title.includes(term);
  });

  return (
    <>
      <SpreadsheetPageTemplate
        title={t("budget.pageTitle", "Ngân sách định kỳ (Budget)")}
        desc={t(
          "budget.pageDesc",
          "Quản lý các khoản chi định kỳ, dự báo dòng tiền",
        )}
        icon={<Target className="w-4 h-4" />}
        tableId="budget-list"
        items={filtered}
        loading={isLoading}
        emptyLabel={t("budget.emptyList", "Không có khoản chi định kỳ nào.")}
        getRowKey={(item: any) => item.id || Math.random().toString()}
        columns={[
          {
            key: "doc_no",
            header: t("budget.colDocNo", "Mã CT"),
            cell: (item: any) => {
              const docNo = item.poNo || item.expenseNo;
              return <span>{docNo}</span>;
            },
          },
          {
            key: "title",
            header: t("budget.colTitle", "Nội dung"),
            cell: (item: any) => item.title || "(Không có tiêu đề)",
          },
          {
            key: "collection",
            header: t("budget.colType", "Loại khoản chi"),
            cell: (item: any) => {
              const isPO = item.collection === "purchase_orders";
              return (
                <Badge variant={isPO ? "default" : "secondary"}>
                  {isPO
                    ? t("budget.typeInvoice", "Hóa đơn NCC")
                    : t("budget.typeExpense", "Chi phí nội bộ")}
                </Badge>
              );
            },
          },
          {
            key: "recurrence",
            header: t("budget.colCycle", "Chu kỳ"),
            cell: (item: any) => {
              return (
                <div className="text-sm">
                  {item.recurrenceInterval}{" "}
                  {item.recurrenceType === "MONTHLY"
                    ? t("budget.cycleMonthly")
                    : item.recurrenceType === "QUARTERLY"
                      ? t("budget.cycleQuarterly")
                      : item.recurrenceType === "YEARLY"
                        ? t("budget.cycleYearly")
                        : item.recurrenceType}
                </div>
              );
            },
          },
          {
            key: "amount",
            header: t("budget.colAmount", "Số tiền"),
            className: "text-right align-middle",
            headerClassName: "text-right",
            cell: (item: any) => {
              const amt = item.totalAmount;
              return amt ? Number(amt).toLocaleString() : "-";
            },
          },
        ]}
        page={1}
        pageSize={50}
        total={filtered.length}
        totalPages={1}
        onPage={() => {}}
        onPageSize={() => {}}
        onCreate={() => {
          setSelectedExpense(null);
          setIsDrawerOpen(true);
        }}
        createLabel={t("budget.drawerTitle", "Tạo khoản chi")}
        rowActions={(row: any) => [
          {
            label: t("action.view", "Xem chi tiết"),
            icon: <Eye className="w-4 h-4" />,
            onClick: () => {
              setSelectedExpense(row);
              setIsDrawerOpen(true);
            },
          },
        ]}
        actionColumnSize={40}
        filterConfig={{
          search: {
            placeholder: t("nav.searchPlaceholder", "Tìm kiếm..."),
          },
        }}
        filter={filterPanel}
      />
      <BudgetDrawer
        open={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedExpense(null);
        }}
        expenseData={selectedExpense}
      />
    </>
  );
}
