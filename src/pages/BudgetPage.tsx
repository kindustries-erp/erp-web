import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { budgetApi } from "../modules/budget/api/budgetApi";
import { Badge } from "@/shared/components/ui/badge";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate";
import { Target, Eye } from "lucide-react";
import { BudgetDrawer } from "../modules/budget/components/BudgetDrawer";
import { useT } from "@/core/i18n";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTranslation } from "react-i18next";

export function BudgetPage() {
  const tGlobal = useT();
  const { t } = useTranslation("budget");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const filterPanel = useFilterPanel({
    search: {
      placeholder: tGlobal(
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
        title={t("pageTitle")}
        desc={t("pageDesc")}
        icon={<Target className="w-4 h-4" />}
        tableId="budget-list"
        items={filtered}
        loading={isLoading}
        emptyLabel={t("emptyList")}
        getRowKey={(item: any) => item.id || Math.random().toString()}
        columns={[
          {
            key: "doc_no",
            header: t("colDocNo"),
            cell: (item: any) => {
              const docNo = item.poNo || item.expenseNo;
              return <span>{docNo}</span>;
            },
          },
          {
            key: "title",
            header: t("colTitle"),
            cell: (item: any) => item.title || "(Không có tiêu đề)",
          },
          {
            key: "collection",
            header: t("colType"),
            cell: (item: any) => {
              const isPO = item.collection === "purchase_orders";
              return (
                <Badge variant={isPO ? "default" : "secondary"}>
                  {isPO ? t("typeInvoice") : t("typeExpense")}
                </Badge>
              );
            },
          },
          {
            key: "recurrence",
            header: t("colCycle"),
            cell: (item: any) => {
              return (
                <div className="text-sm">
                  {item.recurrenceInterval}{" "}
                  {item.recurrenceType === "MONTHLY"
                    ? t("cycleMonthly")
                    : item.recurrenceType === "QUARTERLY"
                      ? t("cycleQuarterly")
                      : item.recurrenceType === "YEARLY"
                        ? t("cycleYearly")
                        : item.recurrenceType}
                </div>
              );
            },
          },
          {
            key: "amount",
            header: t("colAmount"),
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
        createLabel={t("drawerTitle")}
        rowActions={(row: any) => [
          {
            label: tGlobal("action.view", "Xem chi tiết"),
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
            placeholder: tGlobal("nav.searchPlaceholder", "Tìm kiếm..."),
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
