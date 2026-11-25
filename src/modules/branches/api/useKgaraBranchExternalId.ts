import { useQuery } from "@tanstack/react-query";
import { getBranchKgaraExternalIdApi } from "./branchApi";

/** Đổi id chi nhánh ERP sang external id KGara; `undefined` khi chưa chọn chi nhánh hoặc chưa liên kết. */
export function useKgaraBranchExternalId(
  branchId: string | null | undefined,
): string | undefined {
  const { data } = useQuery({
    queryKey: ["branches:kgara-external-id", branchId],
    queryFn: () => getBranchKgaraExternalIdApi(branchId as string),
    enabled: Boolean(branchId),
    staleTime: 10 * 60 * 1000,
  });
  return data ?? undefined;
}
