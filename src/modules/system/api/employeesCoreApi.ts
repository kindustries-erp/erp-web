import axiosInstance from "@/core/api/axiosInstance";
import { ErpEmployee } from "./usersCoreApi";

const BASE = "/api/v1/employees";

export type CreateEmployeeCoreDto = {
  employeeCode?: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  startDate?: string;
  leaveDate?: string;
  status?: string;
  notes?: string;
};

export type UpdateEmployeeCoreDto = Partial<CreateEmployeeCoreDto>;

export const employeesCoreApi = {
  async list(query: { page?: number; pageSize?: number; search?: string }) {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.pageSize) params.set("pageSize", String(query.pageSize));
    if (query.search) params.set("search", query.search);
    const res = await axiosInstance.get<{
      items: ErpEmployee[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${BASE}?${params.toString()}`, { _silentSuccess: true });
    return res.data;
  },

  async get(id: string) {
    const res = await axiosInstance.get<{
      message: string;
      data: ErpEmployee;
    }>(`${BASE}/${id}`, { _silentSuccess: true });
    return res.data;
  },

  async create(body: CreateEmployeeCoreDto) {
    const res = await axiosInstance.post<{
      message: string;
      data: ErpEmployee;
    }>(BASE, body);
    return res.data;
  },

  async update(id: string, body: UpdateEmployeeCoreDto) {
    const res = await axiosInstance.patch<{
      message: string;
      data: ErpEmployee;
    }>(`${BASE}/${id}`, body);
    return res.data;
  },
};
