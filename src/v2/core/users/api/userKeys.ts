import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Khóa React Query của họ users. `base` do module truyền vào để giữ khóa cache riêng của module.
 */
export const createUserKeys = (base: readonly string[]) => {
  const all = base;
  return {
    all,
    list: (query: V2TableQuery) => [...all, "list", query] as const,
    detail: (id: string) => [...all, "detail", id] as const,
    audit: (id: string) => [...all, "audit", id] as const,
    employeeOptions: () => [...all, "employee-options"] as const,
  };
};

export type UserKeys = ReturnType<typeof createUserKeys>;

/** Khóa mặc định dùng chung của họ users */
export const userKeys = createUserKeys(["v2-users"]);
