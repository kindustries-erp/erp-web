import type { V2TableQuery } from "@/v2/shared/types/v2-table";

export const invoiceDebtsKeys = {
  all: ["v2-invoice-debts"] as const,
  list: (query: V2TableQuery) =>
    [...invoiceDebtsKeys.all, "list", query] as const,
  detail: (id: string) => [...invoiceDebtsKeys.all, "detail", id] as const,
};
