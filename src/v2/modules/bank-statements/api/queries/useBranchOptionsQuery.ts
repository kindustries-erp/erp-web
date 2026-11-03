import { useQuery } from "@tanstack/react-query";
import { branchOptionsApi } from "../branchOptionsApi";

/** Khóa `branches-options` trùng V1 để chia sẻ cache danh sách chi nhánh */
export function useBranchOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["branches-options"],
    queryFn: () => branchOptionsApi.listBranchOptions(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
