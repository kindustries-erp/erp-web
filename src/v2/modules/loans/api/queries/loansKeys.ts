import { LoansQueryParams } from "../loansApi";

export const loansKeys = {
  all: ["loans"] as const,
  lists: () => [...loansKeys.all, "list"] as const,
  list: (params?: LoansQueryParams) => [...loansKeys.lists(), params] as const,
  details: () => [...loansKeys.all, "detail"] as const,
  detail: (id: string) => [...loansKeys.details(), id] as const,
  cashflow: () => [...loansKeys.all, "cashflow"] as const,
};
