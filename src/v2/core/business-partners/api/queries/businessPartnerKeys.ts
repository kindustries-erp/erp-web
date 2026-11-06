import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Khóa React Query của họ đối tác kinh doanh. `base` do module truyền vào
 * để giữ nguyên khóa cache riêng biệt của từng module (customers vs suppliers).
 */
export const createBusinessPartnerKeys = (base: readonly string[]) => {
  const all = base;
  return {
    all,
    list: (query: V2TableQuery) => [...all, "list", query] as const,
    detail: (id: string) => [...all, "detail", id] as const,
    nextCode: () => [...all, "next-code"] as const,
    syncPreview: [...all, "sync-preview"] as const,
    selectOptions: (direction: "IN" | "OUT", search: string) =>
      [...all, "select-options", direction, search] as const,
  };
};

export type BusinessPartnerKeys = ReturnType<typeof createBusinessPartnerKeys>;

/** Khóa mặc định dùng chung của họ business-partners */
export const businessPartnerKeys = createBusinessPartnerKeys([
  "v2-business-partners",
]);
