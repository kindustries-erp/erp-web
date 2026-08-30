import axiosInstance from "@/core/api/axiosInstance";

export interface GarageOpexItem {
  id: string;
  periodYear: number;
  periodMonth: number;
  period: string; // "MM/YYYY"
  categoryKey: string;
  categoryName: string;
  amount: number;
  ojAmount?: number;
  note?: string | null;
  recurrenceType?: string | null;
  recurrenceUntilYear?: number | null;
  recurrenceUntilMonth?: number | null;
  recurrenceAnchorId?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGarageOpexDto {
  periodYear: number;
  periodMonth: number;
  categoryKey: string;
  categoryName: string;
  amount: number;
  ojAmount?: number;
  note?: string;
  recurrenceType?: string;
  recurrenceUntilYear?: number;
  recurrenceUntilMonth?: number;
  recurrenceAnchorId?: string;
}

export interface UpdateGarageOpexDto {
  periodYear?: number;
  periodMonth?: number;
  categoryKey?: string;
  categoryName?: string;
  amount?: number;
  ojAmount?: number;
  note?: string;
  recurrenceType?: string;
  recurrenceUntilYear?: number;
  recurrenceUntilMonth?: number;
  recurrenceAnchorId?: string;
}

export interface ApplyRecurringOpexDto {
  applyScope: "this" | "this_and_future";
  amount: number;
  ojAmount?: number;
  categoryKey?: string;
  categoryName?: string;
  note?: string;
  recurrenceType?: string;
  untilYear?: number;
  untilMonth?: number;
}

export interface ApplyRecurringOpexResponse {
  updated: number;
  created: number;
  total: number;
  item: GarageOpexItem;
}

export interface GarageOpexListResponse {
  data: GarageOpexItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GarageColumnOptionsResponse {
  data: string[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GaragePnlItem {
  id?: string;
  categoryKey: string;
  categoryName: string;
  amount: number;
  ojAmount?: number;
  note?: string | null;
}

export interface GaragePnlReportResponse {
  period: { year: number; month: number };
  periodStr: string;
  caseCount: number;
  revenue: number;
  cogs: number;
  cogsDirect?: number;
  cogsAdjustment?: {
    total: number;
    ojTotal?: number;
    items: GaragePnlItem[];
  };
  grossProfit: number;
  grossMarginRate: number;
  opex: {
    total: number;
    ojTotal?: number;
    items: GaragePnlItem[];
  };
  netProfitBeforeCommission: number;
  commission: {
    total: number;
    ojTotal?: number;
    items: GaragePnlItem[];
  };
  netProfitAfterCommission: number;
  netMarginRate: number;
  oj?: {
    caseCount: number;
    revenue: number;
    revenueRatio: number;
    cogs: number;
    cogsDirect: number;
    cogsAdjustmentTotal: number;
    grossProfit: number;
    grossMarginRate: number;
    opexTotal: number;
    netProfitBeforeCommission: number;
    commissionTotal: number;
    netProfitAfterCommission: number;
    netMarginRate: number;
  };
}

const BASE = "/api/v1/greenway/dashboard";

export const garageOpexApi = {
  getList: async (params?: {
    year?: number;
    month?: number;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
    cost_group?: string;
    sorts?: string[];
    column_filters?: string;
    column_search?: string;
  }): Promise<GarageOpexListResponse> => {
    const { data } = await axiosInstance.get<GarageOpexListResponse>(
      `${BASE}/opex`,
      { params },
    );
    return data;
  },

  getColumnOptions: async (params: {
    column: string;
    search?: string;
    page?: number;
    pageSize?: number;
    filtersStr?: string;
  }): Promise<GarageColumnOptionsResponse> => {
    const { data } = await axiosInstance.get<GarageColumnOptionsResponse>(
      `${BASE}/opex/column-options`,
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<GarageOpexItem> => {
    const { data } = await axiosInstance.get<GarageOpexItem>(
      `${BASE}/opex/${id}`,
    );
    return data;
  },

  create: async (dto: CreateGarageOpexDto): Promise<GarageOpexItem> => {
    const { data } = await axiosInstance.post<GarageOpexItem>(
      `${BASE}/opex`,
      dto,
    );
    return data;
  },

  update: async (
    id: string,
    dto: UpdateGarageOpexDto,
  ): Promise<GarageOpexItem> => {
    const { data } = await axiosInstance.put<GarageOpexItem>(
      `${BASE}/opex/${id}`,
      dto,
    );
    return data;
  },

  applyRecurring: async (
    id: string,
    dto: ApplyRecurringOpexDto,
  ): Promise<ApplyRecurringOpexResponse> => {
    const { data } = await axiosInstance.post<ApplyRecurringOpexResponse>(
      `${BASE}/opex/${id}/apply-recurring`,
      dto,
    );
    return data;
  },

  delete: async (id: string): Promise<{ success: boolean; id: string }> => {
    const { data } = await axiosInstance.delete<{
      success: boolean;
      id: string;
    }>(`${BASE}/opex/${id}`);
    return data;
  },

  getPnlReport: async (params?: {
    year?: number;
    month?: number;
  }): Promise<GaragePnlReportResponse> => {
    const { data } = await axiosInstance.get<GaragePnlReportResponse>(
      `${BASE}/pnl-report`,
      { params },
    );
    return data;
  },

  exportPnlExcel: async (params?: {
    year?: number;
    month?: number;
  }): Promise<Blob> => {
    const { data } = await axiosInstance.get(`${BASE}/pnl-report/export`, {
      params,
      responseType: "blob",
    });
    return data;
  },
};
