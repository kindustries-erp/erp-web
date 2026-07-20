import axiosInstance from "@/core/api/axiosInstance";

export interface IaLineDto {
  id?: string;
  itemId: string;
  qtyAdjusted: number;
  typeAdjust?: string;
  unitCost?: number;
}

export interface IaHeaderDto {
  id?: string;
  adjustmentNo?: string;
  adjustmentDate: string;
  remarks?: string;
  status?: string;
  lines?: IaLineDto[];
}

export const inventoryAdjustmentsApi = {
  create: async (data: IaHeaderDto) => {
    const res = await axiosInstance.post("/api/v1/inventory-adjustments", data);
    return res.data;
  },
  update: async (id: string, data: Partial<IaHeaderDto>) => {
    const res = await axiosInstance.patch(
      `/api/v1/inventory-adjustments/${id}`,
      data,
    );
    return res.data;
  },
  getById: async (id: string) => {
    const res = await axiosInstance.get(`/api/v1/inventory-adjustments/${id}`);
    return res.data;
  },
  getNextNo: async (date?: string) => {
    const params = date ? { date } : {};
    const res = await axiosInstance.get(
      "/api/v1/inventory-adjustments/next-no",
      { params },
    );
    return res.data;
  },
  postAdjustment: async (
    id: string,
    data: { warehouseCode?: string; createdBy?: string } = {},
  ) => {
    const res = await axiosInstance.post(
      `/api/v1/inventory-adjustments/${id}/post`,
      data,
    );
    return res.data;
  },
  cancelAdjustment: async (id: string) => {
    const res = await axiosInstance.post(
      `/api/v1/inventory-adjustments/${id}/cancel`,
    );
    return res.data;
  },
  delete: async (id: string) => {
    const res = await axiosInstance.delete(
      `/api/v1/inventory-adjustments/${id}`,
    );
    return res.data;
  },
};
