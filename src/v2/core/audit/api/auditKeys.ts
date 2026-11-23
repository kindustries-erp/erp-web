import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/** Khóa React Query của họ audit; `base` do module truyền vào. */
export const createAuditKeys = (base: readonly string[]) => ({
  all: base,
  list: (query: V2TableQuery) => [...base, "list", query] as const,
});

export type AuditKeys = ReturnType<typeof createAuditKeys>;
