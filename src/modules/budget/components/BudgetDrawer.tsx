import React, { useState, useEffect } from "react";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetApi } from "../api/budgetApi";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardHeader } from "@/shared/components/Card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Combobox } from "@/shared/components/Combobox";
import { DatePicker } from "@/shared/components/DatePicker";
import { useT } from "@/core/i18n";
import axiosInstance from "@/core/api/axiosInstance";

export function BudgetDrawer({
  open,
  onClose,
  expenseData,
}: {
  open: boolean;
  onClose: () => void;
  expenseData?: any;
}) {
  const t = useT();
  const queryClient = useQueryClient();

  const isExisting = Boolean(expenseData);
  const [mode, setMode] = useState<"create" | "view" | "edit">("create");
  const [activeTab, setActiveTab] = useState<"suggestions" | "manual">(
    "suggestions",
  );

  useEffect(() => {
    if (open) {
      if (expenseData) {
        setMode("view");
      } else {
        setMode("create");
        setActiveTab("suggestions");
      }
    }
  }, [open, expenseData]);

  // Manual form state
  const [title, setTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("Chi phí vận hành");
  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [recurrenceType, setRecurrenceType] = useState("MONTHLY");
  const [recurrenceInterval, setRecurrenceInterval] = useState("1");
  const [nextDueDate, setNextDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && expenseData) {
      setTitle(expenseData.title || "");
      setExpenseCategory(expenseData.expenseCategory || "Chi phí vận hành");
      setTotalAmount(expenseData.totalAmount || "");
      setRecurrenceType(expenseData.recurrenceType || "MONTHLY");
      setRecurrenceInterval(String(expenseData.recurrenceInterval || "1"));
      setNextDueDate(
        expenseData.nextDueDate ? expenseData.nextDueDate.substring(0, 10) : "",
      );
      setNotes(expenseData.notes || "");
    } else if (open && !expenseData) {
      setTitle("");
      setExpenseCategory("Chi phí vận hành");
      setTotalAmount("");
      setRecurrenceType("MONTHLY");
      setRecurrenceInterval("1");
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      d.setDate(1);
      setNextDueDate(d.toISOString().substring(0, 10));
      setNotes("");
    }
  }, [open, expenseData]);

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["budget-suggestions"],
    queryFn: () => budgetApi.getBudgetSuggestions({}),
    enabled: open && mode === "create",
  });

  const saveExpense = async (data: any) => {
    if (isExisting) {
      return axiosInstance.patch(
        `/api/v1/operating-expenses/${expenseData.id}`,
        data,
      );
    }
    return axiosInstance.post("/api/v1/operating-expenses", data);
  };

  const mutation = useMutation({
    mutationFn: saveExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cashflow-forecast"] });
      onClose();
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title) return;
    setIsSubmitting(true);

    mutation.mutate(
      {
        title,
        expense_category: expenseCategory,
        total_amount: Number(totalAmount) || 0,
        recurrence_type: recurrenceType,
        recurrence_interval: Number(recurrenceInterval) || 1,
        next_due_date: nextDueDate || undefined,
        auto_generate_next: true,
        notes,
        status: "CONFIRMED",
      },
      {
        onSettled: () => setIsSubmitting(false),
      },
    );
  };

  const handleAddSuggestion = (item: any) => {
    setTitle(item.title);
    setTotalAmount(item.avgAmount);
    setRecurrenceType("MONTHLY");
    setRecurrenceInterval("1");
    setActiveTab("manual");
  };

  const isReadOnly = mode === "view";

  const getCycleLabel = (type: string) => {
    if (type === "MONTHLY") return t("budget.cycleMonthly", "Hàng tháng");
    if (type === "QUARTERLY") return t("budget.cycleQuarterly", "Hàng quý");
    if (type === "YEARLY") return t("budget.cycleYearly", "Hàng năm");
    return type;
  };

  const actionsConfig: any[] =
    mode === "view"
      ? [
          {
            label: t("budget.actionEdit", "Chỉnh sửa"),
            primary: true,
            onClick: () => setMode("edit"),
          },
        ]
      : [
          {
            label: t("budget.actionCancel", "Hủy"),
            onClick: mode === "edit" ? () => setMode("view") : onClose,
          },
          {
            label: t("budget.actionSave", "Lưu khoản chi"),
            primary: true,
            loading: isSubmitting,
            disabled: !title,
            onClick: () => handleSubmit(),
          },
        ];

  return (
    <StandardFormDrawer
      open={open}
      mode={mode}
      onClose={onClose}
      onToggleEdit={() => setMode("edit")}
      title={
        isExisting
          ? t("budget.drawerDetailTitle", "Chi tiết khoản chi")
          : t("budget.drawerTitle", "Thêm khoản chi định kỳ")
      }
      layout="1-column"
      size="sm"
      actions={actionsConfig}
      leftPanel={
        <div>
          {mode === "create" && (
            <div className="flex space-x-4 mb-6 border-b pb-2">
              <button
                type="button"
                className={`pb-2 font-medium ${activeTab === "suggestions" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "text-[color:var(--muted-fg)]"}`}
                onClick={() => setActiveTab("suggestions")}
              >
                {t("budget.tabSuggestions", "Gợi ý thông minh")}
              </button>
              <button
                type="button"
                className={`pb-2 font-medium ${activeTab === "manual" ? "text-[color:var(--primary)] border-b-2 border-[color:var(--primary)]" : "text-[color:var(--muted-fg)]"}`}
                onClick={() => setActiveTab("manual")}
              >
                {t("budget.tabManual", "Tạo thủ công")}
              </button>
            </div>
          )}

          <div className="space-y-4">
            {mode === "create" && activeTab === "suggestions" && (
              <div>
                {isLoading ? (
                  <div className="text-sm text-[color:var(--muted-fg)]">
                    Đang tải gợi ý...
                  </div>
                ) : suggestions && suggestions.length > 0 ? (
                  suggestions.map((group: any, idx: number) => (
                    <div key={idx} className="mb-6">
                      <h3 className="font-semibold mb-3">
                        {t(`budget.${group.type}Title`, group.title)}
                      </h3>
                      {group.items && group.items.length > 0 ? (
                        group.items.map((item: any, i: number) => (
                          <Card key={i} className="mb-3">
                            <CardHeader title={item.title} />
                            <div className="flex justify-between items-center py-2 px-4 border-t">
                              <div className="text-sm">
                                <div className="text-[color:var(--foreground)] font-medium">
                                  {Number(item.avgAmount).toLocaleString()} VND
                                </div>
                                <div className="text-xs text-[color:var(--muted-fg)]">
                                  {item.occurrences} lần / 6 tháng gần nhất
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleAddSuggestion(item)}
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                {t("budget.actionAdd", "Thêm")}
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <div className="text-sm text-[color:var(--muted-fg)] p-4 border rounded-md border-dashed text-center">
                          {t(
                            "budget.noSuggestions",
                            "Không tìm thấy gợi ý nào từ hệ thống.",
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[color:var(--muted-fg)] p-4 border rounded-md border-dashed text-center">
                    {t(
                      "budget.noSuggestions",
                      "Không tìm thấy gợi ý nào từ hệ thống.",
                    )}
                  </div>
                )}
              </div>
            )}

            {(mode !== "create" || activeTab === "manual") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t("budget.formName", "Tên khoản chi")}{" "}
                    {mode !== "view" && <span className="text-red-500">*</span>}
                  </label>
                  {isReadOnly ? (
                    <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                      {title || "-"}
                    </div>
                  ) : (
                    <Input
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tên khoản chi..."
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t("budget.formCategory", "Loại khoản chi")}
                  </label>
                  {isReadOnly ? (
                    <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                      {expenseCategory || "-"}
                    </div>
                  ) : (
                    <Input
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      placeholder="VD: Chi phí vận hành, Lương..."
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    {t("budget.formAmount", "Số tiền dự kiến")} (VND)
                  </label>
                  {isReadOnly ? (
                    <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                      {totalAmount ? Number(totalAmount).toLocaleString() : "-"}
                    </div>
                  ) : (
                    <Input
                      type="number"
                      min="0"
                      value={totalAmount}
                      onChange={(e) =>
                        setTotalAmount(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      {t("budget.formCycle", "Chu kỳ")}
                    </label>
                    {isReadOnly ? (
                      <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                        {getCycleLabel(recurrenceType)}
                      </div>
                    ) : (
                      <Combobox
                        value={recurrenceType}
                        onChange={(val) => setRecurrenceType(val || "MONTHLY")}
                        options={[
                          {
                            label: t("budget.cycleMonthly", "Hàng tháng"),
                            value: "MONTHLY",
                          },
                          {
                            label: t("budget.cycleQuarterly", "Hàng quý"),
                            value: "QUARTERLY",
                          },
                          {
                            label: t("budget.cycleYearly", "Hàng năm"),
                            value: "YEARLY",
                          },
                        ]}
                        allowClear={false}
                      />
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Tần suất</label>
                    {isReadOnly ? (
                      <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                        {recurrenceInterval || "-"}
                      </div>
                    ) : (
                      <Input
                        type="number"
                        min="1"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(e.target.value)}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium">
                    {t("budget.formNextDue", "Ngày đến hạn tiếp theo")}
                  </label>
                  {isReadOnly ? (
                    <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[38px] flex items-center">
                      {nextDueDate || "-"}
                    </div>
                  ) : (
                    <DatePicker
                      value={nextDueDate}
                      onChange={(val) => setNextDueDate(val || "")}
                    />
                  )}
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-sm font-medium">
                    {t("budget.formNotes", "Ghi chú")}
                  </label>
                  {isReadOnly ? (
                    <div className="p-2 bg-gray-50 rounded-md text-sm border min-h-[80px] whitespace-pre-wrap">
                      {notes || "-"}
                    </div>
                  ) : (
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      }
    />
  );
}
