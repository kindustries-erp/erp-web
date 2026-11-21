import axiosInstance from "@/core/api/axiosInstance";
import type { Employee } from "@/modules/auth/api/auth";
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  type ListParams,
  type PaginatedResponse,
} from "@/shared/types/pagination";

// ── Department ─────────────────────────────────────────────────────────────

export interface Department {
  id: string;
  department_code: string;
  department_name: string;
  parent_department_id: string | null;
  manager_employee_id: string | null;
  description: string | null;
  is_active: boolean;
  sort: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface CreateDepartmentDto {
  department_code: string;
  department_name: string;
  parent_department_id?: string | null;
  manager_employee_id?: string | null;
  description?: string | null;
  is_active?: boolean;
  sort?: number | null;
}
export type UpdateDepartmentDto = Partial<CreateDepartmentDto>;

// ── Position ───────────────────────────────────────────────────────────────

export interface Position {
  id: string;
  position_code: string;
  position_name: string;
  department_group: string | null;
  approval_level: number | null;
  department_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface CreatePositionDto {
  position_code: string;
  position_name: string;
  department_group?: string | null;
  approval_level?: number | null;
  department_id?: string | null;
  is_active?: boolean;
}
export type UpdatePositionDto = Partial<CreatePositionDto>;

// ── Employee (HR admin) ────────────────────────────────────────────────────

export interface CreateEmployeeDto {
  employee_code?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  department_id?: string | null;
  position_id?: string | null;
  employment_status?: string;
  hire_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
}

// ── Department API ─────────────────────────────────────────────────────────

/** Flat list for select/dropdown use (up to 200 records). */
export async function getDepartmentsApi(): Promise<Department[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<Department>>(
    "/api/v1/departments",
    { params: { page: 1, pageSize: 500, sort: "department_name" } },
  );
  return data.items;
}

/** Server-side paginated list for table views. */
export async function getDepartmentsPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<Department>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? DEFAULT_SORT;
  const { data } = await axiosInstance.get<PaginatedResponse<Department>>(
    "/api/v1/departments",
    {
      params: {
        page,
        pageSize,
        sort: sort.join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function createDepartmentApi(
  dto: CreateDepartmentDto,
): Promise<Department> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: Department;
  }>("/api/v1/departments", dto);
  return data.data;
}

export async function updateDepartmentApi(
  id: string,
  dto: UpdateDepartmentDto,
): Promise<Department> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: Department;
  }>(`/api/v1/departments/${id}`, dto);
  return data.data;
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/departments/${id}`);
}

// ── Position API ───────────────────────────────────────────────────────────

/** Flat list for select/dropdown use (up to 200 records). */
export async function getPositionsApi(): Promise<Position[]> {
  const { data } = await axiosInstance.get<PaginatedResponse<Position>>(
    "/api/v1/positions",
    { params: { page: 1, pageSize: 500, sort: "position_name" } },
  );
  return data.items;
}

/** Server-side paginated list for table views. */
export async function getPositionsPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<Position>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? DEFAULT_SORT;
  const { data } = await axiosInstance.get<PaginatedResponse<Position>>(
    "/api/v1/positions",
    {
      params: {
        page,
        pageSize,
        sort: sort.join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

export async function createPositionApi(
  dto: CreatePositionDto,
): Promise<Position> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: Position;
  }>("/api/v1/positions", dto);
  return data.data;
}

export async function updatePositionApi(
  id: string,
  dto: UpdatePositionDto,
): Promise<Position> {
  const { data } = await axiosInstance.patch<{
    message: string;
    data: Position;
  }>(`/api/v1/positions/${id}`, dto);
  return data.data;
}

export async function deletePositionApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/positions/${id}`);
}

// ── Employee API (HR admin list/create/delete) ─────────────────────────────

/** Server-side paginated list for table views. */
export async function getEmployeesPagedApi(
  params: ListParams = {},
): Promise<PaginatedResponse<Employee>> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const sort = params.sort ?? DEFAULT_SORT;
  const { data } = await axiosInstance.get<PaginatedResponse<Employee>>(
    "/api/v1/employees",
    {
      params: {
        page,
        pageSize,
        sort: sort.join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

/** @deprecated Use getEmployeesPagedApi for table views. */
export async function getEmployeesApi(): Promise<Employee[]> {
  const { data } = await axiosInstance.get<{
    message: string;
    data: Employee[];
  }>("/api/v1/employees");
  return data.data;
}

export async function createEmployeeApi(
  dto: CreateEmployeeDto,
): Promise<Employee> {
  const { data } = await axiosInstance.post<{
    message: string;
    data: Employee;
  }>("/api/v1/employees", dto);
  return data.data;
}

export async function deleteEmployeeApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/employees/${id}`);
}
