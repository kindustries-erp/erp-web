import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/core/config/appStore";
import { getBranchesApi } from "@/modules/branches/api/branchApi";

/**
 * currentBranchId được persist trong localStorage nên có thể trỏ tới chi nhánh
 * không còn tồn tại. Hook này đưa nó về chi nhánh đầu tiên khi không hợp lệ.
 */
export function useEnsureValidCurrentBranch(): void {
  const currentBranchId = useAppStore((s) => s.currentBranchId);
  const setCurrentBranchId = useAppStore((s) => s.setCurrentBranchId);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches:list"],
    queryFn: getBranchesApi,
  });

  useEffect(() => {
    if (branches.length === 0) return;
    const isValid = branches.some((b) => b.id === currentBranchId);
    if (!isValid) setCurrentBranchId(branches[0].id);
  }, [branches, currentBranchId, setCurrentBranchId]);
}
