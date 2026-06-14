import axiosInstance from "@/core/api/axiosInstance";
import { dedupeRequest } from "@/shared/utils/requestCache";

export interface Branch {
  id: string;
  code: string;
  name: string;
  is_active?: boolean;
}

export interface CreateBranchDto {
  code: string;
  name: string;
  is_active?: boolean;
}

export type UpdateBranchDto = Partial<CreateBranchDto>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeBranch(item: any): Branch {
  return {
    id: item.id,
    code: item.code ?? item.branch_code ?? "",
    name: item.name ?? item.branch_name ?? "",
    is_active: item.is_active !== false,
  };
}

export async function getBranchesApi(): Promise<Branch[]> {
  return dedupeRequest("branches:list", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await axiosInstance.get<{ items?: any[]; data?: any[] }>(
      "/api/v1/branches",
      { params: { page: 1, pageSize: 500, sort: "code" } },
    );
    const items = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.data)
        ? data.data
        : [];
    return items.map(normalizeBranch);
  });
}

export async function getBranchOptionsApi(): Promise<
  Array<{ value: string; label: string }>
> {
  const branches = await getBranchesApi();
  return branches.map((b) => ({ value: b.id, label: `${b.code} — ${b.name}` }));
}

export async function createBranchApi(dto: CreateBranchDto): Promise<Branch> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await axiosInstance.post<{ message: string; data: any }>(
    "/api/v1/branches",
    dto,
  );
  return normalizeBranch(data.data);
}

export async function updateBranchApi(
  id: string,
  dto: UpdateBranchDto,
): Promise<Branch> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await axiosInstance.patch<{ message: string; data: any }>(
    `/api/v1/branches/${id}`,
    dto,
  );
  return normalizeBranch(data.data);
}

export async function deleteBranchApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/branches/${id}`);
}
