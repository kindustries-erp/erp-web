import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/** Khóa React Query của họ employees. `base` do module truyền vào để giữ khóa cache riêng. */
export const createEmployeeKeys = (base: readonly string[]) => {
  const all = base;
  return {
    all,
    list: (query: V2TableQuery) => [...all, "list", query] as const,
    detail: (id: string) => [...all, "detail", id] as const,
    nationalId: (id: string) => [...all, "national-id", id] as const,
    nextCode: () => [...all, "next-code"] as const,
    branches: () => [...all, "branches"] as const,
  };
};

export type EmployeeKeys = ReturnType<typeof createEmployeeKeys>;

export const employeeKeys = createEmployeeKeys(["v2-employees"]);
