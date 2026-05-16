import axiosInstance from "@/core/api/axiosInstance";
import { ListParams, PaginatedResponse } from "@/shared/types/pagination";

export interface Branch {
  id: string;
  code: string;
  name: string;
  address?: string;
  note?: string;
  is_active: boolean;
  date_created?: string;
  date_updated?: string;
}

export interface BranchQueryParams extends ListParams {
  search?: string;
  status?: string;
}

export const branchApi = {
  // Lấy danh sách chi nhánh
  getBranches: async (params?: BranchQueryParams) => {
    const res = await axiosInstance.get<PaginatedResponse<Branch>>("/api/v1/branches", { params });
    return res.data;
  },

  // Lookup chi nhánh cho các dropdown
  getBranchOptions: async (search?: string) => {
    const res = await axiosInstance.get<Branch[]>("/branches/lookup/options", {
      params: { search },
    });
    return res.data;
  },

  // Chi tiết chi nhánh
  getBranch: async (id: string) => {
    const res = await axiosInstance.get<Branch>(`/branches/${id}`);
    return res.data;
  },

  // Tạo mới chi nhánh
  createBranch: async (data: Partial<Branch>) => {
    const res = await axiosInstance.post<Branch>("/branches", data);
    return res.data;
  },

  // Cập nhật chi nhánh
  updateBranch: async (id: string, data: Partial<Branch>) => {
    const res = await axiosInstance.patch<Branch>(`/branches/${id}`, data);
    return res.data;
  },

  // Xóa chi nhánh
  deleteBranch: async (id: string) => {
    const res = await axiosInstance.delete(`/branches/${id}`);
    return res.data;
  },
};
