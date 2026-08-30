import axiosInstance from "@/core/api/axiosInstance";

export interface OperatingExpenseItem {
  id: string;
  expenseNo: string;
  branchId?: string | null;
  supplierId?: string | null;
  supplierNameSnapshot?: string | null;
  expenseCategory?: string | null;
  title?: string | null;
  documentDate?: string | null;
  dueDate?: string | null;
  invoiceStatus?: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  recurrenceType?: string;
  recurrenceInterval?: number;
  recurrenceStartDate?: string | null;
  recurrenceEndDate?: string | null;
  nextDueDate?: string | null;
  autoGenerateNext?: boolean;
  parentRecurringId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export const budgetApi = {
  getList: async (params?: any) => {
    const res = await axiosInstance.get<{
      data: OperatingExpenseItem[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
      meta?: { filter_count: number; totalAmountSum?: number };
    }>("/api/v1/operating-expenses", {
      params,
    });
    return res.data;
  },

  getColumnOptions: async ({
    columnKey,
    search,
    pageParam = 1,
    pageSize = 20,
    filtersStr,
    branchId,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    pageSize?: number;
    filtersStr?: string;
    branchId?: string;
  }): Promise<{
    items: { label: string; value: string }[];
    total: number;
    next: number | null;
  }> => {
    const res = await axiosInstance.get<{
      items: (string | { label: string; value: string })[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>("/api/v1/operating-expenses/column-options", {
      params: {
        column: columnKey,
        search,
        page: pageParam,
        pageSize,
        filters: filtersStr,
        branch_id: branchId,
      },
    });

    const rawItems = res.data?.items || [];
    const formattedItems = rawItems.map((item) =>
      typeof item === "string" ? { label: item, value: item } : item,
    );

    const hasNext = res.data ? res.data.page < res.data.totalPages : false;

    return {
      items: formattedItems,
      total: res.data?.total || 0,
      next: hasNext ? (res.data?.page || 1) + 1 : null,
    };
  },

  getById: async (id: string) => {
    const res = await axiosInstance.get<{ data: OperatingExpenseItem }>(
      `/api/v1/operating-expenses/${id}`,
    );
    return res.data;
  },

  create: async (data: any) => {
    const res = await axiosInstance.post("/api/v1/operating-expenses", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await axiosInstance.patch(
      `/api/v1/operating-expenses/${id}`,
      data,
    );
    return res.data;
  },

  deleteExpense: async (id: string) => {
    const res = await axiosInstance.delete(`/api/v1/operating-expenses/${id}`);
    return res.data;
  },

  getRecurringItems: async (params: any) => {
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/cashflow-forecast",
      {
        params,
      },
    );
    return res.data;
  },

  getBudgetSuggestions: async (params: any) => {
    const res = await axiosInstance.get(
      "/api/v1/dashboard-core/budget-suggestions",
      {
        params,
      },
    );
    return res.data;
  },
};
